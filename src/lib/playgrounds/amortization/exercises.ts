import type {
	ExerciseDifficulty,
	ExerciseField,
	ExerciseFeedback,
	ExerciseTypeDef,
} from '$lib/contracts/playground';
import { pmt, remainingBalance } from '$lib/finance/pmt';
import { irr } from '$lib/finance/irr';

type ExerciseSolver = (params: Record<string, number>) => Record<string, number>;

const TOLERANCE_RELATIVE = 0.005;

function roundCurrency(value: number): number {
	return Math.round(value * 100) / 100;
}

function solveMonthlyPayment({ principal, annualRate, months }: Record<string, number>): number {
	return pmt(principal, annualRate / 12, months);
}

function solveTotalInterest({ principal, annualRate, months }: Record<string, number>): number {
	const periodicRate = annualRate / 12;
	const payment = pmt(principal, periodicRate, months);
	return payment * months - principal;
}

function solveRemainingBalance({
	principal,
	annualRate,
	months,
	afterPeriod,
}: Record<string, number>): number {
	return remainingBalance(principal, annualRate / 12, months, afterPeriod);
}

function solveRequiredTerm({
	principal,
	annualRate,
	payment,
}: Record<string, number>): number {
	const r = annualRate / 12;
	if (r === 0) return Math.ceil(principal / payment);
	const n = -Math.log(1 - (principal * r) / payment) / Math.log(1 + r);
	return Math.round(n);
}

function solveApr({
	principal,
	annualRate,
	months,
	originationFee,
}: Record<string, number>): number {
	const periodicRate = annualRate / 12;
	const payment = pmt(principal, periodicRate, months);
	const netCash = principal - originationFee;
	const cashFlows: number[] = [netCash];
	for (let i = 0; i < months; i++) cashFlows.push(-payment);
	const periodic = irr(cashFlows);
	if (!Number.isFinite(periodic)) return NaN;
	return periodic * 12;
}

