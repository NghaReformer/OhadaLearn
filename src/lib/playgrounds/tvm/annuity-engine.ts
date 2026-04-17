/**
 * Annuity & perpetuity engine for the TVM playground.
 *
 * Rate handling is deliberately consistent with the core engine:
 * annual nominal rate + compounding frequency + payment frequency flow
 * through `getEffectivePeriodicRate()` so the same annual inputs produce
 * the same periodic rate across Core, Annuity and Investment groups.
 * `growthRate` (g) is converted to a per-payment-period growth rate the
 * same way — this eliminates the legacy "EAR vs nominal" ambiguity that
 * the audit flagged as Critical C4.
 */

import {
	getEffectivePeriodicRate,
	getPeriodsPerYear
} from './engine';
import type {
	AnnuityMode,
	AnnuitySolveInput,
	AnnuitySolveResult,
	CompoundingFrequency,
	PaymentFrequency,
	PeriodsUnit,
	ValidationError,
	ValidationResult,
	WorkingStep
} from './types';

const FORMULA_KEY: Record<AnnuityMode, string> = {
	annuityPv: 'tvm.ann.formula.annuityPv',
	annuityFv: 'tvm.ann.formula.annuityFv',
	growingAnnuityPv: 'tvm.ann.formula.growingAnnuityPv',
	growingAnnuityFv: 'tvm.ann.formula.growingAnnuityFv',
	perpetuityPv: 'tvm.ann.formula.perpetuityPv',
	growingPerpetuityPv: 'tvm.ann.formula.growingPerpetuityPv',
	ear: 'tvm.ann.formula.ear'
};

function annualToPeriodic(annualPct: number, payFreq: PaymentFrequency): number {
	// Convert an annual nominal growth rate to per-payment-period using
	// geometric conversion: (1 + g_annual)^(1/m) - 1.
	const g = annualPct / 100;
	const m = getPeriodsPerYear(payFreq);
	return Math.pow(1 + g, 1 / m) - 1;
}

function toTotalPeriods(periods: number, unit: PeriodsUnit, payFreq: PaymentFrequency): number {
	const years = unit === 'months' ? periods / 12 : periods;
	return years * getPeriodsPerYear(payFreq);
}

function fmt(value: number, decimals = 4): string {
	if (!isFinite(value)) return String(value);
	return Number(value.toFixed(decimals)).toString();
}

function validateRequired(
	input: AnnuitySolveInput,
	required: Array<keyof AnnuitySolveInput>
): ValidationError[] {
	const errors: ValidationError[] = [];
	for (const field of required) {
		const v = input[field];
		if (typeof v !== 'number' || !isFinite(v)) {
			errors.push({ key: 'tvm.validation.requiredField', params: { field: `tvm.global.${field}` } });
		}
	}
	return errors;
}

export class AnnuityEngine {
	validate(input: AnnuitySolveInput): ValidationResult {
		const errors: ValidationError[] = [];
		const warnings: ValidationError[] = [];

		switch (input.mode) {
			case 'annuityPv':
			case 'annuityFv':
				errors.push(...validateRequired(input, ['pmt', 'rate', 'periods']));
				break;
			case 'growingAnnuityPv':
			case 'growingAnnuityFv':
				errors.push(...validateRequired(input, ['pmt', 'rate', 'growthRate', 'periods']));
				break;
			case 'perpetuityPv':
				errors.push(...validateRequired(input, ['pmt', 'rate']));
				break;
			case 'growingPerpetuityPv': {
				errors.push(...validateRequired(input, ['pmt', 'rate', 'growthRate']));
				if (
					typeof input.rate === 'number' &&
					typeof input.growthRate === 'number' &&
					input.growthRate >= input.rate
				) {
					errors.push({ key: 'tvm.ann.validation.growthGeRate' });
				}
				break;
			}
			case 'ear':
				errors.push(...validateRequired(input, ['rate']));
				break;
		}

		if (input.compoundingFrequency === 'continuous' && input.mode !== 'ear') {
			// Continuous + periodic payments is mathematically undefined — reuse the core key.
			errors.push({ key: 'tvm.validation.continuousPmtUndefined' });
		}

		if (
			typeof input.rate === 'number' &&
			input.rate <= -100 &&
			input.mode !== 'ear'
		) {
			errors.push({ key: 'tvm.validation.rateTooNegative' });
		}

		if (typeof input.periods === 'number' && input.periods <= 0 && ['annuityPv', 'annuityFv', 'growingAnnuityPv', 'growingAnnuityFv'].includes(input.mode)) {
			errors.push({ key: 'tvm.validation.negativePeriods' });
		}

		return { valid: errors.length === 0, errors, warnings };
	}

