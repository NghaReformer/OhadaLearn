import type {
	ExerciseDifficulty,
	ExerciseField,
	ExerciseFeedback,
	ExerciseTypeDef,
} from '$lib/contracts/playground';
import { gradeNumeric } from '$lib/grading/numeric';
import { BankReconciliationEngine } from './engine';
import type { ReconciliationInputs } from './types';

const engine = new BankReconciliationEngine();

type ExerciseSolver = (params: Record<string, number>) => Record<string, number | string>;

function roundCurrency(value: number): number {
	return Math.round(value);
}

function solveSimpleRecon(p: Record<string, number>): Record<string, number> {
	const adjustedBank = p.statementBalance + p.depositInTransit - p.outstandingCheck;
	return { adjustedBank: roundCurrency(adjustedBank), adjustedBooks: roundCurrency(adjustedBank) };
}

function solveOutstandingTotal(p: Record<string, number>): Record<string, number> {
	const total = (p.check1 ?? 0) + (p.check2 ?? 0) + (p.check3 ?? 0);
	return { answer: roundCurrency(total) };
}

function buildClassifyScenario(seed: number): {
	inputs: ReconciliationInputs;
	expectedCategories: Record<string, string>;
} {
	const rng = mulberry32(Math.max(1, Math.round(seed)));
	const items: Array<{ id: string; description: string; amount: number; cat: string; side: 'bank' | 'books' }> = [
		{ id: 'a', description: 'Frais de tenue de compte', amount: -2500, cat: 'bank-charge', side: 'bank' },
		{ id: 'b', description: 'Interest credited', amount: 1500, cat: 'interest-earned', side: 'bank' },
		{ id: 'c', description: 'Customer deposit', amount: 50000, cat: 'deposit-in-transit', side: 'books' },
		{ id: 'd', description: 'Check #1042 to vendor', amount: -30000, cat: 'outstanding-check', side: 'books' },
		{ id: 'e', description: 'NSF customer check returned', amount: -45000, cat: 'nsf-check', side: 'bank' },
	];
	for (let i = items.length - 1; i > 0; i--) {
		const j = Math.floor(rng() * (i + 1));
		[items[i], items[j]] = [items[j], items[i]];
	}
	const expectedCategories: Record<string, string> = {};
	const bankTransactions = [];
	const ledgerEntries = [];
	for (const it of items) {
		expectedCategories[it.id] = it.cat;
		if (it.side === 'bank') {
			bankTransactions.push({ id: it.id, date: '2026-04-30', description: it.description, amount: it.amount, cleared: true });
		} else {
			ledgerEntries.push({ id: it.id, date: '2026-04-29', description: it.description, amount: it.amount, recorded: true });
		}
	}
	return {
		inputs: {
			periodEnd: '2026-04-30',
			openingBankBalance: 1_000_000,
			closingBankBalance: 1_000_000,
			openingBookBalance: 1_000_000,
			closingBookBalance: 1_000_000,
			bankTransactions,
			ledgerEntries,
			manualMatches: [],
			manualClassifications: {},
		},
		expectedCategories,
	};
}

function solveClassify(p: Record<string, number>): Record<string, string> {
	const seed = Math.max(1, Math.round(p.seed ?? 1));
	const { expectedCategories } = buildClassifyScenario(seed);
	return expectedCategories;
}

function solveAdjustedBalance(p: Record<string, number>): Record<string, number> {
	const adjusted =
		(p.statementBalance ?? 0) + (p.depositInTransit ?? 0) - (p.outstandingChecks ?? 0) + (p.bankError ?? 0);
	return { adjustedBank: roundCurrency(adjusted) };
}

function solveBuildAdjustments(p: Record<string, number>): Record<string, number | string> {
	return {
		bankChargeDR: 'bankServiceCharges',
		bankChargeCR: 'bank',
		bankChargeAmount: roundCurrency(p.bankCharge ?? 0),
		interestDR: 'bank',
		interestCR: 'interestIncome',
		interestAmount: roundCurrency(p.interest ?? 0),
		nsfDR: 'accountsReceivable',
		nsfCR: 'bank',
		nsfAmount: roundCurrency(p.nsfAmount ?? 0),
	};
}

