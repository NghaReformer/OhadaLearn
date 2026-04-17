import type { Locale } from '$lib/i18n/types';

export interface NumericGradeResult {
	score: number; // 0 or 100 in the MVP — TVM exercises are single-answer
	isCorrect: boolean;
	relativeError: number;
	absoluteError: number;
}

/**
 * Grade a single numeric answer against the model value with a
 * relative tolerance (defaults to 0.5% — good enough for currency
 * amounts while catching rounding substitutions).
 */
export function gradeNumeric(
	studentValue: number,
	modelValue: number,
	tolerance = 0.005
): NumericGradeResult {
	if (!Number.isFinite(studentValue) || !Number.isFinite(modelValue)) {
		return { score: 0, isCorrect: false, relativeError: Infinity, absoluteError: Infinity };
	}
	const absoluteError = Math.abs(studentValue - modelValue);
	const denom = Math.max(Math.abs(modelValue), 1);
	const relativeError = absoluteError / denom;
	const isCorrect = relativeError < tolerance;
	return { score: isCorrect ? 100 : 0, isCorrect, relativeError, absoluteError };
}

export function renderFeedback(
	isCorrect: boolean,
	correctKey: string,
	incorrectKey: string,
	_locale: Locale
): string {
	// Grader returns the i18n key; the UI resolves it via $t. We preserve the
	// locale parameter for symmetry with the journal-entry grader so future
	// locale-sensitive prose can plug in without a signature change.
	return isCorrect ? correctKey : incorrectKey;
}
