/**
 * Time Value of Money — pure computation engine.
 *
 * Sign convention follows HP-12C: outflows negative, inflows positive.
 * The engine accepts the user's signed values and returns the solved variable
 * in the same frame. The UI is responsible for the ⊖/⊕ banner.
 *
 * Math ported from static/playgrounds/tvm-playground.html (TVMCore + TVMRates).
 * Behaviour preserved bit-for-bit; types and validation added.
 */

import type {
	CompoundingFrequency,
	PaymentFrequency,
	PaymentTiming,
	PeriodsUnit,
	SolveInput,
	SolveMode,
	SolveResult,
	ValidationError,
	ValidationResult,
	WorkingStep
} from './types';

const FREQ: Record<Exclude<CompoundingFrequency, 'continuous'>, number> = {
	annual: 1,
	semi: 2,
	quarterly: 4,
	monthly: 12,
	daily: 365
};

const FREQ_LABEL_KEY: Record<CompoundingFrequency, string> = {
	annual: 'tvm.freq.annual',
	semi: 'tvm.freq.semi',
	quarterly: 'tvm.freq.quarterly',
	monthly: 'tvm.freq.monthly',
	daily: 'tvm.freq.daily',
	continuous: 'tvm.freq.continuous'
};

const FORMULA_KEY: Record<SolveMode, string> = {
	pv: 'tvm.formula.pv',
	fv: 'tvm.formula.fv',
	pmt: 'tvm.formula.pmt',
	rate: 'tvm.formula.rate',
	periods: 'tvm.formula.periods'
};

export function getFrequencyLabelKey(freq: CompoundingFrequency): string {
	return FREQ_LABEL_KEY[freq];
}

export function getPeriodsPerYear(freq: CompoundingFrequency): number {
	if (freq === 'continuous') return Infinity;
	return FREQ[freq];
}

/**
 * Effective periodic rate per *payment* period.
 * When pay frequency differs from compounding, derive via EAR.
 */
export function getEffectivePeriodicRate(
	annualRatePct: number,
	compFreq: CompoundingFrequency,
	payFreq?: PaymentFrequency
): number {
	if (compFreq === 'continuous') {
		// Continuous compounding has no discrete periodic rate; caller
		// must use continuous-specific formulas. Return EAR-equivalent
		// per pay period for sanity (not used by the discrete solvers).
		const earDec = Math.exp(annualRatePct / 100) - 1;
		const m = payFreq ? FREQ[payFreq] : 1;
		return Math.pow(1 + earDec, 1 / m) - 1;
	}
	const r = annualRatePct / 100;
	if (!payFreq || payFreq === compFreq) {
		return r / FREQ[compFreq];
	}
	const earDec = Math.pow(1 + r / FREQ[compFreq], FREQ[compFreq]) - 1;
	return Math.pow(1 + earDec, 1 / FREQ[payFreq]) - 1;
}

/**
 * Total number of *payment* periods over the requested horizon.
 */
export function getTotalPaymentPeriods(
	periods: number,
	unit: PeriodsUnit,
	compFreq: CompoundingFrequency,
	payFreq: PaymentFrequency
): number {
	const years = unit === 'months' ? periods / 12 : periods;
	const freq = payFreq && payFreq !== compFreq && compFreq !== 'continuous'
		? FREQ[payFreq]
		: compFreq === 'continuous'
			? FREQ[payFreq]
			: FREQ[compFreq];
	return years * freq;
}

function nominalFromRp(rp: number, payFreq: PaymentFrequency, compFreq: CompoundingFrequency): number {
	if (compFreq === 'continuous') {
		// Convert periodic-per-pay rate to continuous nominal via EAR.
		const ear = Math.pow(1 + rp, FREQ[payFreq]) - 1;
		return Math.log(1 + ear) * 100;
	}
	if (payFreq === compFreq) return rp * FREQ[compFreq] * 100;
	const ear = Math.pow(1 + rp, FREQ[payFreq]) - 1;
	return FREQ[compFreq] * (Math.pow(1 + ear, 1 / FREQ[compFreq]) - 1) * 100;
}

