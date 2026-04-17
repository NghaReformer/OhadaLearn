import type {
	CVPSingleResult,
	CVPMultiResult,
	IndifferenceResult,
	SensitivityResult,
	SensitivityVar,
	SensitivityMetric,
	Product,
} from './types';

export function calcSingle(
	p: number,
	v: number,
	fc: number,
	q: number,
	targetProfit: number,
	taxRate: number,
): CVPSingleResult {
	const cm = p - v;
	const cmRatio = p > 0 ? cm / p : 0;
	const totalRevenue = p * q;
	const totalVC = v * q;
	const totalCM = cm * q;
	const operatingIncome = totalCM - fc;
	const oiPerUnit = q > 0 ? operatingIncome / q : 0;
	const oiRatio = totalRevenue > 0 ? operatingIncome / totalRevenue : 0;

	const bepUnits = cm > 0 ? fc / cm : Infinity;
	const bepRevenue = cmRatio > 0 ? fc / cmRatio : Infinity;

	const targetUnits = cm > 0 ? (fc + targetProfit) / cm : Infinity;
	const targetRevenue = cmRatio > 0 ? (fc + targetProfit) / cmRatio : Infinity;

	const effectiveTaxRate = Math.min(Math.max(taxRate / 100, 0), 0.9999);
	const preTaxTarget = targetProfit / (1 - effectiveTaxRate);
	const afterTaxUnits = cm > 0 ? (fc + preTaxTarget) / cm : Infinity;
	const afterTaxRevenue = cmRatio > 0 ? (fc + preTaxTarget) / cmRatio : Infinity;

	const mosUnits = q - bepUnits;
	const mosRevenue = totalRevenue - bepRevenue;
	const mosPct = q > 0 ? (mosUnits / q) * 100 : NaN;

	const dol = operatingIncome !== 0 ? totalCM / operatingIncome : totalCM > 0 ? Infinity : 0;

	const taxExpense = operatingIncome > 0 ? operatingIncome * effectiveTaxRate : 0;
	const netIncome = operatingIncome - taxExpense;

	return {
		price: p,
		variableCost: v,
		cm,
		cmRatio,
		totalRevenue,
		totalVC,
		totalCM,
		fc,
		operatingIncome,
		oiPerUnit,
		oiRatio,
		taxExpense,
		netIncome,
		bepUnits,
		bepRevenue,
		targetUnits,
		targetRevenue,
		targetProfit,
		afterTaxUnits,
		afterTaxRevenue,
		preTaxTarget,
		mosUnits,
		mosRevenue,
		mosPct,
		dol,
		isProfit: operatingIncome >= 0,
		volume: q,
		taxRate,
	};
}

export function calcMulti(
	products: Product[],
	fc: number,
	targetProfit: number,
	taxRate: number,
): CVPMultiResult {
	const totalMixPct = products.reduce((s, pr) => s + pr.mixPct, 0);

	if (Math.abs(totalMixPct - 100) > 0.01) {
		return {
			error: true,
			errorType: 'mixTotal',
			totalMixPct,
			weightedCM: 0,
			weightedCMRatio: 0,
			bepTotalUnits: Infinity,
			bepTotalRevenue: Infinity,
			targetTotalUnits: Infinity,
			afterTaxTotalUnits: Infinity,
			preTaxTarget: 0,
			perProduct: [],
			fc,
			targetProfit,
			taxRate,
		};
	}

	const normalized = products.map((pr) => ({ ...pr, mix: pr.mixPct / 100 }));

	let weightedCM = 0;
	for (const pr of normalized) {
		weightedCM += (pr.price - pr.variableCost) * pr.mix;
	}

	let totalWeightedRevenue = 0;
	let totalWeightedCM = 0;
	for (const pr of normalized) {
		totalWeightedRevenue += pr.price * pr.mix;
		totalWeightedCM += (pr.price - pr.variableCost) * pr.mix;
	}
	const weightedCMRatio = totalWeightedRevenue > 0 ? totalWeightedCM / totalWeightedRevenue : 0;

	const bepTotalUnits = weightedCM > 0 ? fc / weightedCM : Infinity;
	const bepTotalRevenue = weightedCMRatio > 0 ? fc / weightedCMRatio : Infinity;

	const effectiveTaxRate = Math.min(Math.max(taxRate / 100, 0), 0.9999);
	const preTaxTarget = targetProfit / (1 - effectiveTaxRate);
	const targetTotalUnits = weightedCM > 0 ? (fc + targetProfit) / weightedCM : Infinity;
	const afterTaxTotalUnits = weightedCM > 0 ? (fc + preTaxTarget) / weightedCM : Infinity;

	const perProduct = normalized.map((pr) => {
		const cm = pr.price - pr.variableCost;
		const cmRatio = pr.price > 0 ? cm / pr.price : 0;
		const bepUnits = bepTotalUnits * pr.mix;
		return {
			name: pr.name,
			price: pr.price,
			variableCost: pr.variableCost,
			cm,
			cmRatio,
			mix: pr.mix,
			mixPct: pr.mixPct,
			bepUnits,
			bepRevenue: bepUnits * pr.price,
		};
	});

	return {
		weightedCM,
		weightedCMRatio,
		bepTotalUnits,
		bepTotalRevenue,
		targetTotalUnits,
		afterTaxTotalUnits,
		preTaxTarget,
		perProduct,
		fc,
		targetProfit,
		taxRate,
	};
}

