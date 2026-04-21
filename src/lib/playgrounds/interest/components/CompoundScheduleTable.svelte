<script lang="ts">
	import { t } from '$lib/i18n';
	import { currency$ } from '$lib/stores/preferences';
	import { fmtCurrency } from '$lib/format';
	import type { CompoundResult } from '../types';
	import type { CompoundRowKey } from '../solvers';

	export interface CompoundCellGoalSeekEvent {
		rowIndex: number;
		colKey: CompoundRowKey;
		currentValue: number;
		columnLabelKey: string;
		position: { x: number; y: number };
	}

	let {
		result,
		onGoalSeek,
	}: {
		result: CompoundResult;
		onGoalSeek?: (event: CompoundCellGoalSeekEvent) => void;
	} = $props();

	let translate = $derived($t);
	let currencyCode = $derived($currency$);

	function money(v: number): string {
		return fmtCurrency(v, currencyCode);
	}

	function triggerGoalSeek(
		e: MouseEvent,
		rowIndex: number,
		colKey: CompoundRowKey,
		currentValue: number,
		columnLabelKey: string,
	) {
		if (!onGoalSeek) return;
		e.preventDefault();
		onGoalSeek({
			rowIndex,
			colKey,
			currentValue,
			columnLabelKey,
			position: { x: e.clientX, y: e.clientY },
		});
	}
</script>

