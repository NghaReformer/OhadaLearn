import { describe, it, expect } from 'vitest';
import { exerciseTypes, solveExerciseBySlug } from '../../src/lib/playgrounds/amortization/exercises';
import { pmt } from '../../src/lib/finance/pmt';

describe('amortization exercises — metadata', () => {
	it('exposes five exercises across all three difficulties', () => {
		expect(exerciseTypes.length).toBe(5);
		const difficulties = new Set(exerciseTypes.map((e) => e.difficulty));
		expect(difficulties).toEqual(new Set(['fondamental', 'intermediaire', 'avance']));
	});

	it('randomize produces valid parameters for every exercise', () => {
		for (const ex of exerciseTypes) {
			const params = ex.randomize();
			for (const key of Object.keys(params)) {
				expect(typeof params[key] === 'number' || typeof params[key] === 'string').toBe(true);
			}
		}
	});
});

describe('amortization exercises — solvers', () => {
	it('monthlyPayment solver agrees with pmt()', () => {
		const out = solveExerciseBySlug('monthly-payment', {
			principal: 10_000_000,
			annualRate: 0.08,
			months: 60,
		});
		const expected = pmt(10_000_000, 0.08 / 12, 60);
		expect(out?.answer).toBeCloseTo(expected, 2);
	});

	it('totalInterest solver equals payment × months − principal', () => {
		const out = solveExerciseBySlug('total-interest', {
			principal: 10_000_000,
			annualRate: 0.08,
			months: 60,
		});
		const expected = pmt(10_000_000, 0.08 / 12, 60) * 60 - 10_000_000;
		expect(out?.answer).toBeCloseTo(expected, 1);
	});

	it('remainingBalanceAt solver returns the correct balance', () => {
		const out = solveExerciseBySlug('remaining-balance', {
			principal: 10_000_000,
			annualRate: 0.08,
			months: 60,
			afterPeriod: 24,
		});
		expect(out?.answer).toBeGreaterThan(0);
		expect(out?.answer).toBeLessThan(10_000_000);
	});

	it('requiredTerm solver returns an integer close to the expected n', () => {
		const rate = 0.08;
		const principal = 10_000_000;
		const payment = pmt(principal, rate / 12, 60);
		const out = solveExerciseBySlug('required-term', {
			principal,
			annualRate: rate,
			payment,
		});
		expect(Math.abs((out?.answer ?? 0) - 60)).toBeLessThanOrEqual(1);
	});

	it('aprWithFees returns APR > nominal when a fee is added', () => {
		const out = solveExerciseBySlug('apr-with-fees', {
			principal: 10_000_000,
			annualRate: 0.08,
			months: 60,
			originationFee: 200_000,
		});
		expect(out?.answer).toBeGreaterThan(0.08);
	});
});

describe('amortization exercises — feedback', () => {
	it('feedback reports correct on a spot-on answer', () => {
		const meta = exerciseTypes.find((e) => e.slug === 'monthly-payment')!;
		const params = { principal: 10_000_000, annualRate: 0.08, months: 60 };
		const correct = meta.solve(params);
		const fb = meta.feedback(correct, correct, params);
		expect(fb.isCorrect).toBe(true);
		expect(fb.score).toBe(1);
	});

	it('feedback reports incorrect on a far-off answer', () => {
		const meta = exerciseTypes.find((e) => e.slug === 'monthly-payment')!;
		const params = { principal: 10_000_000, annualRate: 0.08, months: 60 };
		const correct = meta.solve(params);
		const fb = meta.feedback({ answer: 999 }, correct, params);
		expect(fb.isCorrect).toBe(false);
	});
});
