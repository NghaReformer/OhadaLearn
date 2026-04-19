<script lang="ts">
	import PlaygroundShell from '$lib/components/playground/PlaygroundShell.svelte';
	import { manifest } from './manifest';
	import { AmortizationEngine } from './engine';
	import type {
		AmortizationPlaygroundState,
		AmortizationInputs,
		LifecycleStage,
	} from './types';
	import type { LearnSection, Scenario, ExerciseTemplateFile } from '$lib/content/types';
	import type { AccountingFramework } from '$lib/shared/chart-of-accounts/types';
	import type { AccountingStandard } from '$lib/contracts/playground';
	import { accountingStandard$, setAccountingStandard } from '$lib/stores/preferences';
	import InputsPanel from './components/InputsPanel.svelte';
	import KpiStrip from './components/KpiStrip.svelte';
	import ScheduleTable from './components/ScheduleTable.svelte';
	import ChartPanel from './components/ChartPanel.svelte';
	import LifecyclePanel from './components/LifecyclePanel.svelte';
	import SolverPanel from './components/SolverPanel.svelte';

	const defaultSolverInputs = {
		solveFor: 'payment' as const,
		knownPrincipal: 10_000_000,
		knownRate: 0.08,
		knownTerm: 60,
		knownPayment: 202_760,
	};

	const standardToFramework: Record<AccountingStandard, AccountingFramework> = {
		syscohada: 'ohada',
		ifrs: 'ifrs',
		'french-pcg': 'pcg',
		'us-gaap': 'usgaap',
	};

	const frameworkToStandard: Record<AccountingFramework, AccountingStandard> = {
		ohada: 'syscohada',
		ifrs: 'ifrs',
		pcg: 'french-pcg',
		usgaap: 'us-gaap',
	};

	let framework = $derived(standardToFramework[$accountingStandard$]);

	let {
		learnSections = [],
		scenarios = [],
		exercises = []
	}: {
		learnSections?: LearnSection[];
		scenarios?: Scenario[];
		exercises?: ExerciseTemplateFile[];
	} = $props();

	const defaultInputs: AmortizationInputs = {
		principal: 10_000_000,
		nominalRate: 0.08,
		termPeriods: 60,
		frequency: 'monthly',
		customPeriodsPerYear: 12,
		method: 'annuity',
		dayCount: '30/360',
		startDate: new Date().toISOString().slice(0, 10),
		firstPaymentDate: new Date(new Date().setMonth(new Date().getMonth() + 1))
			.toISOString()
			.slice(0, 10),
		grace: { type: 'none', periods: 0 },
		insurance: { rate: 0, basis: 'initial' },
		fees: { origination: 0, prepaymentPenaltyPct: 0 },
		variableRates: [],
		extras: { perPeriod: 0, lumpSum: 0, lumpPeriod: 0 },
		balloonDueAt: 0,
		progressiveStep: 0.02
	};

	const stateDefaults: Record<string, unknown> = {
		inputs: defaultInputs,
		selectedChart: 'stacked',
		chartOverlays: { interest: true, principal: true, insurance: false },
		selectedStage: 'disbursement',
		selectedExerciseId: null,
		exerciseParams: null,
		solverInputs: null
	} satisfies Omit<AmortizationPlaygroundState, never>;

	const shareableKeys = [
		'inputs',
		'selectedChart',
		'chartOverlays',
		'selectedStage',
		'selectedExerciseId',
		'exerciseParams',
		'solverInputs'
	];

	const engine = new AmortizationEngine();
</script>

<PlaygroundShell
	{manifest}
	storeKey="amortization_v1"
	{stateDefaults}
	{learnSections}
	{scenarios}
	{exercises}
	{shareableKeys}
>
	{#snippet playground(state, updateState)}
		{@const typedState = state as unknown as AmortizationPlaygroundState}
		{@const inputs = typedState.inputs ?? defaultInputs}
		{@const result = engine.computeSchedule(inputs)}
		{@const kpis = engine.computeKpis(result, inputs)}
		{@const entries = engine.buildJournalEntries(inputs, result, framework)}
		{@const selectedStage = (typedState.selectedStage ?? 'disbursement') as LifecycleStage}

		<div class="am-layout">
			<InputsPanel
				{inputs}
				onChange={(patch) => updateState({ inputs: { ...inputs, ...patch } })}
			/>

			<div class="am-workspace">
				<KpiStrip {kpis} />
				<div class="am-grid">
					<ChartPanel
						{result}
						selectedChart={typedState.selectedChart ?? 'stacked'}
						overlays={typedState.chartOverlays ?? { interest: true, principal: true }}
						onSelectChart={(kind) => updateState({ selectedChart: kind })}
						onToggleOverlay={(key) => {
							const current = typedState.chartOverlays ?? {};
							updateState({ chartOverlays: { ...current, [key]: !current[key] } });
						}}
					/>
					<ScheduleTable {result} />
				</div>
				<LifecyclePanel
					{entries}
					{framework}
					{selectedStage}
					onSelectStage={(stage) => updateState({ selectedStage: stage })}
					onSelectFramework={(fw) => setAccountingStandard(frameworkToStandard[fw])}
				/>
				<SolverPanel
					solverInputs={{
						...defaultSolverInputs,
						...((typedState.solverInputs ?? {}) as Partial<typeof defaultSolverInputs>),
					}}
					onChange={(patch) => {
						const current = { ...defaultSolverInputs, ...((typedState.solverInputs ?? {}) as object) };
						updateState({ solverInputs: { ...current, ...patch } });
					}}
				/>
			</div>
		</div>
	{/snippet}
</PlaygroundShell>

<style>
	.am-layout {
		display: grid;
		grid-template-columns: minmax(320px, 380px) 1fr;
		gap: 1.25rem;
		padding: 1.25rem;
		min-height: 0;
		height: 100%;
	}

	.am-workspace {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		min-width: 0;
	}

	.am-grid {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1.15fr);
		gap: 1rem;
		flex: 1;
		min-height: 0;
	}

	.am-grid > :global(*) {
		min-height: 0;
	}

	@media (max-width: 1180px) {
		.am-layout,
		.am-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
