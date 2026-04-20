<script lang="ts">
	import { currency$ } from '$lib/stores/preferences';
	import { fmtCurrency } from '$lib/format';

	let {
		totalDebit,
		totalCredit,
		debitLabel = 'Debit',
		creditLabel = 'Credit',
		balancedLabel = 'Balanced',
		unbalancedLabel = 'Unbalanced',
	}: {
		totalDebit: number;
		totalCredit: number;
		debitLabel?: string;
		creditLabel?: string;
		balancedLabel?: string;
		unbalancedLabel?: string;
	} = $props();

	let diff = $derived(Math.abs(totalDebit - totalCredit));
	let isBalanced = $derived(diff < 0.01);
	let currency = $derived($currency$);
</script>

<div class="balance-bar" role="status" aria-live="polite">
	<span class="balance-item">
		<span class="balance-label">{debitLabel}:</span>
		<span class="balance-value debit">{fmtCurrency(totalDebit, currency)}</span>
	</span>

	<span class="balance-sep" aria-hidden="true">|</span>

	<span class="balance-item">
		<span class="balance-label">{creditLabel}:</span>
		<span class="balance-value credit">{fmtCurrency(totalCredit, currency)}</span>
	</span>

	<span class="balance-sep" aria-hidden="true">|</span>

	<span class="balance-item">
		<span
			class="balance-status"
			class:balanced={isBalanced}
			class:unbalanced={!isBalanced}
		>
			{#if isBalanced}
				<svg class="status-icon" width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
					<path d="M3 8.5l3.5 3.5L13 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
				</svg>
				{balancedLabel}
			{:else}
				<span class="diff-amount">{fmtCurrency(diff, currency)}</span>
				{unbalancedLabel}
			{/if}
		</span>
	</span>
</div>

<style>
	.balance-bar {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.5rem 0.75rem;
		background: var(--bg-subtle);
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-sm);
		font-family: var(--font-mono);
		font-size: 0.8125rem;
		flex-wrap: wrap;
	}

	.balance-item {
		display: flex;
		align-items: center;
		gap: 0.375rem;
	}

	.balance-label {
		color: var(--text-muted);
		font-family: var(--font-body);
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.03em;
	}

	.balance-value {
		color: var(--text-primary);
		font-weight: 600;
	}

	.balance-sep {
		color: var(--border);
		user-select: none;
	}

	.balance-status {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		font-family: var(--font-body);
		font-weight: 600;
		font-size: 0.8125rem;
	}

	.balance-status.balanced {
		color: var(--green);
	}

	.balance-status.unbalanced {
		color: var(--error);
	}

	.status-icon {
		flex-shrink: 0;
	}

	.diff-amount {
		font-family: var(--font-mono);
		margin-right: 0.25rem;
	}

	@media (max-width: 480px) {
		.balance-bar {
			gap: 0.375rem;
			font-size: 0.75rem;
		}

		.balance-sep {
			display: none;
		}

		.balance-item {
			flex: 1 1 auto;
		}
	}
</style>
