import type {
	AmortizationInputs,
	AmortizationResult,
	AmortizationScheduleRow,
	AmortizationKpis,
	LifecycleJournalEntries,
	Frequency,
} from './types';
import type { AccountingFramework } from '$lib/shared/chart-of-accounts/types';
import { pmt } from '$lib/finance/pmt';
import { irr } from '$lib/finance/irr';
import { yearFraction } from '$lib/finance/dayCount';
import { buildLifecycleEntries } from './journal-entries';

const EPSILON = 0.005;

export class AmortizationEngine {
	computeSchedule(input: AmortizationInputs): AmortizationResult {
		switch (input.method) {
			case 'annuity':
				return this.computeAnnuity(input);
			case 'linear':
				return this.computeLinear(input);
			case 'bullet':
				return this.computeBullet(input);
			case 'progressive':
				return this.computeProgressive(input);
			case 'balloon':
				return this.computeBalloon(input);
		}
	}

	computeKpis(result: AmortizationResult, input: AmortizationInputs): AmortizationKpis {
		const firstRow = result.rows[0];
		const balloonRow = result.rows.find((r) => r.flags.includes('balloon'));
		const apr = this.computeApr(input, result);
		const pPerYear = periodsPerYear(input.frequency, input.customPeriodsPerYear);
		const effectiveAnnualRate = Math.pow(1 + input.nominalRate / pPerYear, pPerYear) - 1;
		const ratio = result.totals.principal > 0 ? result.totals.interest / result.totals.principal : 0;
		return {
			firstPayment: firstRow ? firstRow.totalPayment : 0,
			totalInterest: result.totals.interest,
			totalInsurance: result.totals.insurance,
			totalPaid: result.totals.paid,
			apr,
			effectiveAnnualRate,
			interestToPrincipalRatio: ratio,
			balloonAmount: balloonRow ? balloonRow.closingBalance + balloonRow.principal : null,
			requestedTerm: input.termPeriods,
			actualTerm: result.rows.length,
		};
	}

	computeApr(input: AmortizationInputs, result: AmortizationResult): number {
		const cashFlows: number[] = [input.principal - input.fees.origination];
		for (const row of result.rows) {
			cashFlows.push(-(row.totalPayment));
		}
		const periodicRate = irr(cashFlows);
		if (!Number.isFinite(periodicRate)) return NaN;
		const pPerYear = periodsPerYear(input.frequency, input.customPeriodsPerYear);
		return Math.pow(1 + periodicRate, pPerYear) - 1;
	}

	buildJournalEntries(
		input: AmortizationInputs,
		result: AmortizationResult,
		framework: AccountingFramework,
	): LifecycleJournalEntries {
		return buildLifecycleEntries(input, result, framework);
	}

	// ─── Method implementations ─────────────────────────────────────────

	private computeAnnuity(input: AmortizationInputs): AmortizationResult {
		return this.computeVariableAnnuity(input, 'annuity');
	}

	private computeProgressive(input: AmortizationInputs): AmortizationResult {
		const rows: AmortizationScheduleRow[] = [];
		const { principal, termPeriods, nominalRate, progressiveStep } = input;
		const pPerYear = periodsPerYear(input.frequency, input.customPeriodsPerYear);
		const r = nominalRate / pPerYear;
		const g = progressiveStep;
		let balance = principal;
		const dates = buildPaymentDates(input);

		// First payment for progressive annuity: PMT1 = P * (r-g) / (1 - ((1+g)/(1+r))^n)
		let pmt1: number;
		if (Math.abs(r - g) < 1e-10 || g >= r) {
			pmt1 = pmt(principal, r, termPeriods);
		} else {
			const ratio = (1 + g) / (1 + r);
			pmt1 = (principal * (r - g)) / (1 - Math.pow(ratio, termPeriods));
		}

		const graceRows = this.applyGrace(input, balance, dates);
		balance = graceRows.balance;
		rows.push(...graceRows.rows);

		const startPeriod = input.grace.periods + 1;
		const remainingPeriods = termPeriods - input.grace.periods;
		let currentPmt = pmt1;

		for (let i = 0; i < remainingPeriods; i++) {
			const period = startPeriod + i;
			const rateForPeriod = periodRateFor(period, input, dates);
			const interest = balance * rateForPeriod;
			let principalPortion = currentPmt - interest;
			if (principalPortion < 0) principalPortion = 0;
			const row = this.buildRow({
				period,
				date: dates[period - 1] ?? '',
				openingBalance: balance,
				ratePerPeriod: rateForPeriod,
				scheduledPayment: currentPmt,
				interest,
				principal: principalPortion,
				insurance: this.insuranceFor(period, input, balance),
				input,
			});
			this.applyExtrasAndClose(row, input, { isLastScheduled: i === remainingPeriods - 1 });
			rows.push(row);
			balance = row.closingBalance;
			currentPmt = currentPmt * (1 + g);
			if (balance <= EPSILON) {
				row.flags.push('final');
				break;
			}
		}

		return this.finalize(rows, input);
	}

