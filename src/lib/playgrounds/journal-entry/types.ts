import type { AccountingFramework } from '$lib/shared/chart-of-accounts/types';

export interface JournalLine {
	accountKey: string;
	debit: number;
	credit: number;
}

export interface JournalEntry {
	id: string;
	date: string;
	description: string;
	lines: JournalLine[];
}

export interface DraftLine {
	accountKey: string;
	debit: number | '';
	credit: number | '';
}

export interface DraftEntry {
	date: string;
	description: string;
	lines: DraftLine[];
}

export interface JournalEntryPlaygroundState {
	entries: JournalEntry[];
	draft: DraftEntry;
	selectedAccount: string | null;
	selectedEntryId: string | null;
}

export interface ValidationResult {
	valid: boolean;
	errors: string[];
	totalDebit: number;
	totalCredit: number;
}

export interface LedgerAccount {
	accountKey: string;
	debits: { entryId: string; amount: number; description: string }[];
	credits: { entryId: string; amount: number; description: string }[];
	debitTotal: number;
	creditTotal: number;
	balance: number;
}

export interface TAccountData {
	accountKey: string;
	debits: { entryId: string; amount: number; description: string }[];
	credits: { entryId: string; amount: number; description: string }[];
	debitTotal: number;
	creditTotal: number;
	balance: number;
}
