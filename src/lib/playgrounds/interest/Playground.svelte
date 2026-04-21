<script lang="ts">
	import PlaygroundShell from '$lib/components/playground/PlaygroundShell.svelte';
	import { manifest } from './manifest';
	import type { BondInputs, InterestInputs, InterestMode, InterestState } from './types';
	import type { LearnSection, Scenario, ExerciseTemplateFile } from '$lib/content/types';
	import ModeTabs from './components/ModeTabs.svelte';
	import InputsPanel from './components/InputsPanel.svelte';
	import BondInputsPanel from './components/BondInputsPanel.svelte';
	import ScenarioFramingBlock from './components/ScenarioFramingBlock.svelte';
	import SimpleMode from './components/SimpleMode.svelte';
	import CompoundMode from './components/CompoundMode.svelte';
	import EffectiveMode from './components/EffectiveMode.svelte';

	let {
		learnSections = [],
		scenarios = [],
		exercises = [],
	}: {
		learnSections?: LearnSection[];
		scenarios?: Scenario[];
		exercises?: ExerciseTemplateFile[];
	} = $props();

	const defaultInputs: InterestInputs = {
		principal: 1_000_000,
		nominalRate: 0.1,
		startDate: new Date().toISOString().slice(0, 10),
		endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 5))
			.toISOString()
			.slice(0, 10),
		dayCount: '30/360',
		// Default to monthly so Compound mode shows a visibly curved line at
		// 10%/5y (vs. the near-flat line produced by annual compounding).
		frequency: 'monthly',
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
		scenarioSlug: null as string | null,
	};

	const shareableKeys = ['mode', 'inputs', 'bondInputs', 'snapshots', 'scenarioSlug'];
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
		{@const typedState = state as unknown as InterestState & { scenarioSlug: string | null }}
		{@const mode = typedState.mode ?? 'simple'}
		{@const inputs = typedState.inputs ?? defaultInputs}
		{@const bondInputs = typedState.bondInputs ?? defaultBondInputs}
		{@const scenarioSlug = typedState.scenarioSlug ?? null}

		<div class="int-layout">
			<aside class="int-sidebar">
				<InputsPanel
					{inputs}
					onChange={(patch) =>
						updateState({ inputs: { ...inputs, ...patch }, scenarioSlug: null })}
				/>
				{#if mode === 'effective'}
					<BondInputsPanel
						{bondInputs}
						onChange={(patch) =>
							updateState({
								bondInputs: { ...bondInputs, ...patch },
								scenarioSlug: null,
							})}
					/>
				{/if}
			</aside>

			<main class="int-workspace">
				<ModeTabs {mode} onChange={(m) => updateState({ mode: m })} />

				<ScenarioFramingBlock {scenarioSlug} />

				{#if mode === 'simple'}
					<SimpleMode
						{inputs}
						onApplyInputs={(patch) =>
							updateState({ inputs: { ...inputs, ...patch }, scenarioSlug: null })}
					/>
				{:else if mode === 'compound'}
					<CompoundMode
						{inputs}
						onApplyInputs={(patch) =>
							updateState({ inputs: { ...inputs, ...patch }, scenarioSlug: null })}
					/>
				{:else if mode === 'effective'}
					<EffectiveMode
						{bondInputs}
						onApplyBondInputs={(patch) =>
							updateState({
								bondInputs: { ...bondInputs, ...patch },
								scenarioSlug: null,
							})}
					/>
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
		align-self: start;
		position: sticky;
		top: 1.25rem;
	}

	.int-workspace {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		min-width: 0;
	}

	@media (max-width: 1180px) {
		.int-layout {
			grid-template-columns: 1fr;
		}

		.int-sidebar {
			position: static;
		}
	}
</style>