interface SolveCore {
	pv: number;
	fv: number;
	pmt: number;
	rate: number;
	periods: number;
	periodsUnit: PeriodsUnit;
	compoundingFrequency: CompoundingFrequency;
	paymentFrequency: PaymentFrequency;
	paymentTiming: PaymentTiming;
}

function calcPV(input: SolveCore): number {
	const { fv, pmt, rate, periods, periodsUnit, compoundingFrequency, paymentFrequency, paymentTiming } = input;
	if (compoundingFrequency === 'continuous') {
		if (pmt !== 0) return NaN;
		const r = rate / 100;
		const years = periodsUnit === 'months' ? periods / 12 : periods;
		return -(fv * Math.exp(-r * years));
	}
	const rp = getEffectivePeriodicRate(rate, compoundingFrequency, paymentFrequency);
	if (rp <= -1) return NaN;
	const N = getTotalPaymentPeriods(periods, periodsUnit, compoundingFrequency, paymentFrequency);
	if (rp === 0) return -(fv + pmt * N);

	const factor = Math.pow(1 + rp, -N);
	let pv = fv * factor;
	if (pmt !== 0) {
		let annuityPV = (pmt * (1 - factor)) / rp;
		if (paymentTiming === 'begin') annuityPV *= 1 + rp;
		pv += annuityPV;
	}
	return -pv;
}

function calcFV(input: SolveCore): number {
	const { pv, pmt, rate, periods, periodsUnit, compoundingFrequency, paymentFrequency, paymentTiming } = input;
	if (compoundingFrequency === 'continuous') {
		if (pmt !== 0) return NaN;
		const r = rate / 100;
		const years = periodsUnit === 'months' ? periods / 12 : periods;
		return -(pv * Math.exp(r * years));
	}
	const rp = getEffectivePeriodicRate(rate, compoundingFrequency, paymentFrequency);
	if (rp <= -1) return NaN;
	const N = getTotalPaymentPeriods(periods, periodsUnit, compoundingFrequency, paymentFrequency);
	if (rp === 0) return -(pv + pmt * N);

	const compound = Math.pow(1 + rp, N);
	let fv = pv * compound;
	if (pmt !== 0) {
		let annuityFV = (pmt * (compound - 1)) / rp;
		if (paymentTiming === 'begin') annuityFV *= 1 + rp;
		fv += annuityFV;
	}
	return -fv;
}

function calcPMT(input: SolveCore): number {
	const { pv, fv, rate, periods, periodsUnit, compoundingFrequency, paymentFrequency, paymentTiming } = input;
	if (compoundingFrequency === 'continuous') return NaN;
	const rp = getEffectivePeriodicRate(rate, compoundingFrequency, paymentFrequency);
	if (rp <= -1) return NaN;
	const N = getTotalPaymentPeriods(periods, periodsUnit, compoundingFrequency, paymentFrequency);
	if (rp === 0) return -(pv + fv) / N;

	const compound = Math.pow(1 + rp, N);
	let payment = -(pv * rp * compound + fv * rp) / (compound - 1);
	if (paymentTiming === 'begin') payment /= 1 + rp;
	return payment;
}