	private computeLinear(input: AmortizationInputs): AmortizationResult {
		const rows: AmortizationScheduleRow[] = [];
		const pPerYear = periodsPerYear(input.frequency, input.customPeriodsPerYear);
		const r = input.nominalRate / pPerYear;
		let balance = input.principal;
		const dates = buildPaymentDates(input);

		const graceResult = this.applyGrace(input, balance, dates);
		balance = graceResult.balance;
		rows.push(...graceResult.rows);

		const remainingPeriods = input.termPeriods - input.grace.periods;
		const principalPerPeriod = balance / remainingPeriods;
		const startPeriod = input.grace.periods + 1;

		for (let i = 0; i < remainingPeriods; i++) {
			const period = startPeriod + i;
			const rateForPeriod = periodRateFor(period, input, dates);
			const interest = balance * rateForPeriod;
			const row = this.buildRow({
				period,
				date: dates[period - 1] ?? '',
				openingBalance: balance,
				ratePerPeriod: rateForPeriod,
				scheduledPayment: interest + principalPerPeriod,
				interest,
				principal: principalPerPeriod,
				insurance: this.insuranceFor(period, input, balance),
				input,
			});
			this.applyExtrasAndClose(row, input, { isLastScheduled: i === remainingPeriods - 1 });
			rows.push(row);
			balance = row.closingBalance;
			if (balance <= EPSILON) {
				row.flags.push('final');
				break;
			}
		}

		return this.finalize(rows, input);
	}

	private computeBullet(input: AmortizationInputs): AmortizationResult {
		const rows: AmortizationScheduleRow[] = [];
		const pPerYear = periodsPerYear(input.frequency, input.customPeriodsPerYear);
		const r = input.nominalRate / pPerYear;
		let balance = input.principal;
		const dates = buildPaymentDates(input);

		for (let period = 1; period <= input.termPeriods; period++) {
			const rateForPeriod = periodRateFor(period, input, dates);
			const interest = balance * rateForPeriod;
			const isFinal = period === input.termPeriods;
			const principalPortion = isFinal ? balance : 0;
			const row = this.buildRow({
				period,
				date: dates[period - 1] ?? '',
				openingBalance: balance,
				ratePerPeriod: rateForPeriod,
				scheduledPayment: interest + principalPortion,
				interest,
				principal: principalPortion,
				insurance: this.insuranceFor(period, input, balance),
				input,
			});
			this.applyExtrasAndClose(row, input, { isLastScheduled: isFinal });
			if (isFinal) row.flags.push('final', 'balloon');
			rows.push(row);
			balance = row.closingBalance;
			if (balance <= EPSILON) break;
		}

		return this.finalize(rows, input);
	}

	private computeBalloon(input: AmortizationInputs): AmortizationResult {
		const annuityResult = this.computeAnnuity({ ...input, method: 'annuity' });
		const cutoff = Math.min(input.balloonDueAt, annuityResult.rows.length);
		const rows = annuityResult.rows.slice(0, cutoff);
		if (rows.length > 0) {
			const last = rows[rows.length - 1];
			const remainingBalance = last.closingBalance;
			last.principal += remainingBalance;
			last.totalPayment += remainingBalance;
			last.closingBalance = 0;
			last.flags.push('balloon', 'final');
		}
		return this.finalize(rows, input);
	}

	// ─── Core variable-rate annuity driver ──────────────────────────────

	private computeVariableAnnuity(input: AmortizationInputs, _tag: 'annuity'): AmortizationResult {
		const rows: AmortizationScheduleRow[] = [];
		const pPerYear = periodsPerYear(input.frequency, input.customPeriodsPerYear);
		const baseRate = input.nominalRate / pPerYear;
		let balance = input.principal;
		const dates = buildPaymentDates(input);

		const graceResult = this.applyGrace(input, balance, dates);
		balance = graceResult.balance;
		rows.push(...graceResult.rows);

		let remainingPeriods = input.termPeriods - input.grace.periods;
		const startPeriod = input.grace.periods + 1;
		let currentPmt = pmt(balance, baseRate, remainingPeriods);
		let lastRate = baseRate;

		for (let i = 0; i < remainingPeriods && balance > EPSILON; i++) {
			const period = startPeriod + i;
			const rateForPeriod = periodRateFor(period, input, dates);
			const rateChanged = rateForPeriod !== lastRate && i > 0;
			if (rateChanged) {
				currentPmt = pmt(balance, rateForPeriod, remainingPeriods - i);
			}
			lastRate = rateForPeriod;
			const interest = balance * rateForPeriod;
			let principalPortion = currentPmt - interest;
			if (principalPortion < 0) principalPortion = 0;
			if (principalPortion > balance) principalPortion = balance;

			const row = this.buildRow({
				period,
				date: dates[period - 1] ?? '',
				openingBalance: balance,
				ratePerPeriod: rateForPeriod,
				scheduledPayment: currentPmt,
				interest,
				principal: principalPortion,
				insurance: this.insuranceFor(period, input, balance),
				input,
			});
			if (rateChanged) row.flags.push('rate-change');
			this.applyExtrasAndClose(row, input, { isLastScheduled: i === remainingPeriods - 1 });
			rows.push(row);
			balance = row.closingBalance;
			if (balance <= EPSILON) {
				row.flags.push('final');
				break;
			}
		}

		return this.finalize(rows, input);
	}

