import type {
	ExerciseDifficulty,
	ExerciseTypeDef,
	ExerciseFeedback,
} from '$lib/contracts/playground';
import type { ExerciseParameter, ExerciseTemplateFile } from '$lib/content/types';
import type { Locale } from '$lib/i18n/types';
import { calcSingle } from './engine';
import { gradeNumeric } from '$lib/grading/numeric';
import type { CVPExerciseParams } from './types';

type ExerciseSlug = 'bep' | 'target' | 'aftertax' | 'mos' | 'dol';

const exerciseSolvers: Record<ExerciseSlug, (p: CVPExerciseParams) => number> = {
	bep: ({ price, variableCost, fixedCosts }) => {
		const result = calcSingle(price, variableCost, fixedCosts, 0, 0, 0);
		return Math.ceil(result.bepUnits - 0.0001);
	},
	target: ({ price, variableCost, fixedCosts, targetProfit = 0 }) => {
		const result = calcSingle(price, variableCost, fixedCosts, 0, targetProfit, 0);
		return Math.ceil(result.targetUnits - 0.0001);
	},
	aftertax: ({ price, variableCost, fixedCosts, targetProfit = 0, taxRate = 0 }) => {
		const result = calcSingle(price, variableCost, fixedCosts, 0, targetProfit, taxRate);
		return Math.ceil(result.afterTaxUnits - 0.0001);
	},
	mos: ({ price, variableCost, fixedCosts, volume = 0 }) => {
		const result = calcSingle(price, variableCost, fixedCosts, volume, 0, 0);
		return Number(result.mosPct.toFixed(2));
	},
	dol: ({ price, variableCost, fixedCosts, volume = 0 }) => {
		const result = calcSingle(price, variableCost, fixedCosts, volume, 0, 0);
		return Number(result.dol.toFixed(2));
	},
};

const supportedExerciseMeta: Array<{
	slug: ExerciseSlug;
	solverFunction: ExerciseSlug;
	promptKey: string;
	titleKey: string;
	descKey: string;
	difficulty: ExerciseDifficulty;
	parameters: ExerciseParameter[];
	tolerance: number;
	toleranceType: 'absolute' | 'relative';
	answerLabelKey: string;
}> = [
	{
		slug: 'bep',
		solverFunction: 'bep',
		promptKey: 'cvp.ex.bep.prompt',
		titleKey: 'cvp.ex.bep.title',
		descKey: 'cvp.ex.bep.desc',
		difficulty: 'fondamental',
		parameters: [
			{ name: 'price', type: 'currency', min: 10, max: 200, step: 5 },
			{ name: 'variableCost', type: 'currency', min: 2, max: 100, step: 1 },
			{ name: 'fixedCosts', type: 'currency', min: 10000, max: 200000, step: 5000 },
		],
		tolerance: 1,
		toleranceType: 'absolute',
		answerLabelKey: 'cvp.ex.bep.answerLabel',
	},
	{
		slug: 'target',
		solverFunction: 'target',
		promptKey: 'cvp.ex.target.prompt',
		titleKey: 'cvp.ex.target.title',
		descKey: 'cvp.ex.target.desc',
		difficulty: 'fondamental',
		parameters: [
			{ name: 'price', type: 'currency', min: 20, max: 200, step: 5 },
			{ name: 'variableCost', type: 'currency', min: 5, max: 100, step: 1 },
			{ name: 'fixedCosts', type: 'currency', min: 20000, max: 300000, step: 5000 },
			{ name: 'targetProfit', type: 'currency', min: 10000, max: 200000, step: 5000 },
		],
		tolerance: 1,
		toleranceType: 'absolute',
		answerLabelKey: 'cvp.ex.target.answerLabel',
	},
	{
		slug: 'aftertax',
		solverFunction: 'aftertax',
		promptKey: 'cvp.ex.aftertax.prompt',
		titleKey: 'cvp.ex.aftertax.title',
		descKey: 'cvp.ex.aftertax.desc',
		difficulty: 'intermediaire',
		parameters: [
			{ name: 'price', type: 'currency', min: 25, max: 200, step: 5 },
			{ name: 'variableCost', type: 'currency', min: 5, max: 100, step: 1 },
			{ name: 'fixedCosts', type: 'currency', min: 50000, max: 400000, step: 10000 },
			{ name: 'targetProfit', type: 'currency', min: 20000, max: 300000, step: 10000 },
			{ name: 'taxRate', type: 'rate', min: 10, max: 40, step: 5 },
		],
		tolerance: 1,
		toleranceType: 'absolute',
		answerLabelKey: 'cvp.ex.aftertax.answerLabel',
	},
	{
		slug: 'mos',
		solverFunction: 'mos',
		promptKey: 'cvp.ex.mos.prompt',
		titleKey: 'cvp.ex.mos.title',
		descKey: 'cvp.ex.mos.desc',
		difficulty: 'intermediaire',
		parameters: [
			{ name: 'price', type: 'currency', min: 20, max: 200, step: 5 },
			{ name: 'variableCost', type: 'currency', min: 5, max: 100, step: 1 },
			{ name: 'fixedCosts', type: 'currency', min: 20000, max: 300000, step: 5000 },
			{ name: 'volume', type: 'integer', min: 2000, max: 15000, step: 500 },
		],
		tolerance: 0.05,
		toleranceType: 'absolute',
		answerLabelKey: 'cvp.ex.mos.answerLabel',
	},
	{
		slug: 'dol',
		solverFunction: 'dol',
		promptKey: 'cvp.ex.dol.prompt',
		titleKey: 'cvp.ex.dol.title',
		descKey: 'cvp.ex.dol.desc',
		difficulty: 'avance',
		parameters: [
			{ name: 'price', type: 'currency', min: 25, max: 200, step: 5 },
			{ name: 'variableCost', type: 'currency', min: 10, max: 100, step: 1 },
			{ name: 'fixedCosts', type: 'currency', min: 50000, max: 400000, step: 10000 },
			{ name: 'volume', type: 'integer', min: 3000, max: 20000, step: 500 },
		],
		tolerance: 0.02,
		toleranceType: 'relative',
		answerLabelKey: 'cvp.ex.dol.answerLabel',
	},
];

