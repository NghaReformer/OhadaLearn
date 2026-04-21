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
		BankTransaction,
		ItemCategory,
		LedgerEntry,
		ReconciliationInputs,
		StatementSkin,
	} from './types';
	import { EMPTY_KPIS } from './types';
	import type { LearnSection, Scenario, ExerciseTemplateFile, ScenarioMissingTransaction } from '$lib/content/types';
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
	import VarianceScale from './components/VarianceScale.svelte';
	import CategoryBreakdownDonut from './components/CategoryBreakdownDonut.svelte';
	import ReconciliationFlow from './components/ReconciliationFlow.svelte';
	import MatchingPairsOverlay from './components/MatchingPairsOverlay.svelte';
	import TransactionJournal from './components/TransactionJournal.svelte';
	import ScenarioWalkthrough from './components/ScenarioWalkthrough.svelte';

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
		loadedScenarioSlug: null,
		addedMissingIds: [],
	} satisfies Omit<BankReconciliationPlaygroundState, never>;

	const shareableKeys = ['inputs', 'selectedView', 'statementSkin', 'selectedExerciseId', 'exerciseParams', 'loadedScenarioSlug', 'addedMissingIds'];

	const engine = new BankReconciliationEngine();

	let gridContainer = $state<HTMLDivElement | null>(null);
	let recentlyAddedIds = $state(new Set<string>());

	function flagRecentlyAdded(id: string): void {
		recentlyAddedIds = new Set([...recentlyAddedIds, id]);
		setTimeout(() => {
			recentlyAddedIds = new Set([...recentlyAddedIds].filter((x) => x !== id));
		}, 1500);
	}

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

	function buildCategoryLabels(translate: (k: string) => string): Record<ItemCategory, string> {
		return {
			'outstanding-check': translate('br.category.outstandingCheck.label'),
			'deposit-in-transit': translate('br.category.depositInTransit.label'),
			'bank-charge': translate('br.category.bankCharge.label'),
			'interest-earned': translate('br.category.interestEarned.label'),
			'nsf-check': translate('br.category.nsfCheck.label'),
			'direct-debit': translate('br.category.directDebit.label'),
			'standing-order': translate('br.category.standingOrder.label'),
			'bank-error': translate('br.category.bankError.label'),
			'company-error': translate('br.category.companyError.label'),
		};
	}

	function txFromMissing(item: ScenarioMissingTransaction): BankTransaction | LedgerEntry {
		const base = {
			id: item.id,
			date: item.date,
			description: item.description,
			amount: item.amount,
			reference: item.reference,
		};
		if (item.side === 'bank') {
			return { ...base, cleared: true } satisfies BankTransaction;
		}
		return { ...base, recorded: true } satisfies LedgerEntry;
	}

	function applyClassifications(
		current: ReconciliationInputs,
		item: ScenarioMissingTransaction,
	): Record<string, ItemCategory> {
		if (!item.expectedCategory) return current.manualClassifications;
		return { ...current.manualClassifications, [item.id]: item.expectedCategory as ItemCategory };
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
		{@const bankItemCount = result.items.filter((i) => i.side === 'bank').length}
		{@const booksItemCount = result.items.filter((i) => i.side === 'books').length}
		{@const loadedScenario = typedState.loadedScenarioSlug
			? scenarios.find((s) => s.presetValues?.loadedScenarioSlug === typedState.loadedScenarioSlug)
			: null}
		{@const addedMissingIds = typedState.addedMissingIds ?? []}

		<div class="br-layout">
			<InputsPanel
				{inputs}
				onChange={(patch) => updateState({ inputs: { ...inputs, ...patch } })}
			/>

			<div class="br-workspace">
				<VarianceScale
					adjustedBank={result.statement.bankSide.adjustedBalance}
					adjustedBooks={result.statement.booksSide.adjustedBalance}
					variance={result.statement.variance}
					isReconciled={result.statement.isReconciled}
					{bankItemCount}
					{booksItemCount}
					bankLabel={$t('br.scale.bankLabel')}
					booksLabel={$t('br.scale.booksLabel')}
					reconciledLabel={$t('br.scale.reconciled')}
					unbalancedLabel={$t('br.scale.unbalanced')}
					varianceLabel={$t('br.scale.varianceLabel')}
				/>

				{#if loadedScenario && loadedScenario.missingTransactions && loadedScenario.missingTransactions.length > 0}
					<ScenarioWalkthrough
						scenario={loadedScenario}
						addedIds={addedMissingIds}
						onAdd={(item) => {
							if (addedMissingIds.includes(item.id)) return;
							const tx = txFromMissing(item);
							const newInputs = item.side === 'bank'
								? { ...inputs, bankTransactions: [...inputs.bankTransactions, tx as BankTransaction], manualClassifications: applyClassifications(inputs, item) }
								: { ...inputs, ledgerEntries: [...inputs.ledgerEntries, tx as LedgerEntry], manualClassifications: applyClassifications(inputs, item) };
							updateState({
								inputs: newInputs,
								addedMissingIds: [...addedMissingIds, item.id],
							});
							flagRecentlyAdded(item.id);
						}}
						onAddAll={() => {
							const remaining = (loadedScenario?.missingTransactions ?? []).filter((m) => !addedMissingIds.includes(m.id));
							let nextInputs = inputs;
							const ids: string[] = [];
							for (const item of remaining) {
								const tx = txFromMissing(item);
								if (item.side === 'bank') {
									nextInputs = { ...nextInputs, bankTransactions: [...nextInputs.bankTransactions, tx as BankTransaction] };
								} else {
									nextInputs = { ...nextInputs, ledgerEntries: [...nextInputs.ledgerEntries, tx as LedgerEntry] };
								}
								nextInputs = { ...nextInputs, manualClassifications: applyClassifications(nextInputs, item) };
								ids.push(item.id);
								flagRecentlyAdded(item.id);
							}
							updateState({
								inputs: nextInputs,
								addedMissingIds: [...addedMissingIds, ...ids],
							});
						}}
						onReset={() => {
							const ids = (loadedScenario?.missingTransactions ?? []).map((m) => m.id);
							const idSet = new Set(ids);
							updateState({
								inputs: {
									...inputs,
									bankTransactions: inputs.bankTransactions.filter((t) => !idSet.has(t.id)),
									ledgerEntries: inputs.ledgerEntries.filter((e) => !idSet.has(e.id)),
									manualClassifications: Object.fromEntries(
										Object.entries(inputs.manualClassifications).filter(([k]) => !idSet.has(k)),
									),
								},
								addedMissingIds: [],
							});
						}}
					/>
				{/if}

				<TransactionJournal
					{inputs}
					variance={result.statement.variance}
					isReconciled={result.statement.isReconciled}
					onAddBank={(tx) => {
						updateState({ inputs: { ...inputs, bankTransactions: [...inputs.bankTransactions, tx] } });
						flagRecentlyAdded(tx.id);
					}}
					onAddLedger={(entry) => {
						updateState({ inputs: { ...inputs, ledgerEntries: [...inputs.ledgerEntries, entry] } });
						flagRecentlyAdded(entry.id);
					}}
					titleLabel={$t('br.journal.title')}
					sideBankLabel={$t('br.journal.sideBank')}
					sideBooksLabel={$t('br.journal.sideBooks')}
					directionInflowLabel={$t('br.journal.directionInflow')}
					directionOutflowLabel={$t('br.journal.directionOutflow')}
					dateLabel={$t('br.journal.date')}
					descriptionLabel={$t('br.journal.description')}
					descriptionPlaceholder={$t('br.journal.descriptionPlaceholder')}
					referenceLabel={$t('br.journal.reference')}
					referencePlaceholder={$t('br.journal.referencePlaceholder')}
					amountLabel={$t('br.journal.amount')}
					addLabel={$t('br.journal.add')}
					hintReconciled={$t('br.journal.hintReconciled')}
					hintBankHeavier={$t('br.journal.hintBankHeavier')}
					hintBooksHeavier={$t('br.journal.hintBooksHeavier')}
				/>

				<KpiStrip items={buildKpiItems(kpis, $t, $currency$)} />

				<div class="br-grid" bind:this={gridContainer}>
					<BankStatementPanel
						transactions={inputs.bankTransactions}
						matches={result.matches}
						selectedId={typedState.selectedItemId}
						onSelect={(id) => updateState({ selectedItemId: id })}
						onRemove={(id) => updateState({
							inputs: {
								...inputs,
								bankTransactions: inputs.bankTransactions.filter((t) => t.id !== id),
								manualClassifications: Object.fromEntries(
									Object.entries(inputs.manualClassifications).filter(([k]) => k !== id),
								),
							},
							addedMissingIds: addedMissingIds.filter((x) => x !== id),
						})}
						{recentlyAddedIds}
					/>
					<LedgerPanel
						entries={inputs.ledgerEntries}
						matches={result.matches}
						selectedId={typedState.selectedItemId}
						onSelect={(id) => updateState({ selectedItemId: id })}
						onRemove={(id) => updateState({
							inputs: {
								...inputs,
								ledgerEntries: inputs.ledgerEntries.filter((e) => e.id !== id),
								manualClassifications: Object.fromEntries(
									Object.entries(inputs.manualClassifications).filter(([k]) => k !== id),
								),
							},
							addedMissingIds: addedMissingIds.filter((x) => x !== id),
						})}
						{recentlyAddedIds}
					/>
					<MatchingPairsOverlay
						matches={result.matches}
						container={gridContainer}
						highlightId={typedState.selectedItemId}
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

				<div class="br-insights">
					<ReconciliationFlow
						statement={result.statement}
						titleLabel={$t('br.flow.title')}
						bankSideLabel={$t('br.flow.bankSide')}
						booksSideLabel={$t('br.flow.booksSide')}
						startLabel={$t('br.flow.start')}
						endLabel={$t('br.flow.end')}
						matchLabel={$t('br.flow.match')}
					/>
					<CategoryBreakdownDonut
						{kpis}
						categoryLabels={buildCategoryLabels($t)}
						emptyLabel={$t('br.donut.empty')}
						titleLabel={$t('br.donut.title')}
					/>
				</div>

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
		position: relative;
	}

	.br-insights {
		display: grid;
		grid-template-columns: 1.5fr 1fr;
		gap: 1rem;
	}

	@media (max-width: 1200px) {
		.br-layout {
			grid-template-columns: 1fr;
		}
		.br-grid {
			grid-template-columns: 1fr;
		}
		.br-insights {
			grid-template-columns: 1fr;
		}
	}
</style>
