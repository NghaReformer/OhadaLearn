import type {
	ExerciseDifficulty,
	ExerciseField,
	ExerciseFeedback,
	ExerciseTypeDef,
} from '$lib/contracts/playground';
import { gradeNumeric } from '$lib/grading/numeric';
import { InterestEngine } from './engine';
import type { CompoundingFrequency } from '$lib/playgrounds/tvm/types';

const engine = new InterestEngine();

type Params = Record<string, number | string>;
type Answer = Record<string, number | string>;
type ExerciseSolver = (params: Params) => Answer;

const TOL_REL_DEFAULT = 0.005;
const TOL_ABS_RATE = 0.0001;

function solveSimpleInterestTotal(p: Params): Answer {
	const principal = Number(p.principal);
	const rate = Number(p.rate) / 100;
	const years = Number(p.termYears);
	const interest = principal * rate * years;
	return { answer: Math.round((principal + interest) * 100) / 100 };
}

function solveSimpleInterestDays(p: Params): Answer {
	const principal = Number(p.principal);
	const rate = Number(p.rate) / 100;
	const days = Number(p.days);
	const interest = (principal * rate * days) / 360;
	return { answer: Math.round(interest * 100) / 100 };
}

function solveCompoundFv(p: Params): Answer {
	const principal = Number(p.principal);
	const rate = Number(p.rate) / 100;
	const years = Number(p.years);
	const fv = principal * Math.pow(1 + rate, years);
	return { answer: Math.round(fv * 100) / 100 };
}

function solveCompoundFrequencyEffect(p: Params): Answer {
	const principal = Number(p.principal);
	const rate = Number(p.rate) / 100;
	const years = Number(p.years);
	const annual = principal * Math.pow(1 + rate, years);
	const monthly = principal * Math.pow(1 + rate / 12, 12 * years);
	const continuous = principal * Math.exp(rate * years);
	return {
		answer: Math.round(continuous * 100) / 100,
		fvAnnual: Math.round(annual * 100) / 100,
		fvMonthly: Math.round(monthly * 100) / 100,
		fvContinuous: Math.round(continuous * 100) / 100,
	};
}

function solveCompoundRate(p: Params): Answer {
	const principal = Number(p.principal);
	const futureValue = Number(p.futureValue);
	const years = Number(p.years);
	if (principal <= 0 || futureValue <= 0 || years <= 0) return { answer: NaN };
	const rate = Math.pow(futureValue / principal, 1 / years) - 1;
	return { answer: Math.round(rate * 10000) / 10000 };
}

function solveNominalToEir(p: Params): Answer {
	const nominal = Number(p.rate) / 100;
	const freq: CompoundingFrequency = 'monthly';
	const eir = engine.nominalToEir(nominal, freq);
	return { answer: Math.round(eir * 10000) / 10000 };
}

function solveEirToNominal(p: Params): Answer {
	const eir = Number(p.eir) / 100;
	const freq: CompoundingFrequency = 'monthly';
	const nominal = engine.eirToNominal(eir, freq);
	return { answer: Math.round(nominal * 10000) / 10000 };
}

function solveBondIssuePrice(p: Params): Answer {
	const issuePrice = engine.issuePrice({
		faceValue: Number(p.faceValue),
		couponRate: Number(p.couponRate) / 100,
		marketRate: Number(p.marketRate) / 100,
		termYears: Number(p.termYears),
		paymentFrequency: 'annual',
	});
	return { answer: Math.round(issuePrice * 100) / 100 };
}

function solveEirInterestPeriodN(p: Params): Answer {
	const schedule = engine.buildSchedule(
		{
			faceValue: Number(p.faceValue),
			couponRate: Number(p.couponRate) / 100,
			marketRate: Number(p.marketRate) / 100,
			termYears: Number(p.termYears),
			paymentFrequency: 'annual',
		},
		'eir',
	);
	const row = schedule.rows[Number(p.periodIndex) - 1];
	return { answer: Math.round((row?.interestExpense ?? 0) * 100) / 100 };
}

const exerciseSolvers: Record<string, ExerciseSolver> = {
	simpleInterestTotal: solveSimpleInterestTotal,
	simpleInterestDays: solveSimpleInterestDays,
	compoundFv: solveCompoundFv,
	compoundFrequencyEffect: solveCompoundFrequencyEffect,
	solveCompoundRate,
	nominalToEir: solveNominalToEir,
	eirToNominal: solveEirToNominal,
	bondIssuePrice: solveBondIssuePrice,
	eirInterestPeriodN: solveEirInterestPeriodN,
};

