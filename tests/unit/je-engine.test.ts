import { describe, it, expect } from 'vitest';
import { JournalEntryEngine } from '$lib/playgrounds/journal-entry/engine';
import type { DraftEntry, JournalEntry } from '$lib/playgrounds/journal-entry/types';

const engine = new JournalEntryEngine();

describe('JournalEntryEngine.validate', () => {
	it('accepts a balanced entry', () => {
		const draft: DraftEntry = {
			date: '2024-03-15',
			description: 'Cash sale',
			lines: [
				{ accountKey: 'bank', debit: 5000, credit: '' },
				{ accountKey: 'salesMerchandise', debit: '', credit: 5000 }
			]
		};
		const result = engine.validate(draft, 'ohada');
		expect(result.valid).toBe(true);
		expect(result.totalDebit).toBe(5000);
		expect(result.totalCredit).toBe(5000);
	});

	it('rejects unbalanced entry', () => {
		const draft: DraftEntry = {
			date: '2024-03-15',
			description: 'Bad entry',
			lines: [
				{ accountKey: 'bank', debit: 5000, credit: '' },
				{ accountKey: 'salesMerchandise', debit: '', credit: 3000 }
			]
		};
		const result = engine.validate(draft, 'ohada');
		expect(result.valid).toBe(false);
		expect(result.errors.some((e) => e.key === 'je.validation.unbalanced')).toBe(true);
	});

	it('rejects entry with fewer than 2 lines', () => {
		const draft: DraftEntry = {
			date: '2024-03-15',
			description: 'Single line',
			lines: [{ accountKey: 'bank', debit: 5000, credit: '' }]
		};
		const result = engine.validate(draft, 'ohada');
		expect(result.valid).toBe(false);
	});

	it('rejects entry with unknown account', () => {
		const draft: DraftEntry = {
			date: '2024-03-15',
			description: 'Bad account',
			lines: [
				{ accountKey: 'nonexistent', debit: 5000, credit: '' },
				{ accountKey: 'bank', debit: '', credit: 5000 }
			]
		};
		const result = engine.validate(draft, 'ohada');
		expect(result.valid).toBe(false);
		expect(result.errors.some((e) => e.key === 'je.validation.unknownAccount')).toBe(true);
	});

	it('rejects entry with empty description', () => {
		const draft: DraftEntry = {
			date: '2024-03-15',
			description: '',
			lines: [
				{ accountKey: 'bank', debit: 5000, credit: '' },
				{ accountKey: 'salesMerchandise', debit: '', credit: 5000 }
			]
		};
		const result = engine.validate(draft, 'ohada');
		expect(result.valid).toBe(false);
	});

	it('rejects negative amounts', () => {
		const draft: DraftEntry = {
			date: '2024-03-15',
			description: 'Negative',
			lines: [
				{ accountKey: 'bank', debit: -5000, credit: '' },
				{ accountKey: 'salesMerchandise', debit: '', credit: -5000 }
			]
		};
		const result = engine.validate(draft, 'ohada');
		expect(result.valid).toBe(false);
	});
});

describe('JournalEntryEngine.buildLedger', () => {
	it('builds ledger from entries', () => {
		const entries: JournalEntry[] = [
			{
				id: '1',
				date: '2024-03-15',
				description: 'Cash sale',
				lines: [
					{ accountKey: 'bank', debit: 5000, credit: 0 },
					{ accountKey: 'salesMerchandise', debit: 0, credit: 5000 }
				]
			}
		];
		const ledger = engine.buildLedger(entries);
		expect(ledger.size).toBe(2);
		expect(ledger.get('bank')?.debitTotal).toBe(5000);
		expect(ledger.get('salesMerchandise')?.creditTotal).toBe(5000);
	});

	it('accumulates multiple entries for same account', () => {
		const entries: JournalEntry[] = [
			{
				id: '1',
				date: '2024-03-15',
				description: 'Sale 1',
				lines: [
					{ accountKey: 'bank', debit: 5000, credit: 0 },
					{ accountKey: 'salesMerchandise', debit: 0, credit: 5000 }
				]
			},
			{
				id: '2',
				date: '2024-03-16',
				description: 'Sale 2',
				lines: [
					{ accountKey: 'bank', debit: 3000, credit: 0 },
					{ accountKey: 'salesMerchandise', debit: 0, credit: 3000 }
				]
			}
		];
		const ledger = engine.buildLedger(entries);
		expect(ledger.get('bank')?.debitTotal).toBe(8000);
		expect(ledger.get('bank')?.balance).toBe(8000);
	});

	it('uses normal balance when computing credit-normal account balances', () => {
		const entries: JournalEntry[] = [
			{
				id: '1',
				date: '2024-03-15',
				description: 'Sale 1',
				lines: [
					{ accountKey: 'bank', debit: 5000, credit: 0 },
					{ accountKey: 'salesMerchandise', debit: 0, credit: 5000 }
				]
			},
			{
				id: '2',
				date: '2024-03-16',
				description: 'Sale 2',
				lines: [
					{ accountKey: 'bank', debit: 3000, credit: 0 },
					{ accountKey: 'salesMerchandise', debit: 0, credit: 3000 }
				]
			}
		];
		const ledger = engine.buildLedger(entries, 'ohada');
		expect(ledger.get('salesMerchandise')?.balance).toBe(8000);
	});
});

