import { describe, it, expect } from 'vitest';
import { BankReconciliationEngine } from '$lib/playgrounds/bank-reconciliation/engine';
import { buildAdjustingEntries } from '$lib/playgrounds/bank-reconciliation/journal-entries';
import type { ReconciliationInputs } from '$lib/playgrounds/bank-reconciliation/types';
import { getAccount } from '$lib/shared/chart-of-accounts';

const engine = new BankReconciliationEngine();

function inputsWith(category: string, amount: number, description: string): ReconciliationInputs {
	return {
		periodEnd: '2026-04-30',
		openingBankBalance: 1_000_000,
		closingBankBalance: 1_000_000,
		openingBookBalance: 1_000_000,
		closingBookBalance: 1_000_000,
		bankTransactions: [
			{
				id: 't1',
				date: '2026-04-30',
				description,
				amount,
				cleared: true,
			},
		],
		ledgerEntries: [],
		manualMatches: [],
		manualClassifications: { t1: category as never },
	};
}

describe('buildAdjustingEntries', () => {
	it('produces a balanced bank-charge entry (DR bankServiceCharges, CR bank)', () => {
		const result = engine.reconcile(inputsWith('bank-charge', -2500, 'fees'));
		const entries = buildAdjustingEntries(result, 'ohada');
		expect(entries).toHaveLength(1);
		const lines = entries[0].lines;
		expect(lines[0]).toMatchObject({ accountKey: 'bankServiceCharges', debit: 2500, credit: 0 });
		expect(lines[1]).toMatchObject({ accountKey: 'bank', debit: 0, credit: 2500 });
		const totalDebit = lines.reduce((s, l) => s + l.debit, 0);
		const totalCredit = lines.reduce((s, l) => s + l.credit, 0);
		expect(totalDebit).toBe(totalCredit);
	});

	it('produces a balanced interest-earned entry (DR bank, CR interestIncome)', () => {
		const result = engine.reconcile(inputsWith('interest-earned', 1500, 'interest'));
		const entries = buildAdjustingEntries(result, 'ohada');
		expect(entries[0].lines).toEqual([
			{ accountKey: 'bank', debit: 1500, credit: 0 },
			{ accountKey: 'interestIncome', debit: 0, credit: 1500 },
		]);
	});

	it('produces a balanced NSF entry (DR accountsReceivable, CR bank)', () => {
		const result = engine.reconcile(inputsWith('nsf-check', -75_000, 'nsf'));
		const entries = buildAdjustingEntries(result, 'ohada');
		expect(entries[0].lines).toEqual([
			{ accountKey: 'accountsReceivable', debit: 75_000, credit: 0 },
			{ accountKey: 'bank', debit: 0, credit: 75_000 },
		]);
	});

	it('skips outstanding-check (no JE needed; book entry already exists)', () => {
		const inputs: ReconciliationInputs = {
			periodEnd: '2026-04-30',
			openingBankBalance: 1_000_000,
			closingBankBalance: 1_000_000,
			openingBookBalance: 1_000_000,
			closingBookBalance: 970_000,
			bankTransactions: [],
			ledgerEntries: [{ id: 'os', date: '2026-04-29', description: 'check', amount: -30_000, recorded: true }],
			manualMatches: [],
			manualClassifications: {},
		};
		const result = engine.reconcile(inputs);
		const entries = buildAdjustingEntries(result, 'ohada');
		expect(entries).toHaveLength(0);
	});

	it('resolves bankServiceCharges to OHADA code 627', () => {
		const account = getAccount('bankServiceCharges', 'ohada');
		expect(account?.frameworkCode).toBe('627');
	});

	it('resolves bankServiceCharges to PCG code 627', () => {
		const account = getAccount('bankServiceCharges', 'pcg');
		expect(account?.frameworkCode).toBe('627');
	});

	it('resolves suspense to OHADA code 472', () => {
		const account = getAccount('suspense', 'ohada');
		expect(account?.frameworkCode).toBe('472');
	});
});
