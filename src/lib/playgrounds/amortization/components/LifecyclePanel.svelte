<script lang="ts">
	import { t, locale } from '$lib/i18n';
	import { currency$ } from '$lib/stores/preferences';
	import { fmtCurrency } from '$lib/format';
	import { getAccount } from '$lib/shared/chart-of-accounts';
	import type { AccountingFramework } from '$lib/shared/chart-of-accounts/types';
	import type { LifecycleJournalEntries, LifecycleStage } from '../types';

	let {
		entries,
		framework,
		selectedStage,
		onSelectStage,
		onSelectFramework,
	}: {
		entries: LifecycleJournalEntries;
		framework: AccountingFramework;
		selectedStage: LifecycleStage;
		onSelectStage: (stage: LifecycleStage) => void;
		onSelectFramework: (framework: AccountingFramework) => void;
	} = $props();

	let translate = $derived($t);
	let currentLocale = $derived($locale);
	let currency = $derived($currency$);

	const frameworks: AccountingFramework[] = ['ohada', 'pcg', 'ifrs', 'usgaap'];

	let currentEntry = $derived(
		entries.entries.find((e) => e.stage === selectedStage) ?? entries.entries[0] ?? null,
	);

	// Stage actually rendered in the table + narration. If the user selected
	// a stage (e.g. Prepayment) that has since disappeared from `entries`
	// because an input change removed its trigger (lumpSum back to 0), we
	// fall back to entries[0] — and the tab bar should light THAT tab up,
	// not the now-orphaned selection the parent state still holds.
	// Deriving the active-highlight from the rendered entry keeps the tab
	// bar and the table in sync without a side-effect that could loop.
	let activeStage = $derived(currentEntry?.stage ?? selectedStage);

	let totals = $derived.by(() => {
		if (!currentEntry) return { debit: 0, credit: 0 };
		let d = 0;
		let c = 0;
		for (const line of currentEntry.lines) {
			d += line.debit;
			c += line.credit;
		}
		return { debit: d, credit: c };
	});

	function money(value: number): string {
		if (!Number.isFinite(value) || value === 0) return '—';
		return fmtCurrency(value, currency);
	}

	function accountLabel(key: string): { code: string; name: string } {
		const acc = getAccount(key, framework);
		if (!acc) return { code: '—', name: key };
		return {
			code: acc.frameworkCode,
			name: currentLocale === 'fr' ? acc.frameworkNameFr : acc.frameworkNameEn,
		};
	}
</script>

