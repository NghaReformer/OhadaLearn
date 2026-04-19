<script lang="ts">
	import { t, locale } from '$lib/i18n';
	import { currency$ } from '$lib/stores/preferences';
	import { fmtCurrency, fmtPct } from '$lib/format';
	import type { AmortizationResult, AmortizationScheduleRow, RowFlag } from '../types';

	let {
		result
	}: {
		result: AmortizationResult;
	} = $props();

	let currency = $derived($currency$);
	let translate = $derived($t);
	let _locale = $derived($locale);

	function money(value: number): string {
		if (!Number.isFinite(value)) return '—';
		return fmtCurrency(value, currency);
	}

	function ratePct(r: number): string {
		return fmtPct(r * 100, 3);
	}

	function flagClass(flag: RowFlag): string {
		return `flag flag-${flag}`;
	}

	const rows = $derived(result.rows);
	const totals = $derived(result.totals);
</script>

<section class="st-panel">
	<header class="st-header">
		<h2 class="st-title">{translate('am.schedule.title')}</h2>
		<span class="st-count">{rows.length}</span>
	</header>

	{#if rows.length === 0}
		<p class="st-empty">{translate('am.schedule.empty')}</p>
	{:else}
		<div class="st-scroll">
			<table class="st-table">
				<thead>
					<tr>
						<th class="st-th st-th-num">{translate('am.schedule.period')}</th>
						<th class="st-th">{translate('am.schedule.date')}</th>
						<th class="st-th st-th-num">{translate('am.schedule.rate')}</th>
						<th class="st-th st-th-num">{translate('am.schedule.openingBalance')}</th>
						<th class="st-th st-th-num">{translate('am.schedule.interest')}</th>
						<th class="st-th st-th-num">{translate('am.schedule.principal')}</th>
						<th class="st-th st-th-num">{translate('am.schedule.insurance')}</th>
						<th class="st-th st-th-num">{translate('am.schedule.extra')}</th>
						<th class="st-th st-th-num">{translate('am.schedule.totalPayment')}</th>
						<th class="st-th st-th-num">{translate('am.schedule.closingBalance')}</th>
						<th class="st-th">&nbsp;</th>
					</tr>
				</thead>
				<tbody>
					{#each rows as row (row.period)}
						<tr class="st-row" class:st-row-grace={row.flags.includes('grace-partial') || row.flags.includes('grace-total')} class:st-row-final={row.flags.includes('final')}>
							<td class="st-td st-td-num">{row.period}</td>
							<td class="st-td st-td-date">{row.date}</td>
							<td class="st-td st-td-num">{ratePct(row.ratePerPeriod)}</td>
							<td class="st-td st-td-num">{money(row.openingBalance)}</td>
							<td class="st-td st-td-num st-td-interest">{money(row.interest)}</td>
							<td class="st-td st-td-num st-td-principal">{money(row.principal)}</td>
							<td class="st-td st-td-num">{money(row.insurance)}</td>
							<td class="st-td st-td-num">{money(row.extra)}</td>
							<td class="st-td st-td-num st-td-total">{money(row.totalPayment)}</td>
							<td class="st-td st-td-num">{money(row.closingBalance)}</td>
							<td class="st-td st-td-flags">
								{#each row.flags as flag (flag)}
									<span class={flagClass(flag)}>{translate(`am.flag.${flag}`)}</span>
								{/each}
							</td>
						</tr>
					{/each}
				</tbody>
				<tfoot>
					<tr class="st-total-row">
						<td class="st-td st-td-label" colspan="4">{translate('am.kpis.totalPaid')}</td>
						<td class="st-td st-td-num">{money(totals.interest)}</td>
						<td class="st-td st-td-num">{money(totals.principal)}</td>
						<td class="st-td st-td-num">{money(totals.insurance)}</td>
						<td class="st-td"></td>
						<td class="st-td st-td-num st-td-grand">{money(totals.paid)}</td>
						<td class="st-td"></td>
						<td class="st-td"></td>
					</tr>
				</tfoot>
			</table>
		</div>
	{/if}
</section>

<style>
	.st-panel {
		display: flex;
		flex-direction: column;
		background: var(--panel);
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-md);
		overflow: hidden;
		min-height: 0;
	}

	.st-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.75rem 1rem;
		border-bottom: 1px solid var(--border-subtle);
		flex-shrink: 0;
	}

	.st-title {
		font-family: var(--font-display);
		font-size: 0.9375rem;
		font-weight: 600;
		color: var(--text-primary);
		margin: 0;
		letter-spacing: -0.01em;
	}

	.st-count {
		font-family: var(--font-mono);
		font-size: 0.6875rem;
		font-weight: 600;
		color: var(--text-muted);
		background: var(--bg);
		padding: 2px 8px;
		border-radius: var(--radius-sm);
	}

	.st-empty {
		padding: 2rem 1rem;
		font-family: var(--font-mono);
		font-size: 0.8125rem;
		color: var(--text-muted);
		text-align: center;
		margin: 0;
	}

	.st-scroll {
		flex: 1;
		overflow: auto;
		min-height: 0;
	}

	.st-table {
		width: 100%;
		border-collapse: separate;
		border-spacing: 0;
		font-family: var(--font-mono);
		font-size: 0.75rem;
	}

	.st-th {
		position: sticky;
		top: 0;
		z-index: 1;
		background: var(--panel);
		color: var(--text-muted);
		font-weight: 600;
		font-size: 0.6875rem;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		padding: 0.625rem 0.75rem;
		text-align: left;
		white-space: nowrap;
		border-bottom: 1px solid var(--border-subtle);
	}

	.st-th-num {
		text-align: right;
	}

	.st-td {
		padding: 0.5rem 0.75rem;
		color: var(--text-primary);
		border-bottom: 1px solid var(--border-subtle);
		white-space: nowrap;
	}

	.st-td-num {
		text-align: right;
		font-variant-numeric: tabular-nums;
	}

	.st-td-date {
		color: var(--text-secondary);
		font-size: 0.6875rem;
	}

	.st-td-interest {
		color: var(--text-secondary);
	}

	.st-td-principal {
		color: var(--accent, var(--text-primary));
		font-weight: 500;
	}

	.st-td-total {
		font-weight: 600;
	}

	.st-row:hover .st-td {
		background: var(--panel-hover, rgba(255, 255, 255, 0.02));
	}

	.st-row-grace .st-td {
		background: rgba(245, 158, 11, 0.04);
	}

	.st-row-final .st-td {
		background: rgba(34, 197, 94, 0.04);
	}

	.st-td-flags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.25rem;
	}

	.flag {
		font-size: 0.625rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		padding: 2px 6px;
		border-radius: var(--radius-sm);
		border: 1px solid transparent;
	}

	.flag-grace-partial,
	.flag-grace-total {
		color: var(--orange, #f59e0b);
		background: rgba(245, 158, 11, 0.08);
		border-color: rgba(245, 158, 11, 0.2);
	}

	.flag-rate-change {
		color: var(--blue, #3b82f6);
		background: rgba(59, 130, 246, 0.08);
		border-color: rgba(59, 130, 246, 0.2);
	}

	.flag-extra,
	.flag-lump {
		color: var(--accent);
		background: var(--accent-glow, rgba(255, 255, 255, 0.05));
		border-color: var(--border);
	}

	.flag-balloon {
		color: var(--red, #ef4444);
		background: rgba(239, 68, 68, 0.08);
		border-color: rgba(239, 68, 68, 0.2);
	}

	.flag-final {
		color: var(--green, #22c55e);
		background: rgba(34, 197, 94, 0.08);
		border-color: rgba(34, 197, 94, 0.2);
	}

	.st-total-row .st-td {
		position: sticky;
		bottom: 0;
		background: var(--panel);
		border-top: 1px solid var(--border);
		border-bottom: none;
		font-weight: 600;
		color: var(--text-primary);
	}

	.st-td-label {
		text-align: right;
		color: var(--text-muted);
		font-size: 0.6875rem;
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}

	.st-td-grand {
		color: var(--accent);
		font-weight: 700;
	}
</style>
