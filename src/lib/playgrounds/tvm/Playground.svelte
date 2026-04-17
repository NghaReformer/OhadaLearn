<script lang="ts">
	import { t } from '$lib/i18n';
	import PlaygroundShell from '$lib/components/playground/PlaygroundShell.svelte';
	import { manifest } from './manifest';
	import { TVMEngine } from './engine';
	import type {
		PlaygroundGroup,
		SolveInput,
		SolveMode,
		TVMPlaygroundState
	} from './types';
	import type { LearnSection, Scenario, ExerciseTemplateFile } from '$lib/content/types';
	import SolverPanel from './components/SolverPanel.svelte';
	import ResultCard from './components/ResultCard.svelte';
	import WorkingsPanel from './components/WorkingsPanel.svelte';
	import AnnuityPanel from './components/AnnuityPanel.svelte';
	import InvestmentPanel from './components/InvestmentPanel.svelte';

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
		group: 'core',
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
		annMode: 'annuityPv',
		annPmt: 5000,
		annRate: 8,
		annGrowth: '',
		annPeriods: 20,
		invFlows: [
			{ period: 0, amount: -100000 },
			{ period: 1, amount: 30000 },
			{ period: 2, amount: 30000 },
			{ period: 3, amount: 30000 },
			{ period: 4, amount: 30000 },
			{ period: 5, amount: 30000 }
		],
		invDiscountRate: 8,
		invFinanceRate: 10,
		invReinvestRate: 8,
		advancedOpen: false,
		selectedExerciseId: null,
		exerciseParams: null
	} satisfies Record<string, unknown>;

	const shareableKeys: Array<keyof TVMPlaygroundState> = [
		'group',
		'mode',
		'pv',
		'fv',
		'pmt',
		'rate',
		'periods',
		'periodsUnit',
		'compoundingFrequency',
		'paymentFrequency',
		'paymentTiming',
		'annMode',
		'annPmt',
		'annRate',
		'annGrowth',
		'annPeriods',
		'invDiscountRate',
		'invFinanceRate',
		'invReinvestRate',
		'invFlows'
	];

	const groups: PlaygroundGroup[] = ['core', 'annuity', 'investment'];
	let groupPillRefs: HTMLButtonElement[] = [];

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
		{@const group = state.group ?? 'core'}

		<div class="tvm-root">
			<!-- Group selector -->
			<div class="group-picker">
				<span class="group-label" id="tvm-group-label">{$t('tvm.group.selector')}</span>
				<div
					class="group-pills"
					role="tablist"
					aria-labelledby="tvm-group-label"
					tabindex={-1}
					onkeydown={(e) => {
						const cur = groups.indexOf(group);
						if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
							e.preventDefault();
							const n = (cur + 1) % groups.length;
							updateState({ group: groups[n] });
							groupPillRefs[n]?.focus();
						} else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
							e.preventDefault();
							const n = (cur - 1 + groups.length) % groups.length;
							updateState({ group: groups[n] });
							groupPillRefs[n]?.focus();
						}
					}}
				>
					{#each groups as g, i (g)}
						<button
							bind:this={groupPillRefs[i]}
							class="group-pill"
							class:active={group === g}
							type="button"
							role="tab"
							aria-selected={group === g}
							tabindex={group === g ? 0 : -1}
							onclick={() => updateState({ group: g })}
						>
							{$t(`tvm.group.${g}`)}
						</button>
					{/each}
				</div>
			</div>

			{#if group === 'annuity'}
				<AnnuityPanel
					{state}
					onUpdate={(partial) => updateState(partial as Record<string, unknown>)}
				/>
			{:else if group === 'investment'}
				<InvestmentPanel
					{state}
					onUpdate={(partial) => updateState(partial as Record<string, unknown>)}
				/>
			{:else}
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
			{/if}
		</div>
	{/snippet}
</PlaygroundShell>

<style>
	.tvm-root {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
		padding: 1.25rem;
	}

	.group-picker {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
	}

	.group-label {
		font-family: var(--font-body);
		font-size: 0.6875rem;
		font-weight: 700;
		color: var(--text-muted);
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}

	.group-pills {
		display: inline-flex;
		padding: 0.3125rem;
		background: var(--bg-subtle);
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-md);
		align-self: flex-start;
	}

	.group-pill {
		padding: 0.5rem 1rem;
		background: transparent;
		color: var(--text-muted);
		border: none;
		border-radius: calc(var(--radius-md) - 2px);
		font-family: var(--font-body);
		font-size: 0.8125rem;
		font-weight: 600;
		cursor: pointer;
		transition: color var(--transition-fast), background var(--transition-fast);
	}

	.group-pill:hover:not(.active) {
		color: var(--text-secondary);
	}

	.group-pill:focus-visible {
		outline: 2px solid var(--accent);
		outline-offset: 2px;
	}

	.group-pill.active {
		background: var(--panel);
		color: var(--text-primary);
		box-shadow: var(--shadow-sm);
	}

	.tvm-layout {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1.1fr);
		gap: 1.25rem;
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
			gap: 1rem;
		}
	}
</style>
