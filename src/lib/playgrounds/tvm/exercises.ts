import type {
	ExerciseDifficulty,
	ExerciseField,
	ExerciseFeedback,
	ExerciseTypeDef
} from '$lib/contracts/playground';
import type { ExerciseParameter, ExerciseTemplateFile } from '$lib/content/types';
import { fmtNumber } from '$lib/format';
import { TVMEngine } from './engine';
import { gradeNumeric } from './grader';
import type { SolveMode, SolveInput } from './types';

const engine = new TVMEngine();

type ExerciseSolverInput = { mode: SolveMode; overrides: Partial<SolveInput> };

type ExerciseSolver = (params: Record<string, number>) => ExerciseSolverInput;

/**
 * Each exercise is a thin adapter from randomised parameters to a concrete
 * SolveInput. The solver returns the full input so the grader can run the
 * engine against the student's numeric answer.
 */
const exerciseSolvers: Record<string, ExerciseSolver> = {
	depositToday: ({ fv, rate, years }) => ({
		mode: 'pv',
		overrides: {
			fv,
			pmt: 0,
			rate,
			periods: years,
			periodsUnit: 'years',
			compoundingFrequency: 'monthly',
			paymentFrequency: 'monthly',
			paymentTiming: 'end'
		}
	}),
	retirementNestEgg: ({ pmt, rate, years }) => ({
		mode: 'fv',
		overrides: {
			pv: 0,
			pmt: -pmt, // contributions are outflows
			rate,
			periods: years,
			periodsUnit: 'years',
			compoundingFrequency: 'monthly',
			paymentFrequency: 'monthly',
			paymentTiming: 'end'
		}
	}),
	loanPayment: ({ pv, rate, years }) => ({
		mode: 'pmt',
		overrides: {
			pv, // loan principal received (positive)
			fv: 0,
			rate,
			periods: years,
			periodsUnit: 'years',
			compoundingFrequency: 'monthly',
			paymentFrequency: 'monthly',
			paymentTiming: 'end'
		}
	}),
	implicitRate: ({ pv, fv, years }) => ({
		mode: 'rate',
		overrides: {
			pv: -pv, // deposited (outflow)
			fv, // withdrawn (inflow)
			pmt: 0,
			periods: years,
			periodsUnit: 'years',
			compoundingFrequency: 'annual',
			paymentFrequency: 'annual',
			paymentTiming: 'end'
		}
	})
};

const supportedExerciseMeta: Array<{
	slug: string;
	solverFunction: keyof typeof exerciseSolvers;
	promptKey: string;
	titleKey: string;
	difficulty: ExerciseDifficulty;
	parameters: ExerciseParameter[];
	correctKey: string;
	incorrectKey: string;
}> = [
	{
		slug: 'deposit-today',
		solverFunction: 'depositToday',
		promptKey: 'tvm.exercise.f01.prompt',
		titleKey: 'tvm.exercise.f01.title',
		difficulty: 'fondamental',
		parameters: [
			{ name: 'fv', type: 'currency', min: 5000000, max: 25000000, step: 1000000 },
			{ name: 'rate', type: 'rate', min: 5, max: 12, step: 0.5 },
			{ name: 'years', type: 'integer', min: 3, max: 15, step: 1 }
		],
		correctKey: 'tvm.exercise.f01.correct',
		incorrectKey: 'tvm.exercise.f01.incorrect'
	},
	{
		slug: 'retirement-nest-egg',
		solverFunction: 'retirementNestEgg',
		promptKey: 'tvm.exercise.f02.prompt',
		titleKey: 'tvm.exercise.f02.title',
		difficulty: 'fondamental',
		parameters: [
			{ name: 'pmt', type: 'currency', min: 25000, max: 250000, step: 25000 },
			{ name: 'rate', type: 'rate', min: 5, max: 10, step: 0.5 },
			{ name: 'years', type: 'integer', min: 10, max: 30, step: 5 }
		],
		correctKey: 'tvm.exercise.f02.correct',
		incorrectKey: 'tvm.exercise.f02.incorrect'
	},
	{
		slug: 'loan-payment',
		solverFunction: 'loanPayment',
		promptKey: 'tvm.exercise.f03.prompt',
		titleKey: 'tvm.exercise.f03.title',
		difficulty: 'fondamental',
		parameters: [
			{ name: 'pv', type: 'currency', min: 2000000, max: 8000000, step: 500000 },
			{ name: 'rate', type: 'rate', min: 5, max: 12, step: 0.25 },
			{ name: 'years', type: 'integer', min: 3, max: 7, step: 1 }
		],
		correctKey: 'tvm.exercise.f03.correct',
		incorrectKey: 'tvm.exercise.f03.incorrect'
	},
	{
		slug: 'implicit-rate',
		solverFunction: 'implicitRate',
		promptKey: 'tvm.exercise.f04.prompt',
		titleKey: 'tvm.exercise.f04.title',
		difficulty: 'fondamental',
		parameters: [
			{ name: 'pv', type: 'currency', min: 500000, max: 5000000, step: 250000 },
			{ name: 'fv', type: 'currency', min: 1000000, max: 20000000, step: 500000 },
			{ name: 'years', type: 'integer', min: 3, max: 20, step: 1 }
		],
		correctKey: 'tvm.exercise.f04.correct',
		incorrectKey: 'tvm.exercise.f04.incorrect'
	}
];

