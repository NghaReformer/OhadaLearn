import { describe, it, expect } from 'vitest';
import {
	TVMEngine,
	getEffectivePeriodicRate,
	getTotalPaymentPeriods
} from '$lib/playgrounds/tvm/engine';
import type { SolveInput } from '$lib/playgrounds/tvm/types';

const engine = new TVMEngine();

const baseInput = (overrides: Partial<SolveInput>): SolveInput => ({
	mode: 'fv',
	pv: -100,
	fv: 0,
	pmt: 0,
	rate: 8,
	periods: 10,
	periodsUnit: 'years',
	compoundingFrequency: 'annual',
	paymentFrequency: 'annual',
	paymentTiming: 'end',
	...overrides
});

describe('getEffectivePeriodicRate', () => {
	it('matches r/m when frequencies align', () => {
		expect(getEffectivePeriodicRate(12, 'annual')).toBeCloseTo(0.12, 12);
		expect(getEffectivePeriodicRate(12, 'monthly')).toBeCloseTo(0.01, 12);
		expect(getEffectivePeriodicRate(12, 'monthly', 'monthly')).toBeCloseTo(0.01, 12);
	});

	it('routes through EAR when payment differs from compounding', () => {
		// 12% nominal compounded monthly => EAR ≈ 12.6825%
		// Monthly→annual payment rate should equal EAR
		const annualPayRate = getEffectivePeriodicRate(12, 'monthly', 'annual');
		expect(annualPayRate * 100).toBeCloseTo(12.6825, 2);
	});

	it('handles continuous compounding gracefully', () => {
		// Continuous EAR for 10% nominal ≈ 10.5171%
		const monthlyPayRate = getEffectivePeriodicRate(10, 'continuous', 'monthly');
		const annualEar = Math.pow(1 + monthlyPayRate, 12) - 1;
		expect(annualEar * 100).toBeCloseTo(10.5171, 2);
	});
});

describe('getTotalPaymentPeriods', () => {
	it('multiplies horizon by payment frequency', () => {
		expect(getTotalPaymentPeriods(5, 'years', 'monthly', 'monthly')).toBe(60);
		expect(getTotalPaymentPeriods(60, 'months', 'monthly', 'monthly')).toBe(60);
		expect(getTotalPaymentPeriods(3, 'years', 'monthly', 'quarterly')).toBe(12);
	});
});

describe('TVMEngine.solve — closed-form FV', () => {
	it('compounds a lump sum at annual rate', () => {
		const r = engine.solve(baseInput({ pv: -200000, periods: 5, rate: 8 }));
		// FV = 200,000 · 1.08^5 = 293,865.6154...
		expect(r?.value).toBeCloseTo(293865.6154, 3);
		expect(r?.signNote).toBe('inflow');
	});

	it('handles zero rate as linear', () => {
		const r = engine.solve(baseInput({ pv: -1000, pmt: -100, rate: 0, periods: 10 }));
		expect(r?.value).toBeCloseTo(2000, 6);
	});

	it('handles continuous compounding', () => {
		const r = engine.solve(baseInput({ pv: -1000, rate: 5, periods: 10, compoundingFrequency: 'continuous' }));
		// FV = 1000 · e^(0.05 · 10) = 1000 · 1.6487213 ≈ 1648.7213
		expect(r?.value).toBeCloseTo(1648.7212707, 4);
	});

	it('blocks continuous + PMT', () => {
		const r = engine.solve(baseInput({ pv: -1000, pmt: -100, rate: 5, periods: 10, compoundingFrequency: 'continuous' }));
		expect(r).toBeNull();
	});
});

describe('TVMEngine.solve — PV', () => {
	it('discounts a future lump sum back to today', () => {
		const r = engine.solve(baseInput({ mode: 'pv', fv: 1000000, rate: 8, periods: 10 }));
		// PV = -1,000,000 / 1.08^10 = -463,193.49...
		expect(r?.value).toBeCloseTo(-463193.4881, 3);
		expect(r?.signNote).toBe('outflow');
	});

	it('handles annuity with monthly compounding', () => {
		const r = engine.solve(
			baseInput({
				mode: 'pv',
				fv: 0,
				pmt: -1000,
				rate: 6,
				periods: 5,
				compoundingFrequency: 'monthly',
				paymentFrequency: 'monthly'
			})
		);
		// 5-year monthly annuity of 1000 at 6%/12 = 0.5%/mo
		// PV = 1000 · [(1-1.005^-60)/0.005] = 51,725.561...
		expect(r?.value).toBeCloseTo(51725.561, 2);
	});
});

