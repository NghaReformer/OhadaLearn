/**
 * Playground Scaffold Generator
 *
 * Usage:
 *   npx tsx scripts/new-playground.ts \
 *     --slug cash-flow \
 *     --title "Cash Flow Statement" \
 *     --titleFr "Tableau des Flux de Trésorerie" \
 *     --category financial-accounting \
 *     --standards syscohada,ifrs \
 *     --sharedResources chart-of-accounts,currency
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEMPLATE_DIR = path.join(__dirname, 'templates', 'playground');
const SRC_ROOT = path.resolve(__dirname, '../src/lib/playgrounds');
const CONTENT_ROOT = path.resolve(__dirname, '../content');
const I18N_DIR = path.resolve(__dirname, '../src/lib/i18n/namespaces');

interface Config {
	slug: string;
	title: string;
	titleFr: string;
	category: string;
	standards: string[];
	sharedResources: string[];
}

function parseArgs(): Config {
	const args = process.argv.slice(2);
	const get = (flag: string): string => {
		const idx = args.indexOf(`--${flag}`);
		if (idx === -1 || idx + 1 >= args.length) {
			console.error(`Missing required flag: --${flag}`);
			process.exit(1);
		}
		return args[idx + 1];
	};

	return {
		slug: get('slug'),
		title: get('title'),
		titleFr: get('titleFr'),
		category: get('category'),
		standards: (args.includes('--standards') ? get('standards') : 'syscohada').split(','),
		sharedResources: (args.includes('--sharedResources') ? get('sharedResources') : 'currency').split(','),
	};
}

function validateInputs(config: Config): void {
	if (!/^[a-z0-9][a-z0-9-]*$/.test(config.slug)) {
		console.error(`Invalid slug: "${config.slug}" — must be lowercase alphanumeric with hyphens`);
		process.exit(1);
	}
	for (const s of config.standards) {
		if (!/^[a-z0-9-]+$/.test(s)) {
			console.error(`Invalid standard: "${s}" — must be lowercase alphanumeric with hyphens`);
			process.exit(1);
		}
	}
	for (const s of config.sharedResources) {
		if (!/^[a-z0-9-]+$/.test(s)) {
			console.error(`Invalid shared resource: "${s}" — must be lowercase alphanumeric with hyphens`);
			process.exit(1);
		}
	}
}

function escapeQuotes(s: string): string {
	return s.replace(/'/g, "\\'");
}

function toClassName(slug: string): string {
	return slug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join('');
}

function replaceTokens(content: string, config: Config): string {
	const className = toClassName(config.slug);
	return content
		.replace(/__SLUG__/g, config.slug)
		.replace(/__TITLE__/g, config.title)
		.replace(/__TITLE_FR__/g, config.titleFr)
		.replace(/__CLASS_NAME__/g, className)
		.replace(/__CATEGORY__/g, config.category)
		.replace(/__STANDARDS__/g, config.standards.map((s) => `'${s}'`).join(', '))
		.replace(/__SHARED_RESOURCES__/g, config.sharedResources.map((s) => `'${s}'`).join(', '));
}

function main(): void {
	const config = parseArgs();
	validateInputs(config);
	const pgDir = path.join(SRC_ROOT, config.slug);

	if (fs.existsSync(pgDir)) {
		console.error(`Playground "${config.slug}" already exists at ${pgDir}`);
		process.exit(1);
	}

	console.log(`Creating playground: ${config.slug}`);

	// 1. Copy template files
	fs.mkdirSync(pgDir, { recursive: true });
	const templateFiles = ['manifest.ts', 'engine.ts', 'exercises.ts', 'index.ts', 'Playground.svelte', 'Learn.svelte', 'Scenarios.svelte'];
	for (const file of templateFiles) {
		const templatePath = path.join(TEMPLATE_DIR, file);
		const content = fs.readFileSync(templatePath, 'utf-8');
		fs.writeFileSync(path.join(pgDir, file), replaceTokens(content, config));
	}

	// 2. Create content directories
	const contentDir = path.join(CONTENT_ROOT, config.slug);
	fs.mkdirSync(path.join(contentDir, 'learn', 'en'), { recursive: true });
	fs.mkdirSync(path.join(contentDir, 'learn', 'fr'), { recursive: true });
	fs.mkdirSync(path.join(contentDir, 'scenarios'), { recursive: true });
	fs.mkdirSync(path.join(contentDir, 'exercises', 'fondamental'), { recursive: true });
	fs.mkdirSync(path.join(contentDir, 'exercises', 'intermediaire'), { recursive: true });
	fs.mkdirSync(path.join(contentDir, 'exercises', 'avance'), { recursive: true });

	// Placeholder learn content
	const learnTemplate = fs.readFileSync(path.join(TEMPLATE_DIR, 'learn-intro.md'), 'utf-8');
	fs.writeFileSync(path.join(contentDir, 'learn', 'en', '01-intro.md'), replaceTokens(learnTemplate, config));
	fs.writeFileSync(
		path.join(contentDir, 'learn', 'fr', '01-intro.md'),
		replaceTokens(learnTemplate, config).replace(new RegExp(config.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), config.titleFr)
	);

	// 3. Add i18n keys
	const enPath = path.join(I18N_DIR, 'playgrounds.en.ts');
	const frPath = path.join(I18N_DIR, 'playgrounds.fr.ts');

	const enContent = fs.readFileSync(enPath, 'utf-8');
	const frContent = fs.readFileSync(frPath, 'utf-8');

	const safeTitle = escapeQuotes(config.title);
	const safeTitleFr = escapeQuotes(config.titleFr);
	const enKeys = `\t'pg.${config.slug}.title': '${safeTitle}',\n\t'pg.${config.slug}.desc': '${safeTitle} playground.',\n`;
	const frKeys = `\t'pg.${config.slug}.title': '${safeTitleFr}',\n\t'pg.${config.slug}.desc': 'Calculateur de ${safeTitleFr.toLowerCase()}.',\n`;

	// Insert keys before the closing `};` — handles optional trailing whitespace/newline
	fs.writeFileSync(enPath, enContent.replace(/};\s*$/, `${enKeys}};\n`));
	fs.writeFileSync(frPath, frContent.replace(/};\s*$/, `${frKeys}};\n`));

	// 4. Regenerate i18n types
	execSync('npx tsx scripts/generate-i18n-types.ts', { cwd: path.resolve(__dirname, '..'), stdio: 'inherit' });

	console.log(`\nPlayground "${config.slug}" created successfully.`);
	console.log(`  Source: ${pgDir}`);
	console.log(`  Content: ${contentDir}`);
}

main();
