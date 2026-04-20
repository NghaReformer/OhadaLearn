<script lang="ts">
	import PlaygroundShell from '$lib/components/playground/PlaygroundShell.svelte';
	import KpiStrip from '$lib/components/playground/KpiStrip.svelte';
	import type { KpiItem } from '$lib/components/playground/kpi-strip-types';
	import { manifest } from './manifest';
	import { BankReconciliationEngine } from './engine';
	import { buildAdjustingEntries } from './journal-entries';
	import type {
		BankReconciliationKpis,
		BankReconciliationPlaygroundState,
		ItemCategory,
		ReconciliationInputs,
		StatementSkin,
	} from './types';
	import { EMPTY_KPIS } from './types';
	import type { LearnSection, Scenario, ExerciseTemplateFile } from '$lib/content/types';
	import type { AccountingFramework } from '$lib/shared/chart-of-accounts/types';
	import type { AccountingStandard } from '$lib/contracts/playground';
	import { accountingStandard$, currency$ } from '$lib/stores/preferences';
	import { t } from '$lib/i18n';
	import { fmtCurrency } from '$lib/format';

	import InputsPanel from './components/InputsPanel.svelte';
	import BankStatementPanel from './components/BankStatementPanel.svelte';
	import LedgerPanel from './components/LedgerPanel.svelte';
	import ReconciliationStatement from './components/ReconciliationStatement.svelte';
	import AdjustingEntriesPanel from './components/AdjustingEntriesPanel.svelte';
	import UnmatchedItemsPanel from './components/UnmatchedItemsPanel.svelte';

	const standardToFramework: Record<AccountingStandard, AccountingFramework> = {
		syscohada: 'ohada',
		ifrs: 'ifrs',
		'french-pcg': 'pcg',
		'us-gaap': 'usgaap',
	};

	let framework = $derived(standardToFramework[$accountingStandard$]);

	let {
		learnSections = [],
		scenarios = [],
		exercises = [],
	}: {
		learnSections?: LearnSection[];
		scenarios?: Scenario[];
		exercises?: ExerciseTemplateFile[];
	} = $props();

	const defaultInputs: ReconciliationInputs = {
		periodEnd: new Date().toISOString().slice(0, 10),
		openingBankBalance: 1_000_000,
		closingBankBalance: 1_000_000,
		openingBookBalance: 1_000_000,
		closingBookBalance: 1_000_000,
		bankTransactions: [],
		ledgerEntries: [],
		manualMatches: [],
		manualClassifications: {},
	};

	const stateDefaults: Record<string, unknown> = {
		inputs: defaultInputs,
		selectedView: 'side-by-side',
		selectedItemId: null,
		highlightedMatchId: null,
		statementSkin: null,
		selectedExerciseId: null,
		exerciseParams: null,
	} satisfies Omit<BankReconciliationPlaygroundState, never>;

	const shareableKeys = ['inputs', 'selectedView', 'statementSkin', 'selectedExerciseId', 'exerciseParams'];

	const engine = new BankReconciliationEngine();

	function buildKpiItems(kpis: BankReconciliationKpis, translate: (k: string) => string, currency: string): KpiItem[] {
		const statusLabel =
			kpis.reconciliationStatus === 'reconciled'
				? translate('br.kpi.statusReconciled')
				: kpis.reconciliationStatus === 'unbalanced'
					? translate('br.kpi.statusUnbalanced')
					: translate('br.kpi.statusPending');
		const items: KpiItem[] = [
			{ label: translate('br.kpi.matched'), value: String(kpis.matchedCount) },
			{ label: translate('br.kpi.unmatchedBank'), value: String(kpis.unmatchedBankCount) },
			{ label: translate('br.kpi.unmatchedBooks'), value: String(kpis.unmatchedBooksCount) },
			{ label: translate('br.kpi.variance'), value: fmtCurrency(kpis.variance, currency), variant: kpis.reconciliationStatus === 'reconciled' ? 'default' : 'warn' },
			{ label: translate('br.kpi.status'), value: statusLabel, variant: 'accent' },
		];
		return items;
	}
</script>

<PlaygroundShell
	{manifest}
	storeKey="bank-reconciliation_v1"
	{stateDefaults}
	{learnSections}
	{scenarios}
	{exercises}
	{shareableKeys}
>
	{#snippet playground(state, updateState)}
		{@const typedState = state as unknown as BankReconciliationPlaygroundState}
		{@const inputs = typedState.inputs ?? defaultInputs}
		{@const result = engine.reconcile(inputs)}
		{@const kpis = result.kpis ?? EMPTY_KPIS}
		{@const adjustingEntries = buildAdjustingEntries(result, framework)}

		<div class="br-layout">
			<InputsPanel
				{inputs}
				onChange={(patch) => updateState({ inputs: { ...inputs, ...patch } })}
			/>

			<div class="br-workspace">
				<KpiStrip items={buildKpiItems(kpis, $t, $currency$)} />

				<div class="br-grid">
					<BankStatementPanel
						transactions={inputs.bankTransactions}
						matches={result.matches}
						selectedId={typedState.selectedItemId}
						onSelect={(id) => updateState({ selectedItemId: id })}
					/>
					<LedgerPanel
						entries={inputs.ledgerEntries}
						matches={result.matches}
						selectedId={typedState.selectedItemId}
						onSelect={(id) => updateState({ selectedItemId: id })}
					/>
				</div>

				<UnmatchedItemsPanel
					items={result.items}
					unmatchedBank={result.unmatchedBank}
					unmatchedBooks={result.unmatchedBooks}
					onClassify={(id, category) =>
						updateState({
							inputs: {
								...inputs,
								manualClassifications: { ...inputs.manualClassifications, [id]: category as ItemCategory },
							},
						})}
				/>

				<ReconciliationStatement
					statement={result.statement}
					skin={typedState.statementSkin}
					onSelectSkin={(skin: StatementSkin) => updateState({ statementSkin: skin })}
				/>

				<AdjustingEntriesPanel entries={adjustingEntries} {framework} />
			</div>
		</div>
	{/snippet}
</PlaygroundShell>

<style>
	.br-layout {
		display: grid;
		grid-template-columns: minmax(280px, 320px) 1fr;
		gap: 1rem;
		padding: 1rem;
	}

	.br-workspace {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		min-width: 0;
	}

	.br-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
	}

	@media (max-width: 1200px) {
		.br-layout {
			grid-template-columns: 1fr;
		}
		.br-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
