/**
 * Goal-seek solvers for the Interest playground.
 *
 * All rates are decimal (0.10 = 10%). The public wrappers (solveSimpleRate,
 * solveCompoundFv, etc.) convert to/from the public representation used by
 * the UI components.
 *
 * The engine reference implementations already exist in ./engine.ts. This
 * module wraps them with a generic bisection solver so the UI can invert
 * them ("what rate produces FV = X?"), without duplicating formula logic.
 */

import type { CompoundingFrequency } from '$lib/playgrounds/tvm/types';
import { InterestEngine } from './engine';
import type { BondInputs, InterestInputs } from './types';

const engine = new InterestEngine();

export interface SolveResult {
	success: boolean;
	value?: number;
	iterations?: number;
	approximate?: boolean;
	reason?: 'no-bracket' | 'invalid-input' | 'max-iter';
}

export interface BisectOptions {
	evaluate: (x: number) => number;
	target: number;
	lo: number;
	hi: number;
	tolerance?: number;
	maxIter?: number;
}

/**
 * Generic root-finding bisection. Caller provides a function `evaluate(x)`
 * that returns the quantity they want to match `target`. Returns the value
 * of x that minimises |evaluate(x) - target|.
 */
export function bisect(opts: BisectOptions): SolveResult {
	let { lo, hi } = opts;
	const { evaluate, target } = opts;
	const tolerance = opts.tolerance ?? 1e-6;
	const maxIter = opts.maxIter ?? 120;

	let fLo = evaluate(lo) - target;
	let fHi = evaluate(hi) - target;

	// Expand bracket up to 10 times if the initial bounds don't straddle the root.
	if (fLo * fHi > 0) {
		let attempts = 0;
		while (fLo * fHi > 0 && attempts < 10) {
			lo = lo - Math.abs(lo) * 0.5 - 0.01;
			hi = hi + Math.abs(hi) * 0.5 + 0.01;
			fLo = evaluate(lo) - target;
			fHi = evaluate(hi) - target;
			attempts++;
		}
		if (fLo * fHi > 0) return { success: false, reason: 'no-bracket' };
	}

	let mid = (lo + hi) / 2;
	for (let i = 0; i < maxIter; i++) {
		mid = (lo + hi) / 2;
		const fMid = evaluate(mid) - target;
		const scale = Math.max(Math.abs(target), 1);
		if (Math.abs(fMid) < tolerance * scale) {
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

// ── Simple-interest solvers ──────────────────────────────────────────────

/** Rate required to reach `totalTarget` given principal and term. */
export function solveSimpleRate(
	inputs: InterestInputs,
	totalTarget: number,
): SolveResult {
	return bisect({
		evaluate: (rate) => engine.simple({ ...inputs, nominalRate: rate }).total,
		target: totalTarget,
		lo: 0,
		hi: 1,
	});
}

/** Years required to reach `totalTarget`. */
export function solveSimpleYears(
	inputs: InterestInputs,
	totalTarget: number,
): SolveResult {
	// Vary endDate by scaling years offset from startDate.
	const startMs = new Date(inputs.startDate + 'T00:00:00Z').getTime();
	return bisect({
		evaluate: (years) => {
			if (years <= 0) return 0;
			const ms = startMs + years * 365.25 * 86400000;
			const endDate = new Date(ms).toISOString().slice(0, 10);
			return engine.simple({ ...inputs, endDate }).total;
		},
		target: totalTarget,
		lo: 0.01,
		hi: 100,
	});
}

/** Principal required to grow to `totalTarget`. */
export function solveSimplePrincipal(
	inputs: InterestInputs,
	totalTarget: number,
): SolveResult {
	return bisect({
		evaluate: (principal) => engine.simple({ ...inputs, principal }).total,
		target: totalTarget,
		lo: 0,
		hi: totalTarget * 2,
	});
}

// ── Compound-interest solvers ────────────────────────────────────────────

export function solveCompoundRate(
	inputs: InterestInputs,
	fvTarget: number,
): SolveResult {
	return bisect({
		evaluate: (rate) => engine.compound({ ...inputs, nominalRate: rate }).futureValue,
		target: fvTarget,
		lo: -0.5,
		hi: 2,
	});
}

export function solveCompoundYears(
	inputs: InterestInputs,
	fvTarget: number,
): SolveResult {
	const startMs = new Date(inputs.startDate + 'T00:00:00Z').getTime();
	return bisect({
		evaluate: (years) => {
			if (years <= 0) return inputs.principal;
			const ms = startMs + years * 365.25 * 86400000;
			const endDate = new Date(ms).toISOString().slice(0, 10);
			return engine.compound({ ...inputs, endDate }).futureValue;
		},
		target: fvTarget,
		lo: 0.01,
		hi: 100,
	});
}

export function solveCompoundPrincipal(
	inputs: InterestInputs,
	fvTarget: number,
): SolveResult {
	return bisect({
		evaluate: (principal) => engine.compound({ ...inputs, principal }).futureValue,
		target: fvTarget,
		lo: 0,
		hi: fvTarget * 2,
	});
}

/** Doubling time for a given rate and frequency. */
export function solveDoublingYears(
	principal: number,
	ratePct: number,
	frequency: CompoundingFrequency,
	dayCount: InterestInputs['dayCount'] = '30/360',
): SolveResult {
	const rate = ratePct / 100;
	const base: InterestInputs = {
		principal,
		nominalRate: rate,
		startDate: '2026-01-01',
		endDate: '2036-01-01',
		dayCount,
		frequency,
		continuous: false,
	};
	return solveCompoundYears(base, principal * 2);
}

// ── Bond / Effective solvers ─────────────────────────────────────────────

export function solveBondMarketRate(
	bond: BondInputs,
	issuePriceTarget: number,
): SolveResult {
	return bisect({
		evaluate: (marketRate) => engine.issuePrice({ ...bond, marketRate }),
		target: issuePriceTarget,
		lo: 0.001,
		hi: 1,
	});
}

export function solveBondCouponRate(
	bond: BondInputs,
	issuePriceTarget: number,
): SolveResult {
	return bisect({
		evaluate: (couponRate) => engine.issuePrice({ ...bond, couponRate }),
		target: issuePriceTarget,
		lo: 0,
		hi: 1,
	});
}

export function solveBondFaceValue(
	bond: BondInputs,
	issuePriceTarget: number,
): SolveResult {
	return bisect({
		evaluate: (faceValue) => engine.issuePrice({ ...bond, faceValue }),
		target: issuePriceTarget,
		lo: 0,
		hi: issuePriceTarget * 4,
	});
}
