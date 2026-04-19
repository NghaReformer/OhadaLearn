/**
 * Internal rate of return for a cash-flow series.
 *
 * Uses Newton-Raphson iteration with a bisection fallback when the
 * derivative is ill-conditioned or the iterate diverges. Returns NaN
 * if no root can be located in the plausible range [-0.99, 10].
 *
 * Cash flows are indexed by period; convention is
 *   flow[0] = initial disbursement (typically negative to the lender,
 *   positive here because we solve from the borrower's cost view),
 *   flow[k] = payment received in period k.
 */
export function irr(cashFlows: number[], guess = 0.05, maxIter = 80, tol = 1e-9): number {
	if (cashFlows.length < 2) return NaN;

	let rate = guess;
	for (let i = 0; i < maxIter; i++) {
		const { npv, dnpv } = npvAndDerivative(cashFlows, rate);
		if (!Number.isFinite(npv) || !Number.isFinite(dnpv)) break;
		if (Math.abs(npv) < tol) return rate;
		if (Math.abs(dnpv) < 1e-14) break;
		const next = rate - npv / dnpv;
		if (!Number.isFinite(next)) break;
		if (Math.abs(next - rate) < tol) return next;
		rate = next;
		if (rate <= -0.9999 || rate > 10) break;
	}

	return bisect(cashFlows, -0.9999, 10, tol, 200);
}

function npvAndDerivative(flows: number[], rate: number): { npv: number; dnpv: number } {
	let npv = 0;
	let dnpv = 0;
	for (let k = 0; k < flows.length; k++) {
		const denom = Math.pow(1 + rate, k);
		npv += flows[k] / denom;
		if (k > 0) dnpv += (-k * flows[k]) / Math.pow(1 + rate, k + 1);
	}
	return { npv, dnpv };
}

function npv(flows: number[], rate: number): number {
	let v = 0;
	for (let k = 0; k < flows.length; k++) v += flows[k] / Math.pow(1 + rate, k);
	return v;
}

function bisect(flows: number[], lo: number, hi: number, tol: number, maxIter: number): number {
	let fLo = npv(flows, lo);
	let fHi = npv(flows, hi);
	if (!Number.isFinite(fLo) || !Number.isFinite(fHi)) return NaN;
	if (fLo * fHi > 0) return NaN;

	for (let i = 0; i < maxIter; i++) {
		const mid = (lo + hi) / 2;
		const fMid = npv(flows, mid);
		if (!Number.isFinite(fMid)) return NaN;
		if (Math.abs(fMid) < tol || (hi - lo) / 2 < tol) return mid;
		if (fLo * fMid < 0) {
			hi = mid;
			fHi = fMid;
		} else {
			lo = mid;
			fLo = fMid;
		}
	}
	return (lo + hi) / 2;
}
