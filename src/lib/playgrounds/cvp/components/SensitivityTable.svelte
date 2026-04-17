<script lang="ts">
	import { t } from '$lib/i18n';
	import { currency$ } from '$lib/stores/preferences';
	import { fmtCurrency, fmtNumber, fmtPct, getCurrencyLocale } from '$lib/format';
	import { calcSensitivityTable, generateSteps } from '../engine';
	import { compactNum } from '../chart-utils';
	import type { SensitivityConfig, SensitivityVar, SensitivityMetric } from '../types';

	let {
		config,
		price,
		variableCost,
		fixedCosts,
		volume,
		targetProfit,
		taxRate,
		onConfigChange,
		onApplyCell,
	}: {
		config: SensitivityConfig;
		price: number;
		variableCost: number;
		fixedCosts: number;
		volume: number;
		targetProfit: number;
		taxRate: number;
		onConfigChange: (partial: Partial<SensitivityConfig>) => void;
		onApplyCell?: (rowVar: SensitivityVar, rowVal: number, colVar: SensitivityVar, colVal: number) => void;
	} = $props();

	let translate = $derived($t);
	let currencyCode = $derived($currency$);
	let locale = $derived(getCurrencyLocale(currencyCode));

	const metrics: Array<{ key: SensitivityMetric; labelKey: string }> = [
		{ key: 'operatingIncome', labelKey: 'cvp.sens.operatingIncome' },
		{ key: 'totalCM', labelKey: 'cvp.sens.totalCM' },
		{ key: 'bepUnits', labelKey: 'cvp.sens.bepUnits' },
		{ key: 'mosPct', labelKey: 'cvp.sens.mosPct' },
		{ key: 'dol', labelKey: 'cvp.sens.dol' },
	];

	const variables: Array<{ key: SensitivityVar; labelKey: string }> = [
		{ key: 'price', labelKey: 'cvp.sens.price' },
		{ key: 'volume', labelKey: 'cvp.sens.volume' },
		{ key: 'variableCost', labelKey: 'cvp.sens.variableCost' },
		{ key: 'fixedCosts', labelKey: 'cvp.sens.fixedCosts' },
	];

	let base = $derived({ p: price, v: variableCost, fc: fixedCosts, q: volume, targetProfit, taxRate });

	let baseValues = $derived({
		price,
		volume,
		variableCost,
		fixedCosts,
	});

	let rowValues = $derived(generateSteps(baseValues[config.rowVar], config.pctRange, config.numSteps));
	let colValues = $derived(generateSteps(baseValues[config.colVar], config.pctRange, config.numSteps));

	let table = $derived(
		calcSensitivityTable(base, config.rowVar, config.colVar, config.targetMetric, {
			rowValues,
			colValues,
		}),
	);

	let flatValues = $derived(table.rows.flat().filter((v) => isFinite(v)));
	let minVal = $derived(flatValues.length > 0 ? Math.min(...flatValues) : 0);
	let maxVal = $derived(flatValues.length > 0 ? Math.max(...flatValues) : 0);
	let range = $derived(maxVal - minVal || 1);

	function formatCell(v: number): string {
		if (!isFinite(v)) return '∞';
		switch (config.targetMetric) {
			case 'operatingIncome':
			case 'totalCM':
				return compactNum(v);
			case 'bepUnits':
				return fmtNumber(Math.ceil(v), 0, locale);
			case 'mosPct':
				return fmtPct(v, 1);
			case 'dol':
				return v.toFixed(2) + '×';
		}
	}

	function heatColor(v: number): string {
		if (!isFinite(v)) return 'rgba(240, 96, 94, 0.15)';
		const invertedMetrics: SensitivityMetric[] = ['bepUnits'];
		const norm = (v - minVal) / range;
		const score = invertedMetrics.includes(config.targetMetric) ? 1 - norm : norm;
		if (score < 0.5) {
			const t = score * 2;
			return `color-mix(in srgb, #f0605e ${((1 - t) * 22).toFixed(0)}%, transparent)`;
		}
		const t = (score - 0.5) * 2;
		return `color-mix(in srgb, #2dd4a0 ${(t * 22).toFixed(0)}%, transparent)`;
	}

	function headerLabel(varKey: SensitivityVar, val: number): string {
		if (varKey === 'price' || varKey === 'variableCost') return fmtCurrency(val, currencyCode);
		if (varKey === 'fixedCosts') return compactNum(val);
		return fmtNumber(val, 0, locale);
	}

	function isBaseRow(rowVal: number): boolean {
		return Math.abs(rowVal - baseValues[config.rowVar]) < 0.01;
	}

	function isBaseCol(colVal: number): boolean {
		return Math.abs(colVal - baseValues[config.colVar]) < 0.01;
	}
</script>

