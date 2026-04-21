import { renderMarkdown } from './markdown';
import type { LearnSection, Scenario, ExerciseTemplateFile } from './types';
import type { Locale } from '$lib/i18n/types';
import type { ExerciseDifficulty } from '$lib/contracts/playground';

// ─── Build-time content bundling via Vite glob ──────────────────────────
// Using import.meta.glob ensures all content under /content/** is bundled
// into the server build at compile time. This works across every adapter
// (node, vercel, static) without runtime filesystem access — the previous
// implementation used fs.readFileSync which silently returned empty arrays
// on Vercel serverless deployments because content/ is not included in the
// function bundle by default.

// Raw markdown for learn sections.
const learnSources = import.meta.glob<string>('/content/*/learn/*/*.md', {
	query: '?raw',
	eager: true,
	import: 'default',
});

// Scenario JSON files.
const scenarioSources = import.meta.glob<Scenario>('/content/*/scenarios/*.json', {
	eager: true,
	import: 'default',
});

// Exercise JSON files (organised by difficulty).
const exerciseSources = import.meta.glob<ExerciseTemplateFile>(
	'/content/*/exercises/*/*.json',
	{ eager: true, import: 'default' },
);

const SAFE_SLUG = /^[a-z0-9][a-z0-9-]*$/;

function validateSlug(slug: string): void {
	if (!SAFE_SLUG.test(slug)) {
		throw new Error(`Invalid content slug: "${slug}"`);
	}
}

/** Extract path segments after the /content/ prefix. */
function segmentsFor(path: string): string[] {
	// Paths look like "/content/<slug>/learn/<locale>/01-intro.md"
	return path.replace(/^\/content\//, '').split('/');
}

export async function loadLearnSections(slug: string, locale: Locale): Promise<LearnSection[]> {
	validateSlug(slug);

	const matches: Array<{ file: string; source: string }> = [];
	for (const [p, source] of Object.entries(learnSources)) {
		const [pathSlug, section, pathLocale, file] = segmentsFor(p);
		if (pathSlug === slug && section === 'learn' && pathLocale === locale) {
			matches.push({ file, source });
		}
	}
	matches.sort((a, b) => a.file.localeCompare(b.file));

	const sections: LearnSection[] = [];
	for (const { file, source } of matches) {
		const html = await renderMarkdown(source);
		const orderMatch = file.match(/^(\d+)/);
		const order = orderMatch ? parseInt(orderMatch[1], 10) : 0;
		const fileSlug = file.replace(/^\d+-/, '').replace(/\.md$/, '');
		const titleMatch = source.match(/^#\s+(.+)$/m);
		const title = titleMatch ? titleMatch[1] : fileSlug;
		sections.push({ slug: fileSlug, title, html, order });
	}

	return sections;
}

export async function loadScenarios(slug: string): Promise<Scenario[]> {
	validateSlug(slug);

	const matches: Array<{ file: string; data: Scenario }> = [];
	for (const [p, data] of Object.entries(scenarioSources)) {
		const [pathSlug, section, file] = segmentsFor(p);
		if (pathSlug === slug && section === 'scenarios') {
			matches.push({ file, data });
		}
	}
	matches.sort((a, b) => a.file.localeCompare(b.file));
	return matches.map((m) => m.data);
}

export async function loadExercises(
	slug: string,
	difficulty?: ExerciseDifficulty,
): Promise<ExerciseTemplateFile[]> {
	validateSlug(slug);

	const difficulties: ExerciseDifficulty[] = difficulty
		? [difficulty]
		: ['fondamental', 'intermediaire', 'avance'];

	const matches: Array<{ difficulty: ExerciseDifficulty; file: string; data: ExerciseTemplateFile }> = [];
	for (const [p, data] of Object.entries(exerciseSources)) {
		const [pathSlug, section, pathDifficulty, file] = segmentsFor(p);
		if (pathSlug !== slug || section !== 'exercises') continue;
		const diff = pathDifficulty as ExerciseDifficulty;
		if (!difficulties.includes(diff)) continue;
		matches.push({ difficulty: diff, file, data });
	}
	// Preserve difficulty order (fondamental → intermediaire → avance),
	// then file order within each difficulty.
	const diffRank: Record<ExerciseDifficulty, number> = {
		fondamental: 0,
		intermediaire: 1,
		avance: 2,
	};
	matches.sort((a, b) => {
		const d = diffRank[a.difficulty] - diffRank[b.difficulty];
		if (d !== 0) return d;
		return a.file.localeCompare(b.file);
	});
	return matches.map((m) => m.data);
}
