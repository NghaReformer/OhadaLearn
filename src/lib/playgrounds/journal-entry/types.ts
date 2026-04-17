import type {
	AccountingFramework,
	NormalBalance,
	ResolvedAccount
} from '$lib/shared/chart-of-accounts/types';

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
	selectedStage: PipelineStage;
	selectedExerciseId: string | null;
	exerciseParams: Record<string, number> | null;
}

export interface ValidationError {
	key: string;
	params?: Record<string, string | number>;
}

export interface ValidationResult {
	valid: boolean;
	errors: ValidationError[];
	totalDebit: number;
	totalCredit: number;
}

export interface LedgerAccount {
	accountKey: string;
	account: ResolvedAccount;
	entries: LedgerEntry[];
	debitTotal: number;
	creditTotal: number;
	balance: number;
}

export interface LedgerEntry {
	entryId: string;
	date: string;
	description: string;
	debit: number;
	credit: number;
}

export interface TAccountData {
	accountKey: string;
	account: ResolvedAccount;
	debits: LedgerEntry[];
	credits: LedgerEntry[];
	debitTotal: number;
	creditTotal: number;
	balance: number;
	normalBalance: NormalBalance;
}

export type PipelineStage =
	| 'ledger'
	| 'trialBalance'
	| 'incomeStatement'
	| 'balanceSheet'
	| 'cashFlow';

export interface TrialBalanceRow {
	accountKey: string;
	account: ResolvedAccount;
	debitTotal: number;
	creditTotal: number;
	balance: number;
}

export interface TrialBalanceCheck {
	balanced: boolean;
	totalDebit: number;
	totalCredit: number;
	diff: number;
}

export interface StatementLineItem {
	accountKey: string;
	account: ResolvedAccount;
	amount: number;
}

export interface IncomeStatementData {
	revenues: StatementLineItem[];
	expenses: StatementLineItem[];
	totalRevenue: number;
	totalExpense: number;
	netIncome: number;
}

export interface BalanceSheetData {
	nonCurrentAssets: StatementLineItem[];
	currentAssets: StatementLineItem[];
	nonCurrentLiabilities: StatementLineItem[];
	currentLiabilities: StatementLineItem[];
	equity: StatementLineItem[];
	derivedNetIncome: number;
	totalAssets: number;
	totalLiabilities: number;
	totalEquity: number;
	totalLiabilitiesAndEquity: number;
	balanced: boolean;
}

export interface CashFlowItem {
	entryId: string;
	date: string;
	description: string;
	accountKey: string;
	account: ResolvedAccount;
	amount: number;
}

export interface CashFlowStatement {
	operating: CashFlowItem[];
	investing: CashFlowItem[];
	financing: CashFlowItem[];
	totalOperating: number;
	totalInvesting: number;
	totalFinancing: number;
	netChangeInCash: number;
}

export interface EntryImpact {
	affectsIncomeStatement: boolean;
	affectsBalanceSheet: boolean;
	affectsCashFlow: boolean;
}
