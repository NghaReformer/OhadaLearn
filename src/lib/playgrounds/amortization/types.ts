/**
 * Amortization domain types.
 * All monetary values in minor-currency units as numbers.
 * Rates are decimals (0.055 for 5.5%).
 */

export type AmortMethod = 'annuity' | 'linear' | 'bullet' | 'progressive' | 'balloon';

export type Frequency = 'monthly' | 'quarterly' | 'semiannual' | 'annual' | 'custom';

export type GraceType = 'none' | 'partial' | 'total';

export type DayCount = '30/360' | 'actual/365' | 'actual/360' | 'actual/actual';

export type InsuranceBasis = 'initial' | 'remaining';

export interface VariableRateRow {
	fromPeriod: number;
	newRate: number;
}

export interface GraceConfig {
	type: GraceType;
	periods: number;
}

export interface InsuranceConfig {
	rate: number;
	basis: InsuranceBasis;
}

export interface FeesConfig {
	origination: number;
	prepaymentPenaltyPct: number;
}

export interface ExtrasConfig {
	perPeriod: number;
	lumpSum: number;
	lumpPeriod: number;
}

export interface AmortizationInputs {
	principal: number;
	nominalRate: number;
	termPeriods: number;
	frequency: Frequency;
	customPeriodsPerYear: number;
	method: AmortMethod;
	dayCount: DayCount;
	startDate: string;
	firstPaymentDate: string;
	grace: GraceConfig;
	insurance: InsuranceConfig;
	fees: FeesConfig;
	variableRates: VariableRateRow[];
	extras: ExtrasConfig;
	balloonDueAt: number;
	progressiveStep: number;
}

export type RowFlag =
	| 'grace-partial'
	| 'grace-total'
	| 'rate-change'
	| 'extra'
	| 'lump'
	| 'balloon'
	| 'final';

export interface AmortizationScheduleRow {
	period: number;
	date: string;
	ratePerPeriod: number;
	openingBalance: number;
	scheduledPayment: number;
	interest: number;
	principal: number;
	insurance: number;
	extra: number;
	totalPayment: number;
	closingBalance: number;
	flags: RowFlag[];
}

export interface AmortizationTotals {
	principal: number;
	interest: number;
	insurance: number;
	paid: number;
	fees: number;
}

export interface AmortizationResult {
	rows: AmortizationScheduleRow[];
	totals: AmortizationTotals;
	lastPeriod: number;
}

export interface AmortizationKpis {
	firstPayment: number;
	totalInterest: number;
	totalInsurance: number;
	totalPaid: number;
	apr: number;
	effectiveAnnualRate: number;
	interestToPrincipalRatio: number;
	balloonAmount: number | null;
}

export type SolveFor = 'payment' | 'principal' | 'rate' | 'term';

export interface SolverInputs {
	solveFor: SolveFor;
	knownPrincipal?: number;
	knownRate?: number;
	knownTerm?: number;
	knownPayment?: number;
	frequency: Frequency;
	method: AmortMethod;
}

export interface SolverResult {
	solveFor: SolveFor;
	value: number;
	iterations: number;
	converged: boolean;
}

export type LifecycleStage =
	| 'disbursement'
	| 'periodic-payment'
	| 'grace-capitalization'
	| 'insurance-premium'
	| 'prepayment'
	| 'final-payment';

export interface JournalEntryLine {
	accountKey: string;
	debit: number;
	credit: number;
}

export interface LifecycleJournalEntry {
	stage: LifecycleStage;
	labelKey: string;
	descKey: string;
	lines: JournalEntryLine[];
	narrationKey?: string;
	sampleAmount?: number;
}

export interface LifecycleJournalEntries {
	entries: LifecycleJournalEntry[];
}

export interface AmortizationPlaygroundState {
	inputs: AmortizationInputs;
	selectedChart: 'stacked' | 'balance' | 'donut' | 'cumulative';
	chartOverlays: Record<string, boolean>;
	selectedStage: LifecycleStage;
	selectedExerciseId: string | null;
	exerciseParams: Record<string, number | string> | null;
	solverInputs: Partial<SolverInputs> | null;
}
