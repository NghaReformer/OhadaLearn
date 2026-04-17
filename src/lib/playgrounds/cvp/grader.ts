export interface NumericGradingResult {
	isCorrect: boolean;
	score: number;
	delta: number;
	deltaPct: number;
	studentValue: number;
	correctValue: number;
}

export function gradeNumeric(
	studentValue: number,
	correctValue: number,
	tolerance = 0.01,
	toleranceType: 'absolute' | 'relative' = 'relative',
): NumericGradingResult {
	if (!isFinite(studentValue)) {
		return {
			isCorrect: false,
			score: 0,
			delta: NaN,
			deltaPct: NaN,
			studentValue,
			correctValue,
		};
	}

	const delta = studentValue - correctValue;
	const absCorrect = Math.abs(correctValue);
	const deltaPct = absCorrect > 0 ? Math.abs(delta) / absCorrect : Math.abs(delta);

	const tolerated =
		toleranceType === 'absolute'
			? Math.abs(delta) <= tolerance
			: deltaPct <= tolerance;

	const score = tolerated ? 1 : Math.max(0, 1 - deltaPct);

	return {
		isCorrect: tolerated,
		score,
		delta,
		deltaPct,
		studentValue,
		correctValue,
	};
}
