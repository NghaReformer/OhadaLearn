import type { PlaygroundManifest } from '$lib/contracts/playground';

export const manifest: PlaygroundManifest = {
	slug: 'bank-reconciliation',
	titleKey: 'pg.bank-reconciliation.title',
	descKey: 'pg.bank-reconciliation.desc',
	icon: '🏧',
	category: 'financial-accounting',
	standards: ['syscohada', 'ifrs', 'french-pcg', 'us-gaap'],
	sharedResources: ['chart-of-accounts', 'currency'],
};
