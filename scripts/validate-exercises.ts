import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Ajv from 'ajv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CONTENT_ROOT = path.resolve(__dirname, '../content');
const SCHEMA_PATH = path.resolve(__dirname, '../schemas/exercise-template.schema.json');

function main(): void {
	if (!fs.existsSync(CONTENT_ROOT)) {
		console.log('No content directory found. Skipping exercise validation.');
		return;
	}

	const playgroundDirs = fs.readdirSync(CONTENT_ROOT)
		.filter((d) => {
			const full = path.join(CONTENT_ROOT, d);
			return fs.statSync(full).isDirectory();
		});

	const exerciseFiles: { path: string; data: unknown }[] = [];

	for (const pgDir of playgroundDirs) {
		const exercisesDir = path.join(CONTENT_ROOT, pgDir, 'exercises');
		if (!fs.existsSync(exercisesDir)) continue;

		const difficulties = fs.readdirSync(exercisesDir)
			.filter((d) => fs.statSync(path.join(exercisesDir, d)).isDirectory());

		for (const diff of difficulties) {
			const diffDir = path.join(exercisesDir, diff);
			const files = fs.readdirSync(diffDir).filter((f) => f.endsWith('.json'));

			for (const file of files) {
				const filePath = path.join(diffDir, file);
				try {
					const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
					exerciseFiles.push({ path: filePath, data });
				} catch (e) {
					console.error(`Invalid JSON in ${filePath}: ${e}`);
					process.exit(1);
				}
			}
		}
	}

	if (exerciseFiles.length === 0) {
		console.log('No exercise templates found. Skipping validation.');
		return;
	}

	const schema = JSON.parse(fs.readFileSync(SCHEMA_PATH, 'utf-8'));
	const ajv = new Ajv();
	const validate = ajv.compile(schema);

	let hasErrors = false;
	const ids = new Set<string>();

	for (const { path: filePath, data } of exerciseFiles) {
		const relPath = path.relative(process.cwd(), filePath);

		if (!validate(data)) {
			console.error(`Schema validation failed: ${relPath}`);
			for (const err of validate.errors || []) {
				console.error(`   ${err.instancePath}: ${err.message}`);
			}
			hasErrors = true;
			continue;
		}

		const exercise = data as { id: string };
		if (ids.has(exercise.id)) {
			console.error(`Duplicate exercise ID: "${exercise.id}" in ${relPath}`);
			hasErrors = true;
		}
		ids.add(exercise.id);
	}

	if (hasErrors) {
		console.error('\nValidation FAILED. Fix the errors above.');
		process.exit(1);
	}

	console.log(`Validated ${exerciseFiles.length} exercise templates. All passed.`);
}

main();
