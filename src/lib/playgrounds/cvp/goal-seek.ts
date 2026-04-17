import type { GoalSeekResult, GoalSeekVariable } from './types';

export const BOUNDS: Record<GoalSeekVariable, [number, number]> = {
	price: [0.01, 1e8],
	variableCost: [0, 1e8],
	fixedCosts: [0, 1e10],
	volume: [0, 1e8],
	targetProfit: [0, 1e10],
	taxRate: [0, 99.99],
};

export interface SolveOptions {
	evaluate: (x: number) => number;
	target: number;
	variable: GoalSeekVariable;
	lo?: number;
	hi?: number;
	tolerance?: number;
	maxIter?: number;
}

export function solve(opts: SolveOptions): GoalSeekResult {
	const { evaluate, target, variable } = opts;
	let lo = opts.lo ?? BOUNDS[variable]?.[0] ?? 0;
	let hi = opts.hi ?? BOUNDS[variable]?.[1] ?? 1e8;
	const tolerance = opts.tolerance ?? 1e-6;
	const maxIter = opts.maxIter ?? 100;

	let fLo = evaluate(lo) - target;
	let fHi = evaluate(hi) - target;

	if (fLo * fHi > 0) {
		for (let exp = 0; exp < 10; exp++) {
			lo = lo / 2;
			hi = hi * 2;
			fLo = evaluate(lo) - target;
			fHi = evaluate(hi) - target;
			if (fLo * fHi <= 0) break;
		}
		if (fLo * fHi > 0) return { success: false, reason: 'no-bracket' };
	}

	let mid = (lo + hi) / 2;
	let fMid = evaluate(mid) - target;

	for (let i = 0; i < maxIter; i++) {
		mid = (lo + hi) / 2;
		fMid = evaluate(mid) - target;

		if (Math.abs(fMid) < Math.max(tolerance * Math.abs(target), 0.01)) {
			return { success: true, value: mid, iterations: i + 1 };
		}

		if (fLo * fMid < 0) {
			hi = mid;
			fHi = fMid;
		} else {
			lo = mid;
			fLo = fMid;
		}
	}

	return { success: true, value: mid, iterations: maxIter, approximate: true };
}