function calcRate(input: SolveCore): number {
	const { pv, fv, pmt, periods, periodsUnit, compoundingFrequency, paymentFrequency, paymentTiming } = input;
	const years = periodsUnit === 'months' ? periods / 12 : periods;

	if (compoundingFrequency === 'continuous') {
		if (pmt !== 0) return NaN;
		if (pv !== 0 && fv !== 0) {
			const ratio = -fv / pv;
			if (ratio <= 0) return NaN;
			return (Math.log(ratio) / years) * 100;
		}
		return NaN;
	}

	const N = years * FREQ[paymentFrequency];

	// Closed-form solution when there is no payment.
	if (pmt === 0 && pv !== 0 && fv !== 0) {
		const ratio = -fv / pv;
		if (ratio <= 0) return NaN;
		const rp = Math.pow(ratio, 1 / N) - 1;
		return nominalFromRp(rp, paymentFrequency, compoundingFrequency);
	}

	// Newton-Raphson initial guess.
	let rp: number;
	const totalCF = pv + pmt * N + fv;
	if (Math.abs(pv) > 0 && N > 0) {
		rp = -totalCF / (pv * N + (pmt * N * (N + 1)) / 2);
		if (!isFinite(rp) || rp <= -1 || rp > 1) rp = 0.01;
	} else {
		rp = 0.01;
	}

	const maxIter = 100;
	const tol = 1e-10;
	for (let i = 0; i < maxIter; i++) {
		if (rp <= -1) rp = -0.99;
		const powNeg = Math.pow(1 + rp, -N);
		const D = paymentTiming === 'begin' ? 1 + rp : 1;

		let f: number;
		let fPrime: number;
		if (Math.abs(rp) < 1e-14) {
			f = pv + pmt * D * N + fv;
			fPrime = (-pmt * D * N * (N + 1)) / 2 - fv * N;
		} else {
			const annuity = (1 - powNeg) / rp;
			f = pv + pmt * D * annuity + fv * powNeg;
			const dAnnuity = ((N * powNeg) / (1 + rp) * rp - (1 - powNeg)) / (rp * rp);
			fPrime = pmt * D * dAnnuity - N * fv * Math.pow(1 + rp, -N - 1);
			if (paymentTiming === 'begin') fPrime += pmt * annuity;
		}
		if (Math.abs(fPrime) < 1e-30) break;
		const rpNew = rp - f / fPrime;
		if (!isFinite(rpNew)) break;
		if (Math.abs(rpNew - rp) < tol) {
			return nominalFromRp(rpNew, paymentFrequency, compoundingFrequency);
		}
		rp = rpNew;
	}

	// Fallback: bracket-and-bisect.
	const tvmF = (rpTry: number): number => {
		if (rpTry <= -1) return NaN;
		const Df = paymentTiming === 'begin' ? 1 + rpTry : 1;
		if (Math.abs(rpTry) < 1e-14) return pv + pmt * Df * N + fv;
		const powNeg = Math.pow(1 + rpTry, -N);
		if (!isFinite(powNeg)) return NaN;
		const annuity = (1 - powNeg) / rpTry;
		return pv + pmt * Df * annuity + fv * powNeg;
	};
	const candidates = [
		-0.5, -0.3, -0.1, -0.01, 0, 0.001, 0.005, 0.01, 0.02, 0.05, 0.1, 0.2, 0.5, 1.0, 2.0, 5.0
	];
	let lo: number | null = null;
	let hi: number | null = null;
	let fLo: number | null = null;
	for (let i = 0; i < candidates.length; i++) {
		const r1 = candidates[i];
		const f1 = tvmF(r1);
		if (!isFinite(f1)) continue;
		for (let j = i + 1; j < candidates.length; j++) {
			const r2 = candidates[j];
			const f2 = tvmF(r2);
			if (!isFinite(f2)) continue;
			if (f1 * f2 < 0) {
				lo = r1;
				fLo = f1;
				hi = r2;
				break;
			}
		}
		if (lo !== null) break;
	}
	if (lo === null || hi === null || fLo === null) return NaN;
	let bracketLo = lo;
	let bracketHi = hi;
	let bracketFLo = fLo;

	for (let i = 0; i < 200; i++) {
		const mid = (bracketLo + bracketHi) / 2;
		if (bracketHi - bracketLo < 1e-12) return nominalFromRp(mid, paymentFrequency, compoundingFrequency);
		const fMid = tvmF(mid);
		if (!isFinite(fMid)) {
			bracketLo = mid;
			continue;
		}
		if (Math.abs(fMid) < 1e-10) return nominalFromRp(mid, paymentFrequency, compoundingFrequency);
		if (bracketFLo * fMid < 0) {
			bracketHi = mid;
		} else {
			bracketLo = mid;
			bracketFLo = fMid;
		}
	}
	return nominalFromRp((bracketLo + bracketHi) / 2, paymentFrequency, compoundingFrequency);
}

