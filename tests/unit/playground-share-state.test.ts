import { describe, it, expect } from 'vitest';

describe('playground share state', () => {
	it('roundtrips nested journal-entry state through URL params', async () => {
		const mod = (await import('$lib/components/playground/share-state')) as {
			serializeShareValue?: (value: unknown) => string;
			deserializeShareValue?: (raw: string) => unknown;
		};

		expect(typeof mod.serializeShareValue).toBe('function');
		expect(typeof mod.deserializeShareValue).toBe('function');
		if (
			typeof mod.serializeShareValue !== 'function' ||
			typeof mod.deserializeShareValue !== 'function'
		) {
			return;
		}

		const original = {
			entries: [
				{
					id: '1',
					date: '2024-03-15',
					description: 'Cash sale',
					lines: [
						{ accountKey: 'bank', debit: 5000, credit: 0 },
						{ accountKey: 'salesMerchandise', debit: 0, credit: 5000 }
					]
				}
			],
			draft: {
				date: '2024-03-16',
				description: 'Draft',
				lines: [
					{ accountKey: 'rentExpense', debit: 750, credit: '' },
					{ accountKey: 'bank', debit: '', credit: 750 }
				]
			},
			selectedStage: 'trialBalance'
		};

		const serialized = mod.serializeShareValue(original);
		const roundTrip = mod.deserializeShareValue(serialized);

		expect(roundTrip).toEqual(original);
	});

	it('preserves primitive values for backwards-compatible sharing', async () => {
		const mod = (await import('$lib/components/playground/share-state')) as {
			serializeShareValue?: (value: unknown) => string;
			deserializeShareValue?: (raw: string) => unknown;
		};

		expect(typeof mod.serializeShareValue).toBe('function');
		expect(typeof mod.deserializeShareValue).toBe('function');
		if (
			typeof mod.serializeShareValue !== 'function' ||
			typeof mod.deserializeShareValue !== 'function'
		) {
			return;
		}

		expect(mod.deserializeShareValue(mod.serializeShareValue(42))).toBe(42);
		expect(mod.deserializeShareValue(mod.serializeShareValue(true))).toBe(true);
		expect(mod.deserializeShareValue(mod.serializeShareValue('journal'))).toBe('journal');
	});
});
