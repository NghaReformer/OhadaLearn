<script lang="ts">
	import PlaygroundShell from '$lib/components/playground/PlaygroundShell.svelte';
	import { manifest } from './manifest';
	import { InterestEngine } from './engine';
	import type {
		BondInputs,
		CompoundResult,
		InterestInputs,
		InterestMode,
		InterestState,
		SimpleResult,
	} from './types';
	import type { LearnSection, Scenario, ExerciseTemplateFile } from '$lib/content/types';
	import ModeTabs from './components/ModeTabs.svelte';
	import InputsPanel from './components/InputsPanel.svelte';
	import BondInputsPanel from './components/BondInputsPanel.svelte';
	import RateSummaryStrip from './components/RateSummaryStrip.svelte';
	import SimpleGrowthChart from './components/SimpleGrowthChart.svelte';
	import CompoundGrowthChart from './components/CompoundGrowthChart.svelte';
	import DivergenceRibbon from './components/DivergenceRibbon.svelte';
	import ScheduleTable from './components/ScheduleTable.svelte';

	let {
		learnSections = [],
		scenarios = [],
		exercises = [],
	}: {
		learnSections?: LearnSection[];
		scenarios?: Scenario[];
		exercises?: ExerciseTemplateFile[];
	} = $props();

	const engine = new InterestEngine();

	const defaultInputs: InterestInputs = {
		principal: 1_000_000,
		nominalRate: 0.1,
		startDate: new Date().toISOString().slice(0, 10),
		endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 5))
			.toISOString()
			.slice(0, 10),
		dayCount: '30/360',
		frequency: 'annual',
		continuous: false,
	};

	const defaultBondInputs: BondInputs = {
		faceValue: 1_000_000,
		couponRate: 0.08,
		marketRate: 0.1,
		termYears: 5,
		paymentFrequency: 'annual',
	};

	const stateDefaults = {
		mode: 'simple' as InterestMode,
		inputs: defaultInputs,
		bondInputs: defaultBondInputs,
		snapshots: [],
	} satisfies InterestState;

	const shareableKeys = ['mode', 'inputs', 'bondInputs', 'snapshots'];
</script>

<PlaygroundShell
	{manifest}
	storeKey="interest_v1"
	{stateDefaults}
	{learnSections}
	{scenarios}
	{exercises}
	{shareableKeys}
>
	{#snippet playground(state, updateState)}
		{@const typedState = state as unknown as InterestState}
		{@const mode = typedState.mode ?? 'simple'}
		{@const inputs = typedState.inputs ?? defaultInputs}
		{@const bondInputs = typedState.bondInputs ?? defaultBondInputs}

		{@const simpleResult =
			mode === 'simple' ? engine.simple(inputs) : (null as SimpleResult | null)}
		{@const compoundResult =
			mode === 'compound' ? engine.compound(inputs) : (null as CompoundResult | null)}
		{@const eirResult = mode === 'effective' ? engine.eirAnalysis(bondInputs) : null}

		{@const rateNominal = mode === 'effective' ? bondInputs.marketRate : inputs.nominalRate}
		{@const rateFreq = mode === 'effective' ? bondInputs.paymentFrequency : inputs.frequency}
		{@const rateEir = engine.nominalToEir(rateNominal, rateFreq)}
		{@const rateContinuous = Math.log(1 + rateEir)}

		<div class="int-layout">
			<aside class="int-sidebar">
				<InputsPanel
					{inputs}
					onChange={(patch) => updateState({ inputs: { ...inputs, ...patch } })}
				/>
				{#if mode === 'effective'}
					<BondInputsPanel
						{bondInputs}
						onChange={(patch) => updateState({ bondInputs: { ...bondInputs, ...patch } })}
					/>
				{/if}
			</aside>

			<main class="int-workspace">
				<ModeTabs {mode} onChange={(m) => updateState({ mode: m })} />

				<RateSummaryStrip
					nominal={rateNominal}
					eir={rateEir}
					continuousEquivalent={rateContinuous}
				/>

				{#if mode === 'simple' && simpleResult}
					<SimpleGrowthChart {inputs} result={simpleResult} />
				{:else if mode === 'compound' && compoundResult}
					<CompoundGrowthChart
						{inputs}
						result={compoundResult}
						showContinuous={inputs.continuous || inputs.frequency === 'continuous'}
					/>
				{:else if mode === 'effective' && eirResult}
					<DivergenceRibbon result={eirResult} />
					<div class="int-schedules">
						<ScheduleTable schedule={eirResult.straightLine} />
						<ScheduleTable schedule={eirResult.eir} />
					</div>
				{/if}
			</main>
		</div>
	{/snippet}
</PlaygroundShell>

<style>
	.int-layout {
		display: grid;
		grid-template-columns: minmax(280px, 340px) 1fr;
		gap: 1.25rem;
		padding: 1.25rem;
		min-height: 0;
		height: 100%;
	}

	.int-sidebar {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		min-width: 0;
	}

	.int-workspace {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		min-width: 0;
	}

	.int-schedules {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
		gap: 1rem;
	}

	@media (max-width: 1180px) {
		.int-layout,
		.int-schedules {
			grid-template-columns: 1fr;
		}
	}
</style>
