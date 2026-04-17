import { describe, it, expect } from 'vitest';
import { solve } from '$lib/playgrounds/cvp/goal-seek';
import { calcSingle } from '$lib/playgrounds/cvp/engine';

describe('goal-seek solver', () => {
	it('solves for volume that achieves a given operating income', () => {
		// Price 50, VC 30, FC 100k — CM=20 → to hit OI $40k, need 7000 units
		const target = 40000;
		const result = solve({
			evaluate: (q) => calcSingle(50, 30, 100000, q, 0, 0).operatingIncome,
			target,
			variable: 'volume',
		});
		expect(result.success).toBe(true);
		expect(result.value).toBeCloseTo(7000, 1);
	});

	it('solves for price that achieves a given operating income', () => {
		// VC 30, FC 100k, Q 6000 — to hit OI $50k we need CM = 25 → price 55
		const result = solve({
			evaluate: (p) => calcSingle(p, 30, 100000, 6000, 0, 0).operatingIncome,
			target: 50000,
			variable: 'price',
		});
		expect(result.success).toBe(true);
		expect(result.value).toBeCloseTo(55, 1);
	});

	it('solves for fixed costs that zero out operating income', () => {
		// At CM $20 * 6000 units = 120k total CM, FC must equal 120k for OI=0
		const result = solve({
			evaluate: (fc) => calcSingle(50, 30, fc, 6000, 0, 0).operatingIncome,
			target: 0,
			variable: 'fixedCosts',
		});
		expect(result.success).toBe(true);
		expect(result.value).toBeCloseTo(120000, 0);
	});

	it('solves for variable cost that achieves target CM', () => {
		// price 50, fc 100k, q 6000, target OI 20k → total CM must be 120k → CM/u = 20 → vc = 30
		const result = solve({
			evaluate: (v) => calcSingle(50, v, 100000, 6000, 0, 0).operatingIncome,
			target: 20000,
			variable: 'variableCost',
		});
		expect(result.success).toBe(true);
		expect(result.value).toBeCloseTo(30, 1);
	});

	it('converges within tolerance for non-trivial cases', () => {
		const result = solve({
			evaluate: (q) => calcSingle(67.5, 22.35, 178990, q, 0, 0).operatingIncome,
			target: 55000,
			variable: 'volume',
		});
		expect(result.success).toBe(true);
		const verification = calcSingle(67.5, 22.35, 178990, result.value!, 0, 0).operatingIncome;
		expect(Math.abs(verification - 55000)).toBeLessThan(1);
	});
});