function randomizeParameters(parameters: ExerciseParameter[]): Record<string, number> {
	const values: Record<string, number> = {};
	for (const parameter of parameters) {
		if (parameter.type === 'account-set' || parameter.type === 'journal-lines') continue;
		const step = parameter.step ?? 1;
		const steps = Math.floor((parameter.max - parameter.min) / step);
		const offset = Math.floor(Math.random() * (steps + 1)) * step;
		values[parameter.name] = parameter.min + offset;
	}
	return values;
}

export function randomizeExerciseParameters(
	exercise: ExerciseTemplateFile,
): Record<string, number> {
	return randomizeParameters(exercise.template.parameters);
}

export function solveExercise(
	solverFunction: string,
	params: Record<string, number>,
): number {
	const solver = exerciseSolvers[solverFunction as ExerciseSlug];
	if (!solver) {
		throw new Error(`Unsupported CVP solver: ${solverFunction}`);
	}
	return solver(params as unknown as CVPExerciseParams);
}

export function renderExercisePrompt(
	template: string,
	params: Record<string, number>,
	locale: Locale,
): string {
	const numberFormatter = new Intl.NumberFormat(locale === 'fr' ? 'fr-FR' : 'en-US');
	return template.replace(/\{(\w+)\}/g, (_, key: string) => {
		const value = params[key];
		if (typeof value !== 'number') return `{${key}}`;
		return numberFormatter.format(value);
	});
}

export function buildExerciseFeedback(
	studentValue: number,
	exercise: ExerciseTemplateFile,
	params: Record<string, number>,
): ExerciseFeedback & {
	delta: number;
	deltaPct: number;
	correctValue: number;
} {
	const correctValue = solveExercise(exercise.solutionLogic.solverFunction, params);
	const tolerance = exercise.solutionLogic.tolerance ?? 0.01;
	const toleranceType = exercise.solutionLogic.toleranceType ?? 'relative';
	const result = gradeNumeric(studentValue, correctValue, tolerance, toleranceType);

	return {
		isCorrect: result.isCorrect,
		score: result.score,
		messageKey: result.isCorrect
			? exercise.feedbackTemplates.correct
			: exercise.feedbackTemplates.incorrect,
		delta: result.delta,
		deltaPct: result.deltaPct,
		correctValue,
	};
}

export const exerciseTypes: ExerciseTypeDef[] = supportedExerciseMeta.map((meta) => ({
	slug: meta.slug,
	titleKey: meta.titleKey,
	descKey: meta.descKey,
	difficulty: meta.difficulty,
	inputSchema: {
		type: 'number',
		fields: [{ key: 'answer', labelKey: meta.answerLabelKey, type: 'number' }],
	},
	solve: (params) => ({
		answer: solveExercise(meta.solverFunction, params as Record<string, number>),
	}),
	feedback: (studentAnswer, correctAnswer): ExerciseFeedback => {
		const student = Number(studentAnswer.answer ?? NaN);
		const correct = Number(correctAnswer.answer ?? NaN);
		const result = gradeNumeric(student, correct, meta.tolerance, meta.toleranceType);
		return {
			isCorrect: result.isCorrect,
			score: result.score,
			messageKey: result.isCorrect
				? 'cvp.ex.correct'
				: result.score > 0
					? 'cvp.ex.partial'
					: 'cvp.ex.incorrect',
		};
	},
	randomize: () => randomizeParameters(meta.parameters),
}));
