import { writable, type Writable } from 'svelte/store';

const isBrowser = typeof localStorage !== 'undefined';

/**
 * Creates a Svelte writable store that persists to localStorage.
 * - SSR-safe: uses defaults on server, loads from localStorage on client
 * - Deep-merges saved data with defaults (adding new fields doesn't break old saves)
 * - Silently handles corrupt data and quota errors
 * - Versioning via key naming convention (e.g., 'tvm_v1')
 */
export function createPersistentStore<T extends Record<string, unknown>>(
	key: string,
	defaults: T,
): Writable<T> {
	const initial = loadAndMerge(key, defaults);
	const store = writable<T>(initial);

	store.subscribe((value) => {
		if (isBrowser) {
			try {
				localStorage.setItem(key, JSON.stringify(value));
			} catch {
				// Quota exceeded — silently ignore
			}
		}
	});

	return store;
}

function loadAndMerge<T extends Record<string, unknown>>(key: string, defaults: T): T {
	if (!isBrowser) return { ...defaults };

	try {
		const raw = localStorage.getItem(key);
		if (!raw) return { ...defaults };

		const saved = JSON.parse(raw);
		if (typeof saved !== 'object' || saved === null || Array.isArray(saved)) {
			return { ...defaults };
		}

		return deepMerge(defaults, saved);
	} catch {
		return { ...defaults };
	}
}

function deepMerge<T extends Record<string, unknown>>(defaults: T, saved: Record<string, unknown>): T {
	const result = { ...defaults };
	for (const key of Object.keys(defaults)) {
		if (!(key in saved)) continue;
		const defVal = defaults[key];
		const savedVal = saved[key];
		if (
			defVal !== null &&
			typeof defVal === 'object' &&
			!Array.isArray(defVal) &&
			savedVal !== null &&
			typeof savedVal === 'object' &&
			!Array.isArray(savedVal)
		) {
			(result as Record<string, unknown>)[key] = deepMerge(
				defVal as Record<string, unknown>,
				savedVal as Record<string, unknown>,
			);
		} else {
			(result as Record<string, unknown>)[key] = savedVal;
		}
	}
	return result;
}
