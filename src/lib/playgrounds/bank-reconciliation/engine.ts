import type {
	BankTransaction,
	LedgerEntry,
	MatchPair,
	ReconcilingItem,
	ReconciliationInputs,
	ReconciliationResult,
	BankReconciliationStatement,
	BankReconciliationKpis,
	ItemCategory,
	Side,
} from './types';
import { EMPTY_KPIS } from './types';

const EPSILON = 1;
const DATE_EXACT_DAYS = 3;
const DATE_FUZZY_DAYS = 10;
const FUZZY_TOKEN_OVERLAP = 0.5;

export class BankReconciliationEngine {
	match(inputs: ReconciliationInputs): MatchPair[] {
		const matches: MatchPair[] = [];
		const lockedBank = new Set<string>();
		const lockedLedger = new Set<string>();

		for (const m of inputs.manualMatches) {
			matches.push({ ...m, matchType: 'manual', confidence: 1 });
			lockedBank.add(m.bankTxId);
			lockedLedger.add(m.ledgerEntryId);
		}

		this.matchPass(
			inputs.bankTransactions,
			inputs.ledgerEntries,
			lockedBank,
			lockedLedger,
			matches,
			(b, l) =>
				!!b.reference &&
				b.reference === l.reference &&
				Math.abs(Math.abs(b.amount) - Math.abs(l.amount)) < EPSILON,
			'exact-amount-ref',
			1,
		);

		this.matchPass(
			inputs.bankTransactions,
			inputs.ledgerEntries,
			lockedBank,
			lockedLedger,
			matches,
			(b, l) =>
				Math.abs(Math.abs(b.amount) - Math.abs(l.amount)) < EPSILON &&
				daysBetween(b.date, l.date) <= DATE_EXACT_DAYS,
			'exact-amount-date',
			0.85,
		);

		this.matchPass(
			inputs.bankTransactions,
			inputs.ledgerEntries,
			lockedBank,
			lockedLedger,
			matches,
			(b, l) =>
				Math.abs(Math.abs(b.amount) - Math.abs(l.amount)) < EPSILON &&
				daysBetween(b.date, l.date) <= DATE_FUZZY_DAYS &&
				descriptionOverlap(b.description, l.description) > FUZZY_TOKEN_OVERLAP,
			'fuzzy',
			0.6,
		);

		return matches;
	}

	classify(inputs: ReconciliationInputs, matches: MatchPair[]): ReconcilingItem[] {
		const matchedBank = new Set(matches.map((m) => m.bankTxId));
		const matchedLedger = new Set(matches.map((m) => m.ledgerEntryId));
		const items: ReconcilingItem[] = [];

		for (const tx of inputs.bankTransactions) {
			if (matchedBank.has(tx.id)) continue;
			const overrideCat = inputs.manualClassifications[tx.id];
			const category: ItemCategory = overrideCat ?? this.guessBankOnlyCategory(tx);
			items.push(this.makeItem(tx.id, category, tx.amount, 'bank', tx.description, tx.id));
		}

		for (const entry of inputs.ledgerEntries) {
			if (matchedLedger.has(entry.id)) continue;
			const overrideCat = inputs.manualClassifications[entry.id];
			const category: ItemCategory = overrideCat ?? this.guessLedgerOnlyCategory(entry);
			items.push(
				this.makeItem(entry.id, category, entry.amount, 'books', entry.description, entry.id),
			);
		}

		return items;
	}

