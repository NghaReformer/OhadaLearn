<script lang="ts">
	import PlaygroundShell from '$lib/components/playground/PlaygroundShell.svelte';
	import { manifest } from './manifest';
	import { JournalEntryEngine } from './engine';
	import { accountingStandard$, currency$ } from '$lib/stores/preferences';
	import { locale, t } from '$lib/i18n';
	import type { AccountingFramework } from '$lib/shared/chart-of-accounts/types';
	import type { AccountingStandard } from '$lib/contracts/playground';
	import type {
		JournalEntryPlaygroundState,
		DraftEntry,
		JournalLine,
		PipelineStage
	} from './types';
	import type { LearnSection, Scenario, ExerciseTemplateFile } from '$lib/content/types';
	import {
		buildExerciseFeedback,
		randomizeExerciseParameters,
		renderExercisePrompt
	} from './exercises';

	import JournalEntryForm from './components/JournalEntryForm.svelte';
	import EntryHistory from './components/EntryHistory.svelte';
	import TAccountView from './components/TAccountView.svelte';
	import AccountingStagePanel from './components/AccountingStagePanel.svelte';
	import ExerciseWorkspace from './components/ExerciseWorkspace.svelte';

	type ExerciseFeedbackState = {
		score: number;
		isCorrect: boolean;
		messageKey: string;
		lineFeedback: Array<{ status: 'correct' | 'partial' | 'extra' | 'missing'; explanation: string }>;
	} | null;

	let {
		learnSections = [],
		scenarios = [],
		exercises = []
	}: {
		learnSections?: LearnSection[];
		scenarios?: Scenario[];
		exercises?: ExerciseTemplateFile[];
	} = $props();

	const engine = new JournalEntryEngine();

	const standardToFramework: Record<AccountingStandard, AccountingFramework> = {
		syscohada: 'ohada',
		ifrs: 'ifrs',
		'french-pcg': 'pcg',
		'us-gaap': 'usgaap'
	};

	const shareableKeys = [
		'entries',
		'draft',
		'selectedAccount',
		'selectedEntryId',
		'selectedStage',
		'selectedExerciseId',
		'exerciseParams'
	];

	function createFreshDraft(description = ''): DraftEntry {
		return {
			date: new Date().toISOString().slice(0, 10),
			description,
			lines: [
				{ accountKey: '', debit: '', credit: '' },
				{ accountKey: '', debit: '', credit: '' }
			]
		};
	}

	function normalizeDraftLines(lines: DraftEntry['lines']): JournalLine[] {
		return lines
			.filter((line) => line.accountKey && (line.debit !== '' || line.credit !== ''))
			.map((line) => ({
				accountKey: line.accountKey,
				debit: typeof line.debit === 'number' ? line.debit : 0,
				credit: typeof line.credit === 'number' ? line.credit : 0
			}));
	}

	const stateDefaults: Record<string, unknown> = {
		entries: [],
		draft: createFreshDraft(),
		selectedAccount: null,
		selectedEntryId: null,
		selectedStage: 'ledger' satisfies PipelineStage,
		selectedExerciseId: null,
		exerciseParams: null
	};

	let framework: AccountingFramework = $derived(standardToFramework[$accountingStandard$]);
	let currentLocale = $derived($locale);
	let currentCurrency = $derived($currency$);
	let translate = $derived($t);
	let exerciseFeedback = $state<ExerciseFeedbackState>(null);
</script>

<PlaygroundShell
	{manifest}
	storeKey="journal-entry_v2"
	{stateDefaults}
	{learnSections}
	{scenarios}
	shareableKeys={shareableKeys}
