import type { JournalLine } from '$lib/grading/journal-entry';
import type { AccountingFramework } from '$lib/shared/chart-of-accounts/types';
import type {
	AdjustingJournalEntry,
	ItemCategory,
	ReconcilingItem,
	ReconciliationResult,
} from './types';
import { ITEMS_NEEDING_JE } from './engine';

interface CategoryAccountKeys {
	debitKey: string;
	creditKey: string;
	labelKey: string;
	descKey: string;
}

const CATEGORY_ACCOUNTS: Partial<Record<ItemCategory, CategoryAccountKeys>> = {
	'bank-charge': {
		debitKey: 'bankServiceCharges',
		creditKey: 'bank',
		labelKey: 'br.je.bankCharge.label',
		descKey: 'br.je.bankCharge.desc',
	},
	'interest-earned': {
		debitKey: 'bank',
		creditKey: 'interestIncome',
		labelKey: 'br.je.interestEarned.label',
		descKey: 'br.je.interestEarned.desc',
	},
	'nsf-check': {
		debitKey: 'accountsReceivable',
		creditKey: 'bank',
		labelKey: 'br.je.nsfCheck.label',
		descKey: 'br.je.nsfCheck.desc',
	},
	'direct-debit': {
		debitKey: 'externalServices',
		creditKey: 'bank',
		labelKey: 'br.je.directDebit.label',
		descKey: 'br.je.directDebit.desc',
	},
	'standing-order': {
		debitKey: 'bank',
		creditKey: 'externalServices',
		labelKey: 'br.je.standingOrder.label',
		descKey: 'br.je.standingOrder.desc',
	},
};

export function buildAdjustingEntries(
	result: ReconciliationResult,
	_framework: AccountingFramework,
): AdjustingJournalEntry[] {
	const entries: AdjustingJournalEntry[] = [];
	for (const item of result.items) {
		if (!item.needsJournalEntry) continue;
		const entry = buildEntryForItem(item);
		if (entry) entries.push(entry);
	}
	return entries;
}

function buildEntryForItem(item: ReconcilingItem): AdjustingJournalEntry | null {
	if (!ITEMS_NEEDING_JE.has(item.category)) return null;

	if (item.category === 'company-error') {
		const debitFirst = item.amount >= 0;
		const lines: JournalLine[] = debitFirst
			? [
					{ accountKey: 'bank', debit: Math.abs(item.amount), credit: 0 },
					{ accountKey: 'suspense', debit: 0, credit: Math.abs(item.amount) },
				]
			: [
					{ accountKey: 'suspense', debit: Math.abs(item.amount), credit: 0 },
					{ accountKey: 'bank', debit: 0, credit: Math.abs(item.amount) },
				];
		return {
			itemId: item.id,
			category: item.category,
			labelKey: 'br.je.companyError.label',
			descKey: 'br.je.companyError.desc',
			lines,
			amount: Math.abs(item.amount),
		};
	}

	const meta = CATEGORY_ACCOUNTS[item.category];
	if (!meta) return null;
	const amount = Math.abs(item.amount);
	const lines: JournalLine[] = [
		{ accountKey: meta.debitKey, debit: amount, credit: 0 },
		{ accountKey: meta.creditKey, debit: 0, credit: amount },
	];
	return {
		itemId: item.id,
		category: item.category,
		labelKey: meta.labelKey,
		descKey: meta.descKey,
		lines,
		amount,
	};
}
