import type { JournalLine } from './types';
import type { Locale } from '$lib/i18n/types';
import { getAccount } from '$lib/shared/chart-of-accounts';
import type { AccountingFramework } from '$lib/shared/chart-of-accounts/types';

export interface LineFeedback {
	status: 'correct' | 'partial' | 'extra' | 'missing';
	studentLine: JournalLine | null;
	modelLine: JournalLine | null;
	explanation: string;
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
): GradeResult {
	const results: LineFeedback[] = [];
	const unmatchedStudent = [...studentLines];
	const unmatchedModel = [...modelLines];

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
				explanation: buildFeedback('correct', model, null, framework, locale),
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
				explanation: buildFeedback('partial', model, student, framework, locale),
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
			explanation: buildFeedback('missing', model, null, framework, locale),
		});
	}

	for (const student of unmatchedStudent) {
		results.push({
			status: 'extra',
			studentLine: student,
			modelLine: null,
			explanation: buildFeedback('extra', null, student, framework, locale),
		});
	}

	// Score: correct = full points, partial = half, extra/missing = 0
	const totalLines = modelLines.length;
	const correctCount = results.filter((r) => r.status === 'correct').length;
	const partialCount = results.filter((r) => r.status === 'partial').length;
	const score =
		totalLines > 0
			? Math.round(((correctCount + partialCount * 0.5) / totalLines) * 100)
			: 0;

	return {
		score,
		isCorrect: score === 100,
		lineResults: results,
	};
}

function buildFeedback(
	status: 'correct' | 'partial' | 'missing' | 'extra',
	modelLine: JournalLine | null,
	studentLine: JournalLine | null,
	framework: AccountingFramework,
	locale: Locale,
): string {
	const getAccountName = (key: string) => {
		const acc = getAccount(key, framework);
		if (!acc) return key;
		return locale === 'fr' ? acc.frameworkNameFr : acc.frameworkNameEn;
	};

	const getCode = (key: string) => {
		const acc = getAccount(key, framework);
		return acc?.frameworkCode ?? key;
	};

	switch (status) {
		case 'correct':
			return locale === 'fr'
				? `Correct — ${getCode(modelLine!.accountKey)} ${getAccountName(modelLine!.accountKey)}`
				: `Correct — ${getCode(modelLine!.accountKey)} ${getAccountName(modelLine!.accountKey)}`;
		case 'partial': {
			const modelSide =
				modelLine!.debit > 0
					? locale === 'fr'
						? 'débit'
						: 'debit'
					: locale === 'fr'
						? 'crédit'
						: 'credit';
			const modelAmt = modelLine!.debit > 0 ? modelLine!.debit : modelLine!.credit;
			return locale === 'fr'
				? `Compte correct (${getAccountName(modelLine!.accountKey)}), mais le montant ou le sens est incorrect. Attendu : ${modelSide} ${modelAmt.toLocaleString()}`
				: `Right account (${getAccountName(modelLine!.accountKey)}), but amount or side is wrong. Expected: ${modelSide} ${modelAmt.toLocaleString()}`;
		}
		case 'missing':
			return locale === 'fr'
				? `Ligne manquante : ${getCode(modelLine!.accountKey)} ${getAccountName(modelLine!.accountKey)} — ${modelLine!.debit > 0 ? 'débit' : 'crédit'} ${(modelLine!.debit || modelLine!.credit).toLocaleString()}`
				: `Missing line: ${getCode(modelLine!.accountKey)} ${getAccountName(modelLine!.accountKey)} — ${modelLine!.debit > 0 ? 'debit' : 'credit'} ${(modelLine!.debit || modelLine!.credit).toLocaleString()}`;
		case 'extra':
			return locale === 'fr'
				? `Ligne en trop : ${getCode(studentLine!.accountKey)} ${getAccountName(studentLine!.accountKey)} n'est pas attendu dans cette écriture`
				: `Extra line: ${getCode(studentLine!.accountKey)} ${getAccountName(studentLine!.accountKey)} is not expected in this entry`;
	}
}
