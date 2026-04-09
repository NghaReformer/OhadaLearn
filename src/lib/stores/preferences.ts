import { derived } from 'svelte/store';
import { createPersistentStore } from '$lib/persistence';
import type { Locale } from '$lib/i18n/types';
import type { AccountingStandard } from '$lib/contracts/playground';

export interface UserPreferences {
	locale: Locale;
	currency: string;
	accountingStandard: AccountingStandard;
}

export const preferences = createPersistentStore<UserPreferences>('ohadalearn_prefs_v1', {
	locale: 'en',
	currency: 'XAF',
	accountingStandard: 'syscohada',
});

export function setCurrency(code: string): void {
	preferences.update((p) => ({ ...p, currency: code }));
}

export function setAccountingStandard(standard: AccountingStandard): void {
	preferences.update((p) => ({ ...p, accountingStandard: standard }));
}

export const currency$ = derived(preferences, (p) => p.currency);
export const accountingStandard$ = derived(preferences, (p) => p.accountingStandard);
export const locale$ = derived(preferences, (p) => p.locale);
