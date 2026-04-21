<script lang="ts">
	import { t } from '$lib/i18n';
	import { currency$ } from '$lib/stores/preferences';
	import { fmtCurrency, fmtNumber, fmtPct, getCurrencyLocale } from '$lib/format';
	import { applyWhatIf, calcSingle } from '../engine';
	import type { WhatIfAdjustments } from '../types';

	let {
		price,
		variableCost,
		fixedCosts,
		volume,
		targetProfit,
		taxRate,
		adjustments,
		onChange,
		onReset,
	}: {
		price: number;
		variableCost: number;
		fixedCosts: number;
		volume: number;
		targetProfit: number;
		taxRate: number;
		adjustments: WhatIfAdjustments;
		onChange: (partial: Partial<WhatIfAdjustments>) => void;
		onReset: () => void;
	} = $props();

	let translate = $derived($t);
	let currencyCode = $derived($currency$);
	let locale = $derived(getCurrencyLocale(currencyCode));

	let baseResult = $derived(
		calcSingle(price, variableCost, fixedCosts, volume, targetProfit, taxRate),
	);

	let adjustedResult = $derived(
		applyWhatIf(
			{ price, variableCost, fc: fixedCosts, volume, targetProfit, taxRate },
			adjustments.price,
			adjustments.volume,
			adjustments.variableCost,
			adjustments.fixedCosts,
		),
	);

	let bepDelta = $derived(adjustedResult.bepUnits - baseResult.bepUnits);
	let mosDelta = $derived(adjustedResult.mosPct - baseResult.mosPct);
	let profitDelta = $derived(adjustedResult.operatingIncome - baseResult.operatingIncome);
	let dolDelta = $derived(
		isFinite(adjustedResult.dol) && isFinite(baseResult.dol)
			? adjustedResult.dol - baseResult.dol
			: 0,
	);

	function fmt(v: number): string {
		return fmtCurrency(v, currencyCode);
	}

	function fmtUnits(v: number): string {
		if (!isFinite(v)) return '∞';
		return fmtNumber(Math.ceil(v - 0.0001), 0, locale);
	}

	function deltaArrow(delta: number): string {
		if (delta > 0.01) return '▲';
		if (delta < -0.01) return '▼';
		return '·';
	}

	function deltaClass(delta: number, inverted = false): string {
		const sign = inverted ? -delta : delta;
		if (sign > 0.01) return 'up';
		if (sign < -0.01) return 'down';
		return '';
	}

	const sliders: Array<{ key: keyof WhatIfAdjustments; labelKey: string; min: number; max: number }> = [
		{ key: 'price', labelKey: 'cvp.slider.price', min: -50, max: 50 },
		{ key: 'volume', labelKey: 'cvp.slider.volume', min: -50, max: 100 },
		{ key: 'variableCost', labelKey: 'cvp.slider.vc', min: -50, max: 50 },
		{ key: 'fixedCosts', labelKey: 'cvp.slider.fc', min: -50, max: 100 },
	];
</script>

