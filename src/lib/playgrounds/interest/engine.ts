import type { CompoundingFrequency } from '$lib/playgrounds/tvm/types';
import { getPeriodsPerYear } from '$lib/playgrounds/tvm/engine';
import { yearFraction } from '$lib/finance/dayCount';
import type {
	AmortisationMethod,
	AmortisationRow,
	AmortisationSchedule,
	BondInputs,
	CompoundResult,
	CompoundResultRow,
	DivergencePoint,
	EirConversion,
	EirResult,
	InterestInputs,
	InterestKpis,
	InterestSnapshot,
	InterestState,
	SimpleResult,
	SimpleResultRow,
} from './types';

const MS_PER_DAY = 86400000;

export class InterestEngine {
	// ── Mode 1: Simple interest ──────────────────────────────────────────────
	simple(inputs: InterestInputs): SimpleResult {
		const { principal, nominalRate, startDate, endDate, dayCount } = inputs;
		const years = yearFraction(startDate, endDate, dayCount);
		const interest = principal * nominalRate * years;
		const total = principal + interest;
		const perPeriod = this.buildSimpleRows(inputs, years, interest);
		return { interest, total, years, perPeriod };
	}

	private buildSimpleRows(
		inputs: InterestInputs,
		totalYears: number,
		totalInterest: number,
	): SimpleResultRow[] {
		const { principal, startDate, endDate, dayCount, frequency } = inputs;
		const m = frequency === 'continuous' ? 12 : getPeriodsPerYear(frequency);
		const totalSteps = Math.max(1, Math.round(totalYears * m));
		const start = new Date(startDate + 'T00:00:00Z').getTime();
		const end = new Date(endDate + 'T00:00:00Z').getTime();
		const span = end - start;
		const rows: SimpleResultRow[] = [];
		let cumulative = 0;
		for (let i = 1; i <= totalSteps; i++) {
			const tMs = start + (span * i) / totalSteps;
			const periodEnd = new Date(tMs).toISOString().slice(0, 10);
			const yearsSoFar = yearFraction(startDate, periodEnd, dayCount);
			const interestToDate = principal * inputs.nominalRate * yearsSoFar;
			const interestThisPeriod = interestToDate - cumulative;
			cumulative = interestToDate;
			rows.push({
				periodEnd,
				fraction: yearsSoFar,
				interestThisPeriod,
				cumulativeInterest: cumulative,
				cumulativeTotal: principal + cumulative,
			});
		}
		// Last row must land exactly on totalInterest (guard against day-count drift).
		if (rows.length > 0) {
			const last = rows[rows.length - 1];
			const drift = totalInterest - last.cumulativeInterest;
			last.cumulativeInterest = totalInterest;
			last.cumulativeTotal = inputs.principal + totalInterest;
			last.interestThisPeriod += drift;
		}
		return rows;
	}

	// ── Mode 2: Compound interest ────────────────────────────────────────────
	compound(inputs: InterestInputs): CompoundResult {
		const { principal, nominalRate, startDate, endDate, dayCount, frequency } = inputs;
		const years = yearFraction(startDate, endDate, dayCount);
		const continuousEquivalent = this.continuousFV(principal, nominalRate, years);

		if (frequency === 'continuous') {
			const futureValue = continuousEquivalent;
			const interest = futureValue - principal;
			return {
				futureValue,
				interest,
				effectiveAnnualRate: Math.exp(nominalRate) - 1,
				continuousEquivalent,
				years,
				perPeriod: this.buildContinuousRows(inputs, years),
			};
		}

		const m = getPeriodsPerYear(frequency);
		const rp = nominalRate / m;
		const totalPeriods = years * m;
		const futureValue = principal * Math.pow(1 + rp, totalPeriods);
		const interest = futureValue - principal;
		const effectiveAnnualRate = Math.pow(1 + rp, m) - 1;
		const perPeriod = this.buildCompoundRows(inputs, years, rp, m);
		return { futureValue, interest, effectiveAnnualRate, continuousEquivalent, years, perPeriod };
	}

	continuousFV(principal: number, rate: number, years: number): number {
		return principal * Math.exp(rate * years);
	}

