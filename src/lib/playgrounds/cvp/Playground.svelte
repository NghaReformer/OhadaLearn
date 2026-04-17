<script lang="ts">
	import PlaygroundShell from '$lib/components/playground/PlaygroundShell.svelte';
	import { t } from '$lib/i18n';
	import { manifest } from './manifest';
	import { calcSingle, applyWhatIf } from './engine';
	import type {
		CVPPlaygroundState,
		CVPSingleResult,
		ChartView,
		OverlayToggles,
		WhatIfAdjustments,
		IndifferenceInputs,
		SensitivityConfig,
		SensitivityVar,
		Product,
		TableTab,
		RightPanelTab,
		GoalSeekVariable,
	} from './types';
	import type { LearnSection, Scenario, ExerciseTemplateFile } from '$lib/content/types';

	import InputPanel from './components/InputPanel.svelte';
	import ChartToolbar from './components/ChartToolbar.svelte';
	import BreakEvenChart from './components/BreakEvenChart.svelte';
	import ProfitVolumeChart from './components/ProfitVolumeChart.svelte';
	import StackedChart from './components/StackedChart.svelte';
	import ResultsTable from './components/ResultsTable.svelte';
	import MultiProductForm from './components/MultiProductForm.svelte';
	import SensitivityTable from './components/SensitivityTable.svelte';
	import WhatIfPanel from './components/WhatIfPanel.svelte';
	import IndifferencePanel from './components/IndifferencePanel.svelte';
	import GoalSeekPanel from './components/GoalSeekPanel.svelte';

	let {
		learnSections = [],
		scenarios = [],
		exercises = [],
	}: {
		learnSections?: LearnSection[];
		scenarios?: Scenario[];
		exercises?: ExerciseTemplateFile[];
	} = $props();

	let translate = $derived($t);

	const stateDefaults: Record<string, unknown> = {
		mode: 'simple',
		price: 40,
		variableCost: 15,
		fixedCosts: 50000,
		volume: 3000,
		targetProfit: 20000,
		taxRate: 30,
		products: [],
		multiProduct: false,
		indifference: { fcA: 50000, vA: 15, fcB: 80000, vB: 10 },
		chartView: 'classic',
		overlays: { bep: true, target: false, mos: false, dol: false },
		tableTab: 'results',
		sensitivity: {
			targetMetric: 'operatingIncome',
			rowVar: 'price',
			colVar: 'volume',
			pctRange: 20,
			numSteps: 5,
		},
		whatIf: { price: 0, volume: 0, variableCost: 0, fixedCosts: 0 },
		rightTab: 'whatif',
		selectedExerciseId: null,
		exerciseParams: null,
	};

	const shareableKeys = [
		'mode',
		'price',
		'variableCost',
		'fixedCosts',
		'volume',
		'targetProfit',
		'taxRate',
		'chartView',
		'overlays',
		'multiProduct',
		'products',
	];

	function whatIfActive(w: WhatIfAdjustments): boolean {
		return w.price !== 0 || w.volume !== 0 || w.variableCost !== 0 || w.fixedCosts !== 0;
	}

	const sensVarToStateKey: Record<SensitivityVar, keyof CVPPlaygroundState> = {
		price: 'price',
		volume: 'volume',
		variableCost: 'variableCost',
		fixedCosts: 'fixedCosts',
	};

	const goalSeekToStateKey: Record<GoalSeekVariable, keyof CVPPlaygroundState> = {
		price: 'price',
		variableCost: 'variableCost',
		fixedCosts: 'fixedCosts',
		volume: 'volume',
		targetProfit: 'targetProfit',
		taxRate: 'taxRate',
	};
</script>

<PlaygroundShell
	{manifest}
	storeKey="cvp_v1"
	{stateDefaults}
	{learnSections}
	{scenarios}
	{exercises}
	{shareableKeys}
