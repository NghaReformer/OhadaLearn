import type { JournalLine } from './types';
import type { Locale } from '$lib/i18n/types';
import { getAccount } from '$lib/shared/chart-of-accounts';
import type { AccountingFramework } from '$lib/shared/chart-of-accounts/types';
import { fmtCurrency } from '$lib/format';

export type FeedbackStatus = 'correct' | 'partial' | 'extra' | 'missing';

export interface FeedbackParts {
	key: string;
	params: Record<string, string>;
}

export interface LineFeedback {
	status: FeedbackStatus;
	studentLine: JournalLine | null;
	modelLine: JournalLine | null;
	explanation: string;
	feedback: FeedbackParts;
}

export interface GradeResult {
	score: number; // 0-100
	isCorrect: boolean;
	lineResults: LineFeedback[];
}

export function gradeJournalEntry(
	studentLines: JournalLine[],
	modelLines: JournalLine[],
	framework: AccountingFramework,
	locale: Locale,
	currencyCode: string = 'XOF',
): GradeResult {
	const results: LineFeedback[] = [];
	const unmatchedStudent = [...studentLines];
	const unmatchedModel = [...modelLines];

	const buildLineFeedback = (
		status: FeedbackStatus,
		modelLine: JournalLine | null,
		studentLine: JournalLine | null,
	): { explanation: string; feedback: FeedbackParts } => {
		const feedback = buildFeedback(status, modelLine, studentLine, framework, locale, currencyCode);
		return { feedback, explanation: renderFeedback(feedback, locale) };
	};

	// Pass 1: Exact matches (same account, same side, amount within 1%)
	for (let i = unmatchedModel.length - 1; i >= 0; i--) {
		const model = unmatchedModel[i];
		const studentIdx = unmatchedStudent.findIndex(
			(s) =>
				s.accountKey === model.accountKey &&
				((s.debit > 0 && model.debit > 0) || (s.credit > 0 && model.credit > 0)) &&
				Math.abs((s.debit || s.credit) - (model.debit || model.credit)) /
					Math.max(model.debit || model.credit, 1) <
					0.01,
		);

		if (studentIdx !== -1) {
			results.push({
				status: 'correct',
				studentLine: unmatchedStudent[studentIdx],
				modelLine: model,
				...buildLineFeedback('correct', model, null),
			});
			unmatchedStudent.splice(studentIdx, 1);
			unmatchedModel.splice(i, 1);
		}
	}

	// Pass 2: Partial matches (same account, wrong amount or wrong side)
	for (let i = unmatchedModel.length - 1; i >= 0; i--) {
		const model = unmatchedModel[i];
		const studentIdx = unmatchedStudent.findIndex((s) => s.accountKey === model.accountKey);

		if (studentIdx !== -1) {
			const student = unmatchedStudent[studentIdx];
			results.push({
				status: 'partial',
				studentLine: student,
				modelLine: model,
				...buildLineFeedback('partial', model, student),
			});
			unmatchedStudent.splice(studentIdx, 1);
			unmatchedModel.splice(i, 1);
		}
	}

	// Pass 3: Unmatched lines
	for (const model of unmatchedModel) {
		results.push({
			status: 'missing',
			studentLine: null,
			modelLine: model,
			...buildLineFeedback('missing', model, null),
		});
	}

	for (const student of unmatchedStudent) {
		results.push({
			status: 'extra',
			studentLine: student,
			modelLine: null,
			...buildLineFeedback('extra', null, student),
		});
	}

	// Score: correct = full points, partial = half, extra/missing = 0.
	// Extra lines expand the denominator so over-posting cannot still earn 100%.
	const totalLines = modelLines.length;
	const correctCount = results.filter((r) => r.status === 'correct').length;
	const partialCount = results.filter((r) => r.status === 'partial').length;
	const extraCount = results.filter((r) => r.status === 'extra').length;
	const scoreDenominator = totalLines + extraCount;
	const score =
		scoreDenominator > 0
			? Math.round(((correctCount + partialCount * 0.5) / scoreDenominator) * 100)
			: 0;

	return {
		score,
		isCorrect: score === 100,
		lineResults: results,
	};
}

const FEEDBACK_TEMPLATES: Record<Locale, Record<string, string>> = {
	en: {
		'je.feedback.correct': 'Correct — {code} {name}',
		'je.feedback.partial':
			'Right account ({name}), but the amount or side is wrong. Expected: {side} {amount}.',
		'je.feedback.missing': 'Missing line: {code} {name} — {side} {amount}.',
		'je.feedback.extra': 'Extra line: {code} {name} is not expected in this entry.',
	},
	fr: {
		'je.feedback.correct': 'Correct — {code} {name}',
		'je.feedback.partial':
			'Compte correct ({name}), mais le montant ou le sens est incorrect. Attendu : {side} {amount}.',
		'je.feedback.missing': 'Ligne manquante : {code} {name} — {side} {amount}.',
		'je.feedback.extra': 'Ligne en trop : {code} {name} n’est pas attendu dans cette écriture.',
	},
};

function renderFeedback(feedback: FeedbackParts, locale: Locale): string {
	const template = FEEDBACK_TEMPLATES[locale]?.[feedback.key] ?? feedback.key;
	return template.replace(/\{(\w+)\}/g, (_, name: string) => feedback.params[name] ?? `{${name}}`);
}

function buildFeedback(
	status: FeedbackStatus,
	modelLine: JournalLine | null,
	studentLine: JournalLine | null,
	framework: AccountingFramework,
	locale: Locale,
	currencyCode: string,
): FeedbackParts {
	const getAccountName = (key: string) => {
		const acc = getAccount(key, framework);
		if (!acc) return key;
		return locale === 'fr' ? acc.frameworkNameFr : acc.frameworkNameEn;
	};

	const getCode = (key: string) => {
		const acc = getAccount(key, framework);
		return acc?.frameworkCode ?? key;
	};

	const sideLabel = (line: JournalLine) =>
		line.debit > 0
			? locale === 'fr'
				? 'débit'
				: 'debit'
			: locale === 'fr'
				? 'crédit'
				: 'credit';

	switch (status) {
		case 'correct':
			return {
				key: 'je.feedback.correct',
				params: {
					code: getCode(modelLine!.accountKey),
					name: getAccountName(modelLine!.accountKey),
				},
			};
		case 'partial': {
			const amount = modelLine!.debit > 0 ? modelLine!.debit : modelLine!.credit;
			return {
				key: 'je.feedback.partial',
				params: {
					code: getCode(modelLine!.accountKey),
					name: getAccountName(modelLine!.accountKey),
					side: sideLabel(modelLine!),
					amount: fmtCurrency(amount, currencyCode),
				},
			};
		}
		case 'missing': {
			const amount = modelLine!.debit > 0 ? modelLine!.debit : modelLine!.credit;
			return {
				key: 'je.feedback.missing',
				params: {
					code: getCode(modelLine!.accountKey),
					name: getAccountName(modelLine!.accountKey),
					side: sideLabel(modelLine!),
					amount: fmtCurrency(amount, currencyCode),
				},
			};
		}
		case 'extra':
			return {
				key: 'je.feedback.extra',
				params: {
					code: getCode(studentLine!.accountKey),
					name: getAccountName(studentLine!.accountKey),
				},
			};
	}
}