interface ExerciseMeta {
	slug: string;
	solverFunction: keyof typeof exerciseSolvers;
	difficulty: ExerciseDifficulty;
	promptKey: string;
	correctKey: string;
	incorrectKey: string;
	fields: ExerciseField[];
	parameters: Array<{ name: string; min: number; max: number; step: number }>;
	tolerance: number;
	toleranceType: 'absolute' | 'relative';
}

const answerField: ExerciseField = { key: 'answer', labelKey: 'int.kpi.totalAmount', type: 'number' };

const exerciseMeta: ExerciseMeta[] = [
	{
		slug: 'simple-interest-total',
		solverFunction: 'simpleInterestTotal',
		difficulty: 'fondamental',
		promptKey: 'int.exercise.simple-interest-total.prompt',
		correctKey: 'int.exercise.simple-interest-total.correct',
		incorrectKey: 'int.exercise.simple-interest-total.incorrect',
		fields: [answerField],
		parameters: [
			{ name: 'principal', min: 500_000, max: 5_000_000, step: 100_000 },
			{ name: 'rate', min: 4, max: 15, step: 0.5 },
			{ name: 'termYears', min: 1, max: 5, step: 1 },
		],
		tolerance: TOL_REL_DEFAULT,
		toleranceType: 'relative',
	},
	{
		slug: 'simple-interest-days',
		solverFunction: 'simpleInterestDays',
		difficulty: 'fondamental',
		promptKey: 'int.exercise.simple-interest-days.prompt',
		correctKey: 'int.exercise.simple-interest-days.correct',
		incorrectKey: 'int.exercise.simple-interest-days.incorrect',
		fields: [answerField],
		parameters: [
			{ name: 'principal', min: 200_000, max: 3_000_000, step: 100_000 },
			{ name: 'rate', min: 5, max: 14, step: 0.5 },
			{ name: 'days', min: 30, max: 180, step: 15 },
		],
		tolerance: 0.01,
		toleranceType: 'relative',
	},
	{
		slug: 'compound-fv',
		solverFunction: 'compoundFv',
		difficulty: 'fondamental',
		promptKey: 'int.exercise.compound-fv.prompt',
		correctKey: 'int.exercise.compound-fv.correct',
		incorrectKey: 'int.exercise.compound-fv.incorrect',
		fields: [answerField],
		parameters: [
			{ name: 'principal', min: 500_000, max: 5_000_000, step: 100_000 },
			{ name: 'rate', min: 4, max: 14, step: 0.5 },
			{ name: 'years', min: 2, max: 10, step: 1 },
		],
		tolerance: TOL_REL_DEFAULT,
		toleranceType: 'relative',
	},
	{
		slug: 'nominal-to-eir',
		solverFunction: 'nominalToEir',
		difficulty: 'fondamental',
		promptKey: 'int.exercise.nominal-to-eir.prompt',
		correctKey: 'int.exercise.nominal-to-eir.correct',
		incorrectKey: 'int.exercise.nominal-to-eir.incorrect',
		fields: [answerField],
		parameters: [{ name: 'rate', min: 4, max: 18, step: 0.25 }],
		tolerance: TOL_ABS_RATE,
		toleranceType: 'absolute',
	},
	{
		slug: 'compound-frequency-effect',
		solverFunction: 'compoundFrequencyEffect',
		difficulty: 'intermediaire',
		promptKey: 'int.exercise.compound-frequency-effect.prompt',
		correctKey: 'int.exercise.compound-frequency-effect.correct',
		incorrectKey: 'int.exercise.compound-frequency-effect.incorrect',
		fields: [answerField],
		parameters: [
			{ name: 'principal', min: 500_000, max: 5_000_000, step: 100_000 },
			{ name: 'rate', min: 6, max: 14, step: 1 },
			{ name: 'years', min: 3, max: 10, step: 1 },
		],
		tolerance: TOL_REL_DEFAULT,
		toleranceType: 'relative',
	},
	{
		slug: 'solve-compound-rate',
		solverFunction: 'solveCompoundRate',
		difficulty: 'intermediaire',
		promptKey: 'int.exercise.solve-compound-rate.prompt',
		correctKey: 'int.exercise.solve-compound-rate.correct',
		incorrectKey: 'int.exercise.solve-compound-rate.incorrect',
		fields: [answerField],
		parameters: [
			{ name: 'principal', min: 500_000, max: 5_000_000, step: 100_000 },
			{ name: 'futureValue', min: 700_000, max: 15_000_000, step: 100_000 },
			{ name: 'years', min: 2, max: 10, step: 1 },
		],
		tolerance: 0.0005,
		toleranceType: 'absolute',
	},
	{
		slug: 'eir-to-nominal',
		solverFunction: 'eirToNominal',
		difficulty: 'intermediaire',
		promptKey: 'int.exercise.eir-to-nominal.prompt',
		correctKey: 'int.exercise.eir-to-nominal.correct',
		incorrectKey: 'int.exercise.eir-to-nominal.incorrect',
		fields: [answerField],
		parameters: [{ name: 'eir', min: 5, max: 20, step: 0.5 }],
		tolerance: TOL_ABS_RATE,
		toleranceType: 'absolute',
	},
	{
		slug: 'bond-issue-price',
		solverFunction: 'bondIssuePrice',
		difficulty: 'intermediaire',
		promptKey: 'int.exercise.bond-issue-price.prompt',
		correctKey: 'int.exercise.bond-issue-price.correct',
		incorrectKey: 'int.exercise.bond-issue-price.incorrect',
		fields: [answerField],
		parameters: [
			{ name: 'faceValue', min: 500_000, max: 5_000_000, step: 500_000 },
			{ name: 'couponRate', min: 5, max: 14, step: 0.5 },
			{ name: 'marketRate', min: 5, max: 16, step: 0.5 },
			{ name: 'termYears', min: 3, max: 10, step: 1 },
		],
		tolerance: TOL_REL_DEFAULT,
		toleranceType: 'relative',
	},
	{
		slug: 'eir-interest-period-n',
		solverFunction: 'eirInterestPeriodN',
		difficulty: 'avance',
		promptKey: 'int.exercise.eir-interest-period-n.prompt',
		correctKey: 'int.exercise.eir-interest-period-n.correct',
		incorrectKey: 'int.exercise.eir-interest-period-n.incorrect',
		fields: [answerField],
		parameters: [
			{ name: 'faceValue', min: 1_000_000, max: 5_000_000, step: 500_000 },
			{ name: 'couponRate', min: 6, max: 12, step: 0.5 },
			{ name: 'marketRate', min: 6, max: 14, step: 0.5 },
			{ name: 'termYears', min: 3, max: 8, step: 1 },
			{ name: 'periodIndex', min: 2, max: 5, step: 1 },
		],
		tolerance: TOL_REL_DEFAULT,
		toleranceType: 'relative',
	},
];