<div class="whatif">
	<header class="wi-head">
		<h4 class="wi-title">{translate('cvp.right.whatif')}</h4>
		<button type="button" class="wi-reset" onclick={onReset}>
			{translate('cvp.right.reset')}
		</button>
	</header>

	<p class="wi-hint">{translate('cvp.right.sliders')}</p>

	<div class="sliders">
		{#each sliders as slider (slider.key)}
			{@const val = adjustments[slider.key]}
			<label class="slider-row">
				<div class="slider-label">
					<span class="slider-name">{translate(slider.labelKey)}</span>
					<span class="slider-val" class:neg={val < 0} class:pos={val > 0}>
						{val > 0 ? '+' : ''}{val.toFixed(0)}%
					</span>
				</div>
				<input
					type="range"
					min={slider.min}
					max={slider.max}
					step="1"
					value={val}
					oninput={(e) => onChange({ [slider.key]: Number((e.target as HTMLInputElement).value) })}
				/>
			</label>
		{/each}
	</div>

	<section class="impact">
		<h5 class="impact-title">{translate('cvp.impact.title')}</h5>
		<div class="impact-grid">
			<div class="impact-cell">
				<span class="cell-label">{translate('cvp.impact.newBep')}</span>
				<span class="cell-val">{fmtUnits(adjustedResult.bepUnits)}</span>
				<span class="cell-delta {deltaClass(bepDelta, true)}">
					{deltaArrow(bepDelta)} {isFinite(bepDelta) ? fmtUnits(Math.abs(bepDelta)) : '—'}
				</span>
			</div>

			<div class="impact-cell">
				<span class="cell-label">{translate('cvp.impact.newMos')}</span>
				<span class="cell-val">{isFinite(adjustedResult.mosPct) ? fmtPct(adjustedResult.mosPct, 1) : '—'}</span>
				<span class="cell-delta {deltaClass(mosDelta)}">
					{deltaArrow(mosDelta)} {isFinite(mosDelta) ? fmtPct(Math.abs(mosDelta), 1) : '—'}
				</span>
			</div>

			<div class="impact-cell">
				<span class="cell-label">{translate('cvp.impact.newProfit')}</span>
				<span class="cell-val" class:loss={adjustedResult.operatingIncome < 0}>
					{fmt(adjustedResult.operatingIncome)}
				</span>
				<span class="cell-delta {deltaClass(profitDelta)}">
					{deltaArrow(profitDelta)} {fmt(Math.abs(profitDelta))}
				</span>
			</div>

			<div class="impact-cell">
				<span class="cell-label">{translate('cvp.impact.newDol')}</span>
				<span class="cell-val">{isFinite(adjustedResult.dol) ? adjustedResult.dol.toFixed(2) + '×' : '∞'}</span>
				<span class="cell-delta {deltaClass(dolDelta)}">
					{deltaArrow(dolDelta)} {isFinite(dolDelta) ? Math.abs(dolDelta).toFixed(2) : '—'}
				</span>
			</div>
		</div>
	</section>
</div>

<style>
	.whatif {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		padding: 1rem;
		background: var(--panel);
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-md);
	}

	.wi-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.wi-title {
		margin: 0;
		font-family: var(--font-display);
		font-size: 0.8125rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--text-primary);
	}

	.wi-reset {
		background: transparent;
		border: 1px solid var(--border);
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

	.wi-reset:hover {
		color: var(--accent);
		border-color: var(--accent);
	}

	.wi-hint {
		margin: 0;
		font-size: 0.75rem;
		color: var(--text-muted);
	}

	.sliders {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.slider-row {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
	}

	.slider-label {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
	}

	.slider-name {
		font-size: 0.75rem;
		color: var(--text-secondary);
	}

	.slider-val {
		font-family: var(--font-mono);
		font-size: 0.8125rem;
		font-weight: 700;
		color: var(--text-primary);
		letter-spacing: 0.04em;
	}

	.slider-val.pos {
		color: var(--green);
	}

	.slider-val.neg {
		color: var(--error);
	}

	input[type='range'] {
		-webkit-appearance: none;
		appearance: none;
		width: 100%;
		height: 4px;
		background: var(--border-subtle);
		border-radius: 2px;
		outline: none;
		cursor: pointer;
	}

	input[type='range']::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		width: 14px;
		height: 14px;
		border-radius: 50%;
		background: var(--accent);
		border: 2px solid var(--bg);
		cursor: pointer;
		transition: transform var(--transition-fast);
	}

	input[type='range']::-webkit-slider-thumb:hover {
		transform: scale(1.1);
	}

	input[type='range']::-moz-range-thumb {
		width: 14px;
		height: 14px;
		border-radius: 50%;
		background: var(--accent);
		border: 2px solid var(--bg);
		cursor: pointer;
	}

	.impact {
		display: flex;
		flex-direction: column;
		gap: 0.625rem;
		padding-top: 0.75rem;
		border-top: 1px solid var(--border-subtle);
	}

	.impact-title {
		margin: 0;
		font-family: var(--font-display);
		font-size: 0.6875rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--text-muted);
	}

	.impact-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.5rem;
	}

	.impact-cell {
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
		padding: 0.5rem 0.625rem;
		background: rgba(255, 255, 255, 0.02);
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-sm);
	}

	.cell-label {
		font-size: 0.625rem;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--text-muted);
	}

	.cell-val {
		font-family: var(--font-mono);
		font-size: 0.875rem;
		font-weight: 700;
		color: var(--text-primary);
	}

	.cell-val.loss {
		color: var(--error);
	}

	.cell-delta {
		font-family: var(--font-mono);
		font-size: 0.6875rem;
		font-weight: 600;
		color: var(--text-muted);
	}

	.cell-delta.up {
		color: var(--green);
	}

	.cell-delta.down {
		color: var(--error);
	}
</style>
