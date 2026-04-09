import { writable, type Writable } from 'svelte/store';

const isBrowser = typeof localStorage !== 'undefined';

/**
 * Creates a Svelte writable store that persists to localStorage.
 * - SSR-safe: uses defaults on server, loads from localStorage on client
 * - Deep-merges saved data with defaults (adding new fields doesn't break old saves)
 * - Silently handles corrupt data and quota errors
 * - Versioning via key naming convention (e.g., 'tvm_v1')
 */
export function createPersistentStore<T extends object>(
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

function loadAndMerge<T extends object>(key: string, defaults: T): T {
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

function deepMerge<T extends object>(defaults: T, saved: Record<string, unknown>): T {
	const result = { ...defaults };
	const defaultsRec = defaults as Record<string, unknown>;
	for (const key of Object.keys(defaultsRec)) {
		if (!(key in saved)) continue;
		const defVal = defaultsRec[key];
		const savedVal = saved[key];
		// Type guard: only merge if the saved value's type matches the default's type.
		// Prevents localStorage containing { count: "not-a-number" } when defaults have { count: 0 }.
		if (typeof defVal !== typeof savedVal) continue;

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