function randomizeForMeta(meta: ExerciseMeta): Record<string, number> {
	const values: Record<string, number> = {};
	for (const p of meta.parameters) {
		const steps = Math.floor((p.max - p.min) / p.step);
		const offset = Math.floor(Math.random() * (steps + 1)) * p.step;
		values[p.name] = +(p.min + offset).toFixed(6);
	}
	return values;
}

export const exerciseTypes: ExerciseTypeDef[] = exerciseMeta.map((meta) => ({
	slug: meta.slug,
	titleKey: meta.promptKey,
	descKey: meta.promptKey,
	difficulty: meta.difficulty,
	inputSchema: { type: 'number', fields: meta.fields },
	solve: (params) => exerciseSolvers[meta.solverFunction](params as Params),
	feedback: (studentAnswer, correctAnswer): ExerciseFeedback => {
		const student = Number(studentAnswer.answer ?? NaN);
		const correct = Number(correctAnswer.answer ?? NaN);
		const { isCorrect, score } = gradeNumeric(
			student,
			correct,
			meta.tolerance,
			meta.toleranceType,
			{ scoringStrategy: 'soft', softMultiplier: 3 },
		);
		return {
			isCorrect,
			score,
			messageKey: isCorrect ? meta.correctKey : meta.incorrectKey,
		};
	},
	randomize: () => randomizeForMeta(meta),
}));

export function solveExerciseBySlug(
	slug: string,
	params: Record<string, number>,
): Record<string, number | string> | null {
	const meta = exerciseMeta.find((m) => m.slug === slug);
	if (!meta) return null;
	const solver = exerciseSolvers[meta.solverFunction];
	return solver(params);
}
