import { describe, it, expect } from 'vitest';
import {
	exerciseTypes,
	solveExercise,
	renderExercisePrompt
} from '$lib/playgrounds/tvm/exercises';
import { gradeNumeric } from '$lib/playgrounds/tvm/grader';

describe('tvm exercises', () => {
	it('registers four foundation exercises', () => {
		expect(exerciseTypes.length).toBe(4);
		expect(exerciseTypes.map((e) => e.slug).sort()).toEqual([
			'deposit-today',
			'implicit-rate',
			'loan-payment',
			'retirement-nest-egg'
		]);
	});

	it('solves the deposit-today exercise with realistic inputs', () => {
		// Need 10,000,000 in 4 years at 6.5% nominal monthly compounding
		const value = solveExercise('depositToday', { fv: 10000000, rate: 6.5, years: 4 });
		// PV ≈ -7,712,290 (negative: outflow today). Allow ±0.5%.
		expect(Math.sign(value)).toBe(-1);
		expect(Math.abs(value)).toBeGreaterThan(7600000);
		expect(Math.abs(value)).toBeLessThan(7800000);
	});

	it('solves the loan-payment exercise', () => {
		const value = solveExercise('loanPayment', { pv: 3500000, rate: 9, years: 5 });
		// Monthly payment on a 5-year 3.5M XOF loan at 9%/12 monthly ≈ -72,654.24
		expect(value).toBeCloseTo(-72654.243, 1);
	});

	it('solves the implicit-rate exercise to a sensible rate', () => {
		// Doubled in 9 years with annual compounding ≈ 8%
		const rate = solveExercise('implicitRate', { pv: 1000000, fv: 2000000, years: 9 });
		expect(rate).toBeCloseTo(8, 1);
	});

	it('renders prompts with locale-formatted numbers', () => {
		const en = renderExercisePrompt(
			'Need {fv} in {years} years at {rate}% rate',
			{ fv: 1000000, years: 5, rate: 7.5 },
			'en'
		);
		expect(en).toContain('1,000,000');
		expect(en).toContain('7.50');

		const fr = renderExercisePrompt(
			'Need {fv} in {years} years at {rate}% rate',
			{ fv: 1000000, years: 5, rate: 7.5 },
			'fr'
		);
		// French locale uses non-breaking space as thousand separator
		expect(fr).toMatch(/1[\s\u00a0\u202f]000[\s\u00a0\u202f]000/);
	});
});

describe('gradeNumeric', () => {
	it('marks within-tolerance answers correct', () => {
		const r = gradeNumeric(1000.5, 1000);
		expect(r.isCorrect).toBe(true);
		expect(r.score).toBe(100);
	});

	it('marks beyond-tolerance answers incorrect', () => {
		const r = gradeNumeric(1100, 1000);
		expect(r.isCorrect).toBe(false);
		expect(r.score).toBe(0);
	});

	it('handles non-finite inputs gracefully', () => {
		expect(gradeNumeric(NaN, 100).isCorrect).toBe(false);
		expect(gradeNumeric(100, Infinity).isCorrect).toBe(false);
	});
});
