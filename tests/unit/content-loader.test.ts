import { describe, it, expect } from 'vitest';

// The content loader is backed by Vite's import.meta.glob, which bundles
// everything under /content/** at build time. Tests exercise real fixtures
// so the assertions double as deployment canaries — if the glob misses a
// playground's content, these tests fail instead of production.

describe('content loader', () => {
	it('loadLearnSections returns empty array for an unknown slug', async () => {
		const { loadLearnSections } = await import('$lib/content/loader');
		const sections = await loadLearnSections('nonexistent', 'en');
		expect(sections).toEqual([]);
	});

	it('loadLearnSections loads the Amortization EN sections in order', async () => {
		const { loadLearnSections } = await import('$lib/content/loader');
		const sections = await loadLearnSections('amortization', 'en');
		// The amortization pack authors 10 learn sections (01-intro through 10-*).
		expect(sections.length).toBeGreaterThanOrEqual(10);
		// Orders should be monotonically increasing, derived from the filename prefix.
		for (let i = 1; i < sections.length; i++) {
			expect(sections[i].order).toBeGreaterThanOrEqual(sections[i - 1].order);
		}
		// First section renders a heading.
		expect(sections[0].html).toContain('<h1');
	});

	it('loadLearnSections serves separate FR content', async () => {
		const { loadLearnSections } = await import('$lib/content/loader');
		const fr = await loadLearnSections('amortization', 'fr');
		expect(fr.length).toBeGreaterThanOrEqual(10);
	});

	it('loadScenarios returns empty array for an unknown slug', async () => {
		const { loadScenarios } = await import('$lib/content/loader');
		const scenarios = await loadScenarios('nonexistent');
		expect(scenarios).toEqual([]);
	});

	it('loadScenarios loads Amortization presets', async () => {
		const { loadScenarios } = await import('$lib/content/loader');
		const scenarios = await loadScenarios('amortization');
		expect(scenarios.length).toBeGreaterThanOrEqual(8);
		// Each scenario carries a slug, titleKey, descKey, and preset state.
		for (const sc of scenarios) {
			expect(typeof sc.slug).toBe('string');
			expect(typeof sc.titleKey).toBe('string');
			expect(typeof sc.descKey).toBe('string');
			expect(sc.presetValues).toBeTruthy();
		}
	});

	it('loadExercises returns empty array for an unknown slug', async () => {
		const { loadExercises } = await import('$lib/content/loader');
		const exercises = await loadExercises('nonexistent');
		expect(exercises).toEqual([]);
	});

	it('loadExercises preserves fondamental → intermediaire → avance order', async () => {
		const { loadExercises } = await import('$lib/content/loader');
		const exercises = await loadExercises('amortization');
		expect(exercises.length).toBeGreaterThanOrEqual(5);
		// Difficulty ordering is an enumerated rank; verify no advanced exercise
		// appears before a fondamental one by checking overall structure.
		const difficulties = exercises.map((e) => e.difficulty);
		const idx = (d: string) => ['fondamental', 'intermediaire', 'avance'].indexOf(d);
		for (let i = 1; i < difficulties.length; i++) {
			expect(idx(difficulties[i])).toBeGreaterThanOrEqual(idx(difficulties[i - 1]));
		}
	});
});
