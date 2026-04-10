<script lang="ts">
	import PlaygroundShell from '$lib/components/playground/PlaygroundShell.svelte';
	import { manifest } from './manifest';
	import { JournalEntryEngine } from './engine';
	import { accountingStandard$ } from '$lib/stores/preferences';
	import { getAccount } from '$lib/shared/chart-of-accounts';
	import type { AccountingFramework } from '$lib/shared/chart-of-accounts/types';
	import type { AccountingStandard } from '$lib/contracts/playground';
	import type { JournalEntryPlaygroundState, DraftEntry } from './types';
	import type { LearnSection, Scenario, ExerciseTemplateFile } from '$lib/content/types';

	import JournalEntryForm from './components/JournalEntryForm.svelte';
	import EntryHistory from './components/EntryHistory.svelte';
	import TAccountView from './components/TAccountView.svelte';

	let {
		learnSections = [],
		scenarios = [],
		exercises = [],
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
		'us-gaap': 'usgaap',
	};

	const freshDraft: DraftEntry = {
		date: new Date().toISOString().slice(0, 10),
		description: '',
		lines: [
			{ accountKey: '', debit: '', credit: '' },
			{ accountKey: '', debit: '', credit: '' },
		],
	};

	const stateDefaults: Record<string, unknown> = {
		entries: [],
		draft: { ...freshDraft, lines: freshDraft.lines.map((l) => ({ ...l })) },
		selectedAccount: null,
		selectedEntryId: null,
	};

	let framework: AccountingFramework = $derived(standardToFramework[$accountingStandard$]);
</script>

<PlaygroundShell
	{manifest}
	storeKey="journal-entry_v1"
	{stateDefaults}
	{learnSections}
	{scenarios}
	{exercises}
>
	{#snippet playground(state, updateState)}
		{@const typedState = state as unknown as JournalEntryPlaygroundState}
		{@const draft = (typedState.draft ?? freshDraft) as DraftEntry}
		{@const entries = typedState.entries ?? []}
		{@const validation = engine.validate(draft, framework)}
		{@const ledger = engine.buildLedger(entries)}
		{@const selectedEntry = entries.find((e) => e.id === typedState.selectedEntryId)}
		{@const tAccountKey = typedState.selectedAccount ?? selectedEntry?.lines[0]?.accountKey ?? null}
		{@const tAccountData = tAccountKey ? engine.getTAccount(ledger, tAccountKey) : null}
		{@const tAccountName = tAccountKey
			? (() => {
					const acc = getAccount(tAccountKey, framework);
					return acc ? `${acc.frameworkCode} — ${acc.frameworkNameEn}` : tAccountKey;
				})()
			: ''}

		<div class="je-layout">
			<div class="je-main">
				<JournalEntryForm
					{draft}
					onUpdate={(updated) => updateState({ draft: updated })}
					onPost={() => {
						if (validation.valid) {
							const entry = engine.postDraft(draft);
							updateState({
								entries: [...entries, entry],
								draft: {
									date: new Date().toISOString().slice(0, 10),
									description: '',
									lines: [
										{ accountKey: '', debit: '', credit: '' },
										{ accountKey: '', debit: '', credit: '' },
									],
								},
								selectedEntryId: entry.id,
							});
						}
					}}
					{validation}
				/>

				<EntryHistory
					{entries}
					selectedEntryId={typedState.selectedEntryId}
					onSelect={(id) => updateState({ selectedEntryId: id })}
					onDelete={(id) => {
						updateState({
							entries: entries.filter((e) => e.id !== id),
							selectedEntryId: typedState.selectedEntryId === id ? null : typedState.selectedEntryId,
						});
					}}
				/>
			</div>

			<div class="je-sidebar">
				<TAccountView data={tAccountData} accountName={tAccountName} />
			</div>
		</div>
	{/snippet}
</PlaygroundShell>

<style>
	.je-layout {
		display: grid;
		grid-template-columns: 1fr 380px;
		gap: 1.5rem;
		padding: 1.5rem;
		min-height: 0;
	}

	.je-main {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		min-width: 0;
	}

	.je-sidebar {
		position: sticky;
		top: 1.5rem;
		align-self: start;
	}

	@media (max-width: 1024px) {
		.je-layout {
			grid-template-columns: 1fr;
		}

		.je-sidebar {
			position: static;
		}
	}
</style>
