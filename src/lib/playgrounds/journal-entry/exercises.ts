import type {
	ExerciseDifficulty,
	ExerciseField,
	ExerciseFeedback,
	ExerciseTypeDef
} from '$lib/contracts/playground';
import type { ExerciseParameter, ExerciseTemplateFile } from '$lib/content/types';
import type { AccountingFramework } from '$lib/shared/chart-of-accounts/types';
import type { Locale } from '$lib/i18n/types';
import type { JournalLine } from './types';
import { gradeJournalEntry } from './grader';

type ExerciseSolver = (params: Record<string, number>) => JournalLine[];

const exerciseSolvers: Record<string, ExerciseSolver> = {
	basicCashSale: ({ saleAmount }) => [
		{ accountKey: 'bank', debit: saleAmount, credit: 0 },
		{ accountKey: 'salesMerchandise', debit: 0, credit: saleAmount }
	],
	creditPurchase: ({ purchaseAmount }) => [
		{ accountKey: 'purchasesMerchandise', debit: purchaseAmount, credit: 0 },
		{ accountKey: 'accountsPayable', debit: 0, credit: purchaseAmount }
	],
	supplierPayment: ({ paymentAmount }) => [
		{ accountKey: 'accountsPayable', debit: paymentAmount, credit: 0 },
		{ accountKey: 'bank', debit: 0, credit: paymentAmount }
	],
	capitalContribution: ({ capitalAmount }) => [
		{ accountKey: 'bank', debit: capitalAmount, credit: 0 },
		{ accountKey: 'shareCapital', debit: 0, credit: capitalAmount }
	],
	rentPayment: ({ rentAmount }) => [
		{ accountKey: 'rentExpense', debit: rentAmount, credit: 0 },
		{ accountKey: 'bank', debit: 0, credit: rentAmount }
	]
};

const supportedExerciseMeta: Array<{
	slug: string;
	solverFunction: keyof typeof exerciseSolvers;
	promptKey: string;
	difficulty: ExerciseDifficulty;
	parameters: ExerciseParameter[];
	correctKey: string;
	incorrectKey: string;
}> = [
	{
		slug: 'basic-cash-sale',
		solverFunction: 'basicCashSale',
		promptKey: 'je.exercise.f01.prompt',
		difficulty: 'fondamental',
		parameters: [{ name: 'saleAmount', type: 'currency', min: 500000, max: 5000000, step: 100000 }],
		correctKey: 'je.exercise.f01.correct',
		incorrectKey: 'je.exercise.f01.incorrect'
	},
	{
		slug: 'credit-purchase',
		solverFunction: 'creditPurchase',
		promptKey: 'je.exercise.f02.prompt',
		difficulty: 'fondamental',
		parameters: [
			{ name: 'purchaseAmount', type: 'currency', min: 300000, max: 4000000, step: 100000 }
		],
		correctKey: 'je.exercise.f02.correct',
		incorrectKey: 'je.exercise.f02.incorrect'
	},
	{
		slug: 'supplier-payment',
		solverFunction: 'supplierPayment',
		promptKey: 'je.exercise.f03.prompt',
		difficulty: 'fondamental',
		parameters: [
			{ name: 'paymentAmount', type: 'currency', min: 200000, max: 3000000, step: 50000 }
		],
		correctKey: 'je.exercise.f03.correct',
		incorrectKey: 'je.exercise.f03.incorrect'
	},
	{
		slug: 'capital-contribution',
		solverFunction: 'capitalContribution',
		promptKey: 'je.exercise.f04.prompt',
		difficulty: 'fondamental',
		parameters: [
			{ name: 'capitalAmount', type: 'currency', min: 5000000, max: 50000000, step: 5000000 }
		],
		correctKey: 'je.exercise.f04.correct',
		incorrectKey: 'je.exercise.f04.incorrect'
	},
	{
		slug: 'rent-payment',
		solverFunction: 'rentPayment',
		promptKey: 'je.exercise.f05.prompt',
		difficulty: 'fondamental',
		parameters: [{ name: 'rentAmount', type: 'currency', min: 200000, max: 2000000, step: 50000 }],
		correctKey: 'je.exercise.f05.correct',
		incorrectKey: 'je.exercise.f05.incorrect'
	}
];

