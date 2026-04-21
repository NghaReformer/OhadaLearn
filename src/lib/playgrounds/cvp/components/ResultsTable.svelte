<script lang="ts">
	import { t } from '$lib/i18n';
	import { currency$ } from '$lib/stores/preferences';
	import { fmtCurrency, fmtNumber, fmtPct, getCurrencyLocale } from '$lib/format';
	import type { CVPSingleResult } from '../types';

	let {
		result,
		taxMode,
	}: {
		result: CVPSingleResult;
		taxMode: boolean;
	} = $props();

	let translate = $derived($t);
	let currencyCode = $derived($currency$);
	let locale = $derived(getCurrencyLocale(currencyCode));

	function fmt(v: number): string {
		return fmtCurrency(v, currencyCode);
	}

	function fmtUnits(v: number): string {
		if (!isFinite(v)) return '∞';
		return fmtNumber(Math.ceil(v - 0.0001), 0, locale);
	}

	function fmtRatio(v: number): string {
		if (!isFinite(v)) return '—';
		return fmtPct(v * 100, 1);
	}

	let hasNegativeCM = $derived(result.cm <= 0);
</script>

<div class="results-table-wrap">
	<header class="table-header">
		<h3 class="table-title">{translate('cvp.res.tableTitle')}</h3>
	</header>

	{#if hasNegativeCM}
		<div class="warning" role="alert">
			{translate('cvp.warn.negativeCM')}
		</div>
	{/if}

	<table class="cvp-table">
		<thead>
			<tr>
				<th class="metric-col">{translate('cvp.res.metric')}</th>
				<th class="num-col">{translate('cvp.res.perUnit')}</th>
				<th class="num-col">{translate('cvp.res.total')}</th>
				<th class="num-col">{translate('cvp.res.ratio')}</th>
			</tr>
		</thead>
		<tbody>
			<tr>
				<th scope="row">{translate('cvp.res.revenue')}</th>
				<td class="num">{fmt(result.price)}</td>
				<td class="num">{fmt(result.totalRevenue)}</td>
				<td class="num muted">100.0%</td>
			</tr>
			<tr>
				<th scope="row" class="deduct">{translate('cvp.res.vc')}</th>
				<td class="num">({fmt(result.variableCost)})</td>
				<td class="num">({fmt(result.totalVC)})</td>
				<td class="num muted">{fmtRatio(1 - result.cmRatio)}</td>
			</tr>
			<tr class="subtotal">
				<th scope="row">{translate('cvp.res.cm')}</th>
				<td class="num">{fmt(result.cm)}</td>
				<td class="num">{fmt(result.totalCM)}</td>
				<td class="num accent">{fmtRatio(result.cmRatio)}</td>
			</tr>
			<tr>
				<th scope="row" class="deduct">{translate('cvp.res.fc')}</th>
				<td class="num muted">—</td>
				<td class="num">({fmt(result.fc)})</td>
				<td class="num muted">—</td>
			</tr>
			<tr class="total" class:profit={result.operatingIncome >= 0} class:loss={result.operatingIncome < 0}>
				<th scope="row">{translate('cvp.res.oi')}</th>
				<td class="num">{fmt(result.oiPerUnit)}</td>
				<td class="num">{fmt(result.operatingIncome)}</td>
				<td class="num">{fmtRatio(result.oiRatio)}</td>
			</tr>
		</tbody>
	</table>

	<ul class="kpi-list">
		<li class="kpi">
			<span class="kpi-label">{translate('cvp.res.bep')}</span>
			<span class="kpi-value">{fmtUnits(result.bepUnits)}</span>
		</li>
		<li class="kpi">
			<span class="kpi-label">{translate('cvp.res.bepSales')}</span>
			<span class="kpi-value">{fmt(result.bepRevenue)}</span>
		</li>
		<li class="kpi">
			<span class="kpi-label">{translate('cvp.res.targetVolPretax')}</span>
			<span class="kpi-value">{fmtUnits(result.targetUnits)}</span>
		</li>
		{#if taxMode}
			<li class="kpi">
				<span class="kpi-label">{translate('cvp.res.targetVolAftertax')}</span>
				<span class="kpi-value">{fmtUnits(result.afterTaxUnits)}</span>
			</li>
		{/if}
		<li class="kpi" class:danger={result.mosPct < 0}>
			<span class="kpi-label">{translate('cvp.res.mosPct')}</span>
			<span class="kpi-value">{fmtPct(result.mosPct, 1)}</span>
		</li>
		<li class="kpi">
			<span class="kpi-label">{translate('cvp.res.dol')}</span>
			<span class="kpi-value">
				{#if isFinite(result.dol)}
					{fmtNumber(result.dol, 2, locale)}×
				{:else}
					∞
				{/if}
			</span>
		</li>
	</ul>
</div>

<style>
	.results-table-wrap {
		display: flex;
		flex-direction: column;
		gap: 0.875rem;
		padding: 1rem;
		background: var(--panel);
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-md);
		min-width: 0;
	}

	.table-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.table-title {
		font-family: var(--font-display);
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--text-primary);
		margin: 0;
	}

	.warning {
		padding: 0.625rem 0.75rem;
		background: color-mix(in srgb, var(--error) 12%, transparent);
		border: 1px solid color-mix(in srgb, var(--error) 35%, transparent);
		border-radius: var(--radius-sm);
		font-family: var(--font-body);
		font-size: 0.75rem;
		line-height: 1.4;
		color: var(--error);
	}

	.cvp-table {
		width: 100%;
		border-collapse: collapse;
		font-family: var(--font-mono);
		font-size: 0.75rem;
		font-variant-numeric: tabular-nums;
	}

	.cvp-table th,
	.cvp-table td {
		padding: 0.4375rem 0.5rem;
		text-align: left;
		border-bottom: 1px solid var(--border-subtle);
	}

	.cvp-table thead th {
		font-family: var(--font-body);
		font-size: 0.625rem;
		font-weight: 700;
		color: var(--text-muted);
		text-transform: uppercase;
		letter-spacing: 0.06em;
		border-bottom: 1px solid var(--border);
		padding-bottom: 0.5rem;
	}

	.cvp-table tbody th {
		font-family: var(--font-body);
		font-size: 0.75rem;
		font-weight: 500;
		color: var(--text-secondary);
	}

	.cvp-table tbody th.deduct {
		padding-left: 1rem;
		color: var(--text-muted);
	}

	.num {
		text-align: right;
		color: var(--text-primary);
		white-space: nowrap;
	}

	.num.muted {
		color: var(--text-muted);
	}

	.num.accent {
		color: var(--accent);
		font-weight: 600;
	}

	.num-col {
		text-align: right !important;
	}

	.subtotal {
		background: color-mix(in srgb, var(--accent) 6%, transparent);
	}

	.subtotal th {
		font-weight: 700 !important;
		color: var(--text-primary) !important;
	}

	.subtotal .num {
		font-weight: 600;
	}

	.total th {
		font-weight: 700 !important;
		color: var(--text-primary) !important;
	}

	.total .num {
		font-weight: 700;
		font-size: 0.8125rem;
	}

	.total.profit .num {
		color: var(--green);
	}

	.total.loss .num {
		color: var(--error);
	}

	.kpi-list {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
		gap: 0.5rem;
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.kpi {
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
		padding: 0.625rem 0.75rem;
		background: var(--bg-subtle, rgba(255, 255, 255, 0.02));
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-sm);
	}

	.kpi-label {
		font-family: var(--font-body);
		font-size: 0.625rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--text-muted);
	}

	.kpi-value {
		font-family: var(--font-mono);
		font-size: 0.9375rem;
		font-weight: 700;
		color: var(--text-primary);
		font-variant-numeric: tabular-nums;
	}

	.kpi.danger .kpi-value {
		color: var(--error);
	}
</style>
