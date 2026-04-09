import { describe, it, expect, beforeEach, vi } from 'vitest';
import { get } from 'svelte/store';

const mockStorage: Record<string, string> = {};
vi.stubGlobal('localStorage', {
	getItem: (key: string) => mockStorage[key] ?? null,
	setItem: (key: string, value: string) => { mockStorage[key] = value; },
	removeItem: (key: string) => { delete mockStorage[key]; },
});

const { preferences, setCurrency, setAccountingStandard } = await import('$lib/stores/preferences');

describe('global preferences', () => {
	beforeEach(() => {
		Object.keys(mockStorage).forEach((k) => delete mockStorage[k]);
	});

	it('defaults to XAF currency', () => {
		expect(get(preferences).currency).toBe('XAF');
	});

	it('defaults to SYSCOHADA standard', () => {
		expect(get(preferences).accountingStandard).toBe('syscohada');
	});

	it('defaults to English locale', () => {
		expect(get(preferences).locale).toBe('en');
	});

	it('persists currency changes', () => {
		setCurrency('EUR');
		expect(get(preferences).currency).toBe('EUR');
	});

	it('persists accounting standard changes', () => {
		setAccountingStandard('ifrs');
		expect(get(preferences).accountingStandard).toBe('ifrs');
	});
});
