import { describe, it, expect } from 'vitest';
import {
	calcSingle,
	calcMulti,
	calcIndifference,
	generateSteps,
	calcSensitivityTable,
	applyWhatIf,
} from '$lib/playgrounds/cvp/engine';

describe('calcSingle', () => {
	it('computes break-even for standard single-product case', () => {
		const result = calcSingle(50, 30, 100000, 6000, 20000, 0);
		expect(result.cm).toBe(20);
		expect(result.cmRatio).toBeCloseTo(0.4, 4);
		expect(result.bepUnits).toBe(5000);
		expect(result.bepRevenue).toBe(250000);
	});

	it('returns Infinity BEP when CM is zero', () => {
		const result = calcSingle(50, 50, 100000, 6000, 0, 0);
		expect(result.cm).toBe(0);
		expect(result.bepUnits).toBe(Infinity);
		expect(result.isProfit).toBe(false);
	});

	it('returns Infinity BEP when CM is negative', () => {
		const result = calcSingle(40, 50, 100000, 6000, 0, 0);
		expect(result.cm).toBe(-10);
		expect(result.bepUnits).toBe(Infinity);
	});

	it('grosses up after-tax target volume correctly', () => {
		// Target $100,000 net at 30% tax → pre-tax = $142,857.14
		// FC = $200,000; CM = $45 → after-tax units = ($200k + $142,857.14) / $45 = 7619.05
		const result = calcSingle(75, 30, 200000, 5000, 100000, 30);
		expect(result.preTaxTarget).toBeCloseTo(142857.14, 1);
		expect(result.afterTaxUnits).toBeCloseTo(7619.05, 1);
	});

	it('computes margin of safety correctly', () => {
		const result = calcSingle(50, 30, 100000, 7000, 0, 0);
		expect(result.bepUnits).toBe(5000);
		expect(result.mosUnits).toBe(2000);
		expect(result.mosPct).toBeCloseTo(28.571, 2);
	});

	it('computes degree of operating leverage correctly', () => {
		// Total CM = (50-30) * 7000 = 140,000; FC = 100,000 → OI = 40,000
		// DOL = 140,000 / 40,000 = 3.5
		const result = calcSingle(50, 30, 100000, 7000, 0, 0);
		expect(result.dol).toBe(3.5);
	});

	it('applies tax only on positive operating income', () => {
		// Loss case: q=1000, CM=20, FC=100k → OI=-80k, no tax expense
		const result = calcSingle(50, 30, 100000, 1000, 0, 30);
		expect(result.operatingIncome).toBe(-80000);
		expect(result.taxExpense).toBe(0);
		expect(result.netIncome).toBe(-80000);
	});

	it('caps effective tax rate below 100%', () => {
		const result = calcSingle(50, 30, 100000, 6000, 100, 100);
		// Effective rate clamped to 99.99% → preTaxTarget ≈ 100 / 0.0001 = 1,000,000
		expect(isFinite(result.preTaxTarget)).toBe(true);
		expect(result.preTaxTarget).toBeGreaterThan(0);
	});
});

describe('calcMulti', () => {
	it('computes weighted CM and per-product BEP for balanced mix', () => {
		const products = [
			{ name: 'A', price: 40, variableCost: 15, mixPct: 60 },
			{ name: 'B', price: 80, variableCost: 40, mixPct: 40 },
		];
		const result = calcMulti(products, 62000, 0, 0);
		expect(result.error).toBeUndefined();
		// Weighted CM: 0.6*25 + 0.4*40 = 31
		expect(result.weightedCM).toBeCloseTo(31, 4);
		expect(result.bepTotalUnits).toBe(2000);
		expect(result.perProduct[0].bepUnits).toBe(1200);
		expect(result.perProduct[1].bepUnits).toBe(800);
	});

	it('flags mix-total error when mix does not sum to 100', () => {
		const products = [
			{ name: 'A', price: 40, variableCost: 15, mixPct: 50 },
			{ name: 'B', price: 80, variableCost: 40, mixPct: 40 },
		];
		const result = calcMulti(products, 62000, 0, 0);
		expect(result.error).toBe(true);
		expect(result.errorType).toBe('mixTotal');
		expect(result.totalMixPct).toBe(90);
	});

	it('accepts single-product multi array (100% mix)', () => {
		const result = calcMulti([{ name: 'Solo', price: 50, variableCost: 30, mixPct: 100 }], 100000, 0, 0);
		expect(result.error).toBeUndefined();
		expect(result.weightedCM).toBe(20);
		expect(result.bepTotalUnits).toBe(5000);
	});
});

