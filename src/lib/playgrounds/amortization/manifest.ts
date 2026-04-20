import type { PlaygroundManifest } from '$lib/contracts/playground';

export const manifest: PlaygroundManifest = {
	slug: 'amortization',
	titleKey: 'pg.amort.title',
	descKey: 'pg.amort.desc',
	icon: '🏦',
	category: 'business-math',
	standards: ['syscohada', 'ifrs', 'french-pcg', 'us-gaap'],
	sharedResources: ['chart-of-accounts', 'currency'],
};
