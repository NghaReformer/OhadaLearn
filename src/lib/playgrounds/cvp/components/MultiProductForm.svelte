<script lang="ts">
	import { t } from '$lib/i18n';
	import { currency$ } from '$lib/stores/preferences';
	import { CURRENCIES, fmtCurrency, fmtNumber, fmtPct, getCurrencyLocale, parseLocaleNumber } from '$lib/format';
	import { calcMulti } from '../engine';
	import type { Product } from '../types';

	let {
		products,
		fixedCosts,
		targetProfit,
		taxRate,
		onChange,
	}: {
		products: Product[];
		fixedCosts: number;
		targetProfit: number;
		taxRate: number;
		onChange: (next: Product[]) => void;
	} = $props();

	let translate = $derived($t);
	let currencyCode = $derived($currency$);
	let currencySymbol = $derived(CURRENCIES[currencyCode]?.symbol ?? '$');
	let locale = $derived(getCurrencyLocale(currencyCode));

	let effectiveProducts = $derived(
		products.length === 0
			? [
					{ name: 'Product A', price: 40, variableCost: 15, mixPct: 60 },
					{ name: 'Product B', price: 80, variableCost: 40, mixPct: 40 },
				]
			: products,
	);

	let result = $derived(calcMulti(effectiveProducts, fixedCosts, targetProfit, taxRate));
	let mixTotal = $derived(effectiveProducts.reduce((s, p) => s + p.mixPct, 0));
	let mixOk = $derived(Math.abs(mixTotal - 100) < 0.01);

	function fmt(v: number): string {
		return fmtCurrency(v, currencyCode);
	}

	function fmtUnits(v: number): string {
		if (!isFinite(v)) return '∞';
		return fmtNumber(Math.ceil(v - 0.0001), 0, locale);
	}

	function update(index: number, partial: Partial<Product>) {
		const next = effectiveProducts.map((p, i) => (i === index ? { ...p, ...partial } : p));
		onChange(next);
	}

	function addProduct() {
		const remaining = Math.max(0, 100 - mixTotal);
		const letter = String.fromCharCode(65 + effectiveProducts.length);
		onChange([
			...effectiveProducts,
			{ name: `Product ${letter}`, price: 50, variableCost: 20, mixPct: remaining },
		]);
	}

	function removeProduct(index: number) {
		if (effectiveProducts.length <= 1) return;
		onChange(effectiveProducts.filter((_, i) => i !== index));
	}

	function parseNum(str: string): number {
		const parsed = parseLocaleNumber(str);
		return isNaN(parsed) ? 0 : parsed;
	}
</script>

