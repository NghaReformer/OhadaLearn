import { describe, it, expect } from 'vitest';
import { BankReconciliationEngine } from '$lib/playgrounds/bank-reconciliation/engine';
import type {
	BankTransaction,
	LedgerEntry,
	ReconciliationInputs,
} from '$lib/playgrounds/bank-reconciliation/types';

const engine = new BankReconciliationEngine();

function makeInputs(overrides: Partial<ReconciliationInputs> = {}): ReconciliationInputs {
	return {
		periodEnd: '2026-04-30',
		openingBankBalance: 1_000_000,
		closingBankBalance: 1_000_000,
		openingBookBalance: 1_000_000,
		closingBookBalance: 1_000_000,
		bankTransactions: [],
		ledgerEntries: [],
		manualMatches: [],
		manualClassifications: {},
		...overrides,
	};
}

function bankTx(id: string, amount: number, date = '2026-04-15', extras: Partial<BankTransaction> = {}): BankTransaction {
	return { id, date, description: '', amount, cleared: true, ...extras };
}

function ledger(id: string, amount: number, date = '2026-04-15', extras: Partial<LedgerEntry> = {}): LedgerEntry {
	return { id, date, description: '', amount, recorded: true, ...extras };
}

describe('BankReconciliationEngine.match', () => {
	it('matches by reference + amount with confidence 1', () => {
		const inputs = makeInputs({
			bankTransactions: [bankTx('b1', 50000, '2026-04-10', { reference: 'CHK001' })],
			ledgerEntries: [ledger('l1', -50000, '2026-04-10', { reference: 'CHK001' })],
		});
		const matches = engine.match(inputs);
		expect(matches).toHaveLength(1);
		expect(matches[0]).toMatchObject({ matchType: 'exact-amount-ref', confidence: 1 });
	});

	it('matches by amount + date within 3 days when no reference', () => {
		const inputs = makeInputs({
			bankTransactions: [bankTx('b1', 75000, '2026-04-10')],
			ledgerEntries: [ledger('l1', -75000, '2026-04-12')],
		});
		const matches = engine.match(inputs);
		expect(matches).toHaveLength(1);
		expect(matches[0].matchType).toBe('exact-amount-date');
	});

	it('does not match when amounts differ', () => {
		const inputs = makeInputs({
			bankTransactions: [bankTx('b1', 75000)],
			ledgerEntries: [ledger('l1', -76000)],
		});
		expect(engine.match(inputs)).toHaveLength(0);
	});

	it('manual matches override and lock participants from auto-pass', () => {
		const inputs = makeInputs({
			bankTransactions: [bankTx('b1', 100, '2026-04-10', { reference: 'X' })],
			ledgerEntries: [ledger('l1', -100, '2026-04-10', { reference: 'X' }), ledger('l2', -100, '2026-04-10')],
			manualMatches: [{ bankTxId: 'b1', ledgerEntryId: 'l2', matchType: 'manual', confidence: 1 }],
		});
		const matches = engine.match(inputs);
		expect(matches).toHaveLength(1);
		expect(matches[0]).toMatchObject({ ledgerEntryId: 'l2', matchType: 'manual' });
	});
});

describe('BankReconciliationEngine.classify', () => {
	it('flags unmatched ledger debit (positive) as deposit-in-transit', () => {
		const inputs = makeInputs({
			ledgerEntries: [ledger('l1', 200_000, '2026-04-29')],
		});
		const result = engine.reconcile(inputs);
		expect(result.items[0].category).toBe('deposit-in-transit');
	});

	it('flags unmatched ledger credit (negative) as outstanding-check', () => {
		const inputs = makeInputs({
			ledgerEntries: [ledger('l1', -50_000, '2026-04-29')],
		});
		const result = engine.reconcile(inputs);
		expect(result.items[0].category).toBe('outstanding-check');
	});

	it('classifies bank-only debit with "interest" keyword as interest-earned', () => {
		const inputs = makeInputs({
			bankTransactions: [bankTx('b1', 1500, '2026-04-30', { description: 'Interest credited' })],
		});
		const result = engine.reconcile(inputs);
		expect(result.items[0].category).toBe('interest-earned');
	});

	it('classifies bank-only debit with "frais" keyword as bank-charge', () => {
		const inputs = makeInputs({
			bankTransactions: [bankTx('b1', -2500, '2026-04-30', { description: 'Frais de tenue de compte' })],
		});
		const result = engine.reconcile(inputs);
		expect(result.items[0].category).toBe('bank-charge');
	});

	it('honours manual classification overrides', () => {
		const inputs = makeInputs({
			bankTransactions: [bankTx('b1', -2500, '2026-04-30', { description: 'Mystery item' })],
			manualClassifications: { b1: 'nsf-check' },
		});
		const result = engine.reconcile(inputs);
		expect(result.items[0].category).toBe('nsf-check');
	});
});

