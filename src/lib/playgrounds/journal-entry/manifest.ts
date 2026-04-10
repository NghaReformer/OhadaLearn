import type { PlaygroundManifest } from '$lib/contracts/playground';

export const manifest: PlaygroundManifest = {
	slug: 'journal-entry',
	titleKey: 'pg.journal-entry.title',
	descKey: 'pg.journal-entry.desc',
	icon: '📒',
	category: 'financial-accounting',
	standards: ['syscohada', 'ifrs', 'french-pcg', 'us-gaap'],
	sharedResources: ['chart-of-accounts', 'currency'],
};
