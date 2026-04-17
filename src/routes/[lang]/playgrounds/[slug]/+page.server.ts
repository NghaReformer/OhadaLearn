import type { PageServerLoad } from './$types';
import { loadLearnSections, loadScenarios, loadExercises } from '$lib/content/loader';
import { isRegistered } from '$lib/playgrounds/_registry';
import type { Locale } from '$lib/i18n/types';

import '$lib/playgrounds';

export const load: PageServerLoad = async ({ params }) => {
	const { slug, lang } = params;

	if (!isRegistered(slug)) {
		return { learnSections: [], scenarios: [], exercises: [] };
	}

	const locale = (lang === 'fr' ? 'fr' : 'en') as Locale;
	const [learnSections, scenarios, exercises] = await Promise.all([
		loadLearnSections(slug, locale),
		loadScenarios(slug),
		loadExercises(slug),
	]);

	return { learnSections, scenarios, exercises };
};
