<script lang="ts">
	import { t } from '$lib/i18n';
	import { currency$ } from '$lib/stores/preferences';
	import { fmtCurrency } from '$lib/format';
	import NumberField from '$lib/components/playground/NumberField.svelte';
	import { InterestEngine } from '../engine';
	import type { BondInputs } from '../types';
	import type { CompoundingFrequency } from '$lib/playgrounds/tvm/types';

	let {
		bondInputs,
		onChange,
	}: {
		bondInputs: BondInputs;
		onChange: (patch: Partial<BondInputs>) => void;
	} = $props();

	let translate = $derived($t);
	let currencyCode = $derived($currency$);

	const engine = new InterestEngine();

	const payFrequencies: Array<{ key: Exclude<CompoundingFrequency, 'continuous'>; labelKey: string }> = [
		{ key: 'annual', labelKey: 'int.freq.annual' },
		{ key: 'semi', labelKey: 'int.freq.semi' },
		{ key: 'quarterly', labelKey: 'int.freq.quarterly' },
		{ key: 'monthly', labelKey: 'int.freq.monthly' },
	];

	let relation = $derived(
		bondInputs.couponRate > bondInputs.marketRate
			? 'premium'
			: bondInputs.couponRate < bondInputs.marketRate
				? 'discount'
				: 'par',
	);

	let relationKey = $derived(
		relation === 'par'
			? 'int.bond.parNote'
			: relation === 'discount'
				? 'int.bond.discountNote'
				: 'int.bond.premiumNote',
	);

	let issuePrice = $derived(engine.issuePrice(bondInputs));

	function roundPct(v: number): number {
		return Math.round(v * 10000) / 10000;
	}

	function money(v: number): string {
		return fmtCurrency(v, currencyCode);
	}
</script>

<section class="bond-inputs">
	<h3 class="bond-title">{translate('int.bond.title')}</h3>

	<NumberField
		label={translate('int.bond.faceValue')}
		value={bondInputs.faceValue}
		onChange={(v) => onChange({ faceValue: v })}
	/>

	<label class="field">
		<span class="field-label">{translate('int.bond.couponRate')}</span>
		<span class="field-help">{translate('int.bond.couponRate.help')}</span>
		<input
			class="field-input"
			type="number"
			step="0.01"
			value={roundPct(bondInputs.couponRate * 100)}
			onchange={(e) =>
				onChange({ couponRate: Number((e.target as HTMLInputElement).value) / 100 })}
		/>
	</label>

	<label class="field">
		<span class="field-label">{translate('int.bond.marketRate')}</span>
		<span class="field-help">{translate('int.bond.marketRate.help')}</span>
		<input
			class="field-input"
			type="number"
			step="0.01"
			value={roundPct(bondInputs.marketRate * 100)}
			onchange={(e) =>
				onChange({ marketRate: Number((e.target as HTMLInputElement).value) / 100 })}
		/>
	</label>

	<NumberField
		label={translate('int.bond.termYears')}
		value={bondInputs.termYears}
		onChange={(v) => onChange({ termYears: v })}
	/>

	<label class="field">
		<span class="field-label">{translate('int.bond.paymentFrequency')}</span>
		<select
			class="field-select"
			value={bondInputs.paymentFrequency}
			onchange={(e) =>
				onChange({
					paymentFrequency: (e.target as HTMLSelectElement).value as Exclude<
						CompoundingFrequency,
						'continuous'
					>,
				})}
		>
			{#each payFrequencies as f (f.key)}
				<option value={f.key}>{translate(f.labelKey)}</option>
			{/each}
		</select>
	</label>

	<div class="issue-price">
		<span class="issue-price-label">{translate('int.bond.issuePrice')}</span>
		<span class="issue-price-value">{money(issuePrice)}</span>
	</div>

	<p class="bond-relation" class:discount={relation === 'discount'} class:premium={relation === 'premium'}>
		{translate(relationKey)}
	</p>
</section>

<style>
	.bond-inputs {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		padding: 1rem;
		background: var(--panel);
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-md);
	}

	.bond-title {
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

	.field-help {
		font-family: var(--font-body);
		font-size: 0.6875rem;
		color: var(--text-dim);
		line-height: 1.35;
		font-style: italic;
	}

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

	.issue-price {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		padding: 0.625rem 0.75rem;
		background: color-mix(in srgb, var(--accent) 6%, transparent);
		border: 1px solid color-mix(in srgb, var(--accent) 30%, transparent);
		border-radius: var(--radius-sm);
	}

	.issue-price-label {
		font-size: 0.625rem;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--text-muted);
		font-weight: 600;
	}

	.issue-price-value {
		font-family: var(--font-mono);
		font-size: 1rem;
		font-weight: 700;
		color: var(--accent);
		font-variant-numeric: tabular-nums;
	}

	.bond-relation {
		margin: 0;
		padding: 0.5rem 0.625rem;
		border-radius: var(--radius-sm);
		font-size: 0.75rem;
		color: var(--text-secondary);
		background: var(--bg-subtle);
		border: 1px solid var(--border-subtle);
		font-style: italic;
	}

	.bond-relation.discount {
		color: var(--green);
		border-color: color-mix(in srgb, var(--green) 30%, transparent);
		background: color-mix(in srgb, var(--green) 6%, transparent);
	}

	.bond-relation.premium {
		color: var(--amber);
		border-color: color-mix(in srgb, var(--amber) 30%, transparent);
		background: color-mix(in srgb, var(--amber) 6%, transparent);
	}
</style>