	private buildCompoundRows(
		inputs: InterestInputs,
		totalYears: number,
		rp: number,
		m: number,
	): CompoundResultRow[] {
		const { principal, startDate, endDate, dayCount, nominalRate } = inputs;
		const totalSteps = Math.max(1, Math.ceil(totalYears * m));
		const start = new Date(startDate + 'T00:00:00Z').getTime();
		const end = new Date(endDate + 'T00:00:00Z').getTime();
		const span = end - start;
		const rows: CompoundResultRow[] = [];
		let balance = principal;
		for (let i = 1; i <= totalSteps; i++) {
			const tMs = start + (span * i) / totalSteps;
			const periodEnd = new Date(tMs).toISOString().slice(0, 10);
			const yearsSoFar = yearFraction(startDate, periodEnd, dayCount);
			const periodsElapsed = yearsSoFar * m;
			const periodRateToDate = Math.pow(1 + rp, periodsElapsed) - 1;
			const newBalance = principal * (1 + periodRateToDate);
			const interestThisPeriod = newBalance - balance;
			const cumulativeInterestOnPrincipal = principal * nominalRate * yearsSoFar;
			const cumulativeInterestTotal = newBalance - principal;
			const cumulativeInterestOnInterest = Math.max(
				0,
				cumulativeInterestTotal - cumulativeInterestOnPrincipal,
			);
			rows.push({
				periodIndex: i,
				periodEnd,
				balanceStart: balance,
				interestThisPeriod,
				balanceEnd: newBalance,
				cumulativeInterestOnPrincipal,
				cumulativeInterestOnInterest,
			});
			balance = newBalance;
		}
		return rows;
	}

	private buildContinuousRows(inputs: InterestInputs, totalYears: number): CompoundResultRow[] {
		const { principal, nominalRate, startDate, endDate, dayCount } = inputs;
		const steps = Math.max(1, Math.ceil(totalYears * 12));
		const start = new Date(startDate + 'T00:00:00Z').getTime();
		const end = new Date(endDate + 'T00:00:00Z').getTime();
		const span = end - start;
		const rows: CompoundResultRow[] = [];
		let balance = principal;
		for (let i = 1; i <= steps; i++) {
			const tMs = start + (span * i) / steps;
			const periodEnd = new Date(tMs).toISOString().slice(0, 10);
			const yearsSoFar = yearFraction(startDate, periodEnd, dayCount);
			const newBalance = principal * Math.exp(nominalRate * yearsSoFar);
			const cumulativeInterestOnPrincipal = principal * nominalRate * yearsSoFar;
			const cumulativeInterestTotal = newBalance - principal;
			rows.push({
				periodIndex: i,
				periodEnd,
				balanceStart: balance,
				interestThisPeriod: newBalance - balance,
				balanceEnd: newBalance,
				cumulativeInterestOnPrincipal,
				cumulativeInterestOnInterest: Math.max(
					0,
					cumulativeInterestTotal - cumulativeInterestOnPrincipal,
				),
			});
			balance = newBalance;
		}
		return rows;
	}

	// ── Mode 3a: Rate conversion ─────────────────────────────────────────────
	nominalToEir(nominal: number, freq: CompoundingFrequency): number {
		if (freq === 'continuous') return Math.exp(nominal) - 1;
		const m = getPeriodsPerYear(freq);
		return Math.pow(1 + nominal / m, m) - 1;
	}

	eirToNominal(eir: number, freq: CompoundingFrequency): number {
		if (freq === 'continuous') return Math.log(1 + eir);
		const m = getPeriodsPerYear(freq);
		return m * (Math.pow(1 + eir, 1 / m) - 1);
	}

	convert(nominal: number, freq: CompoundingFrequency): EirConversion {
		const effectiveAnnualRate = this.nominalToEir(nominal, freq);
		const continuousEquivalent = Math.log(1 + effectiveAnnualRate);
		return {
			nominalRate: nominal,
			frequency: freq,
			effectiveAnnualRate,
			continuousEquivalent,
		};
	}

	// ── Mode 3b: Bond amortisation ───────────────────────────────────────────
	issuePrice(bond: BondInputs): number {
		const { faceValue, couponRate, marketRate, termYears, paymentFrequency } = bond;
		const m = getPeriodsPerYear(paymentFrequency);
		const N = Math.round(termYears * m);
		const rp = marketRate / m;
		const coupon = (faceValue * couponRate) / m;
		if (rp === 0) return faceValue + coupon * N;
		const annuityFactor = (1 - Math.pow(1 + rp, -N)) / rp;
		const pvCoupons = coupon * annuityFactor;
		const pvFace = faceValue * Math.pow(1 + rp, -N);
		return pvCoupons + pvFace;
	}

