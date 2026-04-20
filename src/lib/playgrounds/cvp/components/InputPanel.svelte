<script lang="ts">
	import { t } from '$lib/i18n';
	import { currency$ } from '$lib/stores/preferences';
	import { CURRENCIES } from '$lib/format';
	import NumberField from '$lib/components/playground/NumberField.svelte';
	import type { CVPMode } from '../types';

	let {
		mode,
		price,
		variableCost,
		fixedCosts,
		volume,
		targetProfit,
		taxRate,
		multiProduct,
		onChange,
		onToggleMode,
		onToggleMulti,
	}: {
		mode: CVPMode;
		price: number;
		variableCost: number;
		fixedCosts: number;
		volume: number;
		targetProfit: number;
		taxRate: number;
		multiProduct: boolean;
		onChange: (partial: {
			price?: number;
			variableCost?: number;
			fixedCosts?: number;
			volume?: number;
			targetProfit?: number;
			taxRate?: number;
		}) => void;
		onToggleMode: (m: CVPMode) => void;
		onToggleMulti: (v: boolean) => void;
	} = $props();

	let translate = $derived($t);
	let currencyCode = $derived($currency$);
	let currencySymbol = $derived(CURRENCIES[currencyCode]?.symbol ?? '$');
</script>

<aside class="input-panel">
	<div class="mode-switch" role="tablist" aria-label="CVP mode">
		<button
			type="button"
			class="mode-btn"
			class:active={mode === 'simple'}
			role="tab"
			aria-selected={mode === 'simple'}
			onclick={() => onToggleMode('simple')}
		>
			{translate('cvp.nav.simple')}
		</button>
		<button
			type="button"
			class="mode-btn"
			class:active={mode === 'advanced'}
			role="tab"
			aria-selected={mode === 'advanced'}
			onclick={() => onToggleMode('advanced')}
		>
			{translate('cvp.nav.advanced')}
		</button>
	</div>

	<section class="section">
		<header class="section-head">
			<h3 class="section-title">{translate('cvp.section.revenue')}</h3>
		</header>
		<div class="fields">
			<NumberField
				label={translate('cvp.input.price')}
				hint={translate('cvp.input.priceHint')}
				value={price}
				suffix={currencySymbol}
				onChange={(v) => onChange({ price: v })}
			/>
			<NumberField
				label={translate('cvp.input.volume')}
				hint={translate('cvp.input.volumeHint')}
				value={volume}
				suffix={translate('cvp.general.units')}
				onChange={(v) => onChange({ volume: v })}
			/>
		</div>
	</section>

	<section class="section">
		<header class="section-head">
			<h3 class="section-title">{translate('cvp.section.costStructure')}</h3>
		</header>
		<div class="fields">
			<NumberField
				label={translate('cvp.input.vc')}
				hint={translate('cvp.input.vcHint')}
				value={variableCost}
				suffix={currencySymbol}
				onChange={(v) => onChange({ variableCost: v })}
			/>
			<NumberField
				label={translate('cvp.input.fc')}
				hint={translate('cvp.input.fcHint')}
				value={fixedCosts}
				suffix={currencySymbol}
				onChange={(v) => onChange({ fixedCosts: v })}
			/>
		</div>
	</section>

	<section class="section">
		<header class="section-head">
			<h3 class="section-title">{translate('cvp.section.targets')}</h3>
		</header>
		<div class="fields">
			<NumberField
				label={translate('cvp.input.targetProfit')}
				hint={translate('cvp.input.targetProfitHint')}
				value={targetProfit}
				suffix={currencySymbol}
				onChange={(v) => onChange({ targetProfit: v })}
			/>
			{#if mode === 'advanced'}
				<NumberField
					label={translate('cvp.input.taxRate')}
					hint={translate('cvp.input.taxRateHint')}
					value={taxRate}
					suffix="%"
					min={0}
					max={99.99}
					onChange={(v) => onChange({ taxRate: v })}
				/>
			{/if}
		</div>
	</section>

	{#if mode === 'advanced'}
		<section class="section">
			<header class="section-head with-toggle">
				<h3 class="section-title">{translate('cvp.section.products')}</h3>
				<button
					type="button"
					class="pill-toggle"
					class:on={multiProduct}
					onclick={() => onToggleMulti(!multiProduct)}
					aria-pressed={multiProduct}
				>
					{multiProduct ? translate('cvp.product.multi') : translate('cvp.product.single')}
				</button>
			</header>
		</section>
	{/if}
</aside>

<style>
	.input-panel {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		padding: 1rem;
		background: var(--panel);
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-md);
		min-width: 0;
	}

	.mode-switch {
		display: grid;
		grid-template-columns: 1fr 1fr;
		padding: 3px;
		background: var(--bg-subtle, rgba(255, 255, 255, 0.02));
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-sm);
		gap: 2px;
	}

	.mode-btn {
		padding: 0.375rem 0.75rem;
		background: transparent;
		border: none;
		border-radius: calc(var(--radius-sm) - 2px);
		font-family: var(--font-mono);
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--text-muted);
		cursor: pointer;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		transition:
			color var(--transition-fast),
			background var(--transition-fast);
	}

	.mode-btn:hover {
		color: var(--text-primary);
	}

	.mode-btn.active {
		background: var(--panel-hover, rgba(124, 127, 255, 0.12));
		color: var(--accent);
	}

	.section {
		display: flex;
		flex-direction: column;
		gap: 0.625rem;
	}

	.section-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.section-title {
		font-family: var(--font-display);
		font-size: 0.6875rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--text-muted);
		margin: 0;
	}

	.fields {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.pill-toggle {
		font-family: var(--font-mono);
		font-size: 0.625rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		padding: 3px 10px;
		background: transparent;
		border: 1px solid var(--border);
		border-radius: 999px;
		color: var(--text-muted);
		cursor: pointer;
		transition:
			color var(--transition-fast),
			background var(--transition-fast),
			border-color var(--transition-fast);
	}

	.pill-toggle:hover {
		color: var(--text-primary);
		border-color: var(--accent);
	}

	.pill-toggle.on {
		background: var(--panel-hover, rgba(124, 127, 255, 0.12));
		border-color: var(--accent);
		color: var(--accent);
	}
</style>
