<script lang="ts">
	import { t } from '$lib/i18n';
	import { currency$, accountingStandard$, setCurrency, setAccountingStandard } from '$lib/stores/preferences';
	import type { AccountingStandard } from '$lib/contracts/playground';

	const currencies = ['XAF', 'EUR', 'USD', 'GBP'] as const;

	const standards: { value: AccountingStandard; label: string }[] = [
		{ value: 'syscohada', label: 'SYSCOHADA' },
		{ value: 'ifrs', label: 'IFRS' },
		{ value: 'french-pcg', label: 'French PCG' },
		{ value: 'us-gaap', label: 'US GAAP' },
	];

	function handleCurrencyChange(e: Event) {
		const target = e.target as HTMLSelectElement;
		setCurrency(target.value);
	}

	function handleStandardChange(e: Event) {
		const target = e.target as HTMLSelectElement;
		setAccountingStandard(target.value as AccountingStandard);
	}
</script>

<div class="settings">
	<div class="setting-group">
		<label class="setting-label" for="currency-select">{$t('shell.currency')}</label>
		<select
			id="currency-select"
			class="setting-select"
			value={$currency$}
			onchange={handleCurrencyChange}
		>
			{#each currencies as code (code)}
				<option value={code}>{code}</option>
			{/each}
		</select>
	</div>

	<div class="setting-group">
		<label class="setting-label" for="standard-select">{$t('shell.standard')}</label>
		<select
			id="standard-select"
			class="setting-select"
			value={$accountingStandard$}
			onchange={handleStandardChange}
		>
			{#each standards as std (std.value)}
				<option value={std.value}>{std.label}</option>
			{/each}
		</select>
	</div>
</div>

<style>
	.settings {
		display: flex;
		align-items: center;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.setting-group {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.setting-label {
		font-family: var(--font-mono);
		font-size: 0.75rem;
		font-weight: 500;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--text-muted);
		white-space: nowrap;
	}

	.setting-select {
		appearance: none;
		padding: 0.375rem 2rem 0.375rem 0.625rem;
		background: var(--bg-subtle);
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-sm);
		color: var(--text-primary);
		font-family: var(--font-mono);
		font-size: 0.8125rem;
		font-weight: 500;
		cursor: pointer;
		transition:
			border-color var(--transition-fast),
			box-shadow var(--transition-fast);
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12' fill='none'%3E%3Cpath d='M3 5l3 3 3-3' stroke='%237c7fff' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
		background-repeat: no-repeat;
		background-position: right 0.5rem center;
	}

	.setting-select:hover {
		border-color: var(--accent);
	}

	.setting-select:focus-visible {
		outline: none;
		border-color: var(--accent);
		box-shadow: 0 0 0 2px var(--accent-glow);
	}

	.setting-select option {
		background: var(--panel);
		color: var(--text-primary);
	}

	@media (max-width: 480px) {
		.settings {
			gap: 0.625rem;
		}

		.setting-label {
			font-size: 0.6875rem;
		}
	}
</style>
