import { writable, derived } from 'svelte/store';
import type { Locale, TranslationMap, TranslationNamespace } from './types';
import type { TranslationKey } from './generated';

// --- Internal registry ---
const registry: Record<Locale, TranslationMap> = { en: {}, fr: {} };
const _registryVersion = writable(0);

// --- Public stores ---
export const locale = writable<Locale>('en');

export function registerNamespace(name: string, ns: TranslationNamespace): void {
	Object.assign(registry.en, ns.en);
	Object.assign(registry.fr, ns.fr);
	_registryVersion.update((v) => v + 1);
}

export function setLocale(l: Locale): void {
	locale.set(l);
	if (typeof localStorage !== 'undefined') {
		localStorage.setItem('ohadalearn:locale', l);
	}
}

export function initLocale(): void {
	if (typeof localStorage !== 'undefined') {
		const saved = localStorage.getItem('ohadalearn:locale') as Locale | null;
		if (saved === 'en' || saved === 'fr') {
			locale.set(saved);
		}
	}
}

/**
 * Derived store that returns a translation function.
 * Usage in Svelte 5 templates: {$t('key')}
 */
export const t = derived(
	[locale, _registryVersion],
	([$locale]) => {
		return (key: TranslationKey | (string & {})): string => {
			// Try current locale first
			const value = registry[$locale]?.[key];
			if (value !== undefined) return value;

			// Fall back to English
			if ($locale !== 'en') {
				const fallback = registry.en?.[key];
				if (fallback !== undefined) return fallback;
			}

			// Return the key itself as last resort
			return key;
		};
	}
);

// --- Re-exports ---
export type { Locale, TranslationMap, TranslationNamespace } from './types';
export type { TranslationKey } from './generated';

// --- Eagerly load all built-in namespaces ---
import { commonEn } from './namespaces/common.en';
import { commonFr } from './namespaces/common.fr';
import { landingEn } from './namespaces/landing.en';
import { landingFr } from './namespaces/landing.fr';
import { playgroundsEn } from './namespaces/playgrounds.en';
import { playgroundsFr } from './namespaces/playgrounds.fr';

registerNamespace('common', { en: commonEn, fr: commonFr });
registerNamespace('landing', { en: landingEn, fr: landingFr });
registerNamespace('playgrounds', { en: playgroundsEn, fr: playgroundsFr });
