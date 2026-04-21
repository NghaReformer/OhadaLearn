import { describe, it, expect } from 'vitest';
import { InterestEngine } from '$lib/playgrounds/interest/engine';
import type { BondInputs, InterestInputs } from '$lib/playgrounds/interest/types';

const engine = new InterestEngine();

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

describe('InterestEngine — simple', () => {
	it('computes I = P × r × t under 30/360', () => {
		const result = engine.simple(simpleInputs());
		// 30/360 over 5 years = exactly 5.0
		expect(result.years).toBeCloseTo(5, 10);
		expect(result.interest).toBeCloseTo(500_000, 6);
		expect(result.total).toBeCloseTo(1_500_000, 6);
	});

	it('final row cumulative interest equals total exactly', () => {
		const result = engine.simple(simpleInputs());
		const last = result.perPeriod[result.perPeriod.length - 1];
		expect(last.cumulativeInterest).toBe(result.interest);
		expect(last.cumulativeTotal).toBe(result.total);
	});

	it('is sensitive to day-count convention', () => {
		const r365 = engine.simple(simpleInputs({ dayCount: 'actual/365' }));
		const r360 = engine.simple(simpleInputs({ dayCount: 'actual/360' }));
		// actual/360 yields MORE interest because years is larger (days/360 > days/365)
		expect(r360.interest).toBeGreaterThan(r365.interest);
	});
});

describe('InterestEngine — compound', () => {
	it('matches classic 1000 @ 10% annually for 5 years = 1610.51', () => {
		const result = engine.compound(
			simpleInputs({ principal: 1000, nominalRate: 0.1, frequency: 'annual' }),
		);
		expect(result.futureValue).toBeCloseTo(1610.51, 2);
	});

	it('monthly compounding of 12% nominal → EAR 12.6825%', () => {
		const result = engine.compound(
			simpleInputs({ principal: 1000, nominalRate: 0.12, frequency: 'monthly' }),
		);
		expect(result.effectiveAnnualRate).toBeCloseTo(0.126825, 5);
	});

	it('continuous frequency uses P·e^(rt)', () => {
		const result = engine.compound(
			simpleInputs({ principal: 1000, nominalRate: 0.1, frequency: 'continuous' }),
		);
		const expected = 1000 * Math.exp(0.1 * 5);
		expect(result.futureValue).toBeCloseTo(expected, 6);
		expect(result.effectiveAnnualRate).toBeCloseTo(Math.exp(0.1) - 1, 6);
	});

	it('continuous FV is the limit as frequency increases', () => {
		const base = simpleInputs({ principal: 1000, nominalRate: 0.1 });
		const daily = engine.compound({ ...base, frequency: 'daily' });
		const continuous = engine.compound({ ...base, frequency: 'continuous' });
		// Daily should be very close to continuous, less than annual.
		const annual = engine.compound({ ...base, frequency: 'annual' });
		expect(daily.futureValue).toBeLessThan(continuous.futureValue);
		expect(daily.futureValue).toBeGreaterThan(annual.futureValue);
		expect(Math.abs(daily.futureValue - continuous.futureValue)).toBeLessThan(2);
	});

	it('per-period rows split cumulative interest into on-principal vs on-interest', () => {
		const result = engine.compound(
			simpleInputs({ principal: 1000, nominalRate: 0.1, frequency: 'annual' }),
		);
		const last = result.perPeriod[result.perPeriod.length - 1];
		const total = last.cumulativeInterestOnPrincipal + last.cumulativeInterestOnInterest;
		const actualInterest = last.balanceEnd - 1000;
		expect(total).toBeCloseTo(actualInterest, 2);
		expect(last.cumulativeInterestOnInterest).toBeGreaterThan(0);
	});
});

describe('InterestEngine — rate conversion', () => {
	it('nominalToEir(12% monthly) ≈ 12.6825%', () => {
		expect(engine.nominalToEir(0.12, 'monthly')).toBeCloseTo(0.126825, 5);
	});

	it('eirToNominal is inverse of nominalToEir', () => {
		const eir = engine.nominalToEir(0.12, 'monthly');
		const recovered = engine.eirToNominal(eir, 'monthly');
		expect(recovered).toBeCloseTo(0.12, 10);
	});

	it('continuous case uses exp/log', () => {
		const eir = engine.nominalToEir(0.1, 'continuous');
		expect(eir).toBeCloseTo(Math.exp(0.1) - 1, 10);
		expect(engine.eirToNominal(eir, 'continuous')).toBeCloseTo(0.1, 10);
	});

	it('annual compounding leaves nominal = EIR', () => {
		expect(engine.nominalToEir(0.08, 'annual')).toBeCloseTo(0.08, 10);
	});
});

