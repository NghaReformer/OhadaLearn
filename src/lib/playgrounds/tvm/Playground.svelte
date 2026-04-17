<script lang="ts">
	import PlaygroundShell from '$lib/components/playground/PlaygroundShell.svelte';
	import { manifest } from './manifest';
	import { TVMEngine } from './engine';
	import type {
		SolveInput,
		SolveMode,
		TVMPlaygroundState
	} from './types';
	import type { LearnSection, Scenario, ExerciseTemplateFile } from '$lib/content/types';
	import SolverPanel from './components/SolverPanel.svelte';
	import ResultCard from './components/ResultCard.svelte';
	import WorkingsPanel from './components/WorkingsPanel.svelte';

	let {
		learnSections = [],
		scenarios = [],
		exercises = []
	}: {
		learnSections?: LearnSection[];
		scenarios?: Scenario[];
		exercises?: ExerciseTemplateFile[];
	} = $props();

	const engine = new TVMEngine();

	const stateDefaults: Record<string, unknown> = {
		mode: 'fv',
		pv: -100000,
		fv: '',
		pmt: 0,
		rate: 8,
		periods: 10,
		periodsUnit: 'years',
		compoundingFrequency: 'annual',
		paymentFrequency: 'annual',
		paymentTiming: 'end',
		advancedOpen: false,
		selectedExerciseId: null,
		exerciseParams: null
	} satisfies Record<string, unknown>;

	const shareableKeys: Array<keyof TVMPlaygroundState> = [
		'mode',
		'pv',
		'fv',
		'pmt',
		'rate',
		'periods',
		'periodsUnit',
		'compoundingFrequency',
		'paymentFrequency',
		'paymentTiming'
	];

	function toSolveInput(state: TVMPlaygroundState): SolveInput {
		return {
			mode: state.mode,
			pv: state.mode === 'pv' ? undefined : typeof state.pv === 'number' ? state.pv : undefined,
			fv: state.mode === 'fv' ? undefined : typeof state.fv === 'number' ? state.fv : undefined,
			pmt: state.mode === 'pmt' ? undefined : typeof state.pmt === 'number' ? state.pmt : 0,
			rate: state.mode === 'rate' ? undefined : typeof state.rate === 'number' ? state.rate : undefined,
			periods:
				state.mode === 'periods'
					? undefined
					: typeof state.periods === 'number'
						? state.periods
						: undefined,
			periodsUnit: state.periodsUnit,
			compoundingFrequency: state.compoundingFrequency,
			paymentFrequency: state.paymentFrequency,
			paymentTiming: state.paymentTiming
		};
	}
</script>

<PlaygroundShell
	{manifest}
	storeKey="tvm_v1"
	{stateDefaults}
	{learnSections}
	{scenarios}
	{exercises}
	shareableKeys={shareableKeys as string[]}
>
	{#snippet playground(rawState, updateState)}
		{@const state = rawState as unknown as TVMPlaygroundState}
		{@const solveInput = toSolveInput(state)}
		{@const validation = engine.validate(solveInput)}
		{@const result = validation.valid ? engine.solve(solveInput) : null}

		<div class="tvm-layout">
			<div class="tvm-inputs">
				<SolverPanel
					{state}
					onUpdate={(partial) => updateState(partial as Record<string, unknown>)}
				/>
			</div>

			<div class="tvm-output">
				<ResultCard {result} {validation} />
				<WorkingsPanel
					{result}
					open={state.advancedOpen}
					onToggle={(next) => updateState({ advancedOpen: next })}
				/>
			</div>
		</div>
	{/snippet}
</PlaygroundShell>

<style>
	.tvm-layout {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1.1fr);
		gap: 1.25rem;
		padding: 1.25rem;
	}

	.tvm-inputs,
	.tvm-output {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		min-width: 0;
	}

	@media (max-width: 960px) {
		.tvm-layout {
			grid-template-columns: 1fr;
			padding: 1rem;
			gap: 1rem;
		}
	}
</style>
