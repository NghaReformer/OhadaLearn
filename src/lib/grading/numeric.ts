export interface NumericGradingResult {
	isCorrect: boolean;
	score: number;
	delta: number;
	deltaPct: number;
	studentValue: number;
	correctValue: number;
}

export type ScoringStrategy = 'binary' | 'soft' | 'continuous';

export interface GradeNumericOptions {
	scoringStrategy?: ScoringStrategy;
	softMultiplier?: number;
	scoreScale?: 1 | 100;
}

export function gradeNumeric(
	studentValue: number,
	correctValue: number,
	tolerance: number = 0.01,
	toleranceType: 'absolute' | 'relative' = 'relative',
	options: GradeNumericOptions = {},
): NumericGradingResult {
	const strategy = options.scoringStrategy ?? 'continuous';
	const softMultiplier = options.softMultiplier ?? 3;
	const scale = options.scoreScale ?? 1;

	if (!Number.isFinite(studentValue)) {
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
	const denom = Math.max(Math.abs(correctValue), 1);
	const deltaPct = Math.abs(delta) / denom;

	const tolerated =
		toleranceType === 'absolute'
			? Math.abs(delta) <= tolerance
			: deltaPct <= tolerance;

	let fraction: number;
	if (tolerated) {
		fraction = 1;
	} else if (strategy === 'binary') {
		fraction = 0;
	} else if (strategy === 'soft') {
		const softLimit =
			toleranceType === 'absolute'
				? tolerance * softMultiplier
				: Math.abs(correctValue) * tolerance * softMultiplier;
		fraction = Math.abs(delta) <= softLimit ? 0.5 : 0;
	} else {
		fraction = Math.max(0, 1 - deltaPct);
	}

	return {
		isCorrect: tolerated,
		score: fraction * scale,
		delta,
		deltaPct,
		studentValue,
		correctValue,
	};
}