<section class="table-wrap">
	<header class="table-head">
		<h4 class="table-title">{translate('int.schedule.compoundTitle')}</h4>
		<span class="table-sub">{translate('int.schedule.compoundSub')}</span>
		{#if onGoalSeek}
			<span class="table-hint">{translate('int.goalseek.rightClickHint')}</span>
		{/if}
	</header>
	<div class="table-scroll">
		<table>
			<thead>
				<tr>
					<th class="num">{translate('int.schedule.period')}</th>
					<th>{translate('int.schedule.periodEnd')}</th>
					<th class="num">{translate('int.schedule.openingBalance')}</th>
					<th class="num">{translate('int.schedule.interestThisPeriod')}</th>
					<th class="num">{translate('int.schedule.closingBalance')}</th>
					<th class="num">{translate('int.schedule.interestOnPrincipal')}</th>
					<th class="num">{translate('int.schedule.interestOnInterest')}</th>
				</tr>
			</thead>
			<tbody>
				{#each result.perPeriod as row (row.periodIndex)}
					{@const i = row.periodIndex - 1}
					<tr>
						<td class="num period">{row.periodIndex}</td>
						<td class="date">{row.periodEnd}</td>
						<td
							class="num gs muted"
							class:clickable={!!onGoalSeek}
							oncontextmenu={(e) =>
								triggerGoalSeek(
									e,
									i,
									'balanceStart',
									row.balanceStart,
									'int.schedule.openingBalance',
								)}
							title={onGoalSeek ? translate('int.goalseek.rightClickCell') : undefined}
						>
							{money(row.balanceStart)}
						</td>
						<td
							class="num gs"
							class:clickable={!!onGoalSeek}
							oncontextmenu={(e) =>
								triggerGoalSeek(
									e,
									i,
									'interestThisPeriod',
									row.interestThisPeriod,
									'int.schedule.interestThisPeriod',
								)}
							title={onGoalSeek ? translate('int.goalseek.rightClickCell') : undefined}
						>
							{money(row.interestThisPeriod)}
						</td>
						<td
							class="num gs strong"
							class:clickable={!!onGoalSeek}
							oncontextmenu={(e) =>
								triggerGoalSeek(
									e,
									i,
									'balanceEnd',
									row.balanceEnd,
									'int.schedule.closingBalance',
								)}
							title={onGoalSeek ? translate('int.goalseek.rightClickCell') : undefined}
						>
							{money(row.balanceEnd)}
						</td>
						<td
							class="num gs small"
							class:clickable={!!onGoalSeek}
							oncontextmenu={(e) =>
								triggerGoalSeek(
									e,
									i,
									'cumulativeInterestOnPrincipal',
									row.cumulativeInterestOnPrincipal,
									'int.schedule.interestOnPrincipal',
								)}
							title={onGoalSeek ? translate('int.goalseek.rightClickCell') : undefined}
						>
							{money(row.cumulativeInterestOnPrincipal)}
						</td>
						<td
							class="num gs small accent"
							class:clickable={!!onGoalSeek}
							oncontextmenu={(e) =>
								triggerGoalSeek(
									e,
									i,
									'cumulativeInterestOnInterest',
									row.cumulativeInterestOnInterest,
									'int.schedule.interestOnInterest',
								)}
							title={onGoalSeek ? translate('int.goalseek.rightClickCell') : undefined}
						>
							{money(row.cumulativeInterestOnInterest)}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
	<footer class="table-footer">
		<div class="footer-cell">
			<span class="footer-label">{translate('int.summary.total')}</span>
			<span class="footer-value strong">{money(result.futureValue)}</span>
		</div>
		<div class="footer-cell">
			<span class="footer-label">{translate('int.schedule.interestTotal')}</span>
			<span class="footer-value accent">{money(result.interest)}</span>
		</div>
	</footer>
</section>

<style>
	.table-wrap {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		padding: 1rem;
		background: var(--panel);
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-md);
		min-width: 0;
	}

	.table-head {
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
	}

	.table-title {
		margin: 0;
		font-family: var(--font-display);
		font-size: 0.8125rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--text-primary);
	}

	.table-sub {
		font-size: 0.6875rem;
		color: var(--text-muted);
	}

	.table-hint {
		font-size: 0.6875rem;
		color: var(--accent-soft);
		font-style: italic;
	}

	.table-scroll {
		overflow-x: auto;
		max-height: 360px;
		overflow-y: auto;
	}

	table {
		width: 100%;
		border-collapse: collapse;
		font-family: var(--font-mono);
		font-size: 0.75rem;
		font-variant-numeric: tabular-nums;
	}

	th,
	td {
		padding: 0.4375rem 0.5rem;
		border-bottom: 1px solid var(--border-subtle);
		text-align: left;
	}

	thead {
		position: sticky;
		top: 0;
		background: var(--panel);
		z-index: 1;
	}

	thead th {
		font-family: var(--font-body);
		font-size: 0.625rem;
		font-weight: 700;
		color: var(--text-muted);
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}

	.num {
		text-align: right;
		white-space: nowrap;
	}

	.num.period {
		color: var(--text-secondary);
	}

	.num.muted {
		color: var(--text-muted);
	}

	.num.accent {
		color: var(--accent);
		font-weight: 600;
	}

	.num.strong {
		color: var(--text-primary);
		font-weight: 700;
	}

	.num.small {
		font-size: 0.6875rem;
	}

	.gs.clickable {
		cursor: context-menu;
		border-bottom: 1px dotted transparent;
		transition:
			border-color var(--transition-fast),
			background var(--transition-fast);
	}

	.gs.clickable:hover {
		border-bottom-color: color-mix(in srgb, var(--accent) 60%, transparent);
		background: color-mix(in srgb, var(--accent) 4%, transparent);
	}

	.date {
		color: var(--text-secondary);
	}

	.table-footer {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.75rem;
		padding: 0.5rem 0.5rem 0;
		border-top: 1px solid var(--border);
	}

	.footer-cell {
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
	}

	.footer-label {
		font-family: var(--font-body);
		font-size: 0.625rem;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--text-muted);
		font-weight: 600;
	}

	.footer-value {
		font-family: var(--font-mono);
		font-size: 0.9375rem;
	}

	.footer-value.strong {
		font-weight: 700;
		color: var(--text-primary);
	}

	.footer-value.accent {
		color: var(--accent);
		font-weight: 600;
	}
</style>
