import fs from 'fs';
import path from 'path';
import { renderMarkdown } from './markdown';
import type { LearnSection, Scenario, ExerciseTemplateFile } from './types';
import type { Locale } from '$lib/i18n/types';
import type { ExerciseDifficulty } from '$lib/contracts/playground';

const CONTENT_ROOT = path.resolve('content');

export async function loadLearnSections(slug: string, locale: Locale): Promise<LearnSection[]> {
	const dir = path.join(CONTENT_ROOT, slug, 'learn', locale);
	if (!fs.existsSync(dir)) return [];

	const files = fs.readdirSync(dir)
		.filter((f) => f.endsWith('.md'))
		.sort();

	const sections: LearnSection[] = [];
	for (const file of files) {
		const source = fs.readFileSync(path.join(dir, file), 'utf-8');
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
	const dir = path.join(CONTENT_ROOT, slug, 'scenarios');
	if (!fs.existsSync(dir)) return [];

	const files = fs.readdirSync(dir)
		.filter((f) => f.endsWith('.json'))
		.sort();

	return files.map((file) => {
		const raw = fs.readFileSync(path.join(dir, file), 'utf-8');
		return JSON.parse(raw) as Scenario;
	});
}

export async function loadExercises(
	slug: string,
	difficulty?: ExerciseDifficulty,
): Promise<ExerciseTemplateFile[]> {
	const baseDir = path.join(CONTENT_ROOT, slug, 'exercises');
	if (!fs.existsSync(baseDir)) return [];

	const difficulties: ExerciseDifficulty[] = difficulty
		? [difficulty]
		: ['fondamental', 'intermediaire', 'avance'];

	const exercises: ExerciseTemplateFile[] = [];
	for (const diff of difficulties) {
		const dir = path.join(baseDir, diff);
		if (!fs.existsSync(dir)) continue;

		const files = fs.readdirSync(dir)
			.filter((f) => f.endsWith('.json'))
			.sort();

		for (const file of files) {
			const raw = fs.readFileSync(path.join(dir, file), 'utf-8');
			exercises.push(JSON.parse(raw) as ExerciseTemplateFile);
		}
	}

	return exercises;
}