describe('JournalEntryEngine.getTAccount', () => {
	it('returns null for non-existent account', () => {
		const ledger = engine.buildLedger([]);
		expect(engine.getTAccount(ledger, 'bank')).toBeNull();
	});

	it('returns T-account data for existing account', () => {
		const entries: JournalEntry[] = [
			{
				id: '1',
				date: '2024-03-15',
				description: 'Cash sale',
				lines: [
					{ accountKey: 'bank', debit: 5000, credit: 0 },
					{ accountKey: 'salesMerchandise', debit: 0, credit: 5000 }
				]
			}
		];
		const ledger = engine.buildLedger(entries);
		const tAccount = engine.getTAccount(ledger, 'bank');
		expect(tAccount).not.toBeNull();
		expect(tAccount!.debits).toHaveLength(1);
		expect(tAccount!.debitTotal).toBe(5000);
	});
});

describe('JournalEntryEngine.postDraft', () => {
	it('converts draft to journal entry with ID', () => {
		const draft: DraftEntry = {
			date: '2024-03-15',
			description: '  Cash sale  ',
			lines: [
				{ accountKey: 'bank', debit: 5000, credit: '' },
				{ accountKey: 'salesMerchandise', debit: '', credit: 5000 },
				{ accountKey: '', debit: '', credit: '' }
			]
		};
		const entry = engine.postDraft(draft);
		expect(entry.id).toBeTruthy();
		expect(entry.description).toBe('Cash sale');
		expect(entry.lines).toHaveLength(2);
		expect(entry.lines[0].debit).toBe(5000);
		expect(entry.lines[1].credit).toBe(5000);
	});
});

