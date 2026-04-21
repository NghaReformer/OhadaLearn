<script lang="ts">
	import { InterestEngine } from '../engine';
	import type { InterestInputs } from '../types';
	import CompoundGrowthChart from './CompoundGrowthChart.svelte';
	import ComputedSummary from './ComputedSummary.svelte';
	import FormulaPanel from './FormulaPanel.svelte';

	let { inputs }: { inputs: InterestInputs } = $props();

	const engine = new InterestEngine();

	let result = $derived(engine.compound(inputs));

	// Show continuous overlay automatically when frequency=continuous OR toggle is on;
	// but hide the separate toggle-driven overlay when frequency is already continuous.
	let showContinuous = $derived(inputs.frequency !== 'continuous' && inputs.continuous);
</script>

<ComputedSummary
	interest={result.interest}
	total={result.futureValue}
	principal={inputs.principal}
	effectiveRate={result.effectiveAnnualRate}
/>

<FormulaPanel
	mode="compound"
	continuous={inputs.frequency === 'continuous'}
/>

<CompoundGrowthChart {inputs} {result} {showContinuous} />
