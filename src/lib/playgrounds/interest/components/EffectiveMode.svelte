<script lang="ts">
	import { InterestEngine } from '../engine';
	import { solveBondMarketRate, solveBondCouponRate, solveBondFaceValue } from '../solvers';
	import type { BondInputs } from '../types';
	import DivergenceRibbon from './DivergenceRibbon.svelte';
	import ScheduleTable from './ScheduleTable.svelte';
	import FormulaPanel from './FormulaPanel.svelte';
	import WhatIfPanel, { type WhatIfSliderDef, type WhatIfMetricDef } from './WhatIfPanel.svelte';
	import GoalSeekPanel, { type GoalSeekVariableDef, type GoalSeekTargetDef } from './GoalSeekPanel.svelte';

	let {
		bondInputs,
		onApplyBondInputs,
	}: {
		bondInputs: BondInputs;
		onApplyBondInputs: (patch: Partial<BondInputs>) => void;
	} = $props();

	const engine = new InterestEngine();

	let result = $derived(engine.eirAnalysis(bondInputs));

	let whatIfAdjustments = $state<Record<string, number>>({
		faceValue: 0,
		couponRate: 0,
		marketRate: 0,
		termYears: 0,
	});

	let whatIfSliders: WhatIfSliderDef[] = [
		{ key: 'faceValue', labelKey: 'int.whatif.faceValue', min: -50, max: 100 },
		{ key: 'couponRate', labelKey: 'int.whatif.couponRate', min: -50, max: 100 },
		{ key: 'marketRate', labelKey: 'int.whatif.marketRate', min: -50, max: 100 },
		{ key: 'termYears', labelKey: 'int.whatif.term', min: -50, max: 100 },
	];

	let whatIfAdjustedBond = $derived<BondInputs>({
		...bondInputs,
		faceValue: bondInputs.faceValue * (1 + whatIfAdjustments.faceValue / 100),
		couponRate: Math.max(0, bondInputs.couponRate * (1 + whatIfAdjustments.couponRate / 100)),
		marketRate: Math.max(0.001, bondInputs.marketRate * (1 + whatIfAdjustments.marketRate / 100)),
		termYears: Math.max(0.5, bondInputs.termYears * (1 + whatIfAdjustments.termYears / 100)),
	});

	let whatIfIssuePrice = $derived(engine.issuePrice(whatIfAdjustedBond));
	let whatIfSchedule = $derived(engine.buildSchedule(whatIfAdjustedBond, 'eir'));

	let whatIfMetrics: WhatIfMetricDef[] = $derived([
		{
			labelKey: 'int.kpi.issuePrice',
			baseValue: result.eir.issuePrice,
			adjustedValue: whatIfIssuePrice,
			format: 'currency',
		},
		{
			labelKey: 'int.kpi.totalInterestExpense',
			baseValue: result.eir.totalInterestExpense,
			adjustedValue: whatIfSchedule.totalInterestExpense,
			format: 'currency',
		},
	]);

	function resetWhatIf() {
		whatIfAdjustments = { faceValue: 0, couponRate: 0, marketRate: 0, termYears: 0 };
	}

	let gsVariables: GoalSeekVariableDef[] = [
		{ key: 'marketRate', labelKey: 'int.goalseek.varMarketRate', unit: 'percent' },
		{ key: 'couponRate', labelKey: 'int.goalseek.varCouponRate', unit: 'percent' },
		{ key: 'faceValue', labelKey: 'int.goalseek.varFaceValue', unit: 'currency' },
	];

	let gsTarget: GoalSeekTargetDef = {
		key: 'issuePrice',
		labelKey: 'int.kpi.issuePrice',
		unit: 'currency',
	};

	function runGoalSeek(variableKey: string, targetValue: number) {
		if (variableKey === 'marketRate') return solveBondMarketRate(bondInputs, targetValue);
		if (variableKey === 'couponRate') return solveBondCouponRate(bondInputs, targetValue);
		if (variableKey === 'faceValue') return solveBondFaceValue(bondInputs, targetValue);
		return { success: false as const, reason: 'invalid-input' as const };
	}

	function applyGoalSeek(variableKey: string, value: number) {
		if (variableKey === 'marketRate') onApplyBondInputs({ marketRate: value });
		else if (variableKey === 'couponRate') onApplyBondInputs({ couponRate: value });
		else if (variableKey === 'faceValue') onApplyBondInputs({ faceValue: value });
	}
</script>

<FormulaPanel mode="effective" />

<DivergenceRibbon {result} />

<div class="schedules">
	<ScheduleTable schedule={result.straightLine} />
	<ScheduleTable schedule={result.eir} />
</div>

<div class="advanced-grid">
	<WhatIfPanel
		titleKey="int.whatif.title"
		hintKey="int.whatif.effectiveHint"
		sliders={whatIfSliders}
		adjustments={whatIfAdjustments}
		metrics={whatIfMetrics}
		onChange={(patch) => (whatIfAdjustments = { ...whatIfAdjustments, ...patch })}
		onReset={resetWhatIf}
	/>
	<GoalSeekPanel
		titleKey="int.goalseek.title"
		variables={gsVariables}
		target={gsTarget}
		solve={runGoalSeek}
		onApply={applyGoalSeek}
	/>
</div>

<style>
	.schedules {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
		gap: 1rem;
	}

	.advanced-grid {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
		gap: 1rem;
	}

	@media (max-width: 1180px) {
		.schedules,
		.advanced-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
