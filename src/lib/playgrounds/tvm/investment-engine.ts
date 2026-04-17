/**
 * Investment-appraisal engine: NPV, IRR, MIRR, Payback, Discounted Payback, PI.
 *
 * Cash-flow convention follows corporate-finance standard: negative amount =
 * outflow (investment), positive = inflow (return). Flows are indexed by
 * period number (period 0 is "today"). Rates are entered as percentages.
 *
 * MIRR uses two explicit rates — finance rate for discounting outflows back
 * to t=0 and reinvest rate for compounding inflows to t=N — which is the
 * whole pedagogical point of MIRR vs IRR. The legacy playground conflated
 * these; this engine keeps them distinct.
 */

import type {
	CashFlow,
	InvestmentMetrics,
	InvestmentSolveInput,
	ValidationError,
	ValidationResult
} from './types';

const EPS = 1e-9;

function sortByPeriod(flows: CashFlow[]): CashFlow[] {
	return [...flows].sort((a, b) => a.period - b.period);
}

export function calcNPV(flows: CashFlow[], ratePct: number): number {
	const r = ratePct / 100;
	let npv = 0;
	for (const f of flows) {
		npv += f.amount / Math.pow(1 + r, f.period);
	}
	return npv;
}

export function calcIRR(flows: CashFlow[]): number | null {
	// Require at least one sign change so IRR is meaningful.
	const sorted = sortByPeriod(flows);
	if (sorted.length < 2) return null;
	let positive = false;
	let negative = false;
	for (const f of sorted) {
		if (f.amount > 0) positive = true;
		if (f.amount < 0) negative = true;
	}
	if (!positive || !negative) return null;

	// Newton-Raphson on NPV(r) = 0, derivative dNPV/dr = -sum(t · CF / (1+r)^(t+1))
	let r = 0.1;
	for (let i = 0; i < 100; i++) {
		let f = 0;
		let fp = 0;
		for (const cf of sorted) {
			const disc = Math.pow(1 + r, cf.period);
			f += cf.amount / disc;
			if (cf.period > 0) fp -= (cf.period * cf.amount) / (disc * (1 + r));
		}
		if (!isFinite(f) || !isFinite(fp) || Math.abs(fp) < 1e-30) break;
		const next = r - f / fp;
		if (!isFinite(next)) break;
		if (Math.abs(next - r) < 1e-10) return next * 100;
		r = next;
	}

	// Fallback: bisection on a wide range.
	const probe = (rate: number) => {
		let total = 0;
		for (const cf of sorted) total += cf.amount / Math.pow(1 + rate, cf.period);
		return total;
	};
	const candidates = [-0.99, -0.9, -0.5, -0.1, 0, 0.01, 0.05, 0.1, 0.2, 0.5, 1.0, 2.0, 5.0];
	let lo: number | null = null;
	let hi: number | null = null;
	let fLo = 0;
	for (let i = 0; i < candidates.length; i++) {
		const a = candidates[i];
		const fa = probe(a);
		if (!isFinite(fa)) continue;
		for (let j = i + 1; j < candidates.length; j++) {
			const b = candidates[j];
			const fb = probe(b);
			if (!isFinite(fb)) continue;
			if (fa * fb < 0) {
				lo = a;
				hi = b;
				fLo = fa;
				break;
			}
		}
		if (lo !== null) break;
	}
	if (lo === null || hi === null) return null;
	let bLo = lo;
	let bHi = hi;
	let bFLo = fLo;

	for (let i = 0; i < 200; i++) {
		const mid = (bLo + bHi) / 2;
		if (bHi - bLo < 1e-12) return mid * 100;
		const fm = probe(mid);
		if (Math.abs(fm) < 1e-10) return mid * 100;
		if (bFLo * fm < 0) {
			bHi = mid;
		} else {
			bLo = mid;
			bFLo = fm;
		}
	}
	return ((bLo + bHi) / 2) * 100;
}

/**
 * Modified IRR with explicit finance and reinvest rates.
 * MIRR = (FV_positives / −PV_negatives)^(1/N) − 1
 */
