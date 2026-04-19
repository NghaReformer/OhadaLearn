/**
 * Periodic payment calculation.
 * Returns the fixed payment per period that amortizes `principal`
 * over `periods` at `ratePerPeriod` using the standard annuity formula.
 *
 * PMT = P * r / (1 - (1 + r)^-n)
 *
 * When r == 0, the payment is simply principal / periods.
 */
export function pmt(principal: number, ratePerPeriod: number, periods: number): number {
	if (periods <= 0) return 0;
	if (Math.abs(ratePerPeriod) < 1e-12) return principal / periods;
	const factor = Math.pow(1 + ratePerPeriod, -periods);
	return (principal * ratePerPeriod) / (1 - factor);
}

/**
 * Computes the remaining balance after `k` periods have been paid
 * on an annuity loan. Useful for progressive/balloon truncation.
 */
export function remainingBalance(
	principal: number,
	ratePerPeriod: number,
	periods: number,
	k: number
): number {
	if (k <= 0) return principal;
	if (k >= periods) return 0;
	const payment = pmt(principal, ratePerPeriod, periods);
	if (Math.abs(ratePerPeriod) < 1e-12) return principal - payment * k;
	const growth = Math.pow(1 + ratePerPeriod, k);
	return principal * growth - payment * ((growth - 1) / ratePerPeriod);
}