	buildStatement(
		inputs: ReconciliationInputs,
		items: ReconcilingItem[],
	): BankReconciliationStatement {
		const sumByCategory = (cat: ItemCategory) =>
			items
				.filter((i) => i.category === cat)
				.reduce((s, i) => s + Math.abs(i.amount), 0);

		const depositsInTransit = sumByCategory('deposit-in-transit');
		const outstandingChecks = sumByCategory('outstanding-check');
		const bankErrors = items
			.filter((i) => i.category === 'bank-error')
			.reduce((s, i) => s + i.amount, 0);
		const interest = sumByCategory('interest-earned');
		const bankCharges = sumByCategory('bank-charge');
		const nsfChecks = sumByCategory('nsf-check');
		const directDebits = sumByCategory('direct-debit');
		const standingOrders = sumByCategory('standing-order');
		const companyErrors = items
			.filter((i) => i.category === 'company-error')
			.reduce((s, i) => s + i.amount, 0);

		const adjustedBank =
			inputs.closingBankBalance + depositsInTransit - outstandingChecks + bankErrors;
		const adjustedBooks =
			inputs.closingBookBalance +
			interest +
			standingOrders -
			bankCharges -
			nsfChecks -
			directDebits +
			companyErrors;

		const variance = adjustedBank - adjustedBooks;
		const isReconciled = Math.abs(variance) < EPSILON;

		return {
			bankSide: {
				statementBalance: inputs.closingBankBalance,
				addDepositsInTransit: depositsInTransit,
				lessOutstandingChecks: outstandingChecks,
				addLessBankErrors: bankErrors,
				adjustedBalance: adjustedBank,
			},
			booksSide: {
				bookBalance: inputs.closingBookBalance,
				addInterest: interest,
				lessBankCharges: bankCharges,
				lessNsfChecks: nsfChecks,
				lessDirectDebits: directDebits,
				addStandingOrders: standingOrders,
				addLessCompanyErrors: companyErrors,
				adjustedBalance: adjustedBooks,
			},
			variance,
			isReconciled,
		};
	}

	computeKpis(
		matches: MatchPair[],
		items: ReconcilingItem[],
		unmatchedBank: BankTransaction[],
		unmatchedBooks: LedgerEntry[],
		statement: BankReconciliationStatement,
	): BankReconciliationKpis {
		const itemsByCategory: Record<ItemCategory, number> = { ...EMPTY_KPIS.itemsByCategory };
		for (const item of items) {
			itemsByCategory[item.category] += 1;
		}
		const matchedAmount = matches.reduce((s, m) => {
			const tx = m;
			return s + (tx.confidence > 0 ? 1 : 0);
		}, 0);
		const status: BankReconciliationKpis['reconciliationStatus'] = statement.isReconciled
			? 'reconciled'
			: items.length === 0 && matches.length === 0
				? 'pending'
				: 'unbalanced';

		return {
			matchedCount: matches.length,
			unmatchedBankCount: unmatchedBank.length,
			unmatchedBooksCount: unmatchedBooks.length,
			matchedAmount,
			variance: statement.variance,
			itemsByCategory,
			reconciliationStatus: status,
		};
	}

	reconcile(inputs: ReconciliationInputs): ReconciliationResult {
		const matches = this.match(inputs);
		const matchedBank = new Set(matches.map((m) => m.bankTxId));
		const matchedLedger = new Set(matches.map((m) => m.ledgerEntryId));
		const unmatchedBank = inputs.bankTransactions.filter((t) => !matchedBank.has(t.id));
		const unmatchedBooks = inputs.ledgerEntries.filter((e) => !matchedLedger.has(e.id));
		const items = this.classify(inputs, matches);
		const statement = this.buildStatement(inputs, items);
		const kpis = this.computeKpis(matches, items, unmatchedBank, unmatchedBooks, statement);

		return { matches, items, unmatchedBank, unmatchedBooks, statement, kpis };
	}

	solveMissingBalance(inputs: ReconciliationInputs, knownSide: Side): number {
		const result = this.reconcile(inputs);
		if (knownSide === 'books') {
			return result.statement.booksSide.adjustedBalance + this.bankAdjustments(result.items);
		}
		return result.statement.bankSide.adjustedBalance - this.bookAdjustments(result.items);
	}

	detectErrorItem(items: ReconcilingItem[], variance: number): string | null {
		if (Math.abs(variance) < EPSILON) return null;
		const candidate = items.find((i) => Math.abs(i.amount - variance) < EPSILON);
		return candidate?.id ?? null;
	}

	private bankAdjustments(items: ReconcilingItem[]): number {
		const sum = (cat: ItemCategory) =>
			items.filter((i) => i.category === cat).reduce((s, i) => s + Math.abs(i.amount), 0);
		const errors = items
			.filter((i) => i.category === 'bank-error')
			.reduce((s, i) => s + i.amount, 0);
		return sum('deposit-in-transit') - sum('outstanding-check') + errors;
	}

