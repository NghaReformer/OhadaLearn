import { describe, it, expect } from 'vitest';
import { AmortizationEngine } from '$lib/playgrounds/amortization/engine';
import type { AmortizationInputs } from '$lib/playgrounds/amortization/types';

const engine = new AmortizationEngine();

function baseInputs(overrides: Partial<AmortizationInputs> = {}): AmortizationInputs {
	return {
		principal: 100000,
		nominalRate: 0.06,
		termPeriods: 12,
		frequency: 'monthly',
		customPeriodsPerYear: 12,
		method: 'annuity',
		dayCount: '30/360',
		startDate: '2024-01-01',
		firstPaymentDate: '2024-02-01',
		grace: { type: 'none', periods: 0 },
		insurance: { rate: 0, basis: 'initial' },
		fees: { origination: 0, prepaymentPenaltyPct: 0 },
		variableRates: [],
		extras: { perPeriod: 0, lumpSum: 0, lumpPeriod: 0 },
		balloonDueAt: 0,
		progressiveStep: 0.02,
		...overrides,
	};
}

describe('AmortizationEngine — annuity', () => {
	it('produces a constant scheduled payment', () => {
		const result = engine.computeSchedule(baseInputs({ method: 'annuity' }));
		expect(result.rows.length).toBe(12);
		const payments = result.rows.map((r) => r.scheduledPayment);
		const min = Math.min(...payments);
		const max = Math.max(...payments);
		expect(max - min).toBeLessThan(0.01);
	});

	it('closes balance to zero at end of term', () => {
		const result = engine.computeSchedule(baseInputs({ method: 'annuity' }));
		expect(result.rows[result.rows.length - 1].closingBalance).toBeLessThan(0.01);
	});

	it('total interest is positive and less than principal for short term', () => {
		const result = engine.computeSchedule(baseInputs({ method: 'annuity' }));
		expect(result.totals.interest).toBeGreaterThan(0);
		expect(result.totals.interest).toBeLessThan(result.totals.principal);
	});

	it('sum of principal equals original principal', () => {
		const result = engine.computeSchedule(baseInputs({ method: 'annuity' }));
		expect(result.totals.principal).toBeCloseTo(100000, 1);
	});
});

describe('AmortizationEngine — linear', () => {
	it('produces constant principal across rows', () => {
		const result = engine.computeSchedule(baseInputs({ method: 'linear' }));
		const principals = result.rows.map((r) => r.principal);
		const expected = 100000 / 12;
		for (const p of principals) expect(p).toBeCloseTo(expected, 4);
	});

	it('produces declining scheduled payments', () => {
		const result = engine.computeSchedule(baseInputs({ method: 'linear' }));
		for (let i = 1; i < result.rows.length; i++) {
			expect(result.rows[i].scheduledPayment).toBeLessThan(result.rows[i - 1].scheduledPayment);
		}
	});
});

describe('AmortizationEngine — bullet', () => {
	it('pays interest only in non-final periods', () => {
		const result = engine.computeSchedule(baseInputs({ method: 'bullet' }));
		for (let i = 0; i < result.rows.length - 1; i++) {
			expect(result.rows[i].principal).toBe(0);
			expect(result.rows[i].interest).toBeGreaterThan(0);
		}
	});

	it('repays full principal in the final row and flags balloon+final', () => {
		const result = engine.computeSchedule(baseInputs({ method: 'bullet' }));
		const last = result.rows[result.rows.length - 1];
		expect(last.principal).toBeCloseTo(100000, 2);
		expect(last.flags).toContain('balloon');
		expect(last.flags).toContain('final');
	});
});

describe('AmortizationEngine — progressive', () => {
	it('produces growing scheduled payments at step rate', () => {
		const result = engine.computeSchedule(
			baseInputs({ method: 'progressive', progressiveStep: 0.005 })
		);
		// Payments increase by ~g each period (excluding grace)
		for (let i = 1; i < result.rows.length; i++) {
			expect(result.rows[i].scheduledPayment).toBeGreaterThanOrEqual(
				result.rows[i - 1].scheduledPayment - 0.01
			);
		}
	});

	it('amortizes to zero when step is below rate', () => {
		const result = engine.computeSchedule(
			baseInputs({ method: 'progressive', progressiveStep: 0.001 })
		);
		expect(result.rows[result.rows.length - 1].closingBalance).toBeLessThan(0.5);
	});
});

describe('AmortizationEngine — balloon', () => {
	it('truncates annuity and lumps remaining balance at cutoff', () => {
		const input = baseInputs({
			method: 'balloon',
			termPeriods: 12,
			balloonDueAt: 6,
		});
		const result = engine.computeSchedule(input);
		expect(result.rows.length).toBe(6);
		const last = result.rows[5];
		expect(last.flags).toContain('balloon');
		expect(last.closingBalance).toBe(0);
		expect(last.principal).toBeGreaterThan(50000); // most of principal left
	});
});

