import { describe, it, expect } from 'vitest';
import { gradeNumeric } from '$lib/playgrounds/cvp/grader';

describe('gradeNumeric', () => {
	it('accepts exact match as correct with full score', () => {
		const result = gradeNumeric(5000, 5000);
		expect(result.isCorrect).toBe(true);
		expect(result.score).toBe(1);
		expect(result.delta).toBe(0);
	});

	it('accepts value within absolute tolerance', () => {
		const result = gradeNumeric(4999, 5000, 1, 'absolute');
		expect(result.isCorrect).toBe(true);
	});

	it('rejects value outside absolute tolerance', () => {
		const result = gradeNumeric(4990, 5000, 1, 'absolute');
		expect(result.isCorrect).toBe(false);
		expect(result.score).toBeLessThan(1);
		expect(result.score).toBeGreaterThan(0);
	});

	it('accepts value within relative tolerance', () => {
		// 1% tolerance on 100,000 = 1,000 — so 99,500 is within
		const result = gradeNumeric(99500, 100000, 0.01, 'relative');
		expect(result.isCorrect).toBe(true);
	});

	it('rejects value outside relative tolerance', () => {
		// 1% tolerance on 100,000 = 1,000 — 98,000 is outside
		const result = gradeNumeric(98000, 100000, 0.01, 'relative');
		expect(result.isCorrect).toBe(false);
	});

	it('returns zero score for NaN student value', () => {
		const result = gradeNumeric(NaN, 5000);
		expect(result.isCorrect).toBe(false);
		expect(result.score).toBe(0);
	});

	it('returns zero score for Infinity student value', () => {
		const result = gradeNumeric(Infinity, 5000);
		expect(result.isCorrect).toBe(false);
		expect(result.score).toBe(0);
	});

	it('partial credit decreases with error magnitude', () => {
		const close = gradeNumeric(4500, 5000);
		const far = gradeNumeric(1000, 5000);
		expect(close.score).toBeGreaterThan(far.score);
	});

	it('handles zero correct value without division error', () => {
		const result = gradeNumeric(0, 0);
		expect(result.isCorrect).toBe(true);
		expect(result.delta).toBe(0);
	});
});
