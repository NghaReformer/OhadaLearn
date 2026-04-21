<script lang="ts">
	import { InterestEngine } from '../engine';
	import type { BondInputs } from '../types';
	import DivergenceRibbon from './DivergenceRibbon.svelte';
	import ScheduleTable from './ScheduleTable.svelte';
	import FormulaPanel from './FormulaPanel.svelte';

	let { bondInputs }: { bondInputs: BondInputs } = $props();

	const engine = new InterestEngine();

	// Memoized: the blocker fix. eirAnalysis only recomputes when bondInputs changes.
	let result = $derived(engine.eirAnalysis(bondInputs));
</script>

<FormulaPanel mode="effective" />

<DivergenceRibbon {result} />

<div class="schedules">
	<ScheduleTable schedule={result.straightLine} />
	<ScheduleTable schedule={result.eir} />
</div>

<style>
	.schedules {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
		gap: 1rem;
	}

	@media (max-width: 1180px) {
		.schedules {
			grid-template-columns: 1fr;
		}
	}
</style>
