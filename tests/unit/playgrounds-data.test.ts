import { describe, it, expect } from 'vitest';
import { playgrounds } from '$lib/data/playgrounds';

describe('playground catalog data', () => {
	it('has 5 playgrounds', () => {
		expect(playgrounds).toHaveLength(5);
	});

	it('each playground has required fields', () => {
		for (const pg of playgrounds) {
			expect(pg.slug).toBeTruthy();
			expect(pg.titleKey).toBeTruthy();
			expect(pg.descKey).toBeTruthy();
			expect(pg.staticFile).toBeTruthy();
			expect(pg.icon).toBeTruthy();
			expect(pg.category).toBeTruthy();
		}
	});

	it('slugs are unique', () => {
		const slugs = playgrounds.map((p) => p.slug);
		expect(new Set(slugs).size).toBe(slugs.length);
	});

	it('static files point to existing playground html', () => {
		for (const pg of playgrounds) {
			expect(pg.staticFile).toMatch(/^\/playgrounds\/.*\.html$/);
		}
	});
});