export function calcMIRR(
	flows: CashFlow[],
	financePct: number,
	reinvestPct: number
): number | null {
	if (flows.length < 2) return null;
	const financeRate = financePct / 100;
	const reinvestRate = reinvestPct / 100;
	const sorted = sortByPeriod(flows);
	const N = sorted[sorted.length - 1].period - sorted[0].period;
	if (N <= 0) return null;

	// PV of negative flows at finance rate, discounted to period 0
	let pvNeg = 0;
	let fvPos = 0;
	for (const cf of sorted) {
		if (cf.amount < 0) {
			pvNeg += cf.amount / Math.pow(1 + financeRate, cf.period);
		} else if (cf.amount > 0) {
			fvPos += cf.amount * Math.pow(1 + reinvestRate, N - cf.period);
		}
	}
	if (pvNeg >= 0 || fvPos <= 0) return null;

	const ratio = fvPos / -pvNeg;
	if (ratio <= 0) return null;
	return (Math.pow(ratio, 1 / N) - 1) * 100;
}

function crossZero(cumulatives: number[]): number | null {
	// Returns fractional period at which cumulative first becomes ≥ 0.
	// cumulatives[i] corresponds to the cumulative through period flows[i].period.
	// We do linear interpolation between the last negative and first non-negative.
	for (let i = 0; i < cumulatives.length; i++) {
		if (cumulatives[i] >= -EPS) {
			if (i === 0) return 0;
			const prev = cumulatives[i - 1];
			if (prev >= -EPS) return i - 1; // already crossed
			const delta = cumulatives[i] - prev;
			if (delta === 0) return i;
			return i - 1 + -prev / delta;
		}
	}
	return null;
}

export function calcPayback(flows: CashFlow[]): number | null {
	const sorted = sortByPeriod(flows);
	if (sorted.length === 0) return null;
	let cum = 0;
	const cums: number[] = [];
	for (const cf of sorted) {
		cum += cf.amount;
		cums.push(cum);
	}
	return crossZero(cums);
}

export function calcDiscountedPayback(flows: CashFlow[], ratePct: number): number | null {
	const r = ratePct / 100;
	const sorted = sortByPeriod(flows);
	if (sorted.length === 0) return null;
	let cum = 0;
	const cums: number[] = [];
	for (const cf of sorted) {
		cum += cf.amount / Math.pow(1 + r, cf.period);
		cums.push(cum);
	}
	return crossZero(cums);
}

export function calcProfitabilityIndex(flows: CashFlow[], ratePct: number): number | null {
	const r = ratePct / 100;
	let pvInflows = 0;
	let initialOutflow = 0;
	for (const cf of flows) {
		if (cf.period === 0 && cf.amount < 0) {
			initialOutflow += -cf.amount;
		} else if (cf.amount > 0) {
			pvInflows += cf.amount / Math.pow(1 + r, cf.period);
		} else if (cf.amount < 0 && cf.period > 0) {
			// Later outflows: treat as reducing PV of inflows via standard signed NPV
			pvInflows += cf.amount / Math.pow(1 + r, cf.period);
		}
	}
	if (initialOutflow === 0) return null;
	return pvInflows / initialOutflow;
}

export class InvestmentEngine {
	validate(input: InvestmentSolveInput): ValidationResult {
		const errors: ValidationError[] = [];
		const warnings: ValidationError[] = [];

		if (input.flows.length < 2) {
			errors.push({ key: 'tvm.inv.validation.minFlows' });
		}
		if (
			typeof input.discountRate !== 'number' ||
			!isFinite(input.discountRate) ||
			input.discountRate <= -100
		) {
			errors.push({ key: 'tvm.validation.rateTooNegative' });
		}

		// Warn if all-positive or all-negative (no IRR)
		const hasPos = input.flows.some((f) => f.amount > 0);
		const hasNeg = input.flows.some((f) => f.amount < 0);
		if (!hasPos || !hasNeg) {
			warnings.push({ key: 'tvm.inv.validation.noSignChange' });
		}

		return { valid: errors.length === 0, errors, warnings };
	}

	metrics(input: InvestmentSolveInput): InvestmentMetrics {
		const totalInflow = input.flows.reduce((s, f) => s + (f.amount > 0 ? f.amount : 0), 0);
		const totalOutflow = input.flows.reduce((s, f) => s + (f.amount < 0 ? -f.amount : 0), 0);
		return {
			npv: calcNPV(input.flows, input.discountRate),
			irr: calcIRR(input.flows),
			mirr: calcMIRR(input.flows, input.financeRate, input.reinvestRate),
			payback: calcPayback(input.flows),
			discountedPayback: calcDiscountedPayback(input.flows, input.discountRate),
			profitabilityIndex: calcProfitabilityIndex(input.flows, input.discountRate),
			totalInflow,
			totalOutflow
		};
	}
}
