import { error } from '@sveltejs/kit';
import { playgrounds } from '$lib/data/playgrounds';
import { isRegistered } from '$lib/playgrounds/_registry';
import type { PageLoad } from './$types';

// Ensure native playground modules register themselves (side-effect imports)
import '$lib/playgrounds/journal-entry/index';
import '$lib/playgrounds/tvm/index';

export const load: PageLoad = ({ params, data }) => {
	const pg = playgrounds.find((p) => p.slug === params.slug);
	if (!pg) throw error(404, 'Playground not found');
	return {
		...data,
		pg,
		isNativeModule: isRegistered(params.slug),
	};
};
