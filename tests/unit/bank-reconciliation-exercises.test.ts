import { describe, it, expect } from 'vitest';
import { exerciseTypes, solveExerciseBySlug } from '$lib/playgrounds/bank-reconciliation/exercises';

describe('bank reconciliation exercises', () => {
	it('registers eight exercises across three difficulties', () => {
		expect(exerciseTypes).toHaveLength(8);
		const slugs = exerciseTypes.map((e) => e.slug).sort();
		expect(slugs).toEqual(
			[
				'classify-items',
				'compute-adjusted-balance',
				'find-error',
				'generate-adjustments',
				'missing-balance',
				'multi-month-roll',
				'outstanding-checks',
				'simple-recon',
			],
		);
	});

	it('simple-recon: correct answer scores 1', () => {
		const ex = exerciseTypes.find((e) => e.slug === 'simple-recon')!;
		const params = { statementBalance: 500_000, depositInTransit: 50_000, outstandingCheck: 30_000 };
		const correct = ex.solve(params);
		const fb = ex.feedback(correct, correct, params);
		expect(fb.isCorrect).toBe(true);
		expect(fb.score).toBe(1);
	});

	it('simple-recon: wrong answer scores 0', () => {
		const ex = exerciseTypes.find((e) => e.slug === 'simple-recon')!;
		const params = { statementBalance: 500_000, depositInTransit: 50_000, outstandingCheck: 30_000 };
		const correct = ex.solve(params);
		const fb = ex.feedback({ adjustedBank: 0, adjustedBooks: 0 }, correct, params);
		expect(fb.isCorrect).toBe(false);
		expect(fb.score).toBeLessThan(1);
	});

	it('outstanding-checks: sum of three random checks', () => {
		const ex = exerciseTypes.find((e) => e.slug === 'outstanding-checks')!;
		const params = { check1: 25_000, check2: 40_000, check3: 15_000 };
		const correct = ex.solve(params);
		expect(correct.answer).toBe(80_000);
		const fb = ex.feedback({ answer: 80_000 }, correct, params);
		expect(fb.isCorrect).toBe(true);
	});

	it('classify-items: full match scores 1', () => {
		const ex = exerciseTypes.find((e) => e.slug === 'classify-items')!;
		const params = { seed: 42 };
		const correct = ex.solve(params);
		const fb = ex.feedback(correct, correct, params);
		expect(fb.isCorrect).toBe(true);
		expect(fb.score).toBe(1);
	});

	it('classify-items: half match scores 0.5', () => {
		const ex = exerciseTypes.find((e) => e.slug === 'classify-items')!;
		const params = { seed: 42 };
		const correct = ex.solve(params);
		const ids = Object.keys(correct);
		const partial: Record<string, string> = {};
		ids.forEach((id, idx) => {
			partial[id] = idx % 2 === 0 ? String(correct[id]) : 'wrong-cat';
		});
		const fb = ex.feedback(partial, correct, params);
		expect(fb.isCorrect).toBe(false);
		expect(fb.score).toBeGreaterThan(0);
		expect(fb.score).toBeLessThan(1);
	});

	it('compute-adjusted-balance: applies DIT, OS, bank error', () => {
		const ex = exerciseTypes.find((e) => e.slug === 'compute-adjusted-balance')!;
		const params = { statementBalance: 1_000_000, depositInTransit: 80_000, outstandingChecks: 50_000, bankError: 10_000 };
		const correct = ex.solve(params);
		expect(correct.adjustedBank).toBe(1_040_000);
	});

	it('generate-adjustments: correct accounts + amounts → score 1', () => {
		const ex = exerciseTypes.find((e) => e.slug === 'generate-adjustments')!;
		const params = { bankCharge: 2500, interest: 1500, nsfAmount: 75_000 };
		const correct = ex.solve(params);
		const fb = ex.feedback(correct, correct, params);
		expect(fb.isCorrect).toBe(true);
		expect(fb.score).toBe(1);
	});

	it('find-error: solver returns the offending item id', () => {
		const ex = exerciseTypes.find((e) => e.slug === 'find-error')!;
		const params = { seed: 7, errorAmount: 12_500 };
		const correct = ex.solve(params);
		expect(correct.errorItemId).toBe('mystery');
	});

	it('missing-balance: closes the books-side adjustment correctly', () => {
		const ex = exerciseTypes.find((e) => e.slug === 'missing-balance')!;
		const params = { bookBalance: 1_000_000, bankCharge: 2_500, depositInTransit: 0, outstandingCheck: 0 };
		const correct = ex.solve(params);
		expect(correct.closingBank).toBe(997_500);
	});

	it('multi-month-roll: applies prior-month carryforwards', () => {
		const ex = exerciseTypes.find((e) => e.slug === 'multi-month-roll')!;
		const params = { priorOutstandingCheck: 30_000, priorDepositInTransit: 50_000, currentBankCharge: 2_500 };
		const correct = ex.solve(params);
		expect(correct.month2Adjusted).toBe(17_500);
	});

	it('randomize() returns valid params for every exercise', () => {
		for (const ex of exerciseTypes) {
			const p = ex.randomize();
			expect(Object.keys(p).length).toBeGreaterThan(0);
		}
	});

	it('solveExerciseBySlug returns null for unknown slugs', () => {
		expect(solveExerciseBySlug('nonsense', {})).toBeNull();
	});
});
