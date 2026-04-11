import type { PageServerLoad } from './$types';
import { loadScenarios } from '$lib/content/loader';
import { playgrounds } from '$lib/data/playgrounds';
import type { Scenario } from '$lib/content/types';

export interface PlaygroundScenarioGroup {
	slug: string;
	titleKey: string;
	descKey: string;
	icon: string;
	scenarios: Scenario[];
}

export const load: PageServerLoad = async () => {
	const groups: PlaygroundScenarioGroup[] = [];
	for (const pg of playgrounds) {
		const scenarios = await loadScenarios(pg.slug);
		if (scenarios.length === 0) continue;
		groups.push({
			slug: pg.slug,
			titleKey: pg.titleKey,
			descKey: pg.descKey,
			icon: pg.icon,
			scenarios
		});
	}

	return { groups };
};