describe('AmortizationEngine — grace periods', () => {
	it('partial grace: interest paid, principal unchanged', () => {
		const result = engine.computeSchedule(
			baseInputs({
				method: 'annuity',
				grace: { type: 'partial', periods: 3 },
				termPeriods: 12,
			})
		);
		const graceRows = result.rows.slice(0, 3);
		for (const row of graceRows) {
			expect(row.principal).toBe(0);
			expect(row.interest).toBeGreaterThan(0);
			expect(row.closingBalance).toBe(row.openingBalance);
			expect(row.flags).toContain('grace-partial');
		}
	});

	it('total grace: interest capitalized into balance', () => {
		const result = engine.computeSchedule(
			baseInputs({
				method: 'annuity',
				grace: { type: 'total', periods: 3 },
				termPeriods: 12,
			})
		);
		const graceRows = result.rows.slice(0, 3);
		for (const row of graceRows) {
			expect(row.closingBalance).toBeGreaterThan(row.openingBalance);
			expect(row.flags).toContain('grace-total');
		}
	});
});

describe('AmortizationEngine — variable rates', () => {
	it('applies rate change and flags the row', () => {
		const result = engine.computeSchedule(
			baseInputs({
				method: 'annuity',
				variableRates: [{ fromPeriod: 6, newRate: 0.12 }],
			})
		);
		const rateChange = result.rows.find((r) => r.flags.includes('rate-change'));
		expect(rateChange).toBeDefined();
		expect(rateChange!.period).toBe(6);
		expect(rateChange!.ratePerPeriod).toBeCloseTo(0.12 / 12, 6);
	});
});

describe('AmortizationEngine — insurance', () => {
	it('charges insurance on initial principal when basis=initial', () => {
		const result = engine.computeSchedule(
			baseInputs({
				insurance: { rate: 0.012, basis: 'initial' },
			})
		);
		const expectedPerMonth = (100000 * 0.012) / 12;
		for (const row of result.rows) expect(row.insurance).toBeCloseTo(expectedPerMonth, 4);
	});

	it('charges insurance on declining balance when basis=remaining', () => {
		const result = engine.computeSchedule(
			baseInputs({
				insurance: { rate: 0.012, basis: 'remaining' },
			})
		);
		// Insurance should decrease as balance falls
		for (let i = 1; i < result.rows.length; i++) {
			expect(result.rows[i].insurance).toBeLessThanOrEqual(result.rows[i - 1].insurance + 1e-6);
		}
	});
});

describe('AmortizationEngine — extra payments', () => {
	it('applies per-period extra and flags the row', () => {
		const result = engine.computeSchedule(
			baseInputs({
				extras: { perPeriod: 2000, lumpSum: 0, lumpPeriod: 0 },
			})
		);
		expect(result.rows[0].extra).toBe(2000);
		expect(result.rows[0].flags).toContain('extra');
		// Paying $2k extra monthly on a $100k/12mo loan cuts the term
		expect(result.rows.length).toBeLessThan(12);
	});

	it('applies a lump sum at the target period', () => {
		const result = engine.computeSchedule(
			baseInputs({
				extras: { perPeriod: 0, lumpSum: 20000, lumpPeriod: 3 },
			})
		);
		const lumpRow = result.rows.find((r) => r.flags.includes('lump'));
		expect(lumpRow).toBeDefined();
		expect(lumpRow!.period).toBe(3);
		expect(lumpRow!.extra).toBeGreaterThanOrEqual(20000 - 0.01);
	});
});

describe('AmortizationEngine — APR & KPIs', () => {
	it('APR equals nominal when there are no fees and rates are constant', () => {
		const input = baseInputs();
		const result = engine.computeSchedule(input);
		const apr = engine.computeApr(input, result);
		// APR (annualized from period-level IRR) ≈ effective annual rate
		const pPerYear = 12;
		const expectedApr = Math.pow(1 + 0.06 / pPerYear, pPerYear) - 1;
		expect(apr).toBeCloseTo(expectedApr, 4);
	});

	it('APR exceeds nominal when origination fees are charged', () => {
		const input = baseInputs({
			fees: { origination: 1000, prepaymentPenaltyPct: 0 },
		});
		const result = engine.computeSchedule(input);
		const apr = engine.computeApr(input, result);
		const effective = Math.pow(1 + 0.06 / 12, 12) - 1;
		expect(apr).toBeGreaterThan(effective);
	});

	it('KPIs report first payment, totals, ratios', () => {
		const input = baseInputs();
		const result = engine.computeSchedule(input);
		const kpis = engine.computeKpis(result, input);
		expect(kpis.firstPayment).toBeCloseTo(result.rows[0].totalPayment, 6);
		expect(kpis.totalInterest).toBeCloseTo(result.totals.interest, 6);
		expect(kpis.totalPaid).toBeCloseTo(result.totals.paid, 6);
		expect(kpis.interestToPrincipalRatio).toBeGreaterThan(0);
	});

	it('balloon KPI surfaces the final lump amount', () => {
		const input = baseInputs({ method: 'balloon', balloonDueAt: 6 });
		const result = engine.computeSchedule(input);
		const kpis = engine.computeKpis(result, input);
		expect(kpis.balloonAmount).toBeGreaterThan(0);
	});
});
