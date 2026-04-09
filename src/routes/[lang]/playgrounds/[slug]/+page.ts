import { error } from '@sveltejs/kit';
import { playgrounds } from '$lib/data/playgrounds';
import type { PageLoad } from './$types';

export const load: PageLoad = ({ params }) => {
	const pg = playgrounds.find((p) => p.slug === params.slug);
	if (!pg) throw error(404, 'Playground not found');
	return { pg };
};
