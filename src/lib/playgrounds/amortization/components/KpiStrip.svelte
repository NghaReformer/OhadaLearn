<script lang="ts">
	import { t, locale } from '$lib/i18n';
	import { currency$ } from '$lib/stores/preferences';
	import { fmtCurrency, fmtPct, getCurrencyLocale } from '$lib/format';
	import type { AmortizationKpis } from '../types';

	let {
		kpis
	}: {
		kpis: AmortizationKpis;
	} = $props();

	let currency = $derived($currency$);
	let translate = $derived($t);
	let _locale = $derived($locale);

	function money(value: number): string {
		if (!Number.isFinite(value)) return '—';
		return fmtCurrency(value, currency);
	}

	function percent(value: number): string {
		if (!Number.isFinite(value)) return '—';
		return fmtPct(value * 100, 2);
	}
</script>

<div class="kpi-strip">
	<div class="kpi">
		<span class="kpi-label">{translate('am.kpis.firstPayment')}</span>
		<span class="kpi-value">{money(kpis.firstPayment)}</span>
	</div>
	<div class="kpi">
		<span class="kpi-label">{translate('am.kpis.totalInterest')}</span>
		<span class="kpi-value">{money(kpis.totalInterest)}</span>
	</div>
	<div class="kpi">
		<span class="kpi-label">{translate('am.kpis.totalInsurance')}</span>
		<span class="kpi-value">{money(kpis.totalInsurance)}</span>
	</div>
	<div class="kpi">
		<span class="kpi-label">{translate('am.kpis.totalPaid')}</span>
		<span class="kpi-value">{money(kpis.totalPaid)}</span>
	</div>
	<div class="kpi kpi-accent">
		<span class="kpi-label">{translate('am.kpis.apr')}</span>
		<span class="kpi-value">{percent(kpis.apr)}</span>
	</div>
	<div class="kpi">
		<span class="kpi-label">{translate('am.kpis.effectiveRate')}</span>
		<span class="kpi-value">{percent(kpis.effectiveAnnualRate)}</span>
	</div>
	<div class="kpi">
		<span class="kpi-label">{translate('am.kpis.ratio')}</span>
		<span class="kpi-value">{fmtPct(kpis.interestToPrincipalRatio * 100, 1)}</span>
	</div>
	{#if kpis.balloonAmount !== null}
		<div class="kpi kpi-warn">
			<span class="kpi-label">{translate('am.kpis.balloonAmount')}</span>
			<span class="kpi-value">{money(kpis.balloonAmount)}</span>
		</div>
	{/if}
	{#if kpis.actualTerm < kpis.requestedTerm}
		<div class="kpi kpi-warn">
			<span class="kpi-label">{translate('am.kpis.actualTerm')}</span>
			<span class="kpi-value">
				{kpis.actualTerm} / {kpis.requestedTerm}
			</span>
		</div>
	{/if}
</div>

<style>
	.kpi-strip {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(148px, 1fr));
		gap: 1px;
		background: var(--border-subtle);
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-md);
		overflow: hidden;
	}

	.kpi {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		padding: 0.75rem 1rem;
		background: var(--panel);
		min-width: 0;
	}

	.kpi-label {
		font-family: var(--font-mono);
		font-size: 0.6875rem;
		font-weight: 500;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--text-muted);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.kpi-value {
		font-family: var(--font-display);
		font-size: 1.0625rem;
		font-weight: 600;
		color: var(--text-primary);
		letter-spacing: -0.015em;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.kpi-accent {
		background: var(--panel-hover, var(--panel));
	}

	.kpi-accent .kpi-value {
		color: var(--accent);
	}

	.kpi-warn .kpi-value {
		color: var(--orange, #f59e0b);
	}
</style>
