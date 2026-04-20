<script lang="ts">
	import { t } from '$lib/i18n';
	import { currency$ } from '$lib/stores/preferences';
	import { fmtCurrency } from '$lib/format';
	import type { BankTransaction, MatchPair } from '../types';

	let {
		transactions,
		matches,
		selectedId = null,
		onSelect = () => {},
	}: {
		transactions: BankTransaction[];
		matches: MatchPair[];
		selectedId?: string | null;
		onSelect?: (id: string | null) => void;
	} = $props();

	let translate = $derived($t);
	let currency = $derived($currency$);
	let matchedSet = $derived(new Set(matches.map((m) => m.bankTxId)));
</script>

<section class="panel" aria-labelledby="br-bank-heading">
	<h3 id="br-bank-heading">{translate('br.bank.title')}</h3>
	{#if transactions.length === 0}
		<p class="empty">{translate('br.bank.empty')}</p>
	{:else}
		<table class="tx-table">
			<thead>
				<tr>
					<th scope="col">{translate('br.bank.headerDate')}</th>
					<th scope="col">{translate('br.bank.headerDescription')}</th>
					<th scope="col">{translate('br.bank.headerReference')}</th>
					<th scope="col" class="amount-col">{translate('br.bank.headerAmount')}</th>
				</tr>
			</thead>
			<tbody>
				{#each transactions as tx (tx.id)}
					{@const isMatched = matchedSet.has(tx.id)}
					{@const isSelected = selectedId === tx.id}
					<tr
						class="tx-row"
						class:matched={isMatched}
						class:unmatched={!isMatched}
						class:selected={isSelected}
						onclick={() => onSelect(isSelected ? null : tx.id)}
					>
						<td>{tx.date}</td>
						<td class="desc-cell">{tx.description}</td>
						<td class="ref-cell">{tx.reference ?? ''}</td>
						<td class="amount-col" class:negative={tx.amount < 0}>
							{fmtCurrency(tx.amount, currency)}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	{/if}
</section>

<style>
	.panel {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		padding: 1rem;
		background: var(--panel);
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-md);
		min-width: 0;
	}

	.panel h3 {
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

	.tx-table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.8125rem;
	}

	.tx-table th {
		text-align: left;
		padding: 0.375rem 0.5rem;
		font-family: var(--font-mono);
		font-size: 0.6875rem;
		font-weight: 500;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--text-muted);
		border-bottom: 1px solid var(--border-subtle);
	}

	.tx-table td {
		padding: 0.5rem;
		border-bottom: 1px solid var(--border-subtle);
		color: var(--text-primary);
	}

	.amount-col {
		text-align: right;
		font-family: var(--font-mono);
		font-variant-numeric: tabular-nums;
	}

	.amount-col.negative {
		color: var(--error, #ef4444);
	}

	.desc-cell {
		max-width: 16rem;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.ref-cell {
		font-family: var(--font-mono);
		color: var(--text-secondary);
		font-size: 0.75rem;
	}

	.tx-row {
		cursor: pointer;
		transition: background var(--transition-fast);
	}

	.tx-row:hover {
		background: var(--panel-hover);
	}

	.tx-row.unmatched {
		background: color-mix(in srgb, var(--orange, #f59e0b) 8%, transparent);
	}

	.tx-row.selected {
		background: var(--accent-glow);
		box-shadow: inset 3px 0 0 0 var(--accent);
	}
</style>
