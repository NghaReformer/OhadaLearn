import { describe, it, expect } from 'vitest';
import {
	bisect,
	solveSimpleRate,
	solveSimpleYears,
	solveSimplePrincipal,
	solveCompoundRate,
	solveCompoundYears,
	solveCompoundPrincipal,
	solveDoublingYears,
	solveBondMarketRate,
	solveBondCouponRate,
	solveBondFaceValue,
} from '$lib/playgrounds/interest/solvers';
import type { BondInputs, InterestInputs } from '$lib/playgrounds/interest/types';

function simpleInputs(overrides: Partial<InterestInputs> = {}): InterestInputs {
	return {
		principal: 1_000_000,
		nominalRate: 0.1,
		startDate: '2026-01-01',
		endDate: '2031-01-01',
		dayCount: '30/360',
		frequency: 'annual',
		continuous: false,
		...overrides,
	};
}

function bondInputs(overrides: Partial<BondInputs> = {}): BondInputs {
	return {
		faceValue: 1_000_000,
		couponRate: 0.08,
		marketRate: 0.1,
		termYears: 5,
		paymentFrequency: 'annual',
		...overrides,
	};
}

describe('bisect (generic)', () => {
	it('finds the root of a monotonic function', () => {
		const result = bisect({
			evaluate: (x) => x * x,
			target: 100,
			lo: 0,
			hi: 20,
		});
		expect(result.success).toBe(true);
		expect(result.value).toBeCloseTo(10, 4);
	});

	it('reports no-bracket when target is outside the evaluable range', () => {
		const result = bisect({
			evaluate: () => 5,
			target: 0,
			lo: 0,
			hi: 1,
		});
		expect(result.success).toBe(false);
		expect(result.reason).toBe('no-bracket');
	});
});

describe('Simple-interest solvers', () => {
	it('solveSimpleRate recovers the rate that produces a known total', () => {
		// 1M @ 10% simple 30/360 for 5y → total 1.5M. Recover 0.10.
		const r = solveSimpleRate(simpleInputs(), 1_500_000);
		expect(r.success).toBe(true);
		expect(r.value).toBeCloseTo(0.1, 4);
	});

	it('solveSimpleYears recovers the term that produces a known total', () => {
		const r = solveSimpleYears(simpleInputs(), 1_500_000);
		expect(r.success).toBe(true);
		// 5 years ±0.1 (date-arithmetic tolerance)
		expect(r.value).toBeGreaterThan(4.9);
		expect(r.value).toBeLessThan(5.1);
	});

	it('solveSimplePrincipal recovers the principal that produces a known total', () => {
		const r = solveSimplePrincipal(simpleInputs(), 1_500_000);
		expect(r.success).toBe(true);
		// Bisection converges within the solver's relative tolerance (~1e-6 × target).
		expect(Math.abs(r.value! - 1_000_000)).toBeLessThan(5);
	});
});

describe('Compound-interest solvers', () => {
	it('solveCompoundRate recovers ~10% for 1000 -> 1610.51 over 5y annual', () => {
		const r = solveCompoundRate(
			simpleInputs({ principal: 1000, frequency: 'annual' }),
			1610.51,
		);
		expect(r.success).toBe(true);
		expect(r.value).toBeCloseTo(0.1, 3);
	});

	it('solveCompoundYears recovers ~5 years for the same case', () => {
		const r = solveCompoundYears(
			simpleInputs({ principal: 1000, frequency: 'annual' }),
			1610.51,
		);
		expect(r.success).toBe(true);
		expect(r.value).toBeGreaterThan(4.9);
		expect(r.value).toBeLessThan(5.1);
	});

	it('solveCompoundPrincipal recovers 1000 for target 1610.51', () => {
		const r = solveCompoundPrincipal(
			simpleInputs({ principal: 500, frequency: 'annual' }),
			1610.51,
		);
		expect(r.success).toBe(true);
		expect(r.value).toBeCloseTo(1000, 0);
	});

	it('solveDoublingYears at 6% annual returns ~11.9 years (Rule of 72 predicts 12)', () => {
		const r = solveDoublingYears(1_000_000, 6, 'annual');
		expect(r.success).toBe(true);
		expect(r.value).toBeGreaterThan(11.8);
		expect(r.value).toBeLessThan(12);
	});

	it('solveDoublingYears at 6% continuous is ln(2)/0.06 ≈ 11.55 years', () => {
		const r = solveDoublingYears(1_000_000, 6, 'continuous');
		expect(r.success).toBe(true);
		expect(r.value).toBeCloseTo(Math.log(2) / 0.06, 1);
	});
});

describe('Bond / Effective solvers', () => {
	it('solveBondMarketRate recovers 10% from a 924,184 discount bond', () => {
		const r = solveBondMarketRate(bondInputs(), 924_184);
		expect(r.success).toBe(true);
		expect(r.value).toBeCloseTo(0.1, 3);
	});

	it('solveBondCouponRate recovers 8% from the same target', () => {
		const r = solveBondCouponRate(bondInputs(), 924_184);
		expect(r.success).toBe(true);
		expect(r.value).toBeCloseTo(0.08, 3);
	});

	it('solveBondFaceValue doubles when target issue price doubles (at same coupon/market)', () => {
		const basePrice = 924_184;
		const r = solveBondFaceValue(bondInputs(), basePrice * 2);
		expect(r.success).toBe(true);
		expect(Math.abs(r.value! - 2_000_000)).toBeLessThan(5);
	});
});
