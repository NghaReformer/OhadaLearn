/**
 * Time Value of Money — public types.
 * Sign convention follows HP-12C: outflows negative, inflows positive.
 */

export type SolveMode = 'pv' | 'fv' | 'pmt' | 'rate' | 'periods';

export type CompoundingFrequency =
	| 'annual'
	| 'semi'
	| 'quarterly'
	| 'monthly'
	| 'daily'
	| 'continuous';

export type PaymentFrequency = Exclude<CompoundingFrequency, 'continuous'>;

export type PaymentTiming = 'end' | 'begin';

export type PeriodsUnit = 'years' | 'months';

export interface SolveInput {
	mode: SolveMode;
	pv?: number;
	fv?: number;
	pmt?: number;
	/** Nominal annual rate, as a percentage (e.g. 8.5 = 8.5%). */
	rate?: number;
	periods?: number;
	periodsUnit: PeriodsUnit;
	compoundingFrequency: CompoundingFrequency;
	paymentFrequency: PaymentFrequency;
	paymentTiming: PaymentTiming;
}

export interface WorkingStep {
	labelKey: string;
	expression: string;
	value: string;
}

export interface SolveResult {
	mode: SolveMode;
	value: number;
	signNote: 'inflow' | 'outflow' | 'neutral';
	/** Decimal periodic rate used in the solve (per payment period). */
	effectivePeriodicRate: number;
	/** Total number of payment periods. */
	totalPeriods: number;
	/** Unit in which the `periods` mode result is expressed. */
	periodsUnit: PeriodsUnit;
	/** i18n key for the symbolic formula displayed in Advanced mode. */
	formulaKey: string;
	workings: WorkingStep[];
}

export interface ValidationError {
	key: string;
	params?: Record<string, string | number>;
}

export interface ValidationResult {
	valid: boolean;
	errors: ValidationError[];
	warnings: ValidationError[];
}

export type PlaygroundGroup = 'core' | 'annuity' | 'investment';

export type AnnuityMode =
	| 'annuityPv'
	| 'annuityFv'
	| 'growingAnnuityPv'
	| 'growingAnnuityFv'
	| 'perpetuityPv'
	| 'growingPerpetuityPv'
	| 'ear';

export interface AnnuitySolveInput {
	mode: AnnuityMode;
	pmt?: number;
	rate?: number;
	growthRate?: number;
	periods?: number;
	periodsUnit: PeriodsUnit;
	compoundingFrequency: CompoundingFrequency;
	paymentFrequency: PaymentFrequency;
	paymentTiming: PaymentTiming;
}

export interface AnnuitySolveResult {
	mode: AnnuityMode;
	value: number;
	valueKind: 'currency' | 'rate';
	signNote: 'inflow' | 'outflow' | 'neutral';
	effectivePeriodicRate: number;
	effectivePeriodicGrowth: number | null;
	totalPeriods: number | null;
	formulaKey: string;
	workings: WorkingStep[];
}

export interface CashFlow {
	period: number;
	amount: number;
}

export interface InvestmentSolveInput {
	flows: CashFlow[];
	discountRate: number; // percent
	financeRate: number; // percent, for MIRR negative flows
	reinvestRate: number; // percent, for MIRR positive flows
	periodsPerYear: number;
}

export interface InvestmentMetrics {
	npv: number;
	irr: number | null; // percent
	mirr: number | null; // percent
	payback: number | null; // periods
	discountedPayback: number | null; // periods
	profitabilityIndex: number | null;
	totalInflow: number;
	totalOutflow: number;
}

export interface TVMPlaygroundState {
	group: PlaygroundGroup;
	/* ── Core group state ── */
	mode: SolveMode;
	pv: number | '';
	fv: number | '';
	pmt: number | '';
	rate: number | '';
	periods: number | '';
	periodsUnit: PeriodsUnit;
	compoundingFrequency: CompoundingFrequency;
	paymentFrequency: PaymentFrequency;
	paymentTiming: PaymentTiming;
	/* ── Annuity group state ── */
	annMode: AnnuityMode;
	annPmt: number | '';
	annRate: number | '';
	annGrowth: number | '';
	annPeriods: number | '';
	/* ── Investment group state ── */
	invFlows: CashFlow[];
	invDiscountRate: number | '';
	invFinanceRate: number | '';
	invReinvestRate: number | '';
	/* ── Shared ── */
	advancedOpen: boolean;
	selectedExerciseId: string | null;
	exerciseParams: Record<string, number> | null;
}