<div class="sens">
	<header class="sens-head">
		<h4 class="sens-title">{translate('cvp.table.sensitivity')}</h4>
	</header>

	<div class="controls">
		<label class="ctrl">
			<span class="ctrl-label">{translate('cvp.sens.target')}</span>
			<select
				class="ctrl-sel"
				value={config.targetMetric}
				onchange={(e) =>
					onConfigChange({ targetMetric: (e.target as HTMLSelectElement).value as SensitivityMetric })}
			>
				{#each metrics as m (m.key)}
					<option value={m.key}>{translate(m.labelKey)}</option>
				{/each}
			</select>
		</label>

		<label class="ctrl">
			<span class="ctrl-label">{translate('cvp.sens.row')}</span>
			<select
				class="ctrl-sel"
				value={config.rowVar}
				onchange={(e) =>
					onConfigChange({ rowVar: (e.target as HTMLSelectElement).value as SensitivityVar })}
			>
				{#each variables as v (v.key)}
					<option value={v.key} disabled={v.key === config.colVar}>{translate(v.labelKey)}</option>
				{/each}
			</select>
		</label>

		<label class="ctrl">
			<span class="ctrl-label">{translate('cvp.sens.col')}</span>
			<select
				class="ctrl-sel"
				value={config.colVar}
				onchange={(e) =>
					onConfigChange({ colVar: (e.target as HTMLSelectElement).value as SensitivityVar })}
			>
				{#each variables as v (v.key)}
					<option value={v.key} disabled={v.key === config.rowVar}>{translate(v.labelKey)}</option>
				{/each}
			</select>
		</label>

		<label class="ctrl">
			<span class="ctrl-label">{translate('cvp.sens.range')}</span>
			<input
				type="range"
				min="5"
				max="50"
				step="5"
				value={config.pctRange}
				oninput={(e) => onConfigChange({ pctRange: Number((e.target as HTMLInputElement).value) })}
			/>
			<span class="ctrl-val">±{config.pctRange}%</span>
		</label>
	</div>

	<div class="table-wrap">
		<table class="sens-table">
			<thead>
				<tr>
					<th class="corner">
						<span class="corner-row">{translate('cvp.sens.' + config.rowVar)}</span>
						<span class="corner-sep">↙</span>
						<span class="corner-col">{translate('cvp.sens.' + config.colVar)}</span>
					</th>
					{#each table.colValues as colVal (colVal)}
						<th class="col-h" class:base={isBaseCol(colVal)}>
							{headerLabel(config.colVar, colVal)}
						</th>
					{/each}
				</tr>
			</thead>
			<tbody>
				{#each table.rows as row, rowI (rowI)}
					{@const rowVal = table.rowValues[rowI]}
					<tr>
						<th class="row-h" class:base={isBaseRow(rowVal)}>
							{headerLabel(config.rowVar, rowVal)}
						</th>
						{#each row as val, colI (colI)}
							{@const colVal = table.colValues[colI]}
							{@const isCurrent = isBaseRow(rowVal) && isBaseCol(colVal)}
							<td
								class="cell"
								class:current={isCurrent}
								style:background={heatColor(val)}
								onclick={() =>
									onApplyCell?.(config.rowVar, rowVal, config.colVar, colVal)}
							>
								{formatCell(val)}
							</td>
						{/each}
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	<p class="hint">{translate('cvp.sens.clickHint')}</p>
</div>

<style>
	.sens {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		padding: 1rem;
		background: var(--panel);
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-md);
	}

	.sens-head {
		display: flex;
		align-items: center;
	}

	.sens-title {
		margin: 0;
		font-family: var(--font-display);
		font-size: 0.8125rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--text-primary);
	}

	.controls {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
		gap: 0.5rem;
	}

	.ctrl {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.ctrl-label {
		font-size: 0.625rem;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--text-muted);
		font-weight: 600;
	}

	.ctrl-sel {
		padding: 0.375rem 0.5rem;
		background: rgba(255, 255, 255, 0.02);
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-sm);
		color: var(--text-primary);
		font-family: var(--font-body);
		font-size: 0.75rem;
		cursor: pointer;
	}

	.ctrl-sel:focus {
		outline: none;
		border-color: var(--accent);
	}

	.ctrl-val {
		font-family: var(--font-mono);
		font-size: 0.75rem;
		color: var(--text-primary);
		text-align: right;
	}

	.ctrl input[type='range'] {
		-webkit-appearance: none;
		appearance: none;
		height: 4px;
		background: var(--border-subtle);
		border-radius: 2px;
		outline: none;
		cursor: pointer;
	}

	.ctrl input[type='range']::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		width: 12px;
		height: 12px;
		border-radius: 50%;
		background: var(--accent);
		border: 2px solid var(--bg);
	}

	.table-wrap {
		overflow-x: auto;
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-sm);
	}

	.sens-table {
		width: 100%;
		border-collapse: collapse;
		font-family: var(--font-mono);
		font-size: 0.75rem;
	}

	.corner {
		padding: 0.5rem;
		background: rgba(255, 255, 255, 0.02);
		border-right: 1px solid var(--border-subtle);
		border-bottom: 1px solid var(--border-subtle);
		text-align: left;
		font-family: var(--font-display);
		font-size: 0.625rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}

	.corner-row,
	.corner-col {
		display: block;
		color: var(--text-muted);
	}

	.corner-sep {
		display: block;
		font-size: 0.875rem;
		color: var(--text-muted);
		line-height: 1;
	}

	.col-h,
	.row-h {
		padding: 0.5rem 0.625rem;
		background: rgba(255, 255, 255, 0.02);
		border-right: 1px solid var(--border-subtle);
		border-bottom: 1px solid var(--border-subtle);
		font-family: var(--font-mono);
		font-size: 0.6875rem;
		font-weight: 600;
		color: var(--text-secondary);
		white-space: nowrap;
		text-align: right;
	}

	.col-h.base,
	.row-h.base {
		color: var(--accent);
		background: color-mix(in srgb, var(--accent) 8%, transparent);
	}

	.cell {
		padding: 0.5rem 0.625rem;
		border-right: 1px solid var(--border-subtle);
		border-bottom: 1px solid var(--border-subtle);
		color: var(--text-primary);
		text-align: right;
		cursor: pointer;
		transition: outline var(--transition-fast);
	}

	.cell:hover {
		outline: 1px solid var(--accent);
		outline-offset: -1px;
	}

	.cell.current {
		outline: 1.5px solid var(--accent);
		outline-offset: -1px;
		font-weight: 700;
	}

	.hint {
		margin: 0;
		font-size: 0.6875rem;
		color: var(--text-muted);
		font-style: italic;
	}
</style>
