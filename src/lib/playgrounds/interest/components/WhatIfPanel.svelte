<script lang="ts">
	import { t } from '$lib/i18n';
	import { currency$ } from '$lib/stores/preferences';
	import { fmtCurrency, fmtPct } from '$lib/format';

	export type WhatIfFormat = 'currency' | 'percent' | 'number';

	export interface WhatIfSliderDef {
		/** Key in the `adjustments` map. */
		key: string;
		labelKey: string;
		/** Slider range, in percent around the current value (e.g., min=-50, max=50 for ±50%). */
		min: number;
		max: number;
	}

	export interface WhatIfMetricDef {
		labelKey: string;
		baseValue: number;
		adjustedValue: number;
		format: WhatIfFormat;
		/** If true, lower is better (e.g., issue price sensitivity below face). */
		inverted?: boolean;
	}

	let {
		titleKey,
		hintKey,
		sliders,
		adjustments,
		metrics,
		onChange,
		onReset,
	}: {
		titleKey: string;
		hintKey: string;
		sliders: WhatIfSliderDef[];
		adjustments: Record<string, number>;
		metrics: WhatIfMetricDef[];
		onChange: (patch: Record<string, number>) => void;
		onReset: () => void;
	} = $props();

	let translate = $derived($t);
	let currencyCode = $derived($currency$);

	function fmt(v: number, format: WhatIfFormat): string {
		if (!Number.isFinite(v)) return '—';
		if (format === 'currency') return fmtCurrency(v, currencyCode);
		if (format === 'percent') return fmtPct(v * 100, 3);
		return v.toFixed(0);
	}

	function deltaArrow(delta: number, inverted = false): string {
		const s = inverted ? -delta : delta;
		if (Math.abs(delta) < 1e-9) return '·';
		return s > 0 ? '▲' : '▼';
	}

	function deltaClass(delta: number, inverted = false): string {
		const s = inverted ? -delta : delta;
		if (Math.abs(delta) < 1e-9) return '';
		return s > 0 ? 'up' : 'down';
	}
</script>

<section class="whatif">
	<header class="wi-head">
		<h4 class="wi-title">{translate(titleKey)}</h4>
		<button type="button" class="wi-reset" onclick={onReset}>
			{translate('int.whatif.reset')}
		</button>
	</header>
	<p class="wi-hint">{translate(hintKey)}</p>

	<div class="sliders">
		{#each sliders as s (s.key)}
			{@const val = adjustments[s.key] ?? 0}
			<label class="slider-row">
				<div class="slider-label">
					<span class="slider-name">{translate(s.labelKey)}</span>
					<span class="slider-val" class:neg={val < 0} class:pos={val > 0}>
						{val > 0 ? '+' : ''}{val.toFixed(0)}%
					</span>
				</div>
				<input
					type="range"
					min={s.min}
					max={s.max}
					step="1"
					value={val}
					oninput={(e) => onChange({ [s.key]: Number((e.target as HTMLInputElement).value) })}
				/>
			</label>
		{/each}
	</div>

	<section class="impact">
		<h5 class="impact-title">{translate('int.whatif.impactTitle')}</h5>
		<div class="impact-grid">
			{#each metrics as m (m.labelKey)}
				{@const delta = m.adjustedValue - m.baseValue}
				<div class="impact-cell">
					<span class="cell-label">{translate(m.labelKey)}</span>
					<span class="cell-val">{fmt(m.adjustedValue, m.format)}</span>
					<span class="cell-delta {deltaClass(delta, m.inverted)}">
						{deltaArrow(delta, m.inverted)} {fmt(Math.abs(delta), m.format)}
					</span>
				</div>
			{/each}
		</div>
	</section>
</section>

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
		width: 16px;
		height: 16px;
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
		width: 16px;
		height: 16px;
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
		grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
		gap: 0.5rem;
	}

	.impact-cell {
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
		padding: 0.5rem 0.625rem;
		background: var(--bg-subtle);
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