>
	{#snippet playground(state, updateState)}
		{@const typedState = state as unknown as JournalEntryPlaygroundState}
		{@const draft = (typedState.draft ?? createFreshDraft()) as DraftEntry}
		{@const entries = typedState.entries ?? []}
		{@const validation = engine.validate(draft, framework)}
		{@const ledger = engine.buildLedger(entries, framework)}
		{@const ledgerAccounts = [...ledger.values()].sort((a, b) =>
			a.account.frameworkCode.localeCompare(b.account.frameworkCode, undefined, { numeric: true })
		)}
		{@const trialBalance = engine.buildTrialBalance(ledger)}
		{@const trialBalanceCheck = engine.verifyTrialBalance(trialBalance)}
		{@const incomeStatement = engine.buildIncomeStatement(trialBalance, framework)}
		{@const balanceSheet = engine.buildBalanceSheet(trialBalance, incomeStatement.netIncome)}
		{@const cashFlow = engine.buildCashFlow(entries, framework)}
		{@const selectedStage = typedState.selectedStage ?? 'ledger'}
		{@const selectedEntry = entries.find((entry) => entry.id === typedState.selectedEntryId)}
		{@const selectedAccountKeys = selectedEntry?.lines.map((line) => line.accountKey) ?? []}
		{@const entryImpact = engine.analyzeEntryImpact(selectedEntry, framework)}
		{@const tAccountKey = typedState.selectedAccount ?? selectedEntry?.lines[0]?.accountKey ?? null}
		{@const tAccountData = tAccountKey ? engine.getTAccount(ledger, tAccountKey) : null}
		{@const selectedExercise = exercises.find(
			(exercise) => exercise.id === typedState.selectedExerciseId
		)}
		{@const exercisePrompt =
			selectedExercise && typedState.exerciseParams
				? renderExercisePrompt(
						translate(selectedExercise.template.promptKey),
						typedState.exerciseParams,
						currentLocale
					)
				: ''}

		<div class="je-layout">
			<div class="je-workspace">
				{#if exercises.length > 0}
					<ExerciseWorkspace
						{exercises}
						selectedExerciseId={typedState.selectedExerciseId}
						prompt={exercisePrompt}
						feedback={exerciseFeedback}
						onSelectExercise={(exerciseId) => {
							const exercise = exercises.find((item) => item.id === exerciseId);
							if (!exercise) return;

							exerciseFeedback = null;
							updateState({
								selectedExerciseId: exerciseId,
								exerciseParams: randomizeExerciseParameters(exercise),
								draft: createFreshDraft(translate(exercise.template.promptKey)),
								selectedEntryId: null
							});
						}}
						onRandomize={() => {
							if (!selectedExercise) return;

							exerciseFeedback = null;
							updateState({
								exerciseParams: randomizeExerciseParameters(selectedExercise),
								draft: createFreshDraft(translate(selectedExercise.template.promptKey)),
								selectedEntryId: null
							});
						}}
						onCheck={() => {
							if (!selectedExercise || !typedState.exerciseParams) return;

							const result = buildExerciseFeedback(
								normalizeDraftLines(draft.lines),
								selectedExercise,
								typedState.exerciseParams,
								framework,
								currentLocale,
								currentCurrency
							);

							exerciseFeedback = {
								score: result.score,
								isCorrect: result.isCorrect,
								messageKey: result.messageKey,
								lineFeedback: result.lineFeedback
							};
						}}
					/>
				{/if}

				<JournalEntryForm
					{draft}
					onUpdate={(updated) => {
						exerciseFeedback = null;
						updateState({ draft: updated });
					}}
					onPost={() => {
						if (!validation.valid) return;

						const entry = engine.postDraft(draft);
						exerciseFeedback = null;
						updateState({
							entries: [...entries, entry],
							draft: createFreshDraft(),
							selectedEntryId: entry.id,
							selectedStage: 'ledger'
						});
					}}
					{validation}
				/>

				<EntryHistory
					{entries}
					selectedEntryId={typedState.selectedEntryId}
					onSelect={(id) =>
						updateState({
							selectedEntryId: id,
							selectedStage: selectedStage
						})}
					onSelectAccount={(accountKey) => updateState({ selectedAccount: accountKey })}
					onDelete={(id) => {
						updateState({
							entries: entries.filter((entry) => entry.id !== id),
							selectedEntryId:
								typedState.selectedEntryId === id ? null : typedState.selectedEntryId
						});
					}}
				/>
			</div>

			<div class="je-analysis">
				<AccountingStagePanel
					stage={selectedStage}
					counts={{
						ledger: ledgerAccounts.length,
						trialBalance: trialBalance.length,
						incomeStatement: incomeStatement.revenues.length + incomeStatement.expenses.length,
						balanceSheet:
							balanceSheet.currentAssets.length +
							balanceSheet.nonCurrentAssets.length +
							balanceSheet.currentLiabilities.length +
							balanceSheet.nonCurrentLiabilities.length +
							balanceSheet.equity.length,
						cashFlow:
							cashFlow.operating.length +
							cashFlow.investing.length +
							cashFlow.financing.length
					}}
					{ledgerAccounts}
					{trialBalance}
					{trialBalanceCheck}
					{incomeStatement}
					{balanceSheet}
					{cashFlow}
					selectedAccount={typedState.selectedAccount}
					{selectedEntry}
					{selectedAccountKeys}
					{entryImpact}
					onSelectStage={(stage) => updateState({ selectedStage: stage })}
					onSelectAccount={(accountKey) => updateState({ selectedAccount: accountKey })}
				/>

				<TAccountView data={tAccountData} />
			</div>
		</div>
	{/snippet}
</PlaygroundShell>

<style>
	.je-layout {
		display: grid;
		grid-template-columns: minmax(360px, 420px) 1fr;
		gap: 1.5rem;
		padding: 1.5rem;
		min-height: 0;
	}

	.je-workspace,
	.je-analysis {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		min-width: 0;
	}

	@media (max-width: 1180px) {
		.je-layout {
			grid-template-columns: 1fr;
		}
	}
</style>