	// ─── Grace period ───────────────────────────────────────────────────

	private applyGrace(
		input: AmortizationInputs,
		startingBalance: number,
		dates: string[],
	): { rows: AmortizationScheduleRow[]; balance: number } {
		const rows: AmortizationScheduleRow[] = [];
		if (input.grace.type === 'none' || input.grace.periods <= 0) {
			return { rows, balance: startingBalance };
		}
		const pPerYear = periodsPerYear(input.frequency, input.customPeriodsPerYear);
		const baseRate = input.nominalRate / pPerYear;
		let balance = startingBalance;

		for (let period = 1; period <= input.grace.periods; period++) {
			const rateForPeriod = periodRateFor(period, input, dates);
			const interest = balance * rateForPeriod;
			const insurance = this.insuranceFor(period, input, balance);
			const row: AmortizationScheduleRow = {
				period,
				date: dates[period - 1] ?? '',
				ratePerPeriod: rateForPeriod,
				openingBalance: balance,
				scheduledPayment: input.grace.type === 'partial' ? interest : 0,
				interest,
				principal: 0,
				insurance,
				extra: 0,
				totalPayment:
					input.grace.type === 'partial' ? interest + insurance : insurance,
				closingBalance:
					input.grace.type === 'partial' ? balance : balance + interest,
				flags: [input.grace.type === 'partial' ? 'grace-partial' : 'grace-total'],
			};
			rows.push(row);
			balance = row.closingBalance;
		}
		return { rows, balance };
	}

	// ─── Row helpers ────────────────────────────────────────────────────

	private buildRow(args: {
		period: number;
		date: string;
		openingBalance: number;
		ratePerPeriod: number;
		scheduledPayment: number;
		interest: number;
		principal: number;
		insurance: number;
		input: AmortizationInputs;
	}): AmortizationScheduleRow {
		const { period, date, openingBalance, ratePerPeriod, scheduledPayment, interest } = args;
		let { principal } = args;
		const { insurance } = args;
		if (principal > openingBalance) principal = openingBalance;
		const closingBalance = openingBalance - principal;
		return {
			period,
			date,
			ratePerPeriod,
			openingBalance,
			scheduledPayment,
			interest,
			principal,
			insurance,
			extra: 0,
			totalPayment: interest + principal + insurance,
			closingBalance,
			flags: [],
		};
	}

	private applyExtrasAndClose(
		row: AmortizationScheduleRow,
		input: AmortizationInputs,
		_ctx: { isLastScheduled: boolean },
	): void {
		const { extras } = input;
		let extra = 0;
		if (extras.perPeriod > 0 && row.period > input.grace.periods) {
			extra += extras.perPeriod;
		}
		if (extras.lumpSum > 0 && row.period === extras.lumpPeriod) {
			extra += extras.lumpSum;
		}
		if (extra > 0) {
			const extraApplied = Math.min(extra, row.closingBalance);
			row.extra = extraApplied;
			row.principal += extraApplied;
			row.totalPayment += extraApplied;
			row.closingBalance -= extraApplied;
			row.flags.push('extra');
			if (extras.lumpSum > 0 && row.period === extras.lumpPeriod) row.flags.push('lump');
		}
		if (row.closingBalance < EPSILON) row.closingBalance = 0;
	}

	private insuranceFor(period: number, input: AmortizationInputs, openingBalance: number): number {
		if (input.insurance.rate <= 0) return 0;
		const pPerYear = periodsPerYear(input.frequency, input.customPeriodsPerYear);
		const perPeriodRate = input.insurance.rate / pPerYear;
		const basis = input.insurance.basis === 'initial' ? input.principal : openingBalance;
		return basis * perPeriodRate;
	}

