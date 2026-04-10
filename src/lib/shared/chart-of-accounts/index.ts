export type {
	AccountType,
	NormalBalance,
	AccountingFramework,
	SubType,
	CashFlowClass,
	AccountBase,
	FrameworkOverride,
	ResolvedAccount
} from './types';

import type { AccountingFramework, AccountBase, FrameworkOverride, ResolvedAccount } from './types';
import { ohadaAccounts } from './ohada-accounts';
import { pcgOverrides } from './overrides/pcg';
import { ifrsOverrides } from './overrides/ifrs';
import { usgaapOverrides } from './overrides/usgaap';
import { searchAccounts as searchAccountsImpl } from './search';

const overridesByFramework: Record<string, Map<string, FrameworkOverride>> = {
	pcg: pcgOverrides,
	ifrs: ifrsOverrides,
	usgaap: usgaapOverrides
};

function resolveAccount(base: AccountBase, framework: AccountingFramework): ResolvedAccount {
	const overrides = overridesByFramework[framework];
	const override = overrides?.get(base.key);

	return {
		...base,
		frameworkCode: override?.code ?? base.code,
		frameworkNameFr: override?.nameFr ?? base.nameFr,
		frameworkNameEn: override?.nameEn ?? base.nameEn
	};
}

/**
 * Get a single account by key, resolved for the given framework.
 */
export function getAccount(key: string, framework: AccountingFramework): ResolvedAccount | null {
	const base = ohadaAccounts.get(key);
	if (!base) return null;
	return resolveAccount(base, framework);
}

/**
 * Get all accounts resolved for the given framework.
 */
export function getAllAccounts(framework: AccountingFramework): ResolvedAccount[] {
	const results: ResolvedAccount[] = [];
	for (const base of ohadaAccounts.values()) {
		results.push(resolveAccount(base, framework));
	}
	return results;
}

/**
 * Search accounts by query string with weighted scoring.
 */
export function searchAccounts(
	query: string,
	framework: AccountingFramework,
	locale: 'en' | 'fr'
): ResolvedAccount[] {
	const all = getAllAccounts(framework);
	return searchAccountsImpl(query, all, locale);
}

/**
 * Get accounts whose code starts with the given OHADA class number (1-9).
 */
export function getAccountsByClass(
	classNum: number,
	framework: AccountingFramework
): ResolvedAccount[] {
	const prefix = String(classNum);
	const results: ResolvedAccount[] = [];
	for (const base of ohadaAccounts.values()) {
		if (base.code.startsWith(prefix)) {
			results.push(resolveAccount(base, framework));
		}
	}
	return results;
}
