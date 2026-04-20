<script lang="ts">
	import { t, locale } from '$lib/i18n';
	import { currency$ } from '$lib/stores/preferences';
	import { fmtCurrency } from '$lib/format';
	import { getAccount, formatAccountLabel } from '$lib/shared/chart-of-accounts';
	import type { AccountingFramework } from '$lib/shared/chart-of-accounts/types';
	import type { AdjustingJournalEntry } from '../types';

	let {
		entries,
		framework,
	}: {
		entries: AdjustingJournalEntry[];
		framework: AccountingFramework;
	} = $props();

	let translate = $derived($t);
	let currency = $derived($currency$);
	let currentLocale = $derived($locale);

	function accountLabel(key: string): string {
		const acc = getAccount(key, framework);
		return acc ? formatAccountLabel(acc, currentLocale) : key;
	}
</script>

<section class="adjustments-panel" aria-labelledby="br-adjustments-heading">
	<h3 id="br-adjustments-heading">{translate('br.adjustments.title')}</h3>
	{#if entries.length === 0}
		<p class="empty">{translate('br.adjustments.empty')}</p>
	{:else}
		<div class="entries">
			{#each entries as entry (entry.itemId)}
				<article class="entry">
					<header>
						<h4>{translate(entry.labelKey)}</h4>
						<span class="amount">{fmtCurrency(entry.amount, currency)}</span>
					</header>
					<p class="desc">{translate(entry.descKey)}</p>
					<table class="lines">
						<thead>
							<tr>
								<th scope="col">{translate('br.adjustments.account')}</th>
								<th scope="col" class="num">{translate('br.adjustments.debit')}</th>
								<th scope="col" class="num">{translate('br.adjustments.credit')}</th>
							</tr>
						</thead>
						<tbody>
							{#each entry.lines as line, i (i)}
								<tr>
									<td>{accountLabel(line.accountKey)}</td>
									<td class="num">{line.debit > 0 ? fmtCurrency(line.debit, currency) : ''}</td>
									<td class="num">{line.credit > 0 ? fmtCurrency(line.credit, currency) : ''}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</article>
			{/each}
		</div>
	{/if}
</section>

<style>
	.adjustments-panel {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		padding: 1rem;
		background: var(--panel);
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-md);
	}

	.adjustments-panel h3 {
		margin: 0;
		font-family: var(--font-display);
		font-size: 0.9375rem;
		font-weight: 600;
		color: var(--text-primary);
	}

	.empty {
		margin: 0;
		padding: 1rem 0;
		color: var(--text-muted);
		font-size: 0.8125rem;
		font-style: italic;
		text-align: center;
	}

	.entries {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.entry {
		padding: 0.75rem;
		background: var(--bg-subtle);
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-sm);
	}

	.entry header {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 0.5rem;
		margin-bottom: 0.25rem;
	}

	.entry h4 {
		margin: 0;
		font-family: var(--font-display);
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--text-primary);
	}

	.amount {
		font-family: var(--font-mono);
		font-variant-numeric: tabular-nums;
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--accent);
	}

	.desc {
		margin: 0 0 0.5rem;
		font-size: 0.75rem;
		color: var(--text-muted);
	}

	.lines {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.8125rem;
	}

	.lines th {
		text-align: left;
		padding: 0.25rem 0.5rem;
		font-family: var(--font-mono);
		font-size: 0.625rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--text-muted);
		font-weight: 500;
		border-bottom: 1px solid var(--border-subtle);
	}

	.lines td {
		padding: 0.375rem 0.5rem;
		color: var(--text-primary);
		border-bottom: 1px dotted var(--border-subtle);
	}

	.num {
		text-align: right;
		font-family: var(--font-mono);
		font-variant-numeric: tabular-nums;
	}
</style>
