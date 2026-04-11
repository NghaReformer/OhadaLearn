import { describe, it, expect } from 'vitest';
import { gradeJournalEntry } from '$lib/playgrounds/journal-entry/grader';
import type { JournalLine } from '$lib/playgrounds/journal-entry/types';

describe('gradeJournalEntry', () => {
	it('scores 100 for perfect match', () => {
		const model: JournalLine[] = [
			{ accountKey: 'bank', debit: 5000, credit: 0 },
			{ accountKey: 'salesMerchandise', debit: 0, credit: 5000 },
		];
		const student: JournalLine[] = [
			{ accountKey: 'bank', debit: 5000, credit: 0 },
			{ accountKey: 'salesMerchandise', debit: 0, credit: 5000 },
		];
		const result = gradeJournalEntry(student, model, 'ohada', 'en');
		expect(result.score).toBe(100);
		expect(result.isCorrect).toBe(true);
	});

	it('handles partial match (right account, wrong amount)', () => {
		const model: JournalLine[] = [
			{ accountKey: 'bank', debit: 5000, credit: 0 },
			{ accountKey: 'salesMerchandise', debit: 0, credit: 5000 },
		];
		const student: JournalLine[] = [
			{ accountKey: 'bank', debit: 3000, credit: 0 },
			{ accountKey: 'salesMerchandise', debit: 0, credit: 3000 },
		];
		const result = gradeJournalEntry(student, model, 'ohada', 'en');
		expect(result.score).toBe(50);
		expect(result.lineResults.filter((r) => r.status === 'partial')).toHaveLength(2);
	});

	it('detects missing lines', () => {
		const model: JournalLine[] = [
			{ accountKey: 'bank', debit: 5000, credit: 0 },
			{ accountKey: 'salesMerchandise', debit: 0, credit: 5000 },
		];
		const student: JournalLine[] = [{ accountKey: 'bank', debit: 5000, credit: 0 }];
		const result = gradeJournalEntry(student, model, 'ohada', 'en');
		expect(result.score).toBe(50);
		expect(result.lineResults.filter((r) => r.status === 'missing')).toHaveLength(1);
	});

	it('detects extra lines', () => {
		const model: JournalLine[] = [
			{ accountKey: 'bank', debit: 5000, credit: 0 },
			{ accountKey: 'salesMerchandise', debit: 0, credit: 5000 },
		];
		const student: JournalLine[] = [
			{ accountKey: 'bank', debit: 5000, credit: 0 },
			{ accountKey: 'salesMerchandise', debit: 0, credit: 5000 },
			{ accountKey: 'vatCollected', debit: 0, credit: 1000 },
		];
		const result = gradeJournalEntry(student, model, 'ohada', 'en');
		expect(result.score).toBeLessThan(100);
		expect(result.lineResults.filter((r) => r.status === 'extra')).toHaveLength(1);
	});

	it('scores 0 for completely wrong answer', () => {
		const model: JournalLine[] = [
			{ accountKey: 'bank', debit: 5000, credit: 0 },
			{ accountKey: 'salesMerchandise', debit: 0, credit: 5000 },
		];
		const student: JournalLine[] = [
			{ accountKey: 'rentExpense', debit: 1000, credit: 0 },
			{ accountKey: 'pettyCash', debit: 0, credit: 1000 },
		];
		const result = gradeJournalEntry(student, model, 'ohada', 'en');
		expect(result.score).toBe(0);
	});

	it('provides French feedback', () => {
		const model: JournalLine[] = [{ accountKey: 'bank', debit: 5000, credit: 0 }];
		const student: JournalLine[] = [];
		const result = gradeJournalEntry(student, model, 'ohada', 'fr');
		expect(result.lineResults[0].explanation).toContain('manquante');
	});

	it('handles empty model and student', () => {
		const result = gradeJournalEntry([], [], 'ohada', 'en');
		expect(result.score).toBe(0);
		expect(result.lineResults).toHaveLength(0);
	});
});
