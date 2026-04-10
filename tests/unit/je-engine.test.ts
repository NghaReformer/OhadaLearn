import { describe, it, expect } from 'vitest';
import { JournalEntryEngine } from '$lib/playgrounds/journal-entry/engine';
import type { DraftEntry, JournalEntry } from '$lib/playgrounds/journal-entry/types';

const engine = new JournalEntryEngine();

describe('JournalEntryEngine.validate', () => {
	it('accepts a balanced entry', () => {
		const draft: DraftEntry = {
			date: '2024-03-15',
			description: 'Cash sale',
			lines: [
				{ accountKey: 'bank', debit: 5000, credit: '' },
				{ accountKey: 'salesMerchandise', debit: '', credit: 5000 }
			]
		};
		const result = engine.validate(draft, 'ohada');
		expect(result.valid).toBe(true);
		expect(result.totalDebit).toBe(5000);
		expect(result.totalCredit).toBe(5000);
	});

	it('rejects unbalanced entry', () => {
		const draft: DraftEntry = {
			date: '2024-03-15',
			description: 'Bad entry',
			lines: [
				{ accountKey: 'bank', debit: 5000, credit: '' },
				{ accountKey: 'salesMerchandise', debit: '', credit: 3000 }
			]
		};
		const result = engine.validate(draft, 'ohada');
		expect(result.valid).toBe(false);
		expect(result.errors.some((e) => e.includes('unbalanced'))).toBe(true);
	});

	it('rejects entry with fewer than 2 lines', () => {
		const draft: DraftEntry = {
			date: '2024-03-15',
			description: 'Single line',
			lines: [{ accountKey: 'bank', debit: 5000, credit: '' }]
		};
		const result = engine.validate(draft, 'ohada');
		expect(result.valid).toBe(false);
	});

	it('rejects entry with unknown account', () => {
		const draft: DraftEntry = {
			date: '2024-03-15',
			description: 'Bad account',
			lines: [
				{ accountKey: 'nonexistent', debit: 5000, credit: '' },
				{ accountKey: 'bank', debit: '', credit: 5000 }
			]
		};
		const result = engine.validate(draft, 'ohada');
		expect(result.valid).toBe(false);
		expect(result.errors.some((e) => e.includes('Unknown account'))).toBe(true);
	});

	it('rejects entry with empty description', () => {
		const draft: DraftEntry = {
			date: '2024-03-15',
			description: '',
			lines: [
				{ accountKey: 'bank', debit: 5000, credit: '' },
				{ accountKey: 'salesMerchandise', debit: '', credit: 5000 }
			]
		};
		const result = engine.validate(draft, 'ohada');
		expect(result.valid).toBe(false);
	});

	it('rejects negative amounts', () => {
		const draft: DraftEntry = {
			date: '2024-03-15',
			description: 'Negative',
			lines: [
				{ accountKey: 'bank', debit: -5000, credit: '' },
				{ accountKey: 'salesMerchandise', debit: '', credit: -5000 }
			]
		};
		const result = engine.validate(draft, 'ohada');
		expect(result.valid).toBe(false);
	});
});

describe('JournalEntryEngine.buildLedger', () => {
	it('builds ledger from entries', () => {
		const entries: JournalEntry[] = [
			{
				id: '1',
				date: '2024-03-15',
				description: 'Cash sale',
				lines: [
					{ accountKey: 'bank', debit: 5000, credit: 0 },
					{ accountKey: 'salesMerchandise', debit: 0, credit: 5000 }
				]
			}
		];
		const ledger = engine.buildLedger(entries);
		expect(ledger.size).toBe(2);
		expect(ledger.get('bank')?.debitTotal).toBe(5000);
		expect(ledger.get('salesMerchandise')?.creditTotal).toBe(5000);
	});

	it('accumulates multiple entries for same account', () => {
		const entries: JournalEntry[] = [
			{
				id: '1',
				date: '2024-03-15',
				description: 'Sale 1',
				lines: [
					{ accountKey: 'bank', debit: 5000, credit: 0 },
					{ accountKey: 'salesMerchandise', debit: 0, credit: 5000 }
				]
			},
			{
				id: '2',
				date: '2024-03-16',
				description: 'Sale 2',
				lines: [
					{ accountKey: 'bank', debit: 3000, credit: 0 },
					{ accountKey: 'salesMerchandise', debit: 0, credit: 3000 }
				]
			}
		];
		const ledger = engine.buildLedger(entries);
		expect(ledger.get('bank')?.debitTotal).toBe(8000);
		expect(ledger.get('bank')?.balance).toBe(8000);
	});
});

describe('JournalEntryEngine.getTAccount', () => {
	it('returns null for non-existent account', () => {
		const ledger = engine.buildLedger([]);
		expect(engine.getTAccount(ledger, 'bank')).toBeNull();
	});

	it('returns T-account data for existing account', () => {
		const entries: JournalEntry[] = [
			{
				id: '1',
				date: '2024-03-15',
				description: 'Cash sale',
				lines: [
					{ accountKey: 'bank', debit: 5000, credit: 0 },
					{ accountKey: 'salesMerchandise', debit: 0, credit: 5000 }
				]
			}
		];
		const ledger = engine.buildLedger(entries);
		const tAccount = engine.getTAccount(ledger, 'bank');
		expect(tAccount).not.toBeNull();
		expect(tAccount!.debits).toHaveLength(1);
		expect(tAccount!.debitTotal).toBe(5000);
	});
});

describe('JournalEntryEngine.postDraft', () => {
	it('converts draft to journal entry with ID', () => {
		const draft: DraftEntry = {
			date: '2024-03-15',
			description: '  Cash sale  ',
			lines: [
				{ accountKey: 'bank', debit: 5000, credit: '' },
				{ accountKey: 'salesMerchandise', debit: '', credit: 5000 },
				{ accountKey: '', debit: '', credit: '' }
			]
		};
		const entry = engine.postDraft(draft);
		expect(entry.id).toBeTruthy();
		expect(entry.description).toBe('Cash sale');
		expect(entry.lines).toHaveLength(2);
		expect(entry.lines[0].debit).toBe(5000);
		expect(entry.lines[1].credit).toBe(5000);
	});
});
