import { describe, it, expect } from 'vitest';
import { AmortizationEngine } from '../../src/lib/playgrounds/amortization/engine';
import type { AmortizationInputs } from '../../src/lib/playgrounds/amortization/types';

const baseInputs: AmortizationInputs = {
	principal: 10_000_000,
	nominalRate: 0.08,
	termPeriods: 12,
	frequency: 'monthly',
	customPeriodsPerYear: 12,
	method: 'annuity',
	dayCount: '30/360',
	startDate: '2026-01-01',
	firstPaymentDate: '2026-02-01',
	grace: { type: 'none', periods: 0 },
	insurance: { rate: 0, basis: 'initial' },
	fees: { origination: 0, prepaymentPenaltyPct: 0 },
	variableRates: [],
	extras: { perPeriod: 0, lumpSum: 0, lumpPeriod: 0 },
	balloonDueAt: 0,
	progressiveStep: 0.02,
};

function balanced(lines: { debit: number; credit: number }[]): boolean {
	const d = lines.reduce((acc, l) => acc + l.debit, 0);
	const c = lines.reduce((acc, l) => acc + l.credit, 0);
	return Math.abs(d - c) < 0.02;
}

describe('buildLifecycleEntries — disbursement + periodic + final', () => {
	const engine = new AmortizationEngine();

	it('emits disbursement, periodic-payment, and final-payment for a vanilla loan', () => {
		const result = engine.computeSchedule(baseInputs);
		const je = engine.buildJournalEntries(baseInputs, result, 'ohada');

		const stages = je.entries.map((e) => e.stage);
		expect(stages).toContain('disbursement');
		expect(stages).toContain('periodic-payment');
		expect(stages).toContain('final-payment');
	});

	it('all entries balance (debits = credits)', () => {
		const result = engine.computeSchedule(baseInputs);
		const je = engine.buildJournalEntries(baseInputs, result, 'ohada');
		for (const entry of je.entries) {
			expect(balanced(entry.lines), `${entry.stage} must balance`).toBe(true);
		}
	});

	it('disbursement debits bank for net cash and credits bankLoan for full principal', () => {
		const result = engine.computeSchedule({
			...baseInputs,
			fees: { origination: 50_000, prepaymentPenaltyPct: 0 },
		});
		const je = engine.buildJournalEntries(
			{
				...baseInputs,
				fees: { origination: 50_000, prepaymentPenaltyPct: 0 },
			},
			result,
			'ohada',
		);
		const disb = je.entries.find((e) => e.stage === 'disbursement')!;
		const bank = disb.lines.find((l) => l.accountKey === 'bank')!;
		const loan = disb.lines.find((l) => l.accountKey === 'bankLoan')!;
		const fee = disb.lines.find((l) => l.accountKey === 'externalServices');

		expect(bank.debit).toBeCloseTo(9_950_000, 0);
		expect(loan.credit).toBeCloseTo(10_000_000, 0);
		expect(fee?.debit).toBeCloseTo(50_000, 0);
	});
});

describe('buildLifecycleEntries — conditional stages', () => {
	const engine = new AmortizationEngine();

	it('does not emit grace-capitalization when no grace period', () => {
		const result = engine.computeSchedule(baseInputs);
		const je = engine.buildJournalEntries(baseInputs, result, 'ohada');
		expect(je.entries.find((e) => e.stage === 'grace-capitalization')).toBeUndefined();
	});

	it('emits grace-capitalization when grace-total is configured', () => {
		const inputs = { ...baseInputs, grace: { type: 'total' as const, periods: 3 } };
		const result = engine.computeSchedule(inputs);
		const je = engine.buildJournalEntries(inputs, result, 'ohada');
		const graceEntry = je.entries.find((e) => e.stage === 'grace-capitalization');
		expect(graceEntry).toBeDefined();
		const interest = graceEntry!.lines.find((l) => l.accountKey === 'interestExpense');
		const loan = graceEntry!.lines.find((l) => l.accountKey === 'bankLoan');
		expect(interest?.debit).toBeGreaterThan(0);
		expect(loan?.credit).toBeCloseTo(interest!.debit, 2);
	});

	it('emits insurance-premium when insurance rate > 0', () => {
		const inputs = {
			...baseInputs,
			insurance: { rate: 0.003, basis: 'initial' as const },
		};
		const result = engine.computeSchedule(inputs);
		const je = engine.buildJournalEntries(inputs, result, 'ohada');
		const ins = je.entries.find((e) => e.stage === 'insurance-premium');
		expect(ins).toBeDefined();
		expect(ins!.lines.find((l) => l.accountKey === 'insuranceExpense')?.debit).toBeGreaterThan(0);
	});

	it('emits prepayment when a lump sum is scheduled', () => {
		const inputs = {
			...baseInputs,
			extras: { perPeriod: 0, lumpSum: 500_000, lumpPeriod: 3 },
			fees: { origination: 0, prepaymentPenaltyPct: 2 },
		};
		const result = engine.computeSchedule(inputs);
		const je = engine.buildJournalEntries(inputs, result, 'ohada');
		const pre = je.entries.find((e) => e.stage === 'prepayment');
		expect(pre).toBeDefined();
		const penalty = pre!.lines.find((l) => l.accountKey === 'exceptionalExpense');
		expect(penalty?.debit).toBeCloseTo(500_000 * 0.02, 0);
	});
});

describe('buildLifecycleEntries — framework independence', () => {
	const engine = new AmortizationEngine();

	it('produces the same entry count across all four frameworks', () => {
		const result = engine.computeSchedule(baseInputs);
		const count = (fw: 'ohada' | 'pcg' | 'ifrs' | 'usgaap') =>
			engine.buildJournalEntries(baseInputs, result, fw).entries.length;
		const counts = [count('ohada'), count('pcg'), count('ifrs'), count('usgaap')];
		expect(new Set(counts).size).toBe(1);
	});
});