function calcPeriods(input: SolveCore): number {
	const { pv, fv, pmt, rate, periodsUnit, compoundingFrequency, paymentFrequency, paymentTiming } = input;
	const m = compoundingFrequency === 'continuous' ? 1 : FREQ[paymentFrequency];

	if (compoundingFrequency === 'continuous') {
		const r = rate / 100;
		if (pmt !== 0) return NaN;
		if (r === 0 || pv === 0 || fv === 0) return NaN;
		const ratio = -fv / pv;
		if (ratio <= 0) return NaN;
		const years = Math.log(ratio) / r;
		if (years <= 0 || !isFinite(years)) return NaN;
		return periodsUnit === 'months' ? years * 12 : years;
	}

	const rp = getEffectivePeriodicRate(rate, compoundingFrequency, paymentFrequency);

	if (rp === 0) {
		if (pmt === 0) return NaN;
		const N0 = -(pv + fv) / pmt / m;
		if (N0 <= 0 || !isFinite(N0)) return NaN;
		return periodsUnit === 'months' ? N0 * 12 : N0;
	}

	const effPmt = paymentTiming === 'begin' ? pmt * (1 + rp) : pmt;

	let N: number;
	if (effPmt === 0) {
		if (pv === 0 || fv === 0) return NaN;
		const ratio = -fv / pv;
		if (ratio <= 0) return NaN;
		N = Math.log(ratio) / Math.log(1 + rp);
	} else {
		const numerator = effPmt - fv * rp;
		const denominator = effPmt + pv * rp;
		if (denominator === 0 || numerator / denominator <= 0) return NaN;
		N = Math.log(numerator / denominator) / Math.log(1 + rp);
	}

	if (N <= 0 || !isFinite(N)) return NaN;
	return periodsUnit === 'months' ? (N / m) * 12 : N / m;
}

function fmt(value: number, decimals = 4): string {
	if (!isFinite(value)) return String(value);
	return Number(value.toFixed(decimals)).toString();
}

function buildWorkings(
	mode: SolveMode,
	core: SolveCore,
	rp: number,
	N: number,
	value: number
): WorkingStep[] {
	const steps: WorkingStep[] = [];
	steps.push({
		labelKey: 'tvm.workings.effectiveRate',
		expression: `${fmt(core.rate, 4)}% / ${getPeriodsPerYear(core.compoundingFrequency)}`,
		value: `${fmt(rp * 100, 6)}%`
	});
	steps.push({
		labelKey: 'tvm.workings.totalPeriods',
		expression: `${fmt(core.periods, 4)} ${core.periodsUnit} × ${getPeriodsPerYear(core.paymentFrequency)}`,
		value: fmt(N, 4)
	});
	steps.push({
		labelKey: `tvm.workings.solve.${mode}`,
		expression: FORMULA_KEY[mode],
		value: fmt(value, 2)
	});
	return steps;
}

