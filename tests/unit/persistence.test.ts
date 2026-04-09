import { describe, it, expect, beforeEach, vi } from 'vitest';
import { get } from 'svelte/store';

// Mock localStorage before importing the module
const mockStorage: Record<string, string> = {};
const mockLocalStorage = {
	getItem: (key: string) => mockStorage[key] ?? null,
	setItem: (key: string, value: string) => { mockStorage[key] = value; },
	removeItem: (key: string) => { delete mockStorage[key]; },
};

vi.stubGlobal('localStorage', mockLocalStorage);

// Dynamic import AFTER mocking — important for the isBrowser check
const { createPersistentStore } = await import('$lib/persistence');

describe('createPersistentStore', () => {
	beforeEach(() => {
		Object.keys(mockStorage).forEach((k) => delete mockStorage[k]);
	});

	it('uses defaults when no saved data exists', () => {
		const store = createPersistentStore('test_v1', { count: 0, name: 'hello' });
		expect(get(store)).toEqual({ count: 0, name: 'hello' });
	});

	it('persists changes to localStorage', () => {
		const store = createPersistentStore('persist_v1', { count: 0 });
		store.set({ count: 42 });
		const raw = JSON.parse(mockStorage['persist_v1']);
		expect(raw.count).toBe(42);
	});

	it('loads saved data on creation', () => {
		mockStorage['load_v1'] = JSON.stringify({ count: 99, name: 'saved' });
		const store = createPersistentStore('load_v1', { count: 0, name: 'default' });
		expect(get(store)).toEqual({ count: 99, name: 'saved' });
	});

	it('deep-merges saved data with defaults (handles new keys)', () => {
		mockStorage['merge_v1'] = JSON.stringify({ count: 99 });
		const store = createPersistentStore('merge_v1', { count: 0, name: 'default', newField: true });
		const val = get(store);
		expect(val.count).toBe(99);
		expect(val.name).toBe('default');
		expect(val.newField).toBe(true);
	});

	it('ignores corrupt localStorage data', () => {
		mockStorage['corrupt_v1'] = 'not-json!!!';
		const store = createPersistentStore('corrupt_v1', { count: 0 });
		expect(get(store)).toEqual({ count: 0 });
	});

	it('ignores type-mismatched saved fields (uses default instead)', () => {
		mockStorage['typemismatch_v1'] = JSON.stringify({ count: 'not-a-number', name: 'valid' });
		const store = createPersistentStore('typemismatch_v1', { count: 0, name: 'default' });
		const val = get(store);
		expect(val.count).toBe(0); // default — saved was string, default is number
		expect(val.name).toBe('valid'); // merged — types match
	});
});
