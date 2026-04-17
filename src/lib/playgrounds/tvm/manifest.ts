import type { PlaygroundManifest } from '$lib/contracts/playground';

export const manifest: PlaygroundManifest = {
	slug: 'tvm',
	titleKey: 'pg.tvm.title',
	descKey: 'pg.tvm.desc',
	icon: '📐',
	category: 'business-math',
	standards: ['syscohada', 'ifrs', 'french-pcg', 'us-gaap'],
	sharedResources: ['currency']
};