export function calcIndifference(
	fcA: number,
	vA: number,
	fcB: number,
	vB: number,
): IndifferenceResult {
	const dv = vA - vB;
	if (Math.abs(dv) < 0.0001) {
		const cheaper: 'A' | 'B' | null = fcA < fcB ? 'A' : fcB < fcA ? 'B' : null;
		return {
			volume: Infinity,
			parallel: true,
			dominated: cheaper !== null,
			dominator: cheaper,
			cheaperBelow: null,
			cheaperAbove: null,
		};
	}
	const volume = (fcB - fcA) / dv;
	if (volume <= 0) {
		const costA1 = fcA + vA;
		const costB1 = fcB + vB;
		const dominator: 'A' | 'B' = costA1 <= costB1 ? 'A' : 'B';
		return {
			volume,
			parallel: false,
			dominated: true,
			dominator,
			cheaperBelow: null,
			cheaperAbove: null,
		};
	}
	return {
		volume,
		parallel: false,
		dominated: false,
		dominator: null,
		cheaperBelow: vA > vB ? 'A' : 'B',
		cheaperAbove: vA > vB ? 'B' : 'A',
	};
}

export interface SensitivityBaseParams {
	p: number;
	v: number;
	fc: number;
	q: number;
	targetProfit: number;
	taxRate: number;
}

const varToKey: Record<SensitivityVar, keyof SensitivityBaseParams> = {
	price: 'p',
	volume: 'q',
	variableCost: 'v',
	fixedCosts: 'fc',
};

export function calcSensitivityTable(
	base: SensitivityBaseParams,
	rowVar: SensitivityVar,
	colVar: SensitivityVar,
	targetMetric: SensitivityMetric,
	steps: { rowValues: number[]; colValues: number[] },
): SensitivityResult {
	const rows = steps.rowValues.map((rowVal) =>
		steps.colValues.map((colVal) => {
			const params = { ...base };
			params[varToKey[rowVar]] = rowVal;
			params[varToKey[colVar]] = colVal;
			const result = calcSingle(
				params.p,
				params.v,
				params.fc,
				params.q,
				params.targetProfit,
				params.taxRate,
			);
			return result[targetMetric];
		}),
	);
	return { rows, rowValues: steps.rowValues, colValues: steps.colValues };
}

export function generateSteps(baseValue: number, pctRange: number, numSteps: number): number[] {
	let lo: number;
	let hi: number;
	if (baseValue !== 0) {
		lo = baseValue * (1 - pctRange / 100);
		hi = baseValue * (1 + pctRange / 100);
	} else {
		lo = -pctRange;
		hi = pctRange;
	}
	const step = (hi - lo) / (numSteps - 1);
	return Array.from({ length: numSteps }, (_, i) => {
		const val = lo + step * i;
		return Math.round(val * 100) / 100;
	});
}

export interface WhatIfBase {
	price: number;
	variableCost: number;
	fc: number;
	volume: number;
	targetProfit: number;
	taxRate: number;
}

export function applyWhatIf(
	base: WhatIfBase,
	pricePct: number,
	volumePct: number,
	vcPct: number,
	fcPct: number,
): CVPSingleResult {
	const p = base.price * (1 + pricePct / 100);
	const v = base.variableCost * (1 + vcPct / 100);
	const fc = base.fc * (1 + fcPct / 100);
	const q = base.volume * (1 + volumePct / 100);
	return calcSingle(p, v, fc, q, base.targetProfit, base.taxRate);
}