describe('JournalEntryEngine.statement pipeline', () => {
	it('exposes a complete native pipeline from ledger to statements', () => {
		const engineWithPipeline = engine as unknown as {
			buildTrialBalance?: (ledger: ReturnType<typeof engine.buildLedger>) => unknown[];
			verifyTrialBalance?: (tb: unknown[]) => { balanced: boolean; totalDebit: number; totalCredit: number };
			buildIncomeStatement?: (tb: unknown[], framework: 'ohada') => { totalRevenue: number; totalExpense: number; netIncome: number };
			buildBalanceSheet?: (tb: unknown[], netIncome: number) => { totalAssets: number; totalLiabilitiesAndEquity: number; balanced: boolean };
			buildCashFlow?: (
				entries: JournalEntry[],
				framework: 'ohada'
			) => { totalOperating: number; totalInvesting: number; totalFinancing: number; netChangeInCash: number };
		};

		expect(typeof engineWithPipeline.buildTrialBalance).toBe('function');
		expect(typeof engineWithPipeline.verifyTrialBalance).toBe('function');
		expect(typeof engineWithPipeline.buildIncomeStatement).toBe('function');
		expect(typeof engineWithPipeline.buildBalanceSheet).toBe('function');
		expect(typeof engineWithPipeline.buildCashFlow).toBe('function');

		if (
			typeof engineWithPipeline.buildTrialBalance !== 'function' ||
			typeof engineWithPipeline.verifyTrialBalance !== 'function' ||
			typeof engineWithPipeline.buildIncomeStatement !== 'function' ||
			typeof engineWithPipeline.buildBalanceSheet !== 'function' ||
			typeof engineWithPipeline.buildCashFlow !== 'function'
		) {
			return;
		}

		const entries: JournalEntry[] = [
			{
				id: '1',
				date: '2024-03-15',
				description: 'Cash sale',
				lines: [
					{ accountKey: 'bank', debit: 5000, credit: 0 },
					{ accountKey: 'salesMerchandise', debit: 0, credit: 5000 }
				]
			}
		];

		const ledger = engine.buildLedger(entries, 'ohada');
		const tb = engineWithPipeline.buildTrialBalance(ledger);
		const tbCheck = engineWithPipeline.verifyTrialBalance(tb);
		const incomeStatement = engineWithPipeline.buildIncomeStatement(tb, 'ohada');
		const balanceSheet = engineWithPipeline.buildBalanceSheet(tb, incomeStatement.netIncome);
		const cashFlow = engineWithPipeline.buildCashFlow(entries, 'ohada');

		expect(tb).toHaveLength(2);
		expect(tbCheck.balanced).toBe(true);
		expect(tbCheck.totalDebit).toBe(5000);
		expect(tbCheck.totalCredit).toBe(5000);
		expect(incomeStatement.totalRevenue).toBe(5000);
		expect(incomeStatement.totalExpense).toBe(0);
		expect(incomeStatement.netIncome).toBe(5000);
		expect(balanceSheet.totalAssets).toBe(5000);
		expect(balanceSheet.totalLiabilitiesAndEquity).toBe(5000);
		expect(balanceSheet.balanced).toBe(true);
		expect(cashFlow.totalOperating).toBe(5000);
		expect(cashFlow.totalInvesting).toBe(0);
		expect(cashFlow.totalFinancing).toBe(0);
		expect(cashFlow.netChangeInCash).toBe(5000);
	});

	it('nets contra-assets correctly on the balance sheet', () => {
		const engineWithPipeline = engine as unknown as {
			buildTrialBalance?: (ledger: ReturnType<typeof engine.buildLedger>) => unknown[];
			buildIncomeStatement?: (tb: unknown[], framework: 'ohada') => { netIncome: number };
			buildBalanceSheet?: (
				tb: unknown[],
				netIncome: number
			) => {
				totalAssets: number;
				totalLiabilitiesAndEquity: number;
				balanced: boolean;
				nonCurrentAssets: Array<{ accountKey: string; amount: number }>;
			};
		};

		expect(typeof engineWithPipeline.buildTrialBalance).toBe('function');
		expect(typeof engineWithPipeline.buildIncomeStatement).toBe('function');
		expect(typeof engineWithPipeline.buildBalanceSheet).toBe('function');

		if (
			typeof engineWithPipeline.buildTrialBalance !== 'function' ||
			typeof engineWithPipeline.buildIncomeStatement !== 'function' ||
			typeof engineWithPipeline.buildBalanceSheet !== 'function'
		) {
			return;
		}

		const entries: JournalEntry[] = [
			{
				id: 'purchase',
				date: '2024-02-12',
				description: 'Equipment purchase on credit',
				lines: [
					{ accountKey: 'equipment', debit: 1000, credit: 0 },
					{ accountKey: 'accountsPayable', debit: 0, credit: 1000 }
				]
			},
			{
				id: 'depr',
				date: '2024-03-31',
				description: 'Depreciation',
				lines: [
					{ accountKey: 'depreciationExpense', debit: 100, credit: 0 },
					{ accountKey: 'accDeprEquipment', debit: 0, credit: 100 }
				]
			}
		];

		const ledger = engine.buildLedger(entries, 'ohada');
		const tb = engineWithPipeline.buildTrialBalance(ledger);
		const incomeStatement = engineWithPipeline.buildIncomeStatement(tb, 'ohada');
		const balanceSheet = engineWithPipeline.buildBalanceSheet(tb, incomeStatement.netIncome);

		expect(balanceSheet.balanced).toBe(true);
		expect(balanceSheet.totalAssets).toBe(900);
		expect(balanceSheet.totalLiabilitiesAndEquity).toBe(900);
		expect(
			balanceSheet.nonCurrentAssets.find((item) => item.accountKey === 'accDeprEquipment')?.amount
		).toBe(-100);
	});
});