>
	{#snippet playground(state, updateState)}
		{@const s = state as unknown as CVPPlaygroundState}
		{@const result = calcSingle(
			s.price,
			s.variableCost,
			s.fixedCosts,
			s.volume,
			s.targetProfit,
			s.taxRate,
		) satisfies CVPSingleResult}
		{@const whatIfData = whatIfActive(s.whatIf)
			? applyWhatIf(
					{
						price: s.price,
						variableCost: s.variableCost,
						fc: s.fixedCosts,
						volume: s.volume,
						targetProfit: s.targetProfit,
						taxRate: s.taxRate,
					},
					s.whatIf.price,
					s.whatIf.volume,
					s.whatIf.variableCost,
					s.whatIf.fixedCosts,
				)
			: null}

		<div class="cvp-layout">
			<div class="cvp-sidebar">
				<InputPanel
					mode={s.mode}
					price={s.price}
					variableCost={s.variableCost}
					fixedCosts={s.fixedCosts}
					volume={s.volume}
					targetProfit={s.targetProfit}
					taxRate={s.taxRate}
					multiProduct={s.multiProduct}
					onChange={(partial) => updateState(partial)}
					onToggleMode={(mode) => updateState({ mode })}
					onToggleMulti={(multiProduct) => updateState({ multiProduct })}
				/>

				{#if s.mode === 'advanced'}
					<GoalSeekPanel
						price={s.price}
						variableCost={s.variableCost}
						fixedCosts={s.fixedCosts}
						volume={s.volume}
						targetProfit={s.targetProfit}
						taxRate={s.taxRate}
						onApply={(variable, value) =>
							updateState({ [goalSeekToStateKey[variable]]: value })}
					/>
				{/if}
			</div>

			<div class="cvp-main">
				<ChartToolbar
					view={s.chartView}
					overlays={s.overlays}
					onChangeView={(chartView: ChartView) => updateState({ chartView })}
					onToggleOverlay={(key: keyof OverlayToggles) =>
						updateState({ overlays: { ...s.overlays, [key]: !s.overlays[key] } })}
				/>

				<div class="cvp-chart-wrap">
					{#if s.chartView === 'classic'}
						<BreakEvenChart data={result} overlays={s.overlays} {whatIfData} />
					{:else if s.chartView === 'pv'}
						<ProfitVolumeChart data={result} overlays={s.overlays} {whatIfData} />
					{:else}
						<StackedChart data={result} overlays={s.overlays} />
					{/if}
				</div>

				<div class="table-tabs" role="tablist">
					<button
						type="button"
						class="tab-btn"
						class:active={s.tableTab === 'results'}
						role="tab"
						aria-selected={s.tableTab === 'results'}
						onclick={() => updateState({ tableTab: 'results' as TableTab })}
					>
						{translate('cvp.table.results')}
					</button>
					<button
						type="button"
						class="tab-btn"
						class:active={s.tableTab === 'sensitivity'}
						role="tab"
						aria-selected={s.tableTab === 'sensitivity'}
						onclick={() => updateState({ tableTab: 'sensitivity' as TableTab })}
					>
						{translate('cvp.table.sensitivity')}
					</button>
				</div>

				{#if s.tableTab === 'results'}
					<ResultsTable {result} taxMode={s.mode === 'advanced'} />
				{:else}
					<SensitivityTable
						config={s.sensitivity}
						price={s.price}
						variableCost={s.variableCost}
						fixedCosts={s.fixedCosts}
						volume={s.volume}
						targetProfit={s.targetProfit}
						taxRate={s.taxRate}
						onConfigChange={(partial) =>
							updateState({ sensitivity: { ...s.sensitivity, ...partial } })}
						onApplyCell={(rowVar, rowVal, colVar, colVal) =>
							updateState({
								[sensVarToStateKey[rowVar]]: rowVal,
								[sensVarToStateKey[colVar]]: colVal,
							})}
					/>
				{/if}

				{#if s.mode === 'advanced' && s.multiProduct}
					<MultiProductForm
						products={s.products}
						fixedCosts={s.fixedCosts}
						targetProfit={s.targetProfit}
						taxRate={s.taxRate}
						onChange={(products: Product[]) => updateState({ products })}
					/>
				{/if}
			</div>

			{#if s.mode === 'advanced'}
				<aside class="cvp-right">
					<div class="right-tabs" role="tablist">
						<button
							type="button"
							class="right-tab"
							class:active={s.rightTab === 'whatif'}
							role="tab"
							aria-selected={s.rightTab === 'whatif'}
							onclick={() => updateState({ rightTab: 'whatif' as RightPanelTab })}
						>
							{translate('cvp.right.whatif')}
						</button>
						<button
							type="button"
							class="right-tab"
							class:active={s.rightTab === 'compare'}
							role="tab"
							aria-selected={s.rightTab === 'compare'}
							onclick={() => updateState({ rightTab: 'compare' as RightPanelTab })}
						>
							{translate('cvp.right.compare')}
						</button>
					</div>

					{#if s.rightTab === 'whatif'}
						<WhatIfPanel
							price={s.price}
							variableCost={s.variableCost}
							fixedCosts={s.fixedCosts}
							volume={s.volume}
							targetProfit={s.targetProfit}
							taxRate={s.taxRate}
							adjustments={s.whatIf}
							onChange={(partial: Partial<WhatIfAdjustments>) =>
								updateState({ whatIf: { ...s.whatIf, ...partial } })}
							onReset={() =>
								updateState({ whatIf: { price: 0, volume: 0, variableCost: 0, fixedCosts: 0 } })}
						/>
					{:else}
						<IndifferencePanel
							inputs={s.indifference}
							onChange={(partial: Partial<IndifferenceInputs>) =>
								updateState({ indifference: { ...s.indifference, ...partial } })}
						/>
					{/if}
				</aside>
			{/if}
		</div>
	{/snippet}
</PlaygroundShell>

<style>
	.cvp-layout {
		display: grid;
		grid-template-columns: minmax(280px, 320px) minmax(0, 1fr) minmax(320px, 360px);
		gap: 1.25rem;
		padding: 1.25rem;
		min-height: 0;
	}

	.cvp-sidebar,
	.cvp-main,
	.cvp-right {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		min-width: 0;
	}

	.cvp-chart-wrap {
		background: var(--panel);
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-md);
		padding: 0.75rem;
		aspect-ratio: 16 / 9;
		min-height: 320px;
	}

	.table-tabs {
		display: flex;
		gap: 0.25rem;
		padding: 3px;
		background: rgba(255, 255, 255, 0.02);
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-sm);
		width: fit-content;
	}

	.tab-btn {
		padding: 0.375rem 0.875rem;
		background: transparent;
		border: none;
		border-radius: calc(var(--radius-sm) - 2px);
		font-family: var(--font-mono);
		font-size: 0.6875rem;
		font-weight: 600;
		color: var(--text-muted);
		cursor: pointer;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		transition:
			color var(--transition-fast),
			background var(--transition-fast);
	}

	.tab-btn:hover {
		color: var(--text-primary);
	}

	.tab-btn.active {
		background: color-mix(in srgb, var(--accent) 12%, transparent);
		color: var(--accent);
	}

	.right-tabs {
		display: grid;
		grid-template-columns: 1fr 1fr;
		padding: 3px;
		background: rgba(255, 255, 255, 0.02);
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-sm);
		gap: 2px;
	}

	.right-tab {
		padding: 0.375rem 0.5rem;
		background: transparent;
		border: none;
		border-radius: calc(var(--radius-sm) - 2px);
		font-family: var(--font-mono);
		font-size: 0.6875rem;
		font-weight: 600;
		color: var(--text-muted);
		cursor: pointer;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		transition:
			color var(--transition-fast),
			background var(--transition-fast);
	}

	.right-tab:hover {
		color: var(--text-primary);
	}

	.right-tab.active {
		background: color-mix(in srgb, var(--accent) 12%, transparent);
		color: var(--accent);
	}

	@media (max-width: 1400px) {
		.cvp-layout {
			grid-template-columns: minmax(260px, 320px) minmax(0, 1fr);
		}
		.cvp-right {
			grid-column: 1 / -1;
		}
	}

	@media (max-width: 960px) {
		.cvp-layout {
			grid-template-columns: 1fr;
		}
	}
</style>
