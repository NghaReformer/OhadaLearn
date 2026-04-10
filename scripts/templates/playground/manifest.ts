import type { PlaygroundManifest } from '$lib/contracts/playground';

export const manifest: PlaygroundManifest = {
	slug: '__SLUG__',
	titleKey: 'pg.__SLUG__.title',
	descKey: 'pg.__SLUG__.desc',
	icon: '📊',
	category: '__CATEGORY__',
	standards: [__STANDARDS__],
	sharedResources: [__SHARED_RESOURCES__],
};