<div class="mp">
	<header class="mp-head">
		<h4 class="mp-title">{translate('cvp.product.multi')}</h4>
		<button type="button" class="add-btn" onclick={addProduct}>
			+ {translate('cvp.product.add')}
		</button>
	</header>

	<div class="product-rows">
		<div class="row row-head" role="row">
			<span class="col col-name">{translate('cvp.product.name')}</span>
			<span class="col col-num">{translate('cvp.product.price')}</span>
			<span class="col col-num">{translate('cvp.product.vc')}</span>
			<span class="col col-num">{translate('cvp.product.mix')}</span>
			<span class="col col-act" aria-hidden="true"></span>
		</div>

		{#each effectiveProducts as product, i (i)}
			<div class="row" role="row">
				<input
					class="cell cell-name"
					type="text"
					value={product.name}
					oninput={(e) => update(i, { name: (e.target as HTMLInputElement).value })}
				/>
				<input
					class="cell cell-num"
					type="text"
					inputmode="decimal"
					value={fmtNumber(product.price, 2, locale)}
					onchange={(e) => update(i, { price: parseNum((e.target as HTMLInputElement).value) })}
				/>
				<input
					class="cell cell-num"
					type="text"
					inputmode="decimal"
					value={fmtNumber(product.variableCost, 2, locale)}
					onchange={(e) =>
						update(i, { variableCost: parseNum((e.target as HTMLInputElement).value) })}
				/>
				<input
					class="cell cell-num"
					type="text"
					inputmode="decimal"
					value={fmtNumber(product.mixPct, 2, locale)}
					onchange={(e) => update(i, { mixPct: parseNum((e.target as HTMLInputElement).value) })}
				/>
				<button
					type="button"
					class="remove-btn"
					aria-label={translate('cvp.product.remove')}
					onclick={() => removeProduct(i)}
					disabled={effectiveProducts.length <= 1}
				>
					×
				</button>
			</div>
		{/each}

		<div class="row row-total" role="row">
			<span class="col col-name">{translate('cvp.product.mixTotal')}</span>
			<span class="col col-num" aria-hidden="true"></span>
			<span class="col col-num" aria-hidden="true"></span>
			<span class="col col-num total-val" class:err={!mixOk}>{fmtPct(mixTotal, 1)}</span>
			<span class="col col-act" aria-hidden="true"></span>
		</div>
	</div>

	{#if !mixOk}
		<div class="warn-banner">
			<span class="warn-icon" aria-hidden="true">⚠</span>
			{translate('cvp.product.mixError')}
		</div>
	{/if}

	{#if result && !result.error}
		<section class="outcome">
			<div class="outcome-grid">
				<div class="outcome-cell">
					<span class="oc-label">{translate('cvp.product.weightedCM')}</span>
					<span class="oc-val">{fmt(result.weightedCM)} {currencySymbol}</span>
				</div>
				<div class="outcome-cell">
					<span class="oc-label">{translate('cvp.product.weightedCMR')}</span>
					<span class="oc-val">{fmtPct(result.weightedCMRatio * 100, 2)}</span>
				</div>
				<div class="outcome-cell">
					<span class="oc-label">{translate('cvp.product.bepTotal')}</span>
					<span class="oc-val">{fmtUnits(result.bepTotalUnits)} {translate('cvp.general.units')}</span>
				</div>
			</div>

			<div class="alloc">
				<h5 class="alloc-title">{translate('cvp.product.perProduct')}</h5>
				<div class="alloc-rows">
					{#each result.perProduct as perP, i (i)}
						<div class="alloc-row">
							<span class="alloc-name">{perP.name}</span>
							<span class="alloc-mix">{fmtPct(perP.mixPct, 1)}</span>
							<span class="alloc-bep">{fmtUnits(perP.bepUnits)} u</span>
							<span class="alloc-rev">{fmt(perP.bepRevenue)}</span>
						</div>
					{/each}
				</div>
			</div>
		</section>
	{/if}
</div>

<style>
	.mp {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		padding: 1rem;
		background: var(--panel);
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-md);
	}

	.mp-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.mp-title {
		margin: 0;
		font-family: var(--font-display);
		font-size: 0.8125rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--text-primary);
	}

	.add-btn {
		background: transparent;
		border: 1px dashed var(--border);
		border-radius: var(--radius-sm);
		color: var(--text-muted);
		font-family: var(--font-mono);
		font-size: 0.6875rem;
		font-weight: 600;
		padding: 0.25rem 0.625rem;
		cursor: pointer;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		transition:
			color var(--transition-fast),
			border-color var(--transition-fast);
	}

	.add-btn:hover {
		color: var(--accent);
		border-color: var(--accent);
	}

	.product-rows {
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
	}

	.row {
		display: grid;
		grid-template-columns: 1.4fr 1fr 1fr 0.8fr 28px;
		gap: 0.375rem;
		align-items: center;
	}

	.row-head .col {
		font-family: var(--font-display);
		font-size: 0.625rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.07em;
		color: var(--text-muted);
		padding: 0.25rem 0.5rem;
	}

	.col-num {
		text-align: right;
	}

	.cell {
		padding: 0.375rem 0.5rem;
		background: rgba(255, 255, 255, 0.02);
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-sm);
		color: var(--text-primary);
		font-family: var(--font-mono);
		font-size: 0.75rem;
		transition: border-color var(--transition-fast);
	}

	.cell:focus {
		outline: none;
		border-color: var(--accent);
	}

	.cell-num {
		text-align: right;
	}

	.cell-name {
		font-family: var(--font-body);
	}

	.remove-btn {
		width: 28px;
		height: 28px;
		background: transparent;
		border: 1px solid transparent;
		border-radius: var(--radius-sm);
		color: var(--text-muted);
		font-size: 1.125rem;
		line-height: 1;
		cursor: pointer;
		transition:
			color var(--transition-fast),
			background var(--transition-fast);
	}

	.remove-btn:hover:not(:disabled) {
		color: #f0605e;
		background: color-mix(in srgb, #f0605e 10%, transparent);
	}

	.remove-btn:disabled {
		opacity: 0.3;
		cursor: not-allowed;
	}

	.row-total {
		padding-top: 0.375rem;
		border-top: 1px solid var(--border-subtle);
	}

	.row-total .col {
		padding: 0.375rem 0.5rem;
		font-family: var(--font-mono);
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--text-secondary);
	}

	.total-val {
		color: var(--text-primary);
	}

	.total-val.err {
		color: #f0605e;
	}

	.warn-banner {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 0.75rem;
		background: color-mix(in srgb, #f0605e 10%, transparent);
		border: 1px solid color-mix(in srgb, #f0605e 30%, transparent);
		border-radius: var(--radius-sm);
		color: #f0605e;
		font-size: 0.75rem;
		font-weight: 600;
	}

	.warn-icon {
		font-size: 0.875rem;
	}

	.outcome {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		padding-top: 0.75rem;
		border-top: 1px solid var(--border-subtle);
	}

	.outcome-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 0.5rem;
	}

	.outcome-cell {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		padding: 0.625rem;
		background: rgba(255, 255, 255, 0.02);
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-sm);
	}

	.oc-label {
		font-size: 0.625rem;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--text-muted);
	}

	.oc-val {
		font-family: var(--font-mono);
		font-size: 0.8125rem;
		font-weight: 700;
		color: var(--text-primary);
	}

	.alloc {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.alloc-title {
		margin: 0;
		font-family: var(--font-display);
		font-size: 0.625rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--text-muted);
	}

	.alloc-rows {
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
	}

	.alloc-row {
		display: grid;
		grid-template-columns: 1.4fr 0.8fr 0.8fr 1fr;
		gap: 0.5rem;
		padding: 0.375rem 0.5rem;
		font-size: 0.75rem;
		background: rgba(255, 255, 255, 0.015);
		border-radius: var(--radius-sm);
	}

	.alloc-name {
		color: var(--text-secondary);
	}

	.alloc-mix,
	.alloc-bep,
	.alloc-rev {
		font-family: var(--font-mono);
		text-align: right;
		color: var(--text-primary);
	}

	.alloc-bep {
		color: var(--accent);
	}
</style>
