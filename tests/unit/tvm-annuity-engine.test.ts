import { describe, it, expect } from 'vitest';
import { AnnuityEngine } from '$lib/playgrounds/tvm/annuity-engine';
import type { AnnuitySolveInput } from '$lib/playgrounds/tvm/types';

const engine = new AnnuityEngine();

function base(overrides: Partial<AnnuitySolveInput>): AnnuitySolveInput {
	return {
		mode: 'annuityPv',
		pmt: 5000,
		rate: 8,
		growthRate: 0,
		periods: 20,
		periodsUnit: 'years',
		compoundingFrequency: 'annual',
		paymentFrequency: 'annual',
		paymentTiming: 'end',
		...overrides
	};
}

describe('AnnuityEngine.annuityPv', () => {
	it('values a 20-year annual annuity at 8% annual', () => {
		const r = engine.solve(base({}));
		// PV = 5000 · (1 − 1.08^−20) / 0.08 ≈ 49,090.74
		expect(r?.value).toBeCloseTo(49090.737, 2);
	});

	it('matches monthly annuity when compounding + pay are both monthly', () => {
		const r = engine.solve(
			base({ periods: 20, compoundingFrequency: 'monthly', paymentFrequency: 'monthly' })
		);
		// N = 240, rp = 0.08/12. PV = 5000 · (1 − 1.006667^−240) / 0.006667 ≈ 597,771.46
		expect(r?.value).toBeCloseTo(597771.46, 1);
	});

	it('annuity due (begin) equals ordinary × (1 + rp)', () => {
		const ordinary = engine.solve(base({ paymentTiming: 'end' }));
		const due = engine.solve(base({ paymentTiming: 'begin' }));
		expect(due!.value).toBeCloseTo(ordinary!.value * 1.08, 4);
	});

	it('handles zero rate as linear', () => {
		const r = engine.solve(base({ rate: 0, periods: 10 }));
		expect(r?.value).toBeCloseTo(50000, 6);
	});
});

describe('AnnuityEngine.annuityFv', () => {
	it('future value of a 10-year annual annuity', () => {
		const r = engine.solve(base({ mode: 'annuityFv', periods: 10 }));
		// 5000 * (1.08^10 - 1) / 0.08 = 72432.813...
		expect(r?.value).toBeCloseTo(72432.813, 2);
	});
});

describe('AnnuityEngine.growingAnnuityPv', () => {
	it('5-period growing annuity (annual, g=5%, r=8%)', () => {
		const r = engine.solve(
			base({
				mode: 'growingAnnuityPv',
				pmt: 1000,
				rate: 8,
				growthRate: 5,
				periods: 5,
				paymentFrequency: 'annual'
			})
		);
		// PV = 1000 · (1 − (1.05/1.08)^5) / (0.08 − 0.05) ≈ 4,379.47
		expect(r?.value).toBeCloseTo(4379.474, 2);
	});

	it('degenerate case g = r uses L\'Hôpital limit', () => {
		const r = engine.solve(
			base({ mode: 'growingAnnuityPv', rate: 8, growthRate: 8, periods: 10 })
		);
		// PV = PMT · N / (1 + r) = 5000 · 10 / 1.08 ≈ 46296.296
		expect(r?.value).toBeCloseTo(46296.296, 2);
	});
});

describe('AnnuityEngine.perpetuityPv', () => {
	it('standard perpetuity PMT/r', () => {
		const r = engine.solve(base({ mode: 'perpetuityPv', pmt: 5000, rate: 8 }));
		expect(r?.value).toBeCloseTo(62500, 6);
	});

	it('monthly perpetuity uses the periodic rate', () => {
		const r = engine.solve(
			base({
				mode: 'perpetuityPv',
				pmt: 500,
				rate: 8,
				compoundingFrequency: 'monthly',
				paymentFrequency: 'monthly'
			})
		);
		// rp = 0.08/12; PV = 500 / (0.08/12) = 75000
		expect(r?.value).toBeCloseTo(75000, 2);
	});
});

describe('AnnuityEngine.growingPerpetuityPv', () => {
	it('values a standard growing perpetuity (g<r)', () => {
		const r = engine.solve(
			base({ mode: 'growingPerpetuityPv', pmt: 5000, rate: 8, growthRate: 2 })
		);
		// rp for annual = 0.08; gp for annual = 0.02; PV = 5000/(0.08-0.02) = 83333.33
		expect(r?.value).toBeCloseTo(83333.33, 1);
	});

	it('refuses when g ≥ r', () => {
		const validation = engine.validate(
			base({ mode: 'growingPerpetuityPv', pmt: 5000, rate: 8, growthRate: 10 })
		);
		expect(validation.valid).toBe(false);
		expect(validation.errors.some((e) => e.key === 'tvm.ann.validation.growthGeRate')).toBe(true);
		const r = engine.solve(
			base({ mode: 'growingPerpetuityPv', pmt: 5000, rate: 8, growthRate: 10 })
		);
		expect(r).toBeNull();
	});
});

describe('AnnuityEngine.ear', () => {
	it('12% monthly nominal → 12.6825% EAR', () => {
		const r = engine.solve(base({ mode: 'ear', rate: 12, compoundingFrequency: 'monthly' }));
		expect(r?.value).toBeCloseTo(12.6825, 3);
	});

	it('continuous: e^r − 1', () => {
		const r = engine.solve(
			base({ mode: 'ear', rate: 10, compoundingFrequency: 'continuous' })
		);
		// e^0.1 - 1 = 0.10517...
		expect(r?.value).toBeCloseTo(10.5171, 3);
	});

	it('annual nominal equals EAR (trivial case)', () => {
		const r = engine.solve(base({ mode: 'ear', rate: 8, compoundingFrequency: 'annual' }));
		expect(r?.value).toBeCloseTo(8, 6);
	});
});

describe('AnnuityEngine.validate', () => {
	it('requires PMT and rate for perpetuity', () => {
		const v = engine.validate(
			base({ mode: 'perpetuityPv', pmt: undefined as unknown as number, rate: undefined as unknown as number })
		);
		expect(v.valid).toBe(false);
		expect(v.errors.filter((e) => e.key === 'tvm.validation.requiredField').length).toBeGreaterThanOrEqual(2);
	});

	it('blocks continuous compounding for non-EAR modes', () => {
		const v = engine.validate(base({ compoundingFrequency: 'continuous' }));
		expect(v.valid).toBe(false);
		expect(v.errors.some((e) => e.key === 'tvm.validation.continuousPmtUndefined')).toBe(true);
	});

	it('allows continuous for EAR mode', () => {
		const v = engine.validate(base({ mode: 'ear', rate: 5, compoundingFrequency: 'continuous' }));
		expect(v.valid).toBe(true);
	});
});