function randomizeParameters(parameters: ExerciseParameter[]): Record<string, number> {
	const values: Record<string, number> = {};
	for (const p of parameters) {
		if (p.type === 'account-set' || p.type === 'journal-lines') continue;
		const step = p.step ?? 1;
		const steps = Math.floor((p.max - p.min) / step);
		const offset = Math.floor(Math.random() * (steps + 1)) * step;
		values[p.name] = p.min + offset;
	}
	return values;
}

function parameterToField(p: ExerciseParameter): ExerciseField {
	return { key: p.name, labelKey: p.name, type: 'number' };
}

export function solveExercise(
	solverFunction: string,
	params: Record<string, number>
): number {
	const solver = exerciseSolvers[solverFunction];
	if (!solver) throw new Error(`Unsupported TVM solver: ${solverFunction}`);
	const { mode, overrides } = solver(params);
	const input: SolveInput = {
		mode,
		periodsUnit: 'years',
		compoundingFrequency: 'annual',
		paymentFrequency: 'annual',
		paymentTiming: 'end',
		...overrides
	};
	const result = engine.solve(input);
	if (!result) throw new Error(`TVM solver returned null for ${solverFunction}`);
	return result.value;
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
		// `rate` renders with up to 2 decimals; amounts as integers.
		const decimals = key === 'rate' ? 2 : 0;
		return fmtNumber(value, decimals, formatLocale);
	});
}

export function randomizeExerciseParameters(exercise: ExerciseTemplateFile): Record<string, number> {
	return randomizeParameters(exercise.template.parameters);
}

export function buildExerciseFeedback(
	studentAnswer: number,
	exercise: ExerciseTemplateFile,
	params: Record<string, number>
): ExerciseFeedback {
	const modelAnswer = solveExercise(exercise.solutionLogic.solverFunction, params);
	const { isCorrect, score } = gradeNumeric(studentAnswer, modelAnswer);
	return {
		isCorrect,
		score,
		messageKey: isCorrect ? exercise.feedbackTemplates.correct : exercise.feedbackTemplates.incorrect,
		details: {
			expected: String(modelAnswer)
		}
	};
}

export const exerciseTypes: ExerciseTypeDef[] = supportedExerciseMeta.map((meta) => ({
	slug: meta.slug,
	titleKey: meta.titleKey,
	descKey: meta.promptKey,
	difficulty: meta.difficulty,
	inputSchema: {
		type: 'number',
		fields: meta.parameters.map(parameterToField)
	},
	solve: (params) => ({ answer: String(solveExercise(meta.solverFunction, params as Record<string, number>)) }),
	feedback: (studentAnswer, correctAnswer) => {
		const student = Number(studentAnswer.answer ?? NaN);
		const correct = Number(correctAnswer.answer ?? NaN);
		const { isCorrect, score } = gradeNumeric(student, correct);
		return {
			isCorrect,
			score,
			messageKey: isCorrect ? meta.correctKey : meta.incorrectKey
		};
	},
	randomize: () => randomizeParameters(meta.parameters)
}));