export class TVMEngine {
	validate(input: SolveInput): ValidationResult {
		const errors: ValidationError[] = [];
		const warnings: ValidationError[] = [];

		const required: Array<keyof SolveInput> = (() => {
			switch (input.mode) {
				case 'pv':
					return ['fv', 'rate', 'periods'];
				case 'fv':
					return ['pv', 'rate', 'periods'];
				case 'pmt':
					return ['pv', 'fv', 'rate', 'periods'];
				case 'rate':
					return ['pv', 'fv', 'periods'];
				case 'periods':
					return ['pv', 'fv', 'rate'];
			}
		})();

		for (const field of required) {
			const v = input[field];
			if (v === undefined || v === null || (typeof v !== 'number') || !isFinite(v)) {
				errors.push({ key: 'tvm.validation.requiredField', params: { field: `tvm.global.${field}` } });
			}
		}

		const pmt = typeof input.pmt === 'number' ? input.pmt : 0;
		if (input.compoundingFrequency === 'continuous' && pmt !== 0 && input.mode !== 'pmt') {
			errors.push({ key: 'tvm.validation.continuousPmtUndefined' });
		}
		if (input.mode === 'pmt' && input.compoundingFrequency === 'continuous') {
			errors.push({ key: 'tvm.validation.continuousPmtUndefined' });
		}

		if (typeof input.periods === 'number' && input.periods <= 0 && input.mode !== 'periods') {
			errors.push({ key: 'tvm.validation.negativePeriods' });
		}

		if (
			typeof input.rate === 'number' &&
			input.rate <= -100 &&
			input.compoundingFrequency !== 'continuous' &&
			input.mode !== 'rate'
		) {
			errors.push({ key: 'tvm.validation.rateTooNegative' });
		}

		if (
			input.mode === 'rate' &&
			pmt === 0 &&
			typeof input.pv === 'number' &&
			typeof input.fv === 'number' &&
			Math.sign(input.pv) === Math.sign(input.fv) &&
			input.pv !== 0
		) {
			warnings.push({ key: 'tvm.validation.sameSignPvFv' });
		}

		return { valid: errors.length === 0, errors, warnings };
	}

	solve(input: SolveInput): SolveResult | null {
		const validation = this.validate(input);
		if (!validation.valid) return null;

		const core: SolveCore = {
			pv: typeof input.pv === 'number' ? input.pv : 0,
			fv: typeof input.fv === 'number' ? input.fv : 0,
			pmt: typeof input.pmt === 'number' ? input.pmt : 0,
			rate: typeof input.rate === 'number' ? input.rate : 0,
			periods: typeof input.periods === 'number' ? input.periods : 0,
			periodsUnit: input.periodsUnit,
			compoundingFrequency: input.compoundingFrequency,
			paymentFrequency: input.paymentFrequency,
			paymentTiming: input.paymentTiming
		};

		let value: number;
		switch (input.mode) {
			case 'pv':
				value = calcPV(core);
				break;
			case 'fv':
				value = calcFV(core);
				break;
			case 'pmt':
				value = calcPMT(core);
				break;
			case 'rate':
				value = calcRate(core);
				break;
			case 'periods':
				value = calcPeriods(core);
				break;
		}

		if (!isFinite(value)) return null;

		const rp =
			input.compoundingFrequency === 'continuous'
				? core.rate / 100
				: input.mode === 'rate'
					? getEffectivePeriodicRate(value, input.compoundingFrequency, input.paymentFrequency)
					: getEffectivePeriodicRate(core.rate, input.compoundingFrequency, input.paymentFrequency);
		const totalPeriods =
			input.mode === 'periods'
				? value * (input.periodsUnit === 'months'
						? getPeriodsPerYear(input.paymentFrequency) / 12
						: getPeriodsPerYear(input.paymentFrequency))
				: getTotalPaymentPeriods(core.periods, core.periodsUnit, core.compoundingFrequency, core.paymentFrequency);

		const signNote: SolveResult['signNote'] =
			input.mode === 'rate' || input.mode === 'periods'
				? 'neutral'
				: value > 0
					? 'inflow'
					: value < 0
						? 'outflow'
						: 'neutral';

		return {
			mode: input.mode,
			value,
			signNote,
			effectivePeriodicRate: rp,
			totalPeriods,
			formulaKey: FORMULA_KEY[input.mode],
			workings: buildWorkings(input.mode, core, rp, totalPeriods, value)
		};
	}
}
