<script lang="ts">
	import { InterestEngine } from '../engine';
	import { solveCompoundCell, type CompoundRowKey } from '../solvers';
	import type { InterestInputs } from '../types';
	import CompoundGrowthChart from './CompoundGrowthChart.svelte';
	import CompoundScheduleTable, {
		type CompoundCellGoalSeekEvent,
	} from './CompoundScheduleTable.svelte';
	import ComputedSummary from './ComputedSummary.svelte';
	import FormulaPanel from './FormulaPanel.svelte';
	import WhatIfPanel, { type WhatIfSliderDef, type WhatIfMetricDef } from './WhatIfPanel.svelte';
	import GoalSeekPopover, {
		type GoalSeekContext,
		type GoalSeekVariable,
	} from './GoalSeekPopover.svelte';
	import RegimeComparison from './RegimeComparison.svelte';

	let {
		inputs,
		onApplyInputs,
	}: {
		inputs: InterestInputs;
		onApplyInputs: (patch: Partial<InterestInputs>) => void;
	} = $props();

	const engine = new InterestEngine();

	let result = $derived(engine.compound(inputs));
	let showContinuous = $derived(inputs.frequency !== 'continuous' && inputs.continuous);

	let whatIfAdjustments = $state<Record<string, number>>({ principal: 0, nominalRate: 0, term: 0 });

	let whatIfSliders: WhatIfSliderDef[] = [
		{ key: 'principal', labelKey: 'int.whatif.principal', min: -50, max: 100 },
		{ key: 'nominalRate', labelKey: 'int.whatif.rate', min: -50, max: 100 },
		{ key: 'term', labelKey: 'int.whatif.term', min: -50, max: 100 },
	];

	let whatIfAdjustedInputs = $derived.by<InterestInputs>(() => {
		const startMs = new Date(inputs.startDate + 'T00:00:00Z').getTime();
		const endMs = new Date(inputs.endDate + 'T00:00:00Z').getTime();
		const baseYears = (endMs - startMs) / (365.25 * 86400000);
		const newYears = Math.max(0.01, baseYears * (1 + whatIfAdjustments.term / 100));
		const newEndMs = startMs + newYears * 365.25 * 86400000;
		return {
			...inputs,
			principal: inputs.principal * (1 + whatIfAdjustments.principal / 100),
			nominalRate: Math.max(0, inputs.nominalRate * (1 + whatIfAdjustments.nominalRate / 100)),
			endDate: new Date(newEndMs).toISOString().slice(0, 10),
		};
	});

	let whatIfResult = $derived(engine.compound(whatIfAdjustedInputs));

	let whatIfMetrics: WhatIfMetricDef[] = $derived([
		{
			labelKey: 'int.summary.interest',
			baseValue: result.interest,
			adjustedValue: whatIfResult.interest,
			format: 'currency',
		},
		{
			labelKey: 'int.kpi.futureValue',
			baseValue: result.futureValue,
			adjustedValue: whatIfResult.futureValue,
			format: 'currency',
		},
		{
			labelKey: 'int.rate.effective.label',
			baseValue: result.effectiveAnnualRate,
			adjustedValue: whatIfResult.effectiveAnnualRate,
			format: 'percent',
		},
	]);

	function resetWhatIf() {
		whatIfAdjustments = { principal: 0, nominalRate: 0, term: 0 };
	}

	// Contextual goal-seek
	interface PopoverState {
		context: GoalSeekContext;
		position: { x: number; y: number };
		rowIndex: number;
		colKey: CompoundRowKey;
	}
	let popover = $state<PopoverState | null>(null);

	const gsVariables: GoalSeekVariable[] = [
		{ key: 'nominalRate', labelKey: 'int.goalseek.varRate', unit: 'percent' },
		{ key: 'years', labelKey: 'int.goalseek.varYears', unit: 'years' },
		{ key: 'principal', labelKey: 'int.goalseek.varPrincipal', unit: 'currency' },
	];

	function handleCellGoalSeek(ev: CompoundCellGoalSeekEvent) {
		popover = {
			context: {
				columnLabelKey: ev.columnLabelKey,
				periodLabel: String(ev.rowIndex + 1),
				currentValue: ev.currentValue,
				cellUnit: 'currency',
			},
			position: ev.position,
			rowIndex: ev.rowIndex,
			colKey: ev.colKey,
		};
	}

	function popoverSolve(variableKey: string, target: number) {
		if (!popover) return { success: false as const, reason: 'invalid-input' as const };
		return solveCompoundCell(
			inputs,
			popover.rowIndex,
			popover.colKey,
			target,
			variableKey as 'nominalRate' | 'principal' | 'years',
		);
	}

	function popoverApply(variableKey: string, value: number) {
		if (variableKey === 'nominalRate') {
			onApplyInputs({ nominalRate: value });
		} else if (variableKey === 'principal') {
			onApplyInputs({ principal: value });
		} else if (variableKey === 'years') {
			const startMs = new Date(inputs.startDate + 'T00:00:00Z').getTime();
			const endMs = startMs + value * 365.25 * 86400000;
			onApplyInputs({ endDate: new Date(endMs).toISOString().slice(0, 10) });
		}
	}
</script>

<ComputedSummary
	interest={result.interest}
	total={result.futureValue}
	principal={inputs.principal}
	effectiveRate={result.effectiveAnnualRate}
/>

<FormulaPanel mode="compound" continuous={inputs.frequency === 'continuous'} />

<CompoundGrowthChart {inputs} {result} {showContinuous} />

<CompoundScheduleTable {result} onGoalSeek={handleCellGoalSeek} />

<RegimeComparison {inputs} />

<WhatIfPanel
	titleKey="int.whatif.title"
	hintKey="int.whatif.compoundHint"
	sliders={whatIfSliders}
	adjustments={whatIfAdjustments}
	metrics={whatIfMetrics}
	onChange={(patch) => (whatIfAdjustments = { ...whatIfAdjustments, ...patch })}
	onReset={resetWhatIf}
/>

{#if popover}
	<GoalSeekPopover
		position={popover.position}
		context={popover.context}
		variables={gsVariables}
		solve={popoverSolve}
		onApply={popoverApply}
		onClose={() => (popover = null)}
	/>
{/if}
