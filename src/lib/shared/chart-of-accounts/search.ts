import type { ResolvedAccount } from './types';

/**
 * Search accounts with weighted scoring.
 * - Code prefix match: +10
 * - Key contains query: +5
 * - Name (locale-appropriate) contains query: +3
 *
 * Returns sorted by score descending, limited to top 20.
 */
export function searchAccounts(
	query: string,
	accounts: ResolvedAccount[],
	locale: 'en' | 'fr'
): ResolvedAccount[] {
	if (!query || query.trim().length === 0) return [];

	const q = query.toLowerCase().trim();

	const scored: Array<{ account: ResolvedAccount; score: number }> = [];

	for (const account of accounts) {
		let score = 0;

		// Code prefix match (+10)
		if (account.frameworkCode.startsWith(q)) {
			score += 10;
		}

		// Key contains query (+5)
		if (account.key.toLowerCase().includes(q)) {
			score += 5;
		}

		// Name contains query (+3) — check framework name in the appropriate locale
		const name =
			locale === 'fr'
				? account.frameworkNameFr.toLowerCase()
				: account.frameworkNameEn.toLowerCase();
		if (name.includes(q)) {
			score += 3;
		}

		// Also check base names as fallback
		if (score === 0) {
			const baseName =
				locale === 'fr' ? account.nameFr.toLowerCase() : account.nameEn.toLowerCase();
			if (baseName.includes(q)) {
				score += 3;
			}
		}

		if (score > 0) {
			scored.push({ account, score });
		}
	}

	scored.sort((a, b) => b.score - a.score);

	return scored.slice(0, 20).map((s) => s.account);
}
