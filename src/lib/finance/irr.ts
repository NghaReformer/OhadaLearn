/**
 * Internal rate of return for a cash-flow series.
 *
 * Uses Newton-Raphson iteration with a bisection fallback when the
 * derivative is ill-conditioned or the iterate diverges. Returns NaN
 * if no root can be located in the plausible periodic-rate range
 * [-0.5, 1.0].
 *
 * Bounds kept tight so that Math.pow(1 + rate, n) does not overflow
 * for very long schedules. At the old lower bound (-0.9999) with
 * n = 480, Math.pow(0.0001, 480) = 1e-1920 underflows to 0 and
 * payment / 0 = Infinity, which silently broke the bisection
 * endpoints. [-0.5, 1.0] is still far wider than any realistic loan
 * periodic rate (−50% to +100% per period would cover weekly to
 * quarterly schedules at any plausible APR).
 *
 * Newton-Raphson iterates are clamped back into the bracket when
 * they overshoot, so a bad guess no longer skips straight to the
 * bisection fallback with potentially infinite endpoints.
 *
 * Cash flows are indexed by period; convention is
 *   flow[0] = initial disbursement (typically negative to the lender,
 *   positive here because we solve from the borrower's cost view),
 *   flow[k] = payment received in period k.
 */
export function irr(cashFlows: number[], guess = 0.05, maxIter = 80, tol = 1e-9): number {
	if (cashFlows.length < 2) return NaN;

	const RATE_MIN = -0.5;
	const RATE_MAX = 1.0;

	let rate = guess;
	for (let i = 0; i < maxIter; i++) {
		const { npv, dnpv } = npvAndDerivative(cashFlows, rate);
		if (!Number.isFinite(npv) || !Number.isFinite(dnpv)) break;
		if (Math.abs(npv) < tol) return rate;
		if (Math.abs(dnpv) < 1e-14) break;
		let next = rate - npv / dnpv;
		if (!Number.isFinite(next)) break;
		// Clamp and damp — if Newton overshoots the bracket, pull halfway back
		// instead of bailing out.
		if (next <= RATE_MIN) next = (rate + RATE_MIN) / 2;
		else if (next >= RATE_MAX) next = (rate + RATE_MAX) / 2;
		// Only declare convergence when BOTH the step is tiny AND npv is small;
		// a tiny step against a still-large npv means we are pinned at a
		// clamped bound with no root in the bracket.
		if (Math.abs(next - rate) < tol && Math.abs(npv) < tol) return next;
		rate = next;
	}

	return bisect(cashFlows, RATE_MIN, RATE_MAX, tol, 200);
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
