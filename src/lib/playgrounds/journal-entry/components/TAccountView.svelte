<script lang="ts">
	import { t } from '$lib/i18n';
	import { locale } from '$lib/i18n';
	import { currency$ } from '$lib/stores/preferences';
	import { fmtCurrency } from '$lib/format';
	import { formatAccountLabel } from '$lib/shared/chart-of-accounts';
	import type { TAccountData } from '../types';

	let {
		data
	}: {
		data: TAccountData | null;
	} = $props();

	let currency = $derived($currency$);
	let currentLocale = $derived($locale);

	let balanceSide = $derived.by(() => {
		if (!data) return 'debit';
		return data.balance >= 0 ? 'debit' : 'credit';
	});

	let balanceAbs = $derived(data ? Math.abs(data.balance) : 0);

	let accountName = $derived.by(() => {
		if (!data) return '';
		return formatAccountLabel(data.account, currentLocale);
	});
</script>

<div class="taccount-view">
	<h3 class="taccount-title">{$t('je.taccount.title')}</h3>

	{#if !data}
		<div class="empty-state">
			<svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
				<line x1="4" y1="8" x2="36" y2="8" stroke="currentColor" stroke-width="1.5" />
				<line x1="20" y1="8" x2="20" y2="36" stroke="currentColor" stroke-width="1.5" />
				<text x="10" y="6" fill="currentColor" font-size="5" text-anchor="middle" font-family="var(--font-mono)">D</text>
				<text x="30" y="6" fill="currentColor" font-size="5" text-anchor="middle" font-family="var(--font-mono)">C</text>
			</svg>
			<p class="empty-text">{$t('je.taccount.empty')}</p>
		</div>
	{:else}
		<div class="taccount" role="table" aria-label={accountName}>
			<!-- Account name header -->
			<div class="taccount-header">
				<span class="account-name">{accountName}</span>
			</div>

			<!-- Column headers -->
			<div class="taccount-columns">
				<div class="taccount-col debit-col">
					<span class="col-label">{$t('je.taccount.debits')}</span>
				</div>
				<div class="taccount-divider" aria-hidden="true"></div>
				<div class="taccount-col credit-col">
					<span class="col-label">{$t('je.taccount.credits')}</span>
				</div>
			</div>

			<!-- Entries -->
			<div class="taccount-body">
				<div class="taccount-col debit-col">
					{#each data.debits as entry}
						<div class="taccount-entry">
							<span class="entry-desc" title={entry.description}>{entry.description}</span>
							<span class="entry-amount debit-amount">{fmtCurrency(entry.debit, currency)}</span>
						</div>
					{/each}
				</div>
				<div class="taccount-divider-body" aria-hidden="true"></div>
				<div class="taccount-col credit-col">
					{#each data.credits as entry}
						<div class="taccount-entry">
							<span class="entry-desc" title={entry.description}>{entry.description}</span>
							<span class="entry-amount credit-amount">{fmtCurrency(entry.credit, currency)}</span>
						</div>
					{/each}
				</div>
			</div>

			<!-- Totals -->
			<div class="taccount-totals">
				<div class="taccount-col debit-col">
					<div class="total-row">
						<span class="total-label">Total</span>
						<span class="total-amount">{fmtCurrency(data.debitTotal, currency)}</span>
					</div>
				</div>
				<div class="taccount-divider" aria-hidden="true"></div>
				<div class="taccount-col credit-col">
					<div class="total-row">
						<span class="total-label">Total</span>
						<span class="total-amount">{fmtCurrency(data.creditTotal, currency)}</span>
					</div>
				</div>
			</div>

			<!-- Balance -->
			<div class="taccount-balance">
				<span class="balance-label">{$t('je.taccount.balance')}:</span>
				<span
					class="balance-amount"
					class:debit-side={balanceSide === 'debit'}
					class:credit-side={balanceSide === 'credit'}
				>
					{fmtCurrency(balanceAbs, currency)}
					<span class="balance-side">({balanceSide === 'debit' ? $t('je.form.debit') : $t('je.form.credit')})</span>
				</span>
			</div>
		</div>
	{/if}
</div>

<style>
	.taccount-view {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.taccount-title {
		font-family: var(--font-display);
		font-size: 0.9375rem;
		font-weight: 600;
		color: var(--text-primary);
		margin: 0 0 0.25rem;
	}

	/* ---- Empty state ---- */
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		padding: 2rem 1rem;
		color: var(--text-muted);
		text-align: center;
	}

	.empty-text {
		font-size: 0.8125rem;
		margin: 0;
		max-width: 24ch;
		line-height: 1.5;
	}

	/* ---- T-Account ---- */
	.taccount {
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-md);
		overflow: hidden;
		background: var(--panel);
	}

	.taccount-header {
		padding: 0.625rem 0.75rem;
		text-align: center;
		border-bottom: 2px solid var(--text-primary);
		background: var(--bg-subtle);
	}

	.account-name {
		font-family: var(--font-display);
		font-size: 0.875rem;
		font-weight: 700;
		color: var(--text-primary);
	}

	.taccount-columns {
		display: flex;
		border-bottom: 1px solid var(--border-subtle);
	}

	.taccount-col {
		flex: 1;
		min-width: 0;
	}

	.col-label {
		display: block;
		padding: 0.375rem 0.625rem;
		font-family: var(--font-body);
		font-size: 0.6875rem;
		font-weight: 700;
		color: var(--text-muted);
		text-transform: uppercase;
		letter-spacing: 0.04em;
		text-align: center;
	}

	.debit-col .col-label {
		color: var(--green);
	}

	.credit-col .col-label {
		color: var(--error);
	}

	.taccount-divider,
	.taccount-divider-body {
		width: 1px;
		background: var(--text-primary);
		flex-shrink: 0;
	}

	.taccount-divider-body {
		background: var(--border);
	}

	/* ---- Body (entries) ---- */
	.taccount-body {
		display: flex;
		min-height: 3rem;
	}

	.taccount-entry {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		gap: 0.375rem;
		padding: 0.3125rem 0.625rem;
		border-bottom: 1px solid var(--border-subtle);
	}

	.taccount-entry:last-child {
		border-bottom: none;
	}

	.entry-desc {
		font-size: 0.75rem;
		color: var(--text-secondary);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		flex: 1;
		min-width: 0;
	}

	.entry-amount {
		font-family: var(--font-mono);
		font-size: 0.8125rem;
		font-weight: 600;
		flex-shrink: 0;
	}

	.debit-amount {
		color: var(--green);
	}

	.credit-amount {
		color: var(--error);
	}

	/* ---- Totals ---- */
	.taccount-totals {
		display: flex;
		border-top: 2px solid var(--border);
		background: var(--bg-subtle);
	}

	.total-row {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		padding: 0.4375rem 0.625rem;
	}

	.total-label {
		font-size: 0.6875rem;
		font-weight: 600;
		color: var(--text-muted);
		text-transform: uppercase;
	}

	.total-amount {
		font-family: var(--font-mono);
		font-size: 0.875rem;
		font-weight: 700;
		color: var(--text-primary);
	}

	/* ---- Balance ---- */
	.taccount-balance {
		display: flex;
		align-items: baseline;
		justify-content: center;
		gap: 0.5rem;
		padding: 0.5rem 0.75rem;
		border-top: 1px solid var(--border-subtle);
	}

	.balance-label {
		font-family: var(--font-body);
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--text-secondary);
	}

	.balance-amount {
		font-family: var(--font-mono);
		font-size: 0.9375rem;
		font-weight: 700;
	}

	.balance-amount.debit-side {
		color: var(--green);
	}

	.balance-amount.credit-side {
		color: var(--error);
	}

	.balance-side {
		font-family: var(--font-body);
		font-size: 0.6875rem;
		font-weight: 400;
		opacity: 0.75;
	}

	/* ---- Responsive ---- */
	@media (max-width: 400px) {
		.entry-desc {
			font-size: 0.6875rem;
		}

		.entry-amount {
			font-size: 0.75rem;
		}

		.col-label {
			font-size: 0.625rem;
		}
	}
</style>