<section class="lc-panel">
	<header class="lc-header">
		<div class="lc-title-row">
			<h2 class="lc-title">{translate('am.lifecycle.title')}</h2>
			<div class="lc-framework">
				<span class="lc-framework-label">{translate('am.lifecycle.framework')}</span>
				<div class="lc-framework-tabs" role="tablist">
					{#each frameworks as fw (fw)}
						<button
							type="button"
							role="tab"
							aria-selected={framework === fw}
							class="lc-framework-tab"
							class:active={framework === fw}
							onclick={() => onSelectFramework(fw)}
						>
							{translate(`am.lifecycle.framework.${fw}`)}
						</button>
					{/each}
				</div>
			</div>
		</div>

		<div class="lc-stages" role="tablist">
			{#each entries.entries as e (e.stage)}
				<button
					type="button"
					role="tab"
					aria-selected={activeStage === e.stage}
					class="lc-stage"
					class:active={activeStage === e.stage}
					onclick={() => onSelectStage(e.stage)}
				>
					{translate(e.labelKey as never)}
				</button>
			{/each}
		</div>
	</header>

	{#if !currentEntry}
		<p class="lc-empty">{translate('am.lifecycle.empty')}</p>
	{:else}
		<div class="lc-body">
			<p class="lc-desc">{translate(currentEntry.descKey as never)}</p>

			<table class="lc-table">
				<thead>
					<tr>
						<th class="lc-th lc-th-account">{translate('am.lifecycle.entry.account')}</th>
						<th class="lc-th lc-th-num">{translate('am.lifecycle.entry.debit')}</th>
						<th class="lc-th lc-th-num">{translate('am.lifecycle.entry.credit')}</th>
					</tr>
				</thead>
				<tbody>
					{#each currentEntry.lines as line, i (i)}
						{@const acc = accountLabel(line.accountKey)}
						{@const hasCode = acc.code && acc.code !== '-' && acc.code !== '—'}
						<tr class="lc-row" class:lc-row-credit={line.credit > 0}>
							<td class="lc-td lc-td-account">
								{#if hasCode}
									<span class="lc-code">{acc.code}</span>
								{/if}
								<span class="lc-name">{acc.name}</span>
							</td>
							<td class="lc-td lc-td-num lc-td-debit">{money(line.debit)}</td>
							<td class="lc-td lc-td-num lc-td-credit">{money(line.credit)}</td>
						</tr>
					{/each}
				</tbody>
				<tfoot>
					<tr class="lc-total-row">
						<td class="lc-td lc-td-label">{translate('am.lifecycle.entry.total')}</td>
						<td class="lc-td lc-td-num">{money(totals.debit)}</td>
						<td class="lc-td lc-td-num">{money(totals.credit)}</td>
					</tr>
				</tfoot>
			</table>

			{#if currentEntry.narrationKey}
				<p class="lc-narration">{translate(currentEntry.narrationKey as never)}</p>
			{/if}

			{#if currentEntry.sampleAmount !== undefined}
				<div class="lc-sample">
					<span class="lc-sample-label">{translate('am.lifecycle.entry.sampleAmount')}</span>
					<span class="lc-sample-value">{money(currentEntry.sampleAmount)}</span>
				</div>
			{/if}
		</div>
	{/if}
</section>

<style>
	.lc-panel {
		display: flex;
		flex-direction: column;
		background: var(--panel);
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-md);
		overflow: hidden;
		min-height: 0;
	}

	.lc-header {
		padding: 0.875rem 1rem;
		border-bottom: 1px solid var(--border-subtle);
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		flex-shrink: 0;
	}

	.lc-title-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.lc-title {
		font-family: var(--font-display);
		font-size: 0.9375rem;
		font-weight: 600;
		color: var(--text-primary);
		margin: 0;
		letter-spacing: -0.01em;
	}

	.lc-framework {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.lc-framework-label {
		font-family: var(--font-mono);
		font-size: 0.6875rem;
		font-weight: 500;
		color: var(--text-muted);
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}

	.lc-framework-tabs {
		display: inline-flex;
		background: var(--bg);
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-sm);
		padding: 2px;
		gap: 1px;
	}

	.lc-framework-tab {
		border: none;
		background: transparent;
		color: var(--text-muted);
		font-family: var(--font-mono);
		font-size: 0.6875rem;
		font-weight: 600;
		letter-spacing: 0.04em;
		padding: 4px 10px;
		border-radius: 3px;
		cursor: pointer;
		transition: background 0.12s ease, color 0.12s ease;
	}

	.lc-framework-tab:hover {
		color: var(--text-secondary);
	}

	.lc-framework-tab:focus-visible {
		outline: 2px solid var(--accent);
		outline-offset: 2px;
	}

	.lc-framework-tab.active {
		background: var(--panel);
		color: var(--text-primary);
		box-shadow: 0 0 0 1px var(--border) inset;
	}

	.lc-stages {
		display: flex;
		flex-wrap: wrap;
		gap: 0.375rem;
	}

	.lc-stage {
		border: 1px solid var(--border-subtle);
		background: var(--bg);
		color: var(--text-secondary);
		font-family: var(--font-display);
		font-size: 0.75rem;
		font-weight: 500;
		padding: 0.375rem 0.75rem;
		border-radius: var(--radius-sm);
		cursor: pointer;
		transition: all 0.12s ease;
	}

	.lc-stage:hover {
		border-color: var(--border);
		color: var(--text-primary);
	}

	.lc-stage:focus-visible {
		outline: 2px solid var(--accent);
		outline-offset: 2px;
	}

	.lc-stage.active {
		background: var(--panel-hover, var(--accent-glow, rgba(255, 255, 255, 0.05)));
		color: var(--accent);
		border-color: var(--accent);
	}

	.lc-empty {
		padding: 2rem 1rem;
		font-family: var(--font-mono);
		font-size: 0.8125rem;
		color: var(--text-muted);
		text-align: center;
		margin: 0;
	}

	.lc-body {
		padding: 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.875rem;
		overflow: auto;
		min-height: 0;
	}

	.lc-desc {
		font-family: var(--font-display);
		font-size: 0.8125rem;
		line-height: 1.5;
		color: var(--text-secondary);
		margin: 0;
	}

	.lc-table {
		width: 100%;
		border-collapse: separate;
		border-spacing: 0;
		font-family: var(--font-mono);
		font-size: 0.75rem;
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-sm);
		overflow: hidden;
	}

	.lc-th {
		background: var(--bg);
		color: var(--text-muted);
		font-weight: 600;
		font-size: 0.625rem;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		padding: 0.5rem 0.75rem;
		text-align: left;
		border-bottom: 1px solid var(--border-subtle);
	}

	.lc-th-num {
		text-align: right;
	}

	.lc-td {
		padding: 0.5rem 0.75rem;
		color: var(--text-primary);
		border-bottom: 1px solid var(--border-subtle);
	}

	.lc-td-num {
		text-align: right;
		font-variant-numeric: tabular-nums;
	}

	.lc-row-credit .lc-td-account {
		padding-left: 1.75rem;
	}

	.lc-td-account {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.lc-code {
		font-family: var(--font-mono);
		font-size: 0.6875rem;
		font-weight: 700;
		color: var(--accent);
		letter-spacing: 0.04em;
	}

	.lc-name {
		font-family: var(--font-display);
		font-size: 0.75rem;
		color: var(--text-secondary);
	}

	.lc-td-debit {
		color: var(--text-primary);
		font-weight: 600;
	}

	.lc-td-credit {
		color: var(--text-primary);
		font-weight: 600;
	}

	.lc-total-row .lc-td {
		background: var(--bg);
		border-top: 1px solid var(--border);
		border-bottom: none;
		font-weight: 700;
		color: var(--text-primary);
	}

	.lc-td-label {
		text-align: right;
		color: var(--text-muted);
		font-size: 0.6875rem;
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}

	.lc-narration {
		font-family: var(--font-display);
		font-size: 0.8125rem;
		line-height: 1.6;
		color: var(--text-secondary);
		margin: 0;
		padding: 0.75rem 1rem;
		background: var(--bg);
		border-left: 2px solid var(--accent);
		border-radius: var(--radius-sm);
	}

	.lc-sample {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.5rem 0.75rem;
		background: var(--bg);
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-sm);
	}

	.lc-sample-label {
		font-family: var(--font-mono);
		font-size: 0.6875rem;
		font-weight: 600;
		color: var(--text-muted);
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	.lc-sample-value {
		font-family: var(--font-display);
		font-size: 0.9375rem;
		font-weight: 700;
		color: var(--accent);
		font-variant-numeric: tabular-nums;
	}
</style>