function randomizeParameters(parameters: ExerciseParameter[]): Record<string, number | string> {
	const values: Record<string, number | string> = {};

	for (const parameter of parameters) {
		if (parameter.type === 'account-set' || parameter.type === 'journal-lines') continue;

		const step = parameter.step ?? 1;
		const steps = Math.floor((parameter.max - parameter.min) / step);
		const offset = Math.floor(Math.random() * (steps + 1)) * step;
		values[parameter.name] = parameter.min + offset;
	}

	return values;
}

function parameterToField(parameter: ExerciseParameter): ExerciseField {
	return {
		key: parameter.name,
		labelKey: parameter.name,
		type: 'number'
	};
}

export function solveExercise(
	solverFunction: string,
	params: Record<string, number>
): JournalLine[] {
	const solver = exerciseSolvers[solverFunction];
	if (!solver) {
		throw new Error(`Unsupported journal-entry solver: ${solverFunction}`);
	}

	return solver(params);
}

export function solveExerciseTemplate(
	exercise: ExerciseTemplateFile,
	params: Record<string, number>
): JournalLine[] {
	return solveExercise(exercise.solutionLogic.solverFunction, params);
}

export function randomizeExerciseParameters(
	exercise: ExerciseTemplateFile
): Record<string, number> {
	return randomizeParameters(exercise.template.parameters) as Record<string, number>;
}

export function renderExercisePrompt(
	template: string,
	params: Record<string, number>,
	locale: 'en' | 'fr'
): string {
	const numberFormatter = new Intl.NumberFormat(locale === 'fr' ? 'fr-FR' : 'en-US');

	return template.replace(/\{(\w+)\}/g, (_, key: string) => {
		const value = params[key];
		if (typeof value !== 'number') return `{${key}}`;
		return numberFormatter.format(value);
	});
}

export function buildExerciseFeedback(
	studentLines: JournalLine[],
	exercise: ExerciseTemplateFile,
	params: Record<string, number>,
	framework: AccountingFramework = 'ohada',
	locale: Locale = 'en'
): ExerciseFeedback & { lineFeedback: ReturnType<typeof gradeJournalEntry>['lineResults'] } {
	const correctLines = solveExerciseTemplate(exercise, params);
	const result = gradeJournalEntry(studentLines, correctLines, framework, locale);

	return {
		isCorrect: result.isCorrect,
		score: result.score,
		messageKey: result.isCorrect
			? exercise.feedbackTemplates.correct
			: exercise.feedbackTemplates.incorrect,
		lineFeedback: result.lineResults
	};
}

export const exerciseTypes: ExerciseTypeDef[] = supportedExerciseMeta.map((meta) => ({
	slug: meta.slug,
	titleKey: meta.promptKey,
	descKey: meta.promptKey,
	difficulty: meta.difficulty,
	inputSchema: {
		type: 'journal-entry',
		fields: meta.parameters.map(parameterToField)
	},
	solve: (params) => ({
		answer: JSON.stringify(solveExercise(meta.solverFunction, params as Record<string, number>))
	}),
	feedback: (studentAnswer, correctAnswer) => {
		const studentLines = JSON.parse(String(studentAnswer.answer ?? '[]')) as JournalLine[];
		const correctLines = JSON.parse(String(correctAnswer.answer ?? '[]')) as JournalLine[];
		const result = gradeJournalEntry(studentLines, correctLines, 'ohada', 'en');
		return {
			isCorrect: result.isCorrect,
			score: result.score,
			messageKey: result.isCorrect ? meta.correctKey : meta.incorrectKey
		};
	},
	randomize: () => randomizeParameters(meta.parameters)
}));
