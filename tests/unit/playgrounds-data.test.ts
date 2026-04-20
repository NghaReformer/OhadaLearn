import { describe, it, expect } from 'vitest';
import { playgrounds } from '$lib/data/playgrounds';
import { isRegistered } from '$lib/playgrounds/_registry';

// Ensure native modules register themselves so isRegistered() returns true for migrated playgrounds.
import '$lib/playgrounds';

describe('playground catalog data', () => {
	it('has 6 playgrounds', () => {
		expect(playgrounds).toHaveLength(6);
	});

	it('each playground has required fields', () => {
		for (const pg of playgrounds) {
			expect(pg.slug).toBeTruthy();
			expect(pg.titleKey).toBeTruthy();
			expect(pg.descKey).toBeTruthy();
			expect(pg.icon).toBeTruthy();
			expect(pg.category).toBeTruthy();
		}
	});

	it('slugs are unique', () => {
		const slugs = playgrounds.map((p) => p.slug);
		expect(new Set(slugs).size).toBe(slugs.length);
	});

	it('every playground either has a staticFile iframe path or a registered native module', () => {
		for (const pg of playgrounds) {
			const hasStatic = typeof pg.staticFile === 'string' && /^\/playgrounds\/.*\.html$/.test(pg.staticFile);
			const hasNative = isRegistered(pg.slug);
			expect(hasStatic || hasNative, `${pg.slug} must provide either staticFile or a native module`).toBe(true);
		}
	});

	it('staticFile paths (when present) point at legacy html under /playgrounds', () => {
		for (const pg of playgrounds) {
			if (pg.staticFile !== undefined) {
				expect(pg.staticFile).toMatch(/^\/playgrounds\/.*\.html$/);
			}
		}
	});
});
