<script lang="ts">
	import { t } from '$lib/i18n';
	import NumberField from '$lib/components/playground/NumberField.svelte';
	import type { ReconciliationInputs } from '../types';

	let {
		inputs,
		onChange,
	}: {
		inputs: ReconciliationInputs;
		onChange: (patch: Partial<ReconciliationInputs>) => void;
	} = $props();

	let translate = $derived($t);

	function updatePeriodEnd(e: Event) {
		onChange({ periodEnd: (e.target as HTMLInputElement).value });
	}
</script>

<section class="inputs-panel" aria-labelledby="br-inputs-heading">
	<h3 id="br-inputs-heading">{translate('br.inputs.title')}</h3>

	<label class="period-field">
		<span class="period-label">{translate('br.inputs.periodEnd')}</span>
		<input
			type="date"
			class="period-input"
			value={inputs.periodEnd}
			oninput={updatePeriodEnd}
		/>
	</label>

	<NumberField
		label={translate('br.inputs.openingBank')}
		value={inputs.openingBankBalance}
		onChange={(v) => onChange({ openingBankBalance: v })}
	/>
	<NumberField
		label={translate('br.inputs.closingBank')}
		value={inputs.closingBankBalance}
		onChange={(v) => onChange({ closingBankBalance: v })}
	/>
	<NumberField
		label={translate('br.inputs.openingBook')}
		value={inputs.openingBookBalance}
		onChange={(v) => onChange({ openingBookBalance: v })}
	/>
	<NumberField
		label={translate('br.inputs.closingBook')}
		value={inputs.closingBookBalance}
		onChange={(v) => onChange({ closingBookBalance: v })}
	/>
</section>

<style>
	.inputs-panel {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-md, 1rem);
		padding: 1rem;
		background: var(--panel);
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-md);
	}

	.inputs-panel h3 {
		margin: 0 0 0.25rem;
		font-family: var(--font-display);
		font-size: 0.9375rem;
		color: var(--text-primary);
		font-weight: 600;
	}

	.period-field {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
	}

	.period-label {
		font-family: var(--font-body);
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--text-secondary);
		letter-spacing: 0.02em;
	}

	.period-input {
		padding: 0.5rem 0.75rem;
		background: var(--bg-input, var(--panel));
		color: var(--text-primary);
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		font-family: var(--font-body);
		font-size: 0.875rem;
		outline: none;
	}

	.period-input:focus {
		border-color: var(--accent);
	}
</style>