	private finalize(rows: AmortizationScheduleRow[], input: AmortizationInputs): AmortizationResult {
		const totals: AmortizationTotalsAccumulator = {
			principal: 0,
			interest: 0,
			insurance: 0,
			paid: 0,
		};
		for (const row of rows) {
			totals.principal += row.principal;
			totals.interest += row.interest;
			totals.insurance += row.insurance;
			totals.paid += row.totalPayment;
		}
		const lastPeriod = rows.length > 0 ? rows[rows.length - 1].period : 0;
		return {
			rows,
			totals: {
				principal: totals.principal,
				interest: totals.interest,
				insurance: totals.insurance,
				paid: totals.paid,
				fees: input.fees.origination,
			},
			lastPeriod,
		};
	}
}

type AmortizationTotalsAccumulator = {
	principal: number;
	interest: number;
	insurance: number;
	paid: number;
};

// ─── Pure helpers exported for testing ──────────────────────────────────

export function periodsPerYear(frequency: Frequency, customPeriodsPerYear = 12): number {
	switch (frequency) {
		case 'monthly':
			return 12;
		case 'quarterly':
			return 4;
		case 'semiannual':
			return 2;
		case 'annual':
			return 1;
		case 'custom':
			return customPeriodsPerYear > 0 ? customPeriodsPerYear : 12;
	}
}

export function rateAtPeriod(
	period: number,
	input: AmortizationInputs,
	baseRate: number,
): number {
	if (!input.variableRates || input.variableRates.length === 0) return baseRate;
	let rate = baseRate;
	const pPerYear = periodsPerYear(input.frequency, input.customPeriodsPerYear);
	for (const row of input.variableRates) {
		if (period >= row.fromPeriod) rate = row.newRate / pPerYear;
	}
	return rate;
}

/**
 * Resolve the periodic interest rate for an accrual window, honouring the
 * day-count convention on the input. For 30/360 (and whenever the dates are
 * unavailable) this falls back to `annualRate / periodsPerYear` — identical
 * to the pre-day-count behaviour, which is how a classical 30/360 fixed-
 * payment amortising loan accrues. For Actual/365, Actual/360, and
 * Actual/Actual we use `yearFraction(prev, curr, dayCount) × annualRate`
 * so the rate actually shifts with the calendar-day gap between payments,
 * producing different February-period interest under Actual/Actual, etc.
 *
 * Variable-rate resets apply on top: the annual rate used for a period is
 * the most-recent `variableRates[k].newRate` whose `fromPeriod ≤ period`.
 */
export function periodRateFor(
	period: number,
	input: AmortizationInputs,
	dates: string[],
): number {
	// 1. Determine the active annual rate (with variable-rate resets).
	let annualRate = input.nominalRate;
	if (input.variableRates && input.variableRates.length > 0) {
		for (const row of input.variableRates) {
			if (period >= row.fromPeriod) annualRate = row.newRate;
		}
	}
	// 2. 30/360 → classical periodic rate. No dates needed.
	const pPerYear = periodsPerYear(input.frequency, input.customPeriodsPerYear);
	if (input.dayCount === '30/360') return annualRate / pPerYear;
	// 3. Actual conventions need valid period endpoints (ISO strings).
	const prevDateStr = period === 1 ? input.startDate : dates[period - 2];
	const currDateStr = dates[period - 1];
	if (!prevDateStr || !currDateStr) return annualRate / pPerYear;
	const yf = yearFraction(prevDateStr, currDateStr, input.dayCount);
	if (!Number.isFinite(yf) || yf <= 0) return annualRate / pPerYear;
	return annualRate * yf;
}

export function buildPaymentDates(input: AmortizationInputs): string[] {
	const dates: string[] = [];
	const first = new Date(input.firstPaymentDate);
	if (Number.isNaN(first.getTime())) {
		for (let i = 0; i < input.termPeriods; i++) dates.push('');
		return dates;
	}
	const step = stepMonths(input.frequency, input.customPeriodsPerYear);
	for (let i = 0; i < input.termPeriods; i++) {
		const d = new Date(first);
		if (step === 'weekly') {
			d.setDate(first.getDate() + 7 * i);
		} else {
			d.setMonth(first.getMonth() + step * i);
		}
		dates.push(d.toISOString().slice(0, 10));
	}
	return dates;
}

function stepMonths(frequency: Frequency, customPeriodsPerYear: number): number | 'weekly' {
	switch (frequency) {
		case 'monthly':
			return 1;
		case 'quarterly':
			return 3;
		case 'semiannual':
			return 6;
		case 'annual':
			return 12;
		case 'custom':
			if (customPeriodsPerYear === 52) return 'weekly';
			if (customPeriodsPerYear > 0) return Math.max(1, Math.round(12 / customPeriodsPerYear));
			return 1;
	}
}

// Re-export so callers can use without extra imports
export { yearFraction };
