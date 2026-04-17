import type { PlaygroundManifest } from '$lib/contracts/playground';

export const manifest: PlaygroundManifest = {
	slug: 'cvp',
	titleKey: 'pg.cvp.title',
	descKey: 'pg.cvp.desc',
	icon: '📊',
	category: 'managerial-accounting',
	standards: ['syscohada', 'ifrs', 'french-pcg', 'us-gaap'],
	sharedResources: ['currency'],
};