const exerciseSolvers: Record<string, ExerciseSolver> = {
	monthlyPayment: (params) => ({ answer: roundCurrency(solveMonthlyPayment(params)) }),
	totalInterest: (params) => ({ answer: roundCurrency(solveTotalInterest(params)) }),
	remainingBalanceAt: (params) => ({ answer: roundCurrency(solveRemainingBalance(params)) }),
	requiredTerm: (params) => ({ answer: solveRequiredTerm(params) }),
	aprWithFees: (params) => ({ answer: Math.round(solveApr(params) * 1_000_000) / 1_000_000 }),
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

const exerciseMeta: ExerciseMeta[] = [
	{
		slug: 'monthly-payment',
		solverFunction: 'monthlyPayment',
		difficulty: 'fondamental',
		promptKey: 'am.exercise.monthlyPayment.prompt',
		correctKey: 'am.exercise.monthlyPayment.correct',
		incorrectKey: 'am.exercise.monthlyPayment.incorrect',
		fields: [{ key: 'answer', labelKey: 'am.exercise.field.payment', type: 'number' }],
		parameters: [
			{ name: 'principal', min: 3_000_000, max: 20_000_000, step: 500_000 },
			{ name: 'annualRate', min: 0.04, max: 0.14, step: 0.005 },
			{ name: 'months', min: 12, max: 120, step: 12 },
		],
		tolerance: TOLERANCE_RELATIVE,
		toleranceType: 'relative',
	},
	{
		slug: 'total-interest',
		solverFunction: 'totalInterest',
		difficulty: 'fondamental',
		promptKey: 'am.exercise.totalInterest.prompt',
		correctKey: 'am.exercise.totalInterest.correct',
		incorrectKey: 'am.exercise.totalInterest.incorrect',
		fields: [{ key: 'answer', labelKey: 'am.exercise.field.totalInterest', type: 'number' }],
		parameters: [
			{ name: 'principal', min: 2_000_000, max: 15_000_000, step: 500_000 },
			{ name: 'annualRate', min: 0.05, max: 0.12, step: 0.005 },
			{ name: 'months', min: 24, max: 84, step: 12 },
		],
		tolerance: TOLERANCE_RELATIVE,
		toleranceType: 'relative',
	},
	{
		slug: 'remaining-balance',
		solverFunction: 'remainingBalanceAt',
		difficulty: 'intermediaire',
		promptKey: 'am.exercise.remainingBalance.prompt',
		correctKey: 'am.exercise.remainingBalance.correct',
		incorrectKey: 'am.exercise.remainingBalance.incorrect',
		fields: [{ key: 'answer', labelKey: 'am.exercise.field.balance', type: 'number' }],
		parameters: [
			{ name: 'principal', min: 5_000_000, max: 20_000_000, step: 1_000_000 },
			{ name: 'annualRate', min: 0.05, max: 0.12, step: 0.005 },
			{ name: 'months', min: 36, max: 120, step: 12 },
			{ name: 'afterPeriod', min: 6, max: 48, step: 6 },
		],
		tolerance: TOLERANCE_RELATIVE,
		toleranceType: 'relative',
	},
	{
		slug: 'required-term',
		solverFunction: 'requiredTerm',
		difficulty: 'intermediaire',
		promptKey: 'am.exercise.requiredTerm.prompt',
		correctKey: 'am.exercise.requiredTerm.correct',
		incorrectKey: 'am.exercise.requiredTerm.incorrect',
		fields: [{ key: 'answer', labelKey: 'am.exercise.field.months', type: 'number' }],
		parameters: [
			{ name: 'principal', min: 5_000_000, max: 15_000_000, step: 1_000_000 },
			{ name: 'annualRate', min: 0.05, max: 0.10, step: 0.005 },
			{ name: 'payment', min: 120_000, max: 400_000, step: 10_000 },
		],
		tolerance: 1,
		toleranceType: 'absolute',
	},
	{
		slug: 'apr-with-fees',
		solverFunction: 'aprWithFees',
		difficulty: 'avance',
		promptKey: 'am.exercise.apr.prompt',
		correctKey: 'am.exercise.apr.correct',
		incorrectKey: 'am.exercise.apr.incorrect',
		fields: [{ key: 'answer', labelKey: 'am.exercise.field.apr', type: 'number' }],
		parameters: [
			{ name: 'principal', min: 5_000_000, max: 15_000_000, step: 1_000_000 },
			{ name: 'annualRate', min: 0.06, max: 0.12, step: 0.005 },
			{ name: 'months', min: 36, max: 84, step: 12 },
			{ name: 'originationFee', min: 50_000, max: 300_000, step: 25_000 },
		],
		tolerance: 0.002,
		toleranceType: 'absolute',
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

function gradeNumericAnswer(
	student: number,
	correct: number,
	tolerance: number,
	toleranceType: 'absolute' | 'relative',
): { isCorrect: boolean; score: number } {
	if (!Number.isFinite(student)) return { isCorrect: false, score: 0 };
	const diff = Math.abs(student - correct);
	const limit = toleranceType === 'absolute' ? tolerance : Math.abs(correct) * tolerance;
	const isCorrect = diff <= limit;
	if (isCorrect) return { isCorrect: true, score: 1 };
	const softLimit = limit * 3;
	if (diff <= softLimit) return { isCorrect: false, score: 0.5 };
	return { isCorrect: false, score: 0 };
}

export const exerciseTypes: ExerciseTypeDef[] = exerciseMeta.map((meta) => ({
	slug: meta.slug,
	titleKey: meta.promptKey,
	descKey: meta.promptKey,
	difficulty: meta.difficulty,
	inputSchema: { type: 'number', fields: meta.fields },
	solve: (params) => {
		const solver = exerciseSolvers[meta.solverFunction];
		return solver(params as Record<string, number>) as Record<string, number | string>;
	},
	feedback: (studentAnswer, correctAnswer): ExerciseFeedback => {
		const student = Number(studentAnswer.answer ?? NaN);
		const correct = Number(correctAnswer.answer ?? NaN);
		const { isCorrect, score } = gradeNumericAnswer(
			student,
			correct,
			meta.tolerance,
			meta.toleranceType,
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
): Record<string, number> | null {
	const meta = exerciseMeta.find((m) => m.slug === slug);
	if (!meta) return null;
	const solver = exerciseSolvers[meta.solverFunction];
	return solver(params);
}
