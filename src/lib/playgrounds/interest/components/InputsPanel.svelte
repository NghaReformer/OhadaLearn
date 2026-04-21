<script lang="ts">
	import { t } from '$lib/i18n';
	import NumberField from '$lib/components/playground/NumberField.svelte';
	import type { InterestInputs } from '../types';
	import type { CompoundingFrequency } from '$lib/playgrounds/tvm/types';
	import type { DayCount } from '$lib/playgrounds/amortization/types';

	let {
		inputs,
		onChange,
	}: {
		inputs: InterestInputs;
		onChange: (patch: Partial<InterestInputs>) => void;
	} = $props();

	let translate = $derived($t);

	const frequencies: Array<{ key: CompoundingFrequency; labelKey: string }> = [
		{ key: 'annual', labelKey: 'int.freq.annual' },
		{ key: 'semi', labelKey: 'int.freq.semi' },
		{ key: 'quarterly', labelKey: 'int.freq.quarterly' },
		{ key: 'monthly', labelKey: 'int.freq.monthly' },
		{ key: 'daily', labelKey: 'int.freq.daily' },
		{ key: 'continuous', labelKey: 'int.freq.continuous' },
	];

	const dayCounts: Array<{ key: DayCount; labelKey: string }> = [
		{ key: '30/360', labelKey: 'int.dayCount.30_360' },
		{ key: 'actual/365', labelKey: 'int.dayCount.actual_365' },
		{ key: 'actual/360', labelKey: 'int.dayCount.actual_360' },
		{ key: 'actual/actual', labelKey: 'int.dayCount.actual_actual' },
	];

	// Round to 4 decimal places for display to avoid IEEE-754 artifacts
	// (e.g. 11.7999999999 → 11.8).
	function displayRate(v: number): number {
		return Math.round(v * 1_000_000) / 1_000_000;
	}
</script>

<section class="inputs">
	<h3 class="inputs-title">{translate('int.inputs.title')}</h3>

	<NumberField
		label={translate('int.inputs.principal')}
		value={inputs.principal}
		onChange={(v) => onChange({ principal: v })}
	/>

	<label class="field">
		<span class="field-label">{translate('int.inputs.nominalRate')}</span>
		<input
			class="field-input"
			type="number"
			step="0.01"
			value={displayRate(inputs.nominalRate * 100)}
			onchange={(e) =>
				onChange({ nominalRate: Number((e.target as HTMLInputElement).value) / 100 })}
		/>
	</label>

	<label class="field">
		<span class="field-label">{translate('int.inputs.startDate')}</span>
		<input
			class="field-input"
			type="date"
			value={inputs.startDate}
			onchange={(e) => onChange({ startDate: (e.target as HTMLInputElement).value })}
		/>
	</label>

	<label class="field">
		<span class="field-label">{translate('int.inputs.endDate')}</span>
		<input
			class="field-input"
			type="date"
			value={inputs.endDate}
			onchange={(e) => onChange({ endDate: (e.target as HTMLInputElement).value })}
		/>
	</label>

	<label class="field">
		<span class="field-label">{translate('int.inputs.frequency')}</span>
		<select
			class="field-select"
			value={inputs.frequency}
			onchange={(e) =>
				onChange({ frequency: (e.target as HTMLSelectElement).value as CompoundingFrequency })}
		>
			{#each frequencies as f (f.key)}
				<option value={f.key}>{translate(f.labelKey)}</option>
			{/each}
		</select>
	</label>

	<label class="field">
		<span class="field-label">{translate('int.inputs.dayCount')}</span>
		<select
			class="field-select"
			value={inputs.dayCount}
			onchange={(e) =>
				onChange({ dayCount: (e.target as HTMLSelectElement).value as DayCount })}
		>
			{#each dayCounts as d (d.key)}
				<option value={d.key}>{translate(d.labelKey)}</option>
			{/each}
		</select>
	</label>

	<!-- Hide the continuous overlay toggle when frequency is already continuous -
	     it would otherwise draw a redundant, visually-identical curve. -->
	{#if inputs.frequency !== 'continuous'}
		<label class="field toggle-field">
			<input
				type="checkbox"
				checked={inputs.continuous}
				onchange={(e) => onChange({ continuous: (e.target as HTMLInputElement).checked })}
			/>
			<span>{translate('int.inputs.continuousToggle')}</span>
		</label>
	{/if}
</section>

<style>
	.inputs {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		padding: 1rem;
		background: var(--panel);
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-md);
	}

	.inputs-title {
		margin: 0 0 0.25rem;
		font-family: var(--font-display);
		font-size: 0.8125rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--text-primary);
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.field-label {
		font-size: 0.625rem;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--text-muted);
		font-weight: 600;
	}

	/* 40px min-height for touch targets (WCAG 2.5.5). */
	.field-input,
	.field-select {
		min-height: 40px;
		padding: 0.5rem 0.625rem;
		background: var(--bg-subtle);
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-sm);
		color: var(--text-primary);
		font-family: var(--font-mono);
		font-size: 0.8125rem;
	}

	.field-input:focus,
	.field-select:focus {
		outline: none;
		border-color: var(--accent);
	}

	.toggle-field {
		flex-direction: row;
		align-items: center;
		gap: 0.5rem;
		min-height: 40px;
		font-size: 0.75rem;
		color: var(--text-secondary);
	}

	.toggle-field input[type='checkbox'] {
		min-width: 18px;
		min-height: 18px;
		cursor: pointer;
	}
</style>
