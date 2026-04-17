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
import { fmtNumber } from '$lib/format';

type ExerciseSolver = (params: Record<string, number>) => JournalLine[];

const SYSCOHADA_VAT_RATE = 0.1925;

function roundTax(amount: number): number {
	return Math.round(amount);
}

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
	],
	cashSaleWithVat: ({ saleAmountHt }) => {
		const vat = roundTax(saleAmountHt * SYSCOHADA_VAT_RATE);
		const ttc = saleAmountHt + vat;
		return [
			{ accountKey: 'bank', debit: ttc, credit: 0 },
			{ accountKey: 'salesMerchandise', debit: 0, credit: saleAmountHt },
			{ accountKey: 'vatCollected', debit: 0, credit: vat }
		];
	},
	creditPurchaseWithVat: ({ purchaseAmountHt }) => {
		const vat = roundTax(purchaseAmountHt * SYSCOHADA_VAT_RATE);
		const ttc = purchaseAmountHt + vat;
		return [
			{ accountKey: 'purchasesMerchandise', debit: purchaseAmountHt, credit: 0 },
			{ accountKey: 'vatDeductible', debit: vat, credit: 0 },
			{ accountKey: 'accountsPayable', debit: 0, credit: ttc }
		];
	},
	salaryAccrual: ({ salaryAmount }) => [
		{ accountKey: 'salaryExpense', debit: salaryAmount, credit: 0 },
		{ accountKey: 'employeesPayable', debit: 0, credit: salaryAmount }
	],
	monthlyDepreciation: ({ depreciationAmount }) => [
		{ accountKey: 'depreciationExpense', debit: depreciationAmount, credit: 0 },
		{ accountKey: 'accDeprEquipment', debit: 0, credit: depreciationAmount }
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
	},
	{
		slug: 'cash-sale-with-vat',
		solverFunction: 'cashSaleWithVat',
		promptKey: 'je.exercise.f06.prompt',
		difficulty: 'fondamental',
		parameters: [
			{ name: 'saleAmountHt', type: 'currency', min: 500000, max: 5000000, step: 100000 }
		],
		correctKey: 'je.exercise.f06.correct',
		incorrectKey: 'je.exercise.f06.incorrect'
	},
	{
		slug: 'credit-purchase-with-vat',
		solverFunction: 'creditPurchaseWithVat',
		promptKey: 'je.exercise.f07.prompt',
		difficulty: 'fondamental',
		parameters: [
			{ name: 'purchaseAmountHt', type: 'currency', min: 500000, max: 5000000, step: 100000 }
		],
		correctKey: 'je.exercise.f07.correct',
		incorrectKey: 'je.exercise.f07.incorrect'
	},
	{
		slug: 'salary-accrual',
		solverFunction: 'salaryAccrual',
		promptKey: 'je.exercise.f08.prompt',
		difficulty: 'fondamental',
		parameters: [
			{ name: 'salaryAmount', type: 'currency', min: 250000, max: 2500000, step: 50000 }
		],
		correctKey: 'je.exercise.f08.correct',
		incorrectKey: 'je.exercise.f08.incorrect'
	},
	{
		slug: 'monthly-depreciation',
		solverFunction: 'monthlyDepreciation',
		promptKey: 'je.exercise.f09.prompt',
		difficulty: 'fondamental',
		parameters: [
			{ name: 'depreciationAmount', type: 'currency', min: 50000, max: 1000000, step: 25000 }
		],
		correctKey: 'je.exercise.f09.correct',
		incorrectKey: 'je.exercise.f09.incorrect'
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
	const formatLocale = locale === 'fr' ? 'fr-FR' : 'en-US';

	return template.replace(/\{(\w+)\}/g, (_, key: string) => {
		const value = params[key];
		if (typeof value !== 'number') return `{${key}}`;
		return fmtNumber(value, 0, formatLocale);
	});
}

export function buildExerciseFeedback(
	studentLines: JournalLine[],
	exercise: ExerciseTemplateFile,
	params: Record<string, number>,
	framework: AccountingFramework = 'ohada',
	locale: Locale = 'en',
	currencyCode: string = 'XOF'
): ExerciseFeedback & { lineFeedback: ReturnType<typeof gradeJournalEntry>['lineResults'] } {
	const correctLines = solveExerciseTemplate(exercise, params);
	const result = gradeJournalEntry(studentLines, correctLines, framework, locale, currencyCode);

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
		// Headless feedback (used by the shared exercise contract). The Playground
		// component re-grades with the live framework/locale/currency for UI display.
		const result = gradeJournalEntry(studentLines, correctLines, 'ohada', 'en');
		return {
			isCorrect: result.isCorrect,
			score: result.score,
			messageKey: result.isCorrect ? meta.correctKey : meta.incorrectKey
		};
	},
	randomize: () => randomizeParameters(meta.parameters)
}));