	private bookAdjustments(items: ReconcilingItem[]): number {
		const sum = (cat: ItemCategory) =>
			items.filter((i) => i.category === cat).reduce((s, i) => s + Math.abs(i.amount), 0);
		const errors = items
			.filter((i) => i.category === 'company-error')
			.reduce((s, i) => s + i.amount, 0);
		return (
			sum('interest-earned') +
			sum('standing-order') -
			sum('bank-charge') -
			sum('nsf-check') -
			sum('direct-debit') +
			errors
		);
	}

	private matchPass(
		bankTxs: BankTransaction[],
		ledgerEntries: LedgerEntry[],
		lockedBank: Set<string>,
		lockedLedger: Set<string>,
		matches: MatchPair[],
		predicate: (b: BankTransaction, l: LedgerEntry) => boolean,
		matchType: MatchPair['matchType'],
		confidence: number,
	): void {
		for (const b of bankTxs) {
			if (lockedBank.has(b.id)) continue;
			const candidate = ledgerEntries.find((l) => !lockedLedger.has(l.id) && predicate(b, l));
			if (candidate) {
				matches.push({ bankTxId: b.id, ledgerEntryId: candidate.id, matchType, confidence });
				lockedBank.add(b.id);
				lockedLedger.add(candidate.id);
			}
		}
	}

	private makeItem(
		id: string,
		category: ItemCategory,
		amount: number,
		side: Side,
		description: string,
		sourceTxId: string,
	): ReconcilingItem {
		const target = ADJUSTMENT_TARGETS[category];
		return {
			id,
			category,
			amount: Math.abs(amount),
			side,
			target,
			sourceTxId,
			description,
			needsJournalEntry: ITEMS_NEEDING_JE.has(category),
		};
	}

	private guessBankOnlyCategory(tx: BankTransaction): ItemCategory {
		const desc = tx.description.toLowerCase();
		if (/interest|intérêt|interets/.test(desc)) return 'interest-earned';
		if (/(nsf|impayé|insufficient|bounced|chèque\s*sans\s*provision)/.test(desc))
			return 'nsf-check';
		if (/(prélèvement|standing|virement\s*permanent|automatic)/.test(desc))
			return tx.amount >= 0 ? 'standing-order' : 'direct-debit';
		if (/(charge|frais|fee|service)/.test(desc)) return 'bank-charge';
		return tx.amount >= 0 ? 'standing-order' : 'bank-charge';
	}

	private guessLedgerOnlyCategory(entry: LedgerEntry): ItemCategory {
		return entry.amount >= 0 ? 'deposit-in-transit' : 'outstanding-check';
	}
}

export const ITEMS_NEEDING_JE = new Set<ItemCategory>([
	'bank-charge',
	'interest-earned',
	'nsf-check',
	'direct-debit',
	'standing-order',
	'company-error',
]);

const ADJUSTMENT_TARGETS: Record<ItemCategory, 'bank' | 'books' | 'none'> = {
	'outstanding-check': 'none',
	'deposit-in-transit': 'none',
	'bank-charge': 'books',
	'interest-earned': 'books',
	'nsf-check': 'books',
	'direct-debit': 'books',
	'standing-order': 'books',
	'bank-error': 'bank',
	'company-error': 'books',
};

function daysBetween(a: string, b: string): number {
	const da = new Date(a).getTime();
	const db = new Date(b).getTime();
	if (!Number.isFinite(da) || !Number.isFinite(db)) return Infinity;
	return Math.abs(da - db) / (1000 * 60 * 60 * 24);
}

function descriptionOverlap(a: string, b: string): number {
	const tokens = (s: string) =>
		new Set(
			s
				.toLowerCase()
				.split(/[\s,;.\-_/]+/)
				.filter((t) => t.length >= 3),
		);
	const ta = tokens(a);
	const tb = tokens(b);
	if (ta.size === 0 || tb.size === 0) return 0;
	let overlap = 0;
	for (const t of ta) if (tb.has(t)) overlap += 1;
	return overlap / Math.max(ta.size, tb.size);
}