describe('BankReconciliationEngine.buildStatement', () => {
	it('reconciles cleanly when no items', () => {
		const inputs = makeInputs({ closingBankBalance: 500_000, closingBookBalance: 500_000 });
		const result = engine.reconcile(inputs);
		expect(result.statement.isReconciled).toBe(true);
		expect(result.statement.variance).toBe(0);
	});

	it('balances classic 2-item case (deposit-in-transit + outstanding-check)', () => {
		// Bank: 500k. Books: 500k. DIT = +50k (books has it, bank doesn't).
		// Outstanding check = -30k (books recorded payment, bank hasn't cleared).
		// Adjusted bank = 500k + 50k - 30k = 520k. Adjusted books = 500k. Variance = 20k.
		// Wait — should reconcile when statement and books are TRUE balances. Let's set up properly:
		// bank statement balance = 500k (but books ledger has 50k DIT and -30k outstanding not in bank)
		// → true cash = bank stmt + DIT - OS = 500k + 50k - 30k = 520k
		// → books shows 520k
		// Adjusted bank = 520k. Adjusted books = 520k. Reconciled.
		const inputs = makeInputs({
			closingBankBalance: 500_000,
			closingBookBalance: 520_000,
			ledgerEntries: [
				ledger('dit', 50_000, '2026-04-29'),
				ledger('os', -30_000, '2026-04-28'),
			],
		});
		const result = engine.reconcile(inputs);
		expect(result.statement.bankSide.adjustedBalance).toBe(520_000);
		expect(result.statement.booksSide.adjustedBalance).toBe(520_000);
		expect(result.statement.isReconciled).toBe(true);
	});

	it('detects unbalanced when book-side adjustment is missing', () => {
		// Bank: 500k. Books: 500k. Bank charge of 2k on statement only.
		// Adjusted bank = 500k. Adjusted books = 500k - 2k = 498k. Variance = 2k.
		const inputs = makeInputs({
			closingBankBalance: 500_000,
			closingBookBalance: 500_000,
			bankTransactions: [bankTx('charge', -2000, '2026-04-30', { description: 'Bank charges' })],
		});
		const result = engine.reconcile(inputs);
		expect(result.statement.isReconciled).toBe(false);
		expect(result.statement.variance).toBeGreaterThan(0);
		expect(result.statement.booksSide.lessBankCharges).toBe(2000);
	});
});

describe('BankReconciliationEngine.computeKpis', () => {
	it('counts items by category', () => {
		const inputs = makeInputs({
			bankTransactions: [
				bankTx('c1', -1000, '2026-04-30', { description: 'service charges' }),
				bankTx('i1', 500, '2026-04-30', { description: 'interest credit' }),
			],
			ledgerEntries: [ledger('os1', -50_000, '2026-04-28')],
		});
		const result = engine.reconcile(inputs);
		expect(result.kpis.itemsByCategory['bank-charge']).toBe(1);
		expect(result.kpis.itemsByCategory['interest-earned']).toBe(1);
		expect(result.kpis.itemsByCategory['outstanding-check']).toBe(1);
	});

	it('reports reconciled status when statement balances', () => {
		const inputs = makeInputs();
		const result = engine.reconcile(inputs);
		expect(result.kpis.reconciliationStatus).toBe('reconciled');
	});
});

describe('BankReconciliationEngine.solveMissingBalance', () => {
	it('solves missing closing bank balance from books side', () => {
		// Adjust books = 500k - 2k charge = 498k. Adjust bank = X. For reconciled: X = 498k.
		// closingBankBalance must be such that X = 498k.
		const inputs = makeInputs({
			closingBankBalance: 0,
			closingBookBalance: 500_000,
			bankTransactions: [bankTx('charge', -2000, '2026-04-30', { description: 'service charges' })],
		});
		const solved = engine.solveMissingBalance(inputs, 'books');
		expect(solved).toBe(498_000);
	});
});

describe('BankReconciliationEngine.detectErrorItem', () => {
	it('flags an item whose amount equals the variance', () => {
		const inputs = makeInputs({
			closingBankBalance: 500_000,
			closingBookBalance: 500_000,
			bankTransactions: [bankTx('mystery', -3500, '2026-04-30', { description: 'service charges' })],
		});
		const result = engine.reconcile(inputs);
		const id = engine.detectErrorItem(result.items, result.statement.variance);
		expect(id).toBe('mystery');
	});
});
