import type { JournalLine } from '$lib/grading/journal-entry';

export type ItemCategory =
	| 'outstanding-check'
	| 'deposit-in-transit'
	| 'bank-charge'
	| 'interest-earned'
	| 'nsf-check'
	| 'direct-debit'
	| 'standing-order'
	| 'bank-error'
	| 'company-error';

export type Side = 'bank' | 'books';
export type AdjustmentTarget = 'bank' | 'books' | 'none';
export type ReconciliationStatus = 'reconciled' | 'unbalanced' | 'pending';

export interface BankTransaction {
	id: string;
	date: string;
	description: string;
	amount: number;
	reference?: string;
	cleared: boolean;
}

export interface LedgerEntry {
	id: string;
	date: string;
	description: string;
	amount: number;
	reference?: string;
	recorded: boolean;
}

export type MatchType = 'exact-amount-ref' | 'exact-amount-date' | 'fuzzy' | 'manual';

export interface MatchPair {
	bankTxId: string;
	ledgerEntryId: string;
	matchType: MatchType;
	confidence: number;
}

export interface ReconcilingItem {
	id: string;
	category: ItemCategory;
	amount: number;
	side: Side;
	target: AdjustmentTarget;
	sourceTxId?: string;
	description: string;
	needsJournalEntry: boolean;
}

export interface ReconciliationInputs {
	periodEnd: string;
	openingBankBalance: number;
	closingBankBalance: number;
	openingBookBalance: number;
	closingBookBalance: number;
	bankTransactions: BankTransaction[];
	ledgerEntries: LedgerEntry[];
	manualMatches: MatchPair[];
	manualClassifications: Record<string, ItemCategory>;
}

export interface BankReconciliationStatement {
	bankSide: {
		statementBalance: number;
		addDepositsInTransit: number;
		lessOutstandingChecks: number;
		addLessBankErrors: number;
		adjustedBalance: number;
	};
	booksSide: {
		bookBalance: number;
		addInterest: number;
		lessBankCharges: number;
		lessNsfChecks: number;
		lessDirectDebits: number;
		addStandingOrders: number;
		addLessCompanyErrors: number;
		adjustedBalance: number;
	};
	variance: number;
	isReconciled: boolean;
}

export interface BankReconciliationKpis {
	matchedCount: number;
	unmatchedBankCount: number;
	unmatchedBooksCount: number;
	matchedAmount: number;
	variance: number;
	itemsByCategory: Record<ItemCategory, number>;
	reconciliationStatus: ReconciliationStatus;
}

export interface ReconciliationResult {
	matches: MatchPair[];
	items: ReconcilingItem[];
	unmatchedBank: BankTransaction[];
	unmatchedBooks: LedgerEntry[];
	statement: BankReconciliationStatement;
	kpis: BankReconciliationKpis;
}

export interface AdjustingJournalEntry {
	itemId: string;
	category: ItemCategory;
	labelKey: string;
	descKey: string;
	lines: JournalLine[];
	amount: number;
}

export type StatementSkin = 'classic-fr' | 'modern';

export interface BankReconciliationPlaygroundState {
	inputs: ReconciliationInputs;
	selectedView: 'side-by-side' | 'statement' | 'adjustments';
	selectedItemId: string | null;
	highlightedMatchId: string | null;
	statementSkin: StatementSkin | null;
	selectedExerciseId: string | null;
	exerciseParams: Record<string, number | string> | null;
	/** Slug of the scenario currently driving the walkthrough panel, or null. */
	loadedScenarioSlug: string | null;
	/** IDs from the scenario's missingTransactions array that have already been
	 *  added to the bank/ledger panels. Used to grey them out in the walkthrough. */
	addedMissingIds: string[];
}

export const EMPTY_KPIS: BankReconciliationKpis = {
	matchedCount: 0,
	unmatchedBankCount: 0,
	unmatchedBooksCount: 0,
	matchedAmount: 0,
	variance: 0,
	itemsByCategory: {
		'outstanding-check': 0,
		'deposit-in-transit': 0,
		'bank-charge': 0,
		'interest-earned': 0,
		'nsf-check': 0,
		'direct-debit': 0,
		'standing-order': 0,
		'bank-error': 0,
		'company-error': 0,
	},
	reconciliationStatus: 'pending',
};
