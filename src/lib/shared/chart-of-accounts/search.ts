import type { ResolvedAccount } from './types';

/**
 * Bilingual synonyms that promote the correct primary account when a learner
 * searches with everyday terminology. Each key maps a normalized query term
 * to an ordered list of account keys — first match wins the largest bonus.
 *
 * Example: "cash" should surface Bank (521) and Petty Cash (57) instead of
 * only returning Petty Cash because "cash" literally appears in its name.
 */
const SYNONYMS: Record<string, string[]> = {
	// English
	cash: ['bank', 'pettyCash'],
	bank: ['bank', 'bankLoan', 'bankOverdraft'],
	inventory: ['merchandise', 'rawMaterials', 'finishedGoods', 'workInProgress'],
	stock: ['merchandise', 'rawMaterials', 'finishedGoods', 'workInProgress'],
	merchandise: ['merchandise'],
	accumulated: ['accDeprEquipment', 'accDeprBuildings', 'accDeprFurniture', 'accDeprVehicles'],
	depreciation: [
		'depreciationExpense',
		'accDeprEquipment',
		'accDeprBuildings',
		'accDeprFurniture',
		'accDeprVehicles'
	],
	allowance: ['allowanceDoubtful', 'inventoryProvision'],
	doubtful: ['allowanceDoubtful'],
	drawings: ['ownerDrawings'],
	owner: ['ownerDrawings', 'shareCapital'],
	capital: ['shareCapital'],
	receivable: ['accountsReceivable'],
	payable: ['accountsPayable'],
	sales: ['salesMerchandise', 'salesFinishedGoods', 'serviceRevenue'],
	revenue: ['salesMerchandise', 'serviceRevenue', 'otherOperatingRevenue'],
	vat: ['vatCollected', 'vatDeductible', 'vatPayable'],
	loan: ['bankLoan'],
	tax: ['incomeTaxPayable', 'incomeTaxExpense', 'vatPayable', 'taxesAndDuties'],
	// French
	caisse: ['pettyCash', 'bank'],
	banque: ['bank', 'bankLoan'],
	stocks: ['merchandise', 'rawMaterials', 'finishedGoods', 'workInProgress'],
	marchandises: ['merchandise'],
	amortissement: [
		'depreciationExpense',
		'accDeprEquipment',
		'accDeprBuildings',
		'accDeprFurniture',
		'accDeprVehicles'
	],
	amortissements: [
		'depreciationExpense',
		'accDeprEquipment',
		'accDeprBuildings',
		'accDeprFurniture',
		'accDeprVehicles'
	],
	amort: ['accDeprEquipment', 'accDeprBuildings', 'accDeprFurniture', 'accDeprVehicles'],
	provision: ['inventoryProvision', 'allowanceDoubtful', 'provisionForRisks'],
	clients: ['accountsReceivable'],
	fournisseurs: ['accountsPayable'],
	ventes: ['salesMerchandise', 'salesFinishedGoods', 'serviceRevenue'],
	emprunt: ['bankLoan'],
	tva: ['vatCollected', 'vatDeductible', 'vatPayable'],
	capitaux: ['shareCapital', 'retainedEarnings'],
	exploitant: ['ownerDrawings']
};

/**
 * Search accounts with weighted scoring.
 * - Code prefix match: +10
 * - Synonym match: +8
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
	const synonymHits = SYNONYMS[q] ?? [];
	const synonymRank = new Map<string, number>();
	synonymHits.forEach((key, i) => synonymRank.set(key, i));

	const scored: Array<{ account: ResolvedAccount; score: number }> = [];

	for (const account of accounts) {
		let score = 0;

		// Code prefix match (+10)
		if (account.frameworkCode.startsWith(q)) {
			score += 10;
		}

		// Synonym match: the primary hit (index 0) must out-rank any natural
		// keyword/name match so that, e.g., "cash" surfaces Bank (521) above
		// Petty Cash even though the word "cash" literally appears in Petty Cash.
		if (synonymRank.has(account.key)) {
			const rank = synonymRank.get(account.key) ?? 0;
			score += rank === 0 ? 20 : 8 - rank * 0.1;
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