function solveFindError(p: Record<string, number>): Record<string, string> {
	const seed = Math.max(1, Math.round(p.seed ?? 1));
	const errorAmount = roundCurrency(p.errorAmount ?? 5000);
	const inputs: ReconciliationInputs = {
		periodEnd: '2026-04-30',
		openingBankBalance: 1_000_000,
		closingBankBalance: 1_000_000,
		openingBookBalance: 1_000_000,
		closingBookBalance: 1_000_000,
		bankTransactions: [
			{ id: 'mystery', date: '2026-04-30', description: 'service charges', amount: -errorAmount, cleared: true },
			{ id: 'noise', date: '2026-04-15', description: `unrelated ${seed}`, amount: 0, cleared: true },
		],
		ledgerEntries: [],
		manualMatches: [],
		manualClassifications: {},
	};
	const result = engine.reconcile(inputs);
	const id = engine.detectErrorItem(result.items, result.statement.variance) ?? 'mystery';
	return { errorItemId: id };
}

function solveMissingBankBalance(p: Record<string, number>): Record<string, number> {
	const inputs: ReconciliationInputs = {
		periodEnd: '2026-04-30',
		openingBankBalance: 1_000_000,
		closingBankBalance: 0,
		openingBookBalance: p.bookBalance ?? 1_000_000,
		closingBookBalance: p.bookBalance ?? 1_000_000,
		bankTransactions: [
			{
				id: 'charge',
				date: '2026-04-30',
				description: 'service charges',
				amount: -(p.bankCharge ?? 0),
				cleared: true,
			},
		],
		ledgerEntries: [
			{ id: 'dit', date: '2026-04-29', description: 'Customer deposit', amount: p.depositInTransit ?? 0, recorded: true },
			{
				id: 'os',
				date: '2026-04-28',
				description: 'Check to vendor',
				amount: -(p.outstandingCheck ?? 0),
				recorded: true,
			},
		],
		manualMatches: [],
		manualClassifications: {},
	};
	return { closingBank: roundCurrency(engine.solveMissingBalance(inputs, 'books')) };
}

function solveMultiMonth(p: Record<string, number>): Record<string, number> {
	const priorOS = p.priorOutstandingCheck ?? 0;
	const priorDIT = p.priorDepositInTransit ?? 0;
	const currentCharge = p.currentBankCharge ?? 0;
	const month2Adjusted = priorDIT - priorOS - currentCharge;
	return { month2Adjusted: roundCurrency(month2Adjusted) };
}

const exerciseSolvers: Record<string, ExerciseSolver> = {
	simpleRecon: (p) => solveSimpleRecon(p),
	outstandingChecksTotal: (p) => solveOutstandingTotal(p),
	classifyItems: (p) => solveClassify(p),
	adjustedBankBalance: (p) => solveAdjustedBalance(p),
	buildAdjustments: (p) => solveBuildAdjustments(p),
	findErrorItem: (p) => solveFindError(p),
	missingBankBalance: (p) => solveMissingBankBalance(p),
	multiMonthAdjusted: (p) => solveMultiMonth(p),
};

interface ExerciseMeta {
	slug: string;
	solverFunction: keyof typeof exerciseSolvers;
	difficulty: ExerciseDifficulty;
	titleKey: string;
	promptKey: string;
	correctKey: string;
	incorrectKey: string;
	answerFields: ExerciseField[];
	parameters: Array<{ name: string; min: number; max: number; step: number }>;
	tolerance: number;
	toleranceType: 'absolute' | 'relative';
	feedbackMode: 'numeric-pair' | 'numeric-single' | 'category-set' | 'journal-entry-set' | 'id-match';
	answerKeys?: string[];
}

