import { describe, it, expect } from 'vitest';
import Ajv from 'ajv';
import fs from 'fs';
import path from 'path';

const schemaPath = path.resolve('schemas/exercise-template.schema.json');

describe('exercise template schema', () => {
	it('schema file exists and is valid JSON', () => {
		expect(fs.existsSync(schemaPath)).toBe(true);
		const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf-8'));
		const ajv = new Ajv();
		const validate = ajv.compile(schema);
		expect(typeof validate).toBe('function');
	});

	it('accepts a valid numeric exercise template', () => {
		const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf-8'));
		const ajv = new Ajv();
		const validate = ajv.compile(schema);

		const valid = validate({
			id: 'pv-single-sum',
			playgroundSlug: 'tvm',
			difficulty: 'fondamental',
			template: {
				promptKey: 'exercises.tvm.pv-single-sum.prompt',
				parameters: [
					{ name: 'futureValue', type: 'currency', min: 1000, max: 100000 },
					{ name: 'rate', type: 'rate', min: 1, max: 20, step: 0.5 },
					{ name: 'periods', type: 'periods', min: 1, max: 30 },
				],
			},
			solutionLogic: { solverFunction: 'solvePV', answerType: 'numeric', tolerance: 0.01, toleranceType: 'absolute' },
			feedbackTemplates: { correct: 'exercises.tvm.pv-single-sum.correct', incorrect: 'exercises.tvm.pv-single-sum.incorrect' },
		});
		expect(valid).toBe(true);
	});

	it('accepts a journal-entry exercise template', () => {
		const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf-8'));
		const ajv = new Ajv();
		const validate = ajv.compile(schema);

		const valid = validate({
			id: 'equipment-purchase',
			playgroundSlug: 'journal-entry',
			difficulty: 'fondamental',
			template: {
				promptKey: 'exercises.je.equipment-purchase.prompt',
				parameters: [
					{ name: 'amount', type: 'currency', min: 500000, max: 10000000 },
					{ name: 'accounts', type: 'account-set', accountClasses: [2, 4] },
					{ name: 'entryLines', type: 'journal-lines', minLines: 2, maxLines: 4 },
				],
			},
			solutionLogic: { solverFunction: 'solveEquipmentPurchase', answerType: 'journal-entry', partialCredit: true },
			feedbackTemplates: { correct: 'exercises.je.correct', incorrect: 'exercises.je.incorrect' },
		});
		expect(valid).toBe(true);
	});

	it('rejects template with missing required fields', () => {
		const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf-8'));
		const ajv = new Ajv();
		const validate = ajv.compile(schema);
		const valid = validate({ id: 'bad', playgroundSlug: 'tvm' });
		expect(valid).toBe(false);
	});

	it('rejects template with invalid difficulty', () => {
		const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf-8'));
		const ajv = new Ajv();
		const validate = ajv.compile(schema);

		const valid = validate({
			id: 'bad',
			playgroundSlug: 'tvm',
			difficulty: 'easy',
			template: { promptKey: 'x', parameters: [] },
			solutionLogic: { solverFunction: 'solve' },
			feedbackTemplates: { correct: 'x', incorrect: 'y' },
		});
		expect(valid).toBe(false);
	});
});
