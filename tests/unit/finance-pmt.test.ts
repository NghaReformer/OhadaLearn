import { describe, it, expect } from 'vitest';
import { pmt, remainingBalance } from '$lib/finance/pmt';

describe('pmt', () => {
	it('returns principal / periods when rate is zero', () => {
		expect(pmt(12000, 0, 12)).toBeCloseTo(1000, 10);
	});

	it('computes canonical annuity payment (10k @ 5% for 10 years annual)', () => {
		// Standard textbook example: PMT = 10000 * 0.05 / (1 - 1.05^-10) = 1295.046...
		expect(pmt(10000, 0.05, 10)).toBeCloseTo(1295.04575, 4);
	});

	it('computes monthly payment for 200k @ 6% nominal over 360 months', () => {
		// Well-known US mortgage: 1199.10
		const monthlyRate = 0.06 / 12;
		expect(pmt(200000, monthlyRate, 360)).toBeCloseTo(1199.1, 1);
	});

	it('returns 0 when periods is zero', () => {
		expect(pmt(10000, 0.05, 0)).toBe(0);
	});

	it('handles tiny rates without numerical blow-up', () => {
		const payment = pmt(100000, 1e-10, 120);
		expect(payment).toBeGreaterThan(833);
		expect(payment).toBeLessThan(834);
	});
});

describe('remainingBalance', () => {
	it('equals principal at k=0', () => {
		expect(remainingBalance(10000, 0.05, 10, 0)).toBeCloseTo(10000, 8);
	});

	it('equals zero at k=periods', () => {
		expect(remainingBalance(10000, 0.05, 10, 10)).toBeCloseTo(0, 6);
	});

	it('produces monotonically decreasing balance', () => {
		let prev = 10000;
		for (let k = 1; k <= 10; k++) {
			const bal = remainingBalance(10000, 0.05, 10, k);
			expect(bal).toBeLessThan(prev);
			prev = bal;
		}
	});

	it('matches zero-rate linear amortization', () => {
		// At r=0 the balance should decline linearly
		expect(remainingBalance(12000, 0, 12, 6)).toBeCloseTo(6000, 8);
	});
});