const exerciseMeta: ExerciseMeta[] = [
	{
		slug: 'simple-recon',
		solverFunction: 'simpleRecon',
		difficulty: 'fondamental',
		titleKey: 'br.exercise.simpleRecon.title',
		promptKey: 'br.exercise.simpleRecon.prompt',
		correctKey: 'br.exercise.simpleRecon.correct',
		incorrectKey: 'br.exercise.simpleRecon.incorrect',
		answerFields: [
			{ key: 'adjustedBank', labelKey: 'br.statement.adjustedBalance', type: 'number' },
			{ key: 'adjustedBooks', labelKey: 'br.statement.adjustedBalance', type: 'number' },
		],
		parameters: [
			{ name: 'statementBalance', min: 500_000, max: 5_000_000, step: 100_000 },
			{ name: 'depositInTransit', min: 20_000, max: 200_000, step: 10_000 },
			{ name: 'outstandingCheck', min: 10_000, max: 150_000, step: 5_000 },
		],
		tolerance: 0.005,
		toleranceType: 'relative',
		feedbackMode: 'numeric-pair',
		answerKeys: ['adjustedBank', 'adjustedBooks'],
	},
	{
		slug: 'outstanding-checks',
		solverFunction: 'outstandingChecksTotal',
		difficulty: 'fondamental',
		titleKey: 'br.exercise.outstandingChecks.title',
		promptKey: 'br.exercise.outstandingChecks.prompt',
		correctKey: 'br.exercise.outstandingChecks.correct',
		incorrectKey: 'br.exercise.outstandingChecks.incorrect',
		answerFields: [{ key: 'answer', labelKey: 'br.exercise.outstandingChecks.title', type: 'number' }],
		parameters: [
			{ name: 'check1', min: 10_000, max: 100_000, step: 2_500 },
			{ name: 'check2', min: 10_000, max: 100_000, step: 2_500 },
			{ name: 'check3', min: 10_000, max: 100_000, step: 2_500 },
		],
		tolerance: 1,
		toleranceType: 'absolute',
		feedbackMode: 'numeric-single',
	},
	{
		slug: 'classify-items',
		solverFunction: 'classifyItems',
		difficulty: 'intermediaire',
		titleKey: 'br.exercise.classify.title',
		promptKey: 'br.exercise.classify.prompt',
		correctKey: 'br.exercise.classify.correct',
		incorrectKey: 'br.exercise.classify.incorrect',
		answerFields: [{ key: 'answer', labelKey: 'br.classify.placeholder', type: 'text' }],
		parameters: [{ name: 'seed', min: 1, max: 100, step: 1 }],
		tolerance: 0,
		toleranceType: 'absolute',
		feedbackMode: 'category-set',
	},
	{
		slug: 'compute-adjusted-balance',
		solverFunction: 'adjustedBankBalance',
		difficulty: 'intermediaire',
		titleKey: 'br.exercise.adjustedBalance.title',
		promptKey: 'br.exercise.adjustedBalance.prompt',
		correctKey: 'br.exercise.adjustedBalance.correct',
		incorrectKey: 'br.exercise.adjustedBalance.incorrect',
		answerFields: [{ key: 'adjustedBank', labelKey: 'br.statement.adjustedBalance', type: 'number' }],
		parameters: [
			{ name: 'statementBalance', min: 1_000_000, max: 5_000_000, step: 100_000 },
			{ name: 'depositInTransit', min: 30_000, max: 250_000, step: 10_000 },
			{ name: 'outstandingChecks', min: 20_000, max: 200_000, step: 10_000 },
			{ name: 'bankError', min: 0, max: 50_000, step: 5_000 },
		],
		tolerance: 0.001,
		toleranceType: 'relative',
		feedbackMode: 'numeric-single',
		answerKeys: ['adjustedBank'],
	},
	{
		slug: 'generate-adjustments',
		solverFunction: 'buildAdjustments',
		difficulty: 'intermediaire',
		titleKey: 'br.exercise.adjustments.title',
		promptKey: 'br.exercise.adjustments.prompt',
		correctKey: 'br.exercise.adjustments.correct',
		incorrectKey: 'br.exercise.adjustments.incorrect',
		answerFields: [
			{ key: 'bankChargeDR', labelKey: 'br.adjustments.account', type: 'text' },
			{ key: 'bankChargeAmount', labelKey: 'br.adjustments.amount', type: 'number' },
		],
		parameters: [
			{ name: 'bankCharge', min: 1_000, max: 10_000, step: 500 },
			{ name: 'interest', min: 1_000, max: 15_000, step: 500 },
			{ name: 'nsfAmount', min: 20_000, max: 150_000, step: 5_000 },
		],
		tolerance: 1,
		toleranceType: 'absolute',
		feedbackMode: 'journal-entry-set',
	},
	{
		slug: 'find-error',
		solverFunction: 'findErrorItem',
		difficulty: 'avance',
		titleKey: 'br.exercise.findError.title',
		promptKey: 'br.exercise.findError.prompt',
		correctKey: 'br.exercise.findError.correct',
		incorrectKey: 'br.exercise.findError.incorrect',
		answerFields: [{ key: 'errorItemId', labelKey: 'br.exercise.findError.title', type: 'text' }],
		parameters: [
			{ name: 'seed', min: 1, max: 100, step: 1 },
			{ name: 'errorAmount', min: 5_000, max: 50_000, step: 1_000 },
		],
		tolerance: 0,
		toleranceType: 'absolute',
		feedbackMode: 'id-match',
	},
	{
		slug: 'missing-balance',
		solverFunction: 'missingBankBalance',
		difficulty: 'avance',
		titleKey: 'br.exercise.missingBalance.title',
		promptKey: 'br.exercise.missingBalance.prompt',
		correctKey: 'br.exercise.missingBalance.correct',
		incorrectKey: 'br.exercise.missingBalance.incorrect',
		answerFields: [{ key: 'closingBank', labelKey: 'br.inputs.closingBank', type: 'number' }],
		parameters: [
			{ name: 'bookBalance', min: 1_000_000, max: 5_000_000, step: 100_000 },
			{ name: 'bankCharge', min: 1_000, max: 10_000, step: 500 },
			{ name: 'depositInTransit', min: 30_000, max: 200_000, step: 10_000 },
			{ name: 'outstandingCheck', min: 20_000, max: 150_000, step: 10_000 },
		],
		tolerance: 0.001,
		toleranceType: 'relative',
		feedbackMode: 'numeric-single',
		answerKeys: ['closingBank'],
	},
	{
		slug: 'multi-month-roll',
		solverFunction: 'multiMonthAdjusted',
		difficulty: 'avance',
		titleKey: 'br.exercise.multiMonth.title',
		promptKey: 'br.exercise.multiMonth.prompt',
		correctKey: 'br.exercise.multiMonth.correct',
		incorrectKey: 'br.exercise.multiMonth.incorrect',
		answerFields: [{ key: 'month2Adjusted', labelKey: 'br.statement.adjustedBalance', type: 'number' }],
		parameters: [
			{ name: 'priorOutstandingCheck', min: 20_000, max: 150_000, step: 5_000 },
			{ name: 'priorDepositInTransit', min: 30_000, max: 200_000, step: 10_000 },
			{ name: 'currentBankCharge', min: 1_000, max: 10_000, step: 500 },
		],
		tolerance: 0.001,
		toleranceType: 'relative',
		feedbackMode: 'numeric-single',
		answerKeys: ['month2Adjusted'],
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

function gradeNumericPair(student: Record<string, number | string>, correct: Record<string, number | string>, keys: string[], tolerance: number, toleranceType: 'absolute' | 'relative'): { isCorrect: boolean; score: number } {
	let totalScore = 0;
	let allCorrect = true;
	for (const k of keys) {
		const s = Number(student[k] ?? NaN);
		const c = Number(correct[k] ?? NaN);
		const r = gradeNumeric(s, c, tolerance, toleranceType, { scoringStrategy: 'soft', softMultiplier: 3 });
		totalScore += r.score;
		if (!r.isCorrect) allCorrect = false;
	}
	return { isCorrect: allCorrect, score: totalScore / keys.length };
}

function gradeCategorySet(student: Record<string, number | string>, correct: Record<string, number | string>): { isCorrect: boolean; score: number } {
	const ids = Object.keys(correct);
	if (ids.length === 0) return { isCorrect: false, score: 0 };
	let matches = 0;
	for (const id of ids) {
		if (String(student[id] ?? '') === String(correct[id])) matches += 1;
	}
	return { isCorrect: matches === ids.length, score: matches / ids.length };
}

function gradeJournalEntrySet(
	student: Record<string, number | string>,
	correct: Record<string, number | string>,
	tolerance: number,
): { isCorrect: boolean; score: number } {
	const checks: Array<{ keyAccount: string; keyAmount: string }> = [
		{ keyAccount: 'bankChargeDR', keyAmount: 'bankChargeAmount' },
		{ keyAccount: 'interestDR', keyAmount: 'interestAmount' },
		{ keyAccount: 'nsfDR', keyAmount: 'nsfAmount' },
	];
	let total = 0;
	let allCorrect = true;
	for (const c of checks) {
		const accOk = String(student[c.keyAccount] ?? '') === String(correct[c.keyAccount] ?? '');
		const amtOk = Math.abs(Number(student[c.keyAmount] ?? 0) - Number(correct[c.keyAmount] ?? 0)) <= tolerance;
		const hit = accOk && amtOk ? 1 : accOk || amtOk ? 0.5 : 0;
		total += hit;
		if (hit < 1) allCorrect = false;
	}
	return { isCorrect: allCorrect, score: total / checks.length };
}

function gradeIdMatch(student: Record<string, number | string>, correct: Record<string, number | string>, key: string): { isCorrect: boolean; score: number } {
	const ok = String(student[key] ?? '') === String(correct[key] ?? '');
	return { isCorrect: ok, score: ok ? 1 : 0 };
}

export const exerciseTypes: ExerciseTypeDef[] = exerciseMeta.map((meta) => ({
	slug: meta.slug,
	titleKey: meta.titleKey,
	descKey: meta.promptKey,
	difficulty: meta.difficulty,
	inputSchema: { type: meta.feedbackMode === 'category-set' ? 'multiple-choice' : meta.feedbackMode === 'journal-entry-set' ? 'journal-entry' : 'number', fields: meta.answerFields },
	solve: (params) => exerciseSolvers[meta.solverFunction](params as Record<string, number>),
	feedback: (studentAnswer, correctAnswer): ExerciseFeedback => {
		let result: { isCorrect: boolean; score: number };
		switch (meta.feedbackMode) {
			case 'numeric-pair':
				result = gradeNumericPair(studentAnswer, correctAnswer, meta.answerKeys ?? [], meta.tolerance, meta.toleranceType);
				break;
			case 'numeric-single': {
				const key = meta.answerKeys?.[0] ?? 'answer';
				const student = Number(studentAnswer[key] ?? NaN);
				const correct = Number(correctAnswer[key] ?? NaN);
				const r = gradeNumeric(student, correct, meta.tolerance, meta.toleranceType, { scoringStrategy: 'soft', softMultiplier: 3 });
				result = { isCorrect: r.isCorrect, score: r.score };
				break;
			}
			case 'category-set':
				result = gradeCategorySet(studentAnswer, correctAnswer);
				break;
			case 'journal-entry-set':
				result = gradeJournalEntrySet(studentAnswer, correctAnswer, meta.tolerance);
				break;
			case 'id-match':
				result = gradeIdMatch(studentAnswer, correctAnswer, 'errorItemId');
				break;
		}
		return {
			isCorrect: result.isCorrect,
			score: result.score,
			messageKey: result.isCorrect ? meta.correctKey : meta.incorrectKey,
		};
	},
	randomize: () => randomizeForMeta(meta) as Record<string, number | string>,
}));

export function solveExerciseBySlug(
	slug: string,
	params: Record<string, number>,
): Record<string, number | string> | null {
	const meta = exerciseMeta.find((m) => m.slug === slug);
	if (!meta) return null;
	return exerciseSolvers[meta.solverFunction](params);
}

function mulberry32(seed: number) {
	let a = seed >>> 0;
	return function () {
		a = (a + 0x6d2b79f5) >>> 0;
		let t = a;
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}