describe('calcIndifference', () => {
	it('finds crossover for classic case (A low-FC, B high-FC)', () => {
		// A: FC 80k, VC 45; B: FC 120k, VC 35
		// Q* = (120k - 80k) / (45 - 35) = 4000
		const result = calcIndifference(80000, 45, 120000, 35);
		expect(result.parallel).toBe(false);
		expect(result.dominated).toBe(false);
		expect(result.volume).toBe(4000);
		// Below 4000: A cheaper (lower FC dominates small volumes)
		expect(result.cheaperBelow).toBe('A');
		expect(result.cheaperAbove).toBe('B');
	});

	it('detects parallel lines when VCs match', () => {
		const result = calcIndifference(80000, 45, 120000, 45);
		expect(result.parallel).toBe(true);
		expect(result.dominator).toBe('A'); // lower FC
	});

	it('detects dominated alternative', () => {
		// Both higher FC and higher VC than opponent → dominated
		const result = calcIndifference(200000, 50, 100000, 30);
		expect(result.dominated).toBe(true);
		expect(result.dominator).toBe('B');
	});
});

describe('generateSteps', () => {
	it('generates symmetric steps around base value', () => {
		const steps = generateSteps(100, 20, 5);
		expect(steps).toHaveLength(5);
		expect(steps[0]).toBe(80);
		expect(steps[2]).toBe(100);
		expect(steps[4]).toBe(120);
	});

	it('falls back to absolute range when base is zero', () => {
		const steps = generateSteps(0, 10, 5);
		expect(steps).toHaveLength(5);
		expect(steps[0]).toBe(-10);
		expect(steps[4]).toBe(10);
	});
});

describe('calcSensitivityTable', () => {
	it('builds a 3x3 table for price × volume over operating income', () => {
		const base = { p: 50, v: 30, fc: 100000, q: 6000, targetProfit: 0, taxRate: 0 };
		const result = calcSensitivityTable(base, 'price', 'volume', 'operatingIncome', {
			rowValues: [45, 50, 55],
			colValues: [5000, 6000, 7000],
		});
		expect(result.rows).toHaveLength(3);
		expect(result.rows[0]).toHaveLength(3);
		// At price=50, volume=6000: OI = (50-30)*6000 - 100000 = 20,000
		expect(result.rows[1][1]).toBe(20000);
	});
});

describe('applyWhatIf', () => {
	it('applies percentage adjustments to all levers', () => {
		const base = {
			price: 100,
			variableCost: 40,
			fc: 50000,
			volume: 1000,
			targetProfit: 0,
			taxRate: 0,
		};
		// +10% price, +20% volume, -5% VC, -10% FC
		const result = applyWhatIf(base, 10, 20, -5, -10);
		// Adjusted: p=110, v=38, fc=45000, q=1200
		// OI = (110-38)*1200 - 45000 = 86,400 - 45,000 = 41,400
		expect(result.operatingIncome).toBeCloseTo(41400, 6);
	});

	it('returns base result when all adjustments are zero', () => {
		const base = {
			price: 50,
			variableCost: 30,
			fc: 100000,
			volume: 6000,
			targetProfit: 0,
			taxRate: 0,
		};
		const result = applyWhatIf(base, 0, 0, 0, 0);
		const direct = calcSingle(50, 30, 100000, 6000, 0, 0);
		expect(result.operatingIncome).toBe(direct.operatingIncome);
	});
});
