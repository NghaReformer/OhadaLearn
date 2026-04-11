import { describe, it, expect } from 'vitest';

describe('journal-entry exercises', () => {
	it('registers interactive exercise types', async () => {
		const mod = (await import('$lib/playgrounds/journal-entry/exercises')) as {
			exerciseTypes: unknown[];
		};

		expect(mod.exerciseTypes.length).toBeGreaterThan(0);
	});

	it('solves a basic cash sale exercise into journal lines', async () => {
		const mod = (await import('$lib/playgrounds/journal-entry/exercises')) as {
			solveExercise?: (solverFunction: string, params: Record<string, number>) => Array<{
				accountKey: string;
				debit: number;
				credit: number;
			}>;
		};

		expect(typeof mod.solveExercise).toBe('function');
		if (typeof mod.solveExercise !== 'function') return;

		const lines = mod.solveExercise('basicCashSale', { saleAmount: 500000 });
		expect(lines).toEqual([
			{ accountKey: 'bank', debit: 500000, credit: 0 },
			{ accountKey: 'salesMerchandise', debit: 0, credit: 500000 }
		]);
	});

	it('renders exercise prompts with parameter values', async () => {
		const mod = (await import('$lib/playgrounds/journal-entry/exercises')) as {
			renderExercisePrompt?: (
				template: string,
				params: Record<string, number>,
				locale: 'en' | 'fr'
			) => string;
		};

		expect(typeof mod.renderExercisePrompt).toBe('function');
		if (typeof mod.renderExercisePrompt !== 'function') return;

		const prompt = mod.renderExercisePrompt(
			'Your company made a cash sale of merchandise for {saleAmount}. No VAT applies. Record the journal entry.',
			{ saleAmount: 500000 },
			'en'
		);

		expect(prompt).toContain('500,000');
		expect(prompt).not.toContain('{saleAmount}');
	});
});
