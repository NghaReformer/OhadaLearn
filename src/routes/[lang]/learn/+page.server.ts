import type { PageServerLoad } from './$types';
import { loadLearnSections } from '$lib/content/loader';
import { playgrounds } from '$lib/data/playgrounds';
import type { Locale } from '$lib/i18n/types';
import type { LearnSection } from '$lib/content/types';

export interface PlaygroundLearnGroup {
	slug: string;
	titleKey: string;
	descKey: string;
	icon: string;
	sections: LearnSection[];
}

export const load: PageServerLoad = async ({ params }) => {
	const locale = (params.lang === 'fr' ? 'fr' : 'en') as Locale;

	const groups: PlaygroundLearnGroup[] = [];
	for (const pg of playgrounds) {
		const sections = await loadLearnSections(pg.slug, locale);
		if (sections.length === 0) continue;
		groups.push({
			slug: pg.slug,
			titleKey: pg.titleKey,
			descKey: pg.descKey,
			icon: pg.icon,
			sections: sections.sort((a, b) => a.order - b.order)
		});
	}

	return { groups };
};
