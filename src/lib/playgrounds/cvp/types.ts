export type ChartView = 'classic' | 'pv' | 'stack';

export type TableTab = 'results' | 'sensitivity';

export type RightPanelTab = 'whatif' | 'compare';

export type CVPMode = 'simple' | 'advanced';

export type SensitivityVar = 'price' | 'volume' | 'variableCost' | 'fixedCosts';

export type SensitivityMetric =
	| 'operatingIncome'
	| 'totalCM'
	| 'bepUnits'
	| 'mosPct'
	| 'dol';

export type GoalSeekVariable =
	| 'price'
	| 'variableCost'
	| 'fixedCosts'
	| 'volume'
	| 'targetProfit'
	| 'taxRate';

export interface OverlayToggles {
	bep: boolean;
	target: boolean;
	mos: boolean;
	dol: boolean;
}

export interface WhatIfAdjustments {
	price: number;
	volume: number;
	variableCost: number;
	fixedCosts: number;
}

export interface IndifferenceInputs {
	fcA: number;
	vA: number;
	fcB: number;
	vB: number;
}

export interface SensitivityConfig {
	targetMetric: SensitivityMetric;
	rowVar: SensitivityVar;
	colVar: SensitivityVar;
	pctRange: number;
	numSteps: number;
}

export interface Product {
	name: string;
	price: number;
	variableCost: number;
	mixPct: number;
}

export interface CVPPlaygroundState {
	mode: CVPMode;
	price: number;
	variableCost: number;
	fixedCosts: number;
	volume: number;
	targetProfit: number;
	taxRate: number;
	products: Product[];
	multiProduct: boolean;
	indifference: IndifferenceInputs;
	chartView: ChartView;
	overlays: OverlayToggles;
	tableTab: TableTab;
	sensitivity: SensitivityConfig;
	whatIf: WhatIfAdjustments;
	rightTab: RightPanelTab;
	selectedExerciseId: string | null;
	exerciseParams: Record<string, number> | null;
}

export interface CVPSingleResult {
	// Per-unit
	price: number;
	variableCost: number;
	cm: number;
	cmRatio: number;
	// Totals
	totalRevenue: number;
	totalVC: number;
	totalCM: number;
	fc: number;
	operatingIncome: number;
	oiPerUnit: number;
	oiRatio: number;
	// Tax & net income
	taxExpense: number;
	netIncome: number;
	// Break-even
	bepUnits: number;
	bepRevenue: number;
	// Target
	targetUnits: number;
	targetRevenue: number;
	targetProfit: number;
	// After-tax
	afterTaxUnits: number;
	afterTaxRevenue: number;
	preTaxTarget: number;
	// Margin of safety
	mosUnits: number;
	mosRevenue: number;
	mosPct: number;
	// Operating leverage
	dol: number;
	// Meta
	isProfit: boolean;
	volume: number;
	taxRate: number;
}

export interface MultiProductPerProduct {
	name: string;
	price: number;
	variableCost: number;
	cm: number;
	cmRatio: number;
	mix: number;
	mixPct: number;
	bepUnits: number;
	bepRevenue: number;
}

export interface CVPMultiResult {
	weightedCM: number;
	weightedCMRatio: number;
	bepTotalUnits: number;
	bepTotalRevenue: number;
	targetTotalUnits: number;
	afterTaxTotalUnits: number;
	preTaxTarget: number;
	perProduct: MultiProductPerProduct[];
	fc: number;
	targetProfit: number;
	taxRate: number;
	error?: true;
	errorType?: 'mixTotal';
	totalMixPct?: number;
}

export interface IndifferenceResult {
	volume: number;
	parallel: boolean;
	dominated: boolean;
	dominator: 'A' | 'B' | null;
	cheaperBelow: 'A' | 'B' | null;
	cheaperAbove: 'A' | 'B' | null;
}

export interface SensitivityResult {
	rows: number[][];
	rowValues: number[];
	colValues: number[];
}

export interface GoalSeekResult {
	success: boolean;
	value?: number;
	iterations?: number;
	approximate?: boolean;
	reason?: string;
}

export interface CVPExerciseParams {
	price: number;
	variableCost: number;
	fixedCosts: number;
	volume?: number;
	targetProfit?: number;
	taxRate?: number;
}
