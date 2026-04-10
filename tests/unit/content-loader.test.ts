import { describe, it, expect, afterAll } from 'vitest';
import fs from 'fs';
import path from 'path';

const TEST_SLUG = 'test-pg-tmp';
const CONTENT_ROOT = path.resolve('content');
const TEST_DIR = path.join(CONTENT_ROOT, TEST_SLUG);

describe('content loader', () => {
	afterAll(() => {
		if (fs.existsSync(TEST_DIR)) {
			fs.rmSync(TEST_DIR, { recursive: true });
		}
	});

	it('loadLearnSections returns empty array if no content directory', async () => {
		const { loadLearnSections } = await import('$lib/content/loader');
		const sections = await loadLearnSections('nonexistent', 'en');
		expect(sections).toEqual([]);
	});

	it('loadLearnSections reads and renders Markdown files', async () => {
		const learnDir = path.join(TEST_DIR, 'learn', 'en');
		fs.mkdirSync(learnDir, { recursive: true });
		fs.writeFileSync(path.join(learnDir, '01-intro.md'), '# Introduction\n\nHello world');
		fs.writeFileSync(path.join(learnDir, '02-details.md'), '# Details\n\nMore info');

		const { loadLearnSections } = await import('$lib/content/loader');
		const sections = await loadLearnSections(TEST_SLUG, 'en');

		expect(sections).toHaveLength(2);
		expect(sections[0].order).toBe(1);
		expect(sections[0].html).toContain('<h1>Introduction</h1>');
		expect(sections[1].order).toBe(2);
		expect(sections[1].html).toContain('<h1>Details</h1>');
	});

	it('loadScenarios returns empty array if no scenarios directory', async () => {
		const { loadScenarios } = await import('$lib/content/loader');
		const scenarios = await loadScenarios('nonexistent');
		expect(scenarios).toEqual([]);
	});

	it('loadScenarios reads JSON files', async () => {
		const scenarioDir = path.join(TEST_DIR, 'scenarios');
		fs.mkdirSync(scenarioDir, { recursive: true });
		fs.writeFileSync(
			path.join(scenarioDir, 'car-loan.json'),
			JSON.stringify({
				slug: 'car-loan',
				titleKey: 'scenarios.car-loan.title',
				descKey: 'scenarios.car-loan.desc',
				presetValues: { principal: 5000000, rate: 8.5 },
			})
		);

		const { loadScenarios } = await import('$lib/content/loader');
		const scenarios = await loadScenarios(TEST_SLUG);

		expect(scenarios).toHaveLength(1);
		expect(scenarios[0].slug).toBe('car-loan');
		expect(scenarios[0].presetValues.principal).toBe(5000000);
	});

	it('loadExercises returns empty array if no exercises directory', async () => {
		const { loadExercises } = await import('$lib/content/loader');
		const exercises = await loadExercises('nonexistent');
		expect(exercises).toEqual([]);
	});
});
