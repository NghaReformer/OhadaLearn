import type { CompoundingFrequency } from '$lib/playgrounds/tvm/types';
import type { DayCount } from '$lib/playgrounds/amortization/types';

export type InterestMode = 'simple' | 'compound' | 'effective';

export type AmortisationMethod = 'straight-line' | 'eir';

export interface InterestInputs {
	principal: number;
	nominalRate: number;
	startDate: string;
	endDate: string;
	dayCount: DayCount;
	frequency: CompoundingFrequency;
	continuous: boolean;
}

export interface BondInputs {
	faceValue: number;
	couponRate: number;
	marketRate: number;
	termYears: number;
	paymentFrequency: Exclude<CompoundingFrequency, 'continuous'>;
}

export interface SimpleResultRow {
	periodEnd: string;
	fraction: number;
	interestThisPeriod: number;
	cumulativeInterest: number;
	cumulativeTotal: number;
}

export interface SimpleResult {
	interest: number;
	total: number;
	years: number;
	perPeriod: SimpleResultRow[];
}

export interface CompoundResultRow {
	periodIndex: number;
	periodEnd: string;
	balanceStart: number;
	interestThisPeriod: number;
	balanceEnd: number;
	cumulativeInterestOnPrincipal: number;
	cumulativeInterestOnInterest: number;
}

export interface CompoundResult {
	futureValue: number;
	interest: number;
	effectiveAnnualRate: number;
	continuousEquivalent: number;
	years: number;
	perPeriod: CompoundResultRow[];
}

export interface EirConversion {
	nominalRate: number;
	frequency: CompoundingFrequency;
	effectiveAnnualRate: number;
	continuousEquivalent: number;
}

export interface AmortisationRow {
	periodIndex: number;
	periodEnd: string;
	openingCarryingAmount: number;
	cashInterest: number;
	interestExpense: number;
	discountAmortisation: number;
	closingCarryingAmount: number;
}

export interface AmortisationSchedule {
	method: AmortisationMethod;
	issuePrice: number;
	totalInterestExpense: number;
	rows: AmortisationRow[];
}

export interface DivergencePoint {
	periodIndex: number;
	straightLineCarrying: number;
	eirCarrying: number;
	gap: number;
}

export interface EirResult {
	conversion: EirConversion;
	straightLine: AmortisationSchedule;
	eir: AmortisationSchedule;
	divergenceSeries: DivergencePoint[];
}

export interface InterestSnapshot {
	id: string;
	mode: InterestMode;
	label: string;
	inputsHash: string;
	summary: {
		principal: number;
		rate: number;
		termYears: number;
		resultHeadline: number;
		resultLabelKey: string;
	};
	createdAt: string;
}

export interface InterestState {
	mode: InterestMode;
	inputs: InterestInputs;
	bondInputs: BondInputs;
	snapshots: InterestSnapshot[];
}

export interface InterestKpis {
	nominalRate: number;
	effectiveAnnualRate: number;
	continuousEquivalent: number;
	principalRatio: number;
	periodCount: number;
}