	buildSchedule(bond: BondInputs, method: AmortisationMethod): AmortisationSchedule {
		const { faceValue, couponRate, marketRate, termYears, paymentFrequency } = bond;
		const m = getPeriodsPerYear(paymentFrequency);
		const N = Math.round(termYears * m);
		const cashInterest = (faceValue * couponRate) / m;
		const issuePrice = this.issuePrice(bond);
		const start = new Date().toISOString().slice(0, 10);
		const startMs = new Date(start + 'T00:00:00Z').getTime();
		const rp = marketRate / m;

		const rows: AmortisationRow[] = [];
		let carrying = issuePrice;
		let totalExpense = 0;

		const slAmortPerPeriod = (faceValue - issuePrice) / N;

		for (let n = 1; n <= N; n++) {
			const opening = carrying;
			const periodEndMs = startMs + Math.round(((n * 365) / m) * MS_PER_DAY);
			const periodEnd = new Date(periodEndMs).toISOString().slice(0, 10);

			let interestExpense: number;
			let discountAmort: number;

			if (method === 'eir') {
				interestExpense = opening * rp;
				discountAmort = interestExpense - cashInterest;
			} else {
				discountAmort = slAmortPerPeriod;
				interestExpense = cashInterest + discountAmort;
			}

			let closing = opening + discountAmort;

			// Pin final row to face value and propagate the correction into this
			// row's amortisation / interest expense so the schedule stays
			// internally consistent.
			if (n === N) {
				const pinned = faceValue;
				const correction = pinned - closing;
				discountAmort += correction;
				interestExpense += correction;
				closing = pinned;
			}

			rows.push({
				periodIndex: n,
				periodEnd,
				openingCarryingAmount: opening,
				cashInterest,
				interestExpense,
				discountAmortisation: discountAmort,
				closingCarryingAmount: closing,
			});
			totalExpense += interestExpense;
			carrying = closing;
		}

		return { method, issuePrice, totalInterestExpense: totalExpense, rows };
	}

	eirAnalysis(bond: BondInputs): EirResult {
		const straightLine = this.buildSchedule(bond, 'straight-line');
		const eir = this.buildSchedule(bond, 'eir');
		const conversion = this.convert(bond.marketRate, bond.paymentFrequency);
		const divergenceSeries: DivergencePoint[] = straightLine.rows.map((sl, i) => {
			const e = eir.rows[i];
			return {
				periodIndex: sl.periodIndex,
				straightLineCarrying: sl.closingCarryingAmount,
				eirCarrying: e.closingCarryingAmount,
				gap: sl.closingCarryingAmount - e.closingCarryingAmount,
			};
		});
		return { conversion, straightLine, eir, divergenceSeries };
	}

	// ── KPIs + snapshots ─────────────────────────────────────────────────────
	computeKpis(
		state: InterestState,
		result: SimpleResult | CompoundResult | EirResult,
	): InterestKpis {
		const { inputs } = state;
		const freq = inputs.frequency;
		const effectiveAnnualRate =
			'effectiveAnnualRate' in result
				? result.effectiveAnnualRate
				: 'conversion' in result
					? result.conversion.effectiveAnnualRate
					: this.nominalToEir(inputs.nominalRate, freq);
		const continuousEquivalent =
			'continuousEquivalent' in result
				? result.continuousEquivalent
				: 'conversion' in result
					? result.conversion.continuousEquivalent
					: Math.log(1 + effectiveAnnualRate);
		const years = 'years' in result ? result.years : 0;
		let periodCount = 0;
		let principalRatio = 1;
		if ('perPeriod' in result) {
			periodCount = result.perPeriod.length;
			const last = result.perPeriod[result.perPeriod.length - 1];
			if (last && 'cumulativeTotal' in last) {
				principalRatio = last.cumulativeTotal / inputs.principal;
			} else if (last && 'balanceEnd' in last) {
				principalRatio = last.balanceEnd / inputs.principal;
			}
		} else if ('eir' in result) {
			periodCount = result.eir.rows.length;
			principalRatio = 1;
		}
		void years;
		return {
			nominalRate: inputs.nominalRate,
			effectiveAnnualRate,
			continuousEquivalent,
			principalRatio,
			periodCount,
		};
	}

	makeSnapshot(
		state: InterestState,
		result: SimpleResult | CompoundResult | EirResult,
		label?: string,
	): InterestSnapshot {
		const { mode, inputs, bondInputs } = state;
		const headline =
			'total' in result
				? result.total
				: 'futureValue' in result
					? result.futureValue
					: result.conversion.effectiveAnnualRate;
		const headlineKey =
			mode === 'simple'
				? 'int.kpi.totalAmount'
				: mode === 'compound'
					? 'int.kpi.futureValue'
					: 'int.kpi.effectiveAnnualRate';
		const principal = mode === 'effective' ? bondInputs.faceValue : inputs.principal;
		const rate = mode === 'effective' ? bondInputs.marketRate : inputs.nominalRate;
		const termYears =
			mode === 'effective'
				? bondInputs.termYears
				: yearFraction(inputs.startDate, inputs.endDate, inputs.dayCount);
		return {
			id: `snap-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
			mode,
			label: label ?? `${mode} · ${rate * 100}%`,
			inputsHash: hashInputs(state),
			summary: {
				principal,
				rate,
				termYears,
				resultHeadline: headline,
				resultLabelKey: headlineKey,
			},
			createdAt: new Date().toISOString(),
		};
	}
}

function hashInputs(state: InterestState): string {
	const stable = {
		mode: state.mode,
		inputs: state.inputs,
		bond: state.mode === 'effective' ? state.bondInputs : null,
	};
	const s = JSON.stringify(stable);
	let h = 5381;
	for (let i = 0; i < s.length; i++) {
		h = ((h << 5) + h + s.charCodeAt(i)) | 0;
	}
	return (h >>> 0).toString(36);
}