	solve(input: AnnuitySolveInput): AnnuitySolveResult | null {
		const validation = this.validate(input);
		if (!validation.valid) return null;

		const pmt = typeof input.pmt === 'number' ? input.pmt : 0;
		const rate = typeof input.rate === 'number' ? input.rate : 0;
		const growth = typeof input.growthRate === 'number' ? input.growthRate : 0;
		const periods = typeof input.periods === 'number' ? input.periods : 0;

		// EAR mode doesn't use periodic conversion — it converts the nominal
		// annual rate under the given compounding frequency to an annual
		// effective rate.
		if (input.mode === 'ear') {
			const r = rate / 100;
			const earDec =
				input.compoundingFrequency === 'continuous'
					? Math.exp(r) - 1
					: Math.pow(1 + r / getPeriodsPerYear(input.compoundingFrequency), getPeriodsPerYear(input.compoundingFrequency)) - 1;
			return {
				mode: 'ear',
				value: earDec * 100,
				valueKind: 'rate',
				signNote: 'neutral',
				effectivePeriodicRate: earDec,
				effectivePeriodicGrowth: null,
				totalPeriods: null,
				formulaKey: FORMULA_KEY.ear,
				workings: [
					{
						labelKey: 'tvm.ann.workings.nominal',
						expression: `${fmt(rate, 4)}%`,
						value: `${fmt(rate, 6)}%`
					},
					{
						labelKey: 'tvm.ann.workings.compoundingPerYear',
						expression: input.compoundingFrequency,
						value: String(getPeriodsPerYear(input.compoundingFrequency))
					},
					{
						labelKey: 'tvm.ann.workings.ear',
						expression: input.compoundingFrequency === 'continuous' ? 'e^r − 1' : '(1 + r/m)^m − 1',
						value: `${fmt(earDec * 100, 6)}%`
					}
				]
			};
		}

		const rp = getEffectivePeriodicRate(rate, input.compoundingFrequency, input.paymentFrequency);
		const gp = input.paymentFrequency ? annualToPeriodic(growth, input.paymentFrequency) : growth / 100;

		const workings: WorkingStep[] = [
			{
				labelKey: 'tvm.workings.effectiveRate',
				expression: `${fmt(rate, 4)}% → per ${input.paymentFrequency}`,
				value: `${fmt(rp * 100, 6)}%`
			}
		];
		if (['growingAnnuityPv', 'growingAnnuityFv', 'growingPerpetuityPv'].includes(input.mode)) {
			workings.push({
				labelKey: 'tvm.ann.workings.effectiveGrowth',
				expression: `${fmt(growth, 4)}% annual`,
				value: `${fmt(gp * 100, 6)}%`
			});
		}

		let value: number;
		let totalPeriods: number | null = null;

		switch (input.mode) {
			case 'annuityPv': {
				const N = toTotalPeriods(periods, input.periodsUnit, input.paymentFrequency);
				totalPeriods = N;
				let v: number;
				if (Math.abs(rp) < 1e-14) {
					v = pmt * N;
				} else {
					v = (pmt * (1 - Math.pow(1 + rp, -N))) / rp;
				}
				if (input.paymentTiming === 'begin') v *= 1 + rp;
				value = v;
				break;
			}
			case 'annuityFv': {
				const N = toTotalPeriods(periods, input.periodsUnit, input.paymentFrequency);
				totalPeriods = N;
				let v: number;
				if (Math.abs(rp) < 1e-14) {
					v = pmt * N;
				} else {
					v = (pmt * (Math.pow(1 + rp, N) - 1)) / rp;
				}
				if (input.paymentTiming === 'begin') v *= 1 + rp;
				value = v;
				break;
			}
			case 'growingAnnuityPv': {
				const N = toTotalPeriods(periods, input.periodsUnit, input.paymentFrequency);
				totalPeriods = N;
				let v: number;
				if (Math.abs(rp - gp) < 1e-14) {
					// Degenerate: use L'Hôpital limit — PV = PMT · N / (1 + rp)
					v = (pmt * N) / (1 + rp);
				} else {
					v = (pmt * (1 - Math.pow((1 + gp) / (1 + rp), N))) / (rp - gp);
				}
				if (input.paymentTiming === 'begin') v *= 1 + rp;
				value = v;
				break;
			}
			case 'growingAnnuityFv': {
				const N = toTotalPeriods(periods, input.periodsUnit, input.paymentFrequency);
				totalPeriods = N;
				let v: number;
				if (Math.abs(rp - gp) < 1e-14) {
					v = pmt * N * Math.pow(1 + rp, N - 1);
				} else {
					v = (pmt * (Math.pow(1 + rp, N) - Math.pow(1 + gp, N))) / (rp - gp);
				}
				if (input.paymentTiming === 'begin') v *= 1 + rp;
				value = v;
				break;
			}
			case 'perpetuityPv': {
				if (rp === 0) return null;
				value = pmt / rp;
				if (input.paymentTiming === 'begin') value *= 1 + rp;
				break;
			}
			case 'growingPerpetuityPv': {
				if (rp <= gp) return null; // already caught in validation, belt-and-braces
				value = pmt / (rp - gp);
				if (input.paymentTiming === 'begin') value *= 1 + rp;
				break;
			}
			default:
				return null;
		}

		if (!isFinite(value)) return null;

		const signNote: AnnuitySolveResult['signNote'] =
			value > 0 ? 'inflow' : value < 0 ? 'outflow' : 'neutral';

		workings.push({
			labelKey: `tvm.ann.workings.solve.${input.mode}`,
			expression: FORMULA_KEY[input.mode],
			value: fmt(value, 2)
		});

		return {
			mode: input.mode,
			value,
			valueKind: 'currency',
			signNote,
			effectivePeriodicRate: rp,
			effectivePeriodicGrowth: ['growingAnnuityPv', 'growingAnnuityFv', 'growingPerpetuityPv'].includes(input.mode) ? gp : null,
			totalPeriods,
			formulaKey: FORMULA_KEY[input.mode],
			workings
		};
	}
}
