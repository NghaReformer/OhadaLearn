import type { PlaygroundManifest } from '$lib/contracts/playground';

export const manifest: PlaygroundManifest = {
	slug: 'interest',
	titleKey: 'pg.interest.title',
	descKey: 'pg.interest.desc',
	icon: '📈',
	category: 'business-math',
	standards: ['syscohada', 'ifrs', 'french-pcg', 'us-gaap'],
	sharedResources: ['currency'],
};
