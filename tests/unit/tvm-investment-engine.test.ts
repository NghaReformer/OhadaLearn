import { describe, it, expect } from 'vitest';
import {
	calcNPV,
	calcIRR,
	calcMIRR,
	calcPayback,
	calcDiscountedPayback,
	calcProfitabilityIndex,
	InvestmentEngine
} from '$lib/playgrounds/tvm/investment-engine';
import type { CashFlow } from '$lib/playgrounds/tvm/types';

// Canonical textbook example: I₀ = −100,000, 5× 30,000 inflows
const textbook: CashFlow[] = [
	{ period: 0, amount: -100000 },
	{ period: 1, amount: 30000 },
	{ period: 2, amount: 30000 },
	{ period: 3, amount: 30000 },
	{ period: 4, amount: 30000 },
	{ period: 5, amount: 30000 }
];

describe('calcNPV', () => {
	it('returns the textbook value at 8%', () => {
		expect(calcNPV(textbook, 8)).toBeCloseTo(19781.30, 1);
	});

	it('equals sum-of-flows when rate is 0', () => {
		expect(calcNPV(textbook, 0)).toBeCloseTo(50000, 4);
	});

	it('is negative when rate exceeds IRR', () => {
		expect(calcNPV(textbook, 30)).toBeLessThan(0);
	});
});

describe('calcIRR', () => {
	it('solves the textbook IRR', () => {
		const irr = calcIRR(textbook);
		expect(irr).not.toBeNull();
		expect(irr!).toBeCloseTo(15.2382, 2);
	});

	it('returns null when flows are all positive', () => {
		expect(calcIRR([{ period: 0, amount: 100 }, { period: 1, amount: 100 }])).toBeNull();
	});

	it('returns null when flows are all negative', () => {
		expect(calcIRR([{ period: 0, amount: -100 }, { period: 1, amount: -100 }])).toBeNull();
	});
});

describe('calcMIRR', () => {
	it('uses separate finance & reinvest rates', () => {
		// Finance rate for outflows, reinvest for inflows. With 10%/8% the
		// MIRR should differ from IRR (15.24%).
		const mirr = calcMIRR(textbook, 10, 8);
		expect(mirr).not.toBeNull();
		// FV_positives = 30000·(1.08^4 + 1.08^3 + 1.08^2 + 1.08 + 1) = 175,980.73
		// PV_negatives = -100,000 (period 0)
		// MIRR = (175980.73/100000)^(1/5) - 1 ≈ 0.1198 = 11.98%
		expect(mirr!).toBeCloseTo(11.9700, 2);
	});

	it('equals IRR when finance = reinvest = IRR', () => {
		const irr = calcIRR(textbook)!;
		const mirr = calcMIRR(textbook, irr, irr);
		expect(mirr!).toBeCloseTo(irr, 2);
	});
});

describe('calcPayback', () => {
	it('interpolates fractional payback correctly', () => {
		const p = calcPayback(textbook);
		// Cumulative undiscounted: 0: -100000, 1: -70000, 2: -40000, 3: -10000, 4: +20000
		// Crosses zero between period 3 and 4. Fraction = 10000/30000 = 0.3333
		expect(p).toBeCloseTo(3 + 10000 / 30000, 4);
	});

	it('returns 0 when initial flow is non-negative', () => {
		const p = calcPayback([
			{ period: 0, amount: 100 },
			{ period: 1, amount: 50 }
		]);
		expect(p).toBe(0);
	});

	it('returns null when cumulative never crosses zero', () => {
		const p = calcPayback([
			{ period: 0, amount: -1000 },
			{ period: 1, amount: 100 },
			{ period: 2, amount: 100 }
		]);
		expect(p).toBeNull();
	});
});

describe('calcDiscountedPayback', () => {
	it('is longer than simple payback at positive rates', () => {
		const simple = calcPayback(textbook)!;
		const disc = calcDiscountedPayback(textbook, 8)!;
		expect(disc).toBeGreaterThan(simple);
	});

	it('equals simple payback at 0%', () => {
		expect(calcDiscountedPayback(textbook, 0)).toBeCloseTo(calcPayback(textbook)!, 4);
	});

	it('matches textbook value at 8%', () => {
		// Textbook discounted payback for this setup ≈ 4.03
		expect(calcDiscountedPayback(textbook, 8)).toBeCloseTo(4.03, 1);
	});
});

describe('calcProfitabilityIndex', () => {
	it('> 1 when NPV > 0', () => {
		const pi = calcProfitabilityIndex(textbook, 8);
		expect(pi).not.toBeNull();
		expect(pi!).toBeGreaterThan(1);
		// PI = (100000 + 19781.30) / 100000 = 1.198
		expect(pi!).toBeCloseTo(1.1978, 2);
	});

	it('= 1 exactly when NPV = 0 (rate = IRR)', () => {
		const pi = calcProfitabilityIndex(textbook, 15.2382);
		expect(pi!).toBeCloseTo(1, 2);
	});
});

describe('InvestmentEngine', () => {
	const engine = new InvestmentEngine();

	it('computes all metrics in one call', () => {
		const m = engine.metrics({
			flows: textbook,
			discountRate: 8,
			financeRate: 10,
			reinvestRate: 8,
			periodsPerYear: 1
		});
		expect(m.npv).toBeCloseTo(19781.30, 1);
		expect(m.irr).toBeCloseTo(15.2382, 2);
		expect(m.mirr).toBeCloseTo(11.9700, 2);
		expect(m.payback).toBeCloseTo(3.3333, 3);
		expect(m.discountedPayback).toBeCloseTo(4.03, 1);
		expect(m.profitabilityIndex).toBeCloseTo(1.1978, 2);
		expect(m.totalInflow).toBe(150000);
		expect(m.totalOutflow).toBe(100000);
	});

	it('warns when flows lack a sign change', () => {
		const v = engine.validate({
			flows: [{ period: 0, amount: 100 }, { period: 1, amount: 100 }],
			discountRate: 8,
			financeRate: 10,
			reinvestRate: 8,
			periodsPerYear: 1
		});
		expect(v.warnings.some((w) => w.key === 'tvm.inv.validation.noSignChange')).toBe(true);
	});

	it('rejects fewer than 2 flows', () => {
		const v = engine.validate({
			flows: [{ period: 0, amount: -100 }],
			discountRate: 8,
			financeRate: 10,
			reinvestRate: 8,
			periodsPerYear: 1
		});
		expect(v.valid).toBe(false);
		expect(v.errors.some((e) => e.key === 'tvm.inv.validation.minFlows')).toBe(true);
	});
});