describe('TVMEngine.solve — PMT', () => {
	it('amortises an auto loan correctly', () => {
		const r = engine.solve(
			baseInput({
				mode: 'pmt',
				pv: 3500000,
				fv: 0,
				rate: 9,
				periods: 5,
				compoundingFrequency: 'monthly',
				paymentFrequency: 'monthly'
			})
		);
		// PV=3,500,000; r=0.0075/mo; n=60 → PMT ≈ -72,654.24
		expect(r?.value).toBeCloseTo(-72654.243, 2);
	});

	it('annuity-due reduces the payment vs ordinary', () => {
		const ordinary = engine.solve(
			baseInput({
				mode: 'pmt',
				pv: 100000,
				fv: 0,
				rate: 6,
				periods: 10,
				paymentTiming: 'end'
			})
		);
		const due = engine.solve(
			baseInput({
				mode: 'pmt',
				pv: 100000,
				fv: 0,
				rate: 6,
				periods: 10,
				paymentTiming: 'begin'
			})
		);
		expect(Math.abs(due!.value)).toBeLessThan(Math.abs(ordinary!.value));
		expect(due!.value).toBeCloseTo(ordinary!.value / 1.06, 4);
	});
});

describe('TVMEngine.solve — Rate', () => {
	it('recovers a known rate from PV/FV with no payment', () => {
		const r = engine.solve(
			baseInput({ mode: 'rate', pv: -200000, fv: 293866.2356, periods: 5 })
		);
		expect(r?.value).toBeCloseTo(8, 4);
	});

	it('recovers a known rate from a loan amortisation', () => {
		const r = engine.solve(
			baseInput({
				mode: 'rate',
				pv: 3500000,
				pmt: -72653.022,
				fv: 0,
				periods: 5,
				compoundingFrequency: 'monthly',
				paymentFrequency: 'monthly'
			})
		);
		expect(r?.value).toBeCloseTo(9, 2);
	});

	it('returns null when same-sign PV/FV with no payment', () => {
		const r = engine.solve(
			baseInput({ mode: 'rate', pv: -1000, pmt: 0, fv: -500, periods: 5 })
		);
		expect(r).toBeNull();
	});
});

describe('TVMEngine.solve — Periods', () => {
	it('finds time to double at 8% with no payment', () => {
		const r = engine.solve(
			baseInput({ mode: 'periods', pv: -1000, fv: 2000, rate: 8 })
		);
		// ln(2)/ln(1.08) ≈ 9.0065
		expect(r?.value).toBeCloseTo(9.0065, 3);
	});

	it('handles months unit', () => {
		const r = engine.solve(
			baseInput({
				mode: 'periods',
				pv: -1000,
				fv: 2000,
				rate: 12,
				periodsUnit: 'months',
				compoundingFrequency: 'monthly',
				paymentFrequency: 'monthly'
			})
		);
		// At 1%/mo, doubling takes ln(2)/ln(1.01) ≈ 69.66 months
		expect(r?.value).toBeCloseTo(69.66, 1);
	});
});

describe('TVMEngine.validate', () => {
	it('flags missing fields per mode', () => {
		const result = engine.validate(baseInput({ mode: 'pv', fv: undefined as unknown as number }));
		expect(result.valid).toBe(false);
		expect(result.errors.some((e) => e.key === 'tvm.validation.requiredField')).toBe(true);
	});

	it('flags continuous + PMT', () => {
		const result = engine.validate(
			baseInput({ pv: -1000, pmt: -100, rate: 5, periods: 10, compoundingFrequency: 'continuous' })
		);
		expect(result.valid).toBe(false);
		expect(result.errors.some((e) => e.key === 'tvm.validation.continuousPmtUndefined')).toBe(true);
	});

	it('warns when PV and FV share sign with no PMT for rate mode', () => {
		const result = engine.validate(
			baseInput({ mode: 'rate', pv: -1000, fv: -500, pmt: 0, periods: 5 })
		);
		expect(result.warnings.some((w) => w.key === 'tvm.validation.sameSignPvFv')).toBe(true);
	});
});