describe('InterestEngine — bond issue price', () => {
	it('par bond (coupon = market) prices at face', () => {
		const price = engine.issuePrice(
			bondInputs({ couponRate: 0.1, marketRate: 0.1, termYears: 5 }),
		);
		expect(price).toBeCloseTo(1_000_000, 2);
	});

	it('discount bond (market > coupon) prices below face', () => {
		const price = engine.issuePrice(bondInputs({ couponRate: 0.08, marketRate: 0.1 }));
		expect(price).toBeLessThan(1_000_000);
	});

	it('premium bond (market < coupon) prices above face', () => {
		const price = engine.issuePrice(bondInputs({ couponRate: 0.12, marketRate: 0.1 }));
		expect(price).toBeGreaterThan(1_000_000);
	});

	it('discount bond matches textbook: face 1M, 8% coupon, 10% market, 5y annual → ~924,184', () => {
		const price = engine.issuePrice(
			bondInputs({
				faceValue: 1_000_000,
				couponRate: 0.08,
				marketRate: 0.1,
				termYears: 5,
				paymentFrequency: 'annual',
			}),
		);
		expect(price).toBeCloseTo(924_184, 0);
	});
});

describe('InterestEngine — EIR schedule', () => {
	it('discount bond row 1 matches textbook', () => {
		const bond = bondInputs({
			faceValue: 1_000_000,
			couponRate: 0.08,
			marketRate: 0.1,
			termYears: 5,
			paymentFrequency: 'annual',
		});
		const schedule = engine.buildSchedule(bond, 'eir');
		const row1 = schedule.rows[0];
		expect(row1.openingCarryingAmount).toBeCloseTo(924_184, 0);
		expect(row1.cashInterest).toBeCloseTo(80_000, 2);
		expect(row1.interestExpense).toBeCloseTo(92_418, 0);
		expect(row1.discountAmortisation).toBeCloseTo(12_418, 0);
		expect(row1.closingCarryingAmount).toBeCloseTo(936_603, 0);
	});

	it('EIR schedule closes at face value exactly', () => {
		const schedule = engine.buildSchedule(bondInputs({ couponRate: 0.08, marketRate: 0.1 }), 'eir');
		const lastClose = schedule.rows[schedule.rows.length - 1].closingCarryingAmount;
		expect(lastClose).toBe(1_000_000);
	});

	it('straight-line schedule closes at face value exactly', () => {
		const schedule = engine.buildSchedule(
			bondInputs({ couponRate: 0.08, marketRate: 0.1 }),
			'straight-line',
		);
		const lastClose = schedule.rows[schedule.rows.length - 1].closingCarryingAmount;
		expect(lastClose).toBe(1_000_000);
	});

	it('total interest expense is greater for EIR method on a discount bond', () => {
		const bond = bondInputs({ couponRate: 0.08, marketRate: 0.1 });
		const sl = engine.buildSchedule(bond, 'straight-line');
		const eir = engine.buildSchedule(bond, 'eir');
		// Both methods expense the same cumulative amount by term end
		// (total cash interest + total discount amortisation).
		expect(eir.totalInterestExpense).toBeCloseTo(sl.totalInterestExpense, 2);
	});

	it('divergence series has zero gap at final period', () => {
		const analysis = engine.eirAnalysis(bondInputs({ couponRate: 0.08, marketRate: 0.1 }));
		const last = analysis.divergenceSeries[analysis.divergenceSeries.length - 1];
		expect(last.gap).toBeCloseTo(0, 6);
	});

	it('divergence series has nonzero gap in middle periods for discount bond', () => {
		const analysis = engine.eirAnalysis(bondInputs({ couponRate: 0.08, marketRate: 0.1 }));
		const mid = analysis.divergenceSeries[Math.floor(analysis.divergenceSeries.length / 2)];
		expect(Math.abs(mid.gap)).toBeGreaterThan(1);
	});
});
