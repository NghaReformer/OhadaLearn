import { describe, it, expect } from 'vitest';
import { irr } from '$lib/finance/irr';

describe('irr', () => {
	it('recovers the rate of a simple annuity', () => {
		// Lender disburses 10000, receives 1295.0457 for 10 periods => IRR = 5%
		const flows = [-10000, ...Array(10).fill(1295.04575)];
		const rate = irr(flows);
		expect(rate).toBeCloseTo(0.05, 5);
	});

	it('returns zero IRR when payments exactly equal principal', () => {
		const flows = [-1000, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100];
		const rate = irr(flows);
		expect(rate).toBeCloseTo(0, 5);
	});

	it('handles negative IRR (losses)', () => {
		// Pay 1000, get back only 900 over 5 periods
		// PV annuity factor 1000/180 ≈ 5.5556 solves r ≈ -3.41%
		const flows = [-1000, 180, 180, 180, 180, 180];
		const rate = irr(flows);
		expect(rate).toBeLessThan(0);
		expect(rate).toBeGreaterThan(-0.05);
		// Verify it's a root by re-computing NPV
		let npv = 0;
		for (let k = 0; k < flows.length; k++) npv += flows[k] / Math.pow(1 + rate, k);
		expect(Math.abs(npv)).toBeLessThan(1e-6);
	});

	it('recovers a large IRR (~50%)', () => {
		// 3-year investment: 1000 -> 500, 500, 500
		const flows = [-1000, 500, 500, 500];
		const rate = irr(flows);
		expect(rate).toBeCloseTo(0.23375, 3);
	});

	it('returns NaN when no sign change', () => {
		const flows = [100, 100, 100];
		expect(Number.isNaN(irr(flows))).toBe(true);
	});

	it('returns NaN for degenerate input', () => {
		expect(Number.isNaN(irr([1]))).toBe(true);
	});

	// Regression: a 480-period progressive loan used to return NaN because the
	// upper bisection bound was 10 and Math.pow(11, 480) overflows to Infinity.
	// With the bound tightened to 2.0, the solver converges cleanly.
	it('handles long schedules (480 periods) without overflowing', () => {
		const principal = 10_000_000;
		const r = 0.08 / 12;
		const n = 480;
		// Constant annuity payment so there is a genuine IRR at the nominal rate.
		const pmt = (principal * r) / (1 - Math.pow(1 + r, -n));
		const flows = [-principal, ...Array(n).fill(pmt)];
		const rate = irr(flows);
		expect(Number.isFinite(rate)).toBe(true);
		expect(rate).toBeCloseTo(r, 6);
	});
});
