<script lang="ts">
	import { InterestEngine } from '../engine';
	import type { InterestInputs } from '../types';
	import SimpleGrowthChart from './SimpleGrowthChart.svelte';
	import ComputedSummary from './ComputedSummary.svelte';
	import FormulaPanel from './FormulaPanel.svelte';

	let { inputs }: { inputs: InterestInputs } = $props();

	const engine = new InterestEngine();

	// Memoized: only recompute when inputs actually change.
	let result = $derived(engine.simple(inputs));

	// Overlay compound curve for side-by-side comparison (user request).
	let compoundResult = $derived(engine.compound(inputs));
</script>

<ComputedSummary
	interest={result.interest}
	total={result.total}
	principal={inputs.principal}
/>

<FormulaPanel mode="simple" />

<SimpleGrowthChart {inputs} {result} {compoundResult} />
