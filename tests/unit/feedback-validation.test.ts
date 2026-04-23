import { describe, it, expect } from 'vitest';
import {
	validateFeedback,
	MAX_TITLE,
	MAX_DESCRIPTION,
	MAX_CONTEXT_BYTES,
} from '../../src/routes/api/feedback/validation';

function raw(overrides: Partial<Record<string, unknown>> = {}) {
	return {
		type: null,
		severity: null,
		title: null,
		description: null,
		steps: null,
		email: null,
		context: null,
		...overrides,
	} as Parameters<typeof validateFeedback>[0];
}

describe('validateFeedback', () => {
	it('accepts a minimal valid bug report', () => {
		const result = validateFeedback(
			raw({ type: 'bug', title: 'Crash on submit', description: 'It breaks', severity: 'high' })
		);
		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.value.type).toBe('bug');
			expect(result.value.severity).toBe('high');
			expect(result.value.context).toEqual({});
		}
	});

	it('rejects unknown types', () => {
		const result = validateFeedback(raw({ type: 'malicious', title: 't', description: 'd' }));
		expect(result.ok).toBe(false);
	});

	it('requires title and description', () => {
		expect(validateFeedback(raw({ type: 'other', description: 'hello' })).ok).toBe(false);
		expect(validateFeedback(raw({ type: 'other', title: 'hi' })).ok).toBe(false);
	});

	it('ignores severity for non-bug reports', () => {
		const result = validateFeedback(
			raw({ type: 'feature', title: 'Add X', description: 'Y', severity: 'blocker' })
		);
		expect(result.ok).toBe(true);
		if (result.ok) expect(result.value.severity).toBeNull();
	});

	it('caps oversized title and description to limits', () => {
		const longTitle = 'a'.repeat(MAX_TITLE + 10);
		const longDesc = 'b'.repeat(MAX_DESCRIPTION + 10);
		const result = validateFeedback(
			raw({ type: 'other', title: longTitle, description: longDesc })
		);
		expect(result.ok).toBe(false);
	});

	it('rejects malformed email but accepts empty', () => {
		const bad = validateFeedback(
			raw({ type: 'other', title: 't', description: 'd', email: 'not-an-email' })
		);
		expect(bad.ok).toBe(false);
		const empty = validateFeedback(raw({ type: 'other', title: 't', description: 'd' }));
		expect(empty.ok).toBe(true);
		if (empty.ok) expect(empty.value.email).toBeNull();
	});

	it('normalizes email to lowercase', () => {
		const result = validateFeedback(
			raw({ type: 'other', title: 't', description: 'd', email: 'User@Example.COM' })
		);
		expect(result.ok).toBe(true);
		if (result.ok) expect(result.value.email).toBe('user@example.com');
	});

	it('rejects context payload that exceeds the byte cap', () => {
		const huge = { blob: 'x'.repeat(MAX_CONTEXT_BYTES + 100) };
		const result = validateFeedback(
			raw({ type: 'other', title: 't', description: 'd', context: huge })
		);
		expect(result.ok).toBe(false);
	});
});
