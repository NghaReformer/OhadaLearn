import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const TEST_SLUG = 'test-scaffold-tmp';
const PG_DIR = path.resolve(`src/lib/playgrounds/${TEST_SLUG}`);
const CONTENT_DIR = path.resolve(`content/${TEST_SLUG}`);

describe('scaffold generator', () => {
	beforeAll(() => {
		if (fs.existsSync(PG_DIR)) fs.rmSync(PG_DIR, { recursive: true });
		if (fs.existsSync(CONTENT_DIR)) fs.rmSync(CONTENT_DIR, { recursive: true });
	});

	afterAll(() => {
		if (fs.existsSync(PG_DIR)) fs.rmSync(PG_DIR, { recursive: true });
		if (fs.existsSync(CONTENT_DIR)) fs.rmSync(CONTENT_DIR, { recursive: true });

		// Remove added i18n keys
		const enPath = path.resolve('src/lib/i18n/namespaces/playgrounds.en.ts');
		const frPath = path.resolve('src/lib/i18n/namespaces/playgrounds.fr.ts');
		let en = fs.readFileSync(enPath, 'utf-8');
		let fr = fs.readFileSync(frPath, 'utf-8');
		en = en.replace(new RegExp(`\\t'pg\\.${TEST_SLUG}\\..*\\n`, 'g'), '');
		fr = fr.replace(new RegExp(`\\t'pg\\.${TEST_SLUG}\\..*\\n`, 'g'), '');
		fs.writeFileSync(enPath, en);
		fs.writeFileSync(frPath, fr);
		execSync('npx tsx scripts/generate-i18n-types.ts', { stdio: 'pipe' });
	});

	it('creates all playground source files', () => {
		execSync(
			`npx tsx scripts/new-playground.ts --slug ${TEST_SLUG} --title "Test Scaffold" --titleFr "Test Scaffold FR" --category financial-accounting --standards syscohada --sharedResources currency`,
			{ stdio: 'pipe' }
		);

		expect(fs.existsSync(path.join(PG_DIR, 'manifest.ts'))).toBe(true);
		expect(fs.existsSync(path.join(PG_DIR, 'engine.ts'))).toBe(true);
		expect(fs.existsSync(path.join(PG_DIR, 'exercises.ts'))).toBe(true);
		expect(fs.existsSync(path.join(PG_DIR, 'index.ts'))).toBe(true);
		expect(fs.existsSync(path.join(PG_DIR, 'Playground.svelte'))).toBe(true);
		expect(fs.existsSync(path.join(PG_DIR, 'Learn.svelte'))).toBe(true);
		expect(fs.existsSync(path.join(PG_DIR, 'Scenarios.svelte'))).toBe(true);
	});

	it('creates content directories', () => {
		expect(fs.existsSync(path.join(CONTENT_DIR, 'learn', 'en', '01-intro.md'))).toBe(true);
		expect(fs.existsSync(path.join(CONTENT_DIR, 'learn', 'fr', '01-intro.md'))).toBe(true);
		expect(fs.existsSync(path.join(CONTENT_DIR, 'exercises', 'fondamental'))).toBe(true);
		expect(fs.existsSync(path.join(CONTENT_DIR, 'exercises', 'intermediaire'))).toBe(true);
		expect(fs.existsSync(path.join(CONTENT_DIR, 'exercises', 'avance'))).toBe(true);
	});

	it('replaces tokens in generated files', () => {
		const manifest = fs.readFileSync(path.join(PG_DIR, 'manifest.ts'), 'utf-8');
		expect(manifest).toContain(`slug: '${TEST_SLUG}'`);
		expect(manifest).toContain("'financial-accounting'");
		expect(manifest).not.toContain('__SLUG__');
	});

	it('adds i18n keys', () => {
		const en = fs.readFileSync(path.resolve('src/lib/i18n/namespaces/playgrounds.en.ts'), 'utf-8');
		expect(en).toContain(`'pg.${TEST_SLUG}.title': 'Test Scaffold'`);
	});

	it('refuses to overwrite existing playground', () => {
		expect(() => {
			execSync(
				`npx tsx scripts/new-playground.ts --slug ${TEST_SLUG} --title "Test" --titleFr "Test" --category financial-accounting`,
				{ stdio: 'pipe' }
			);
		}).toThrow();
	});
});
