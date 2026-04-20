<script lang="ts">
	import { t } from '$lib/i18n';
	import { currency$ } from '$lib/stores/preferences';
	import { fmtCurrency } from '$lib/format';
	import type { BankTransaction, LedgerEntry, ItemCategory, ReconcilingItem } from '../types';

	let {
		items,
		unmatchedBank,
		unmatchedBooks,
		onClassify,
	}: {
		items: ReconcilingItem[];
		unmatchedBank: BankTransaction[];
		unmatchedBooks: LedgerEntry[];
		onClassify: (id: string, category: ItemCategory) => void;
	} = $props();

	let translate = $derived($t);
	let currency = $derived($currency$);
	let categoryById = $derived(new Map(items.map((i) => [i.id, i.category] as const)));

	const CATEGORIES: ItemCategory[] = [
		'outstanding-check',
		'deposit-in-transit',
		'bank-charge',
		'interest-earned',
		'nsf-check',
		'direct-debit',
		'standing-order',
		'bank-error',
		'company-error',
	];

	const CATEGORY_LABEL_KEY: Record<ItemCategory, string> = {
		'outstanding-check': 'br.category.outstandingCheck.label',
		'deposit-in-transit': 'br.category.depositInTransit.label',
		'bank-charge': 'br.category.bankCharge.label',
		'interest-earned': 'br.category.interestEarned.label',
		'nsf-check': 'br.category.nsfCheck.label',
		'direct-debit': 'br.category.directDebit.label',
		'standing-order': 'br.category.standingOrder.label',
		'bank-error': 'br.category.bankError.label',
		'company-error': 'br.category.companyError.label',
	};

	function handleSelect(id: string, e: Event) {
		const value = (e.target as HTMLSelectElement).value as ItemCategory;
		if (value) onClassify(id, value);
	}
</script>

<section class="unmatched-panel" aria-labelledby="br-unmatched-heading">
	<h3 id="br-unmatched-heading">{translate('br.unmatched.title')}</h3>
	<div class="grid">
		<div class="side">
			<h4>{translate('br.unmatched.bankSide')}</h4>
			{#if unmatchedBank.length === 0}
				<p class="empty">—</p>
			{:else}
				<ul>
					{#each unmatchedBank as tx (tx.id)}
						<li class="row">
							<span class="desc">{tx.description}</span>
							<span class="amt" class:negative={tx.amount < 0}>{fmtCurrency(tx.amount, currency)}</span>
							<select
								class="cat-select"
								value={categoryById.get(tx.id) ?? ''}
								onchange={(e) => handleSelect(tx.id, e)}
								aria-label={translate('br.classify.placeholder')}
							>
								<option value="" disabled>{translate('br.classify.placeholder')}</option>
								{#each CATEGORIES as cat (cat)}
									<option value={cat}>{translate(CATEGORY_LABEL_KEY[cat])}</option>
								{/each}
							</select>
						</li>
					{/each}
				</ul>
			{/if}
		</div>

		<div class="side">
			<h4>{translate('br.unmatched.booksSide')}</h4>
			{#if unmatchedBooks.length === 0}
				<p class="empty">—</p>
			{:else}
				<ul>
					{#each unmatchedBooks as entry (entry.id)}
						<li class="row">
							<span class="desc">{entry.description}</span>
							<span class="amt" class:negative={entry.amount < 0}>{fmtCurrency(entry.amount, currency)}</span>
							<select
								class="cat-select"
								value={categoryById.get(entry.id) ?? ''}
								onchange={(e) => handleSelect(entry.id, e)}
								aria-label={translate('br.classify.placeholder')}
							>
								<option value="" disabled>{translate('br.classify.placeholder')}</option>
								{#each CATEGORIES as cat (cat)}
									<option value={cat}>{translate(CATEGORY_LABEL_KEY[cat])}</option>
								{/each}
							</select>
						</li>
					{/each}
				</ul>
			{/if}
		</div>
	</div>
</section>

<style>
	.unmatched-panel {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		padding: 1rem;
		background: var(--panel);
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-md);
	}

	.unmatched-panel h3 {
		margin: 0;
		font-family: var(--font-display);
		font-size: 0.9375rem;
		font-weight: 600;
		color: var(--text-primary);
	}

	.grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.75rem;
	}

	.side h4 {
		margin: 0 0 0.5rem;
		font-family: var(--font-mono);
		font-size: 0.6875rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--text-muted);
		font-weight: 500;
	}

	.empty {
		margin: 0;
		color: var(--text-muted);
		font-size: 0.8125rem;
	}

	ul {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
	}

	.row {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		grid-template-rows: auto auto;
		gap: 0.25rem 0.5rem;
		padding: 0.5rem;
		background: var(--bg-subtle);
		border-radius: var(--radius-sm);
		font-size: 0.8125rem;
	}

	.desc {
		color: var(--text-primary);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.amt {
		font-family: var(--font-mono);
		font-variant-numeric: tabular-nums;
		text-align: right;
		color: var(--text-primary);
	}

	.amt.negative {
		color: var(--error, #ef4444);
	}

	.cat-select {
		grid-column: 1 / span 2;
		padding: 0.25rem 0.375rem;
		background: var(--panel);
		color: var(--text-primary);
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		font-family: var(--font-body);
		font-size: 0.75rem;
	}

	@media (max-width: 720px) {
		.grid {
			grid-template-columns: 1fr;
		}
	}
</style>
