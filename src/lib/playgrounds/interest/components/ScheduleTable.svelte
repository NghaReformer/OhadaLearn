<script lang="ts">
	import { t } from '$lib/i18n';
	import { currency$ } from '$lib/stores/preferences';
	import { fmtCurrency } from '$lib/format';
	import type { AmortisationMethod, AmortisationSchedule } from '../types';
	import type { BondRowKey } from '../solvers';

	export interface BondCellGoalSeekEvent {
		rowIndex: number;
		colKey: BondRowKey;
		currentValue: number;
		columnLabelKey: string;
		method: AmortisationMethod;
		position: { x: number; y: number };
	}

	let {
		schedule,
		onGoalSeek,
	}: {
		schedule: AmortisationSchedule;
		onGoalSeek?: (event: BondCellGoalSeekEvent) => void;
	} = $props();

	let translate = $derived($t);
	let currencyCode = $derived($currency$);

	function money(v: number): string {
		return fmtCurrency(v, currencyCode);
	}

	let titleKey = $derived(
		schedule.method === 'eir' ? 'int.schedule.methodEir' : 'int.schedule.methodSl',
	);

	function trigger(
		e: MouseEvent,
		rowIndex: number,
		colKey: BondRowKey,
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
			method: schedule.method,
			position: { x: e.clientX, y: e.clientY },
		});
	}
</script>

<section class="schedule-wrap">
	<header class="schedule-head">
		<h4 class="schedule-title">{translate(titleKey)}</h4>
		{#if onGoalSeek}
			<span class="schedule-hint">{translate('int.goalseek.rightClickHint')}</span>
		{/if}
	</header>
	<div class="schedule-scroll">
		<table class="schedule">
			<thead>
				<tr>
					<th class="num">{translate('int.schedule.period')}</th>
					<th class="num">{translate('int.schedule.opening')}</th>
					<th class="num">{translate('int.schedule.cashInterest')}</th>
					<th class="num">{translate('int.schedule.interestExpense')}</th>
					<th class="num">{translate('int.schedule.discountAmortisation')}</th>
					<th class="num">{translate('int.schedule.closing')}</th>
				</tr>
			</thead>
			<tbody>
				{#each schedule.rows as row (row.periodIndex)}
					{@const i = row.periodIndex - 1}
					<tr>
						<td class="num period">{row.periodIndex}</td>
						<td
							class="num gs"
							class:clickable={!!onGoalSeek}
							oncontextmenu={(e) =>
								trigger(
									e,
									i,
									'openingCarryingAmount',
									row.openingCarryingAmount,
									'int.schedule.opening',
								)}
							title={onGoalSeek ? translate('int.goalseek.rightClickCell') : undefined}
						>
							{money(row.openingCarryingAmount)}
						</td>
						<td
							class="num gs muted"
							class:clickable={!!onGoalSeek}
							oncontextmenu={(e) =>
								trigger(e, i, 'cashInterest', row.cashInterest, 'int.schedule.cashInterest')}
							title={onGoalSeek ? translate('int.goalseek.rightClickCell') : undefined}
						>
							{money(row.cashInterest)}
						</td>
						<td
							class="num gs accent"
							class:clickable={!!onGoalSeek}
							oncontextmenu={(e) =>
								trigger(
									e,
									i,
									'interestExpense',
									row.interestExpense,
									'int.schedule.interestExpense',
								)}
							title={onGoalSeek ? translate('int.goalseek.rightClickCell') : undefined}
						>
							{money(row.interestExpense)}
						</td>
						<td
							class="num gs"
							class:clickable={!!onGoalSeek}
							oncontextmenu={(e) =>
								trigger(
									e,
									i,
									'discountAmortisation',
									row.discountAmortisation,
									'int.schedule.discountAmortisation',
								)}
							title={onGoalSeek ? translate('int.goalseek.rightClickCell') : undefined}
						>
							{money(row.discountAmortisation)}
						</td>
						<td
							class="num gs"
							class:clickable={!!onGoalSeek}
							oncontextmenu={(e) =>
								trigger(
									e,
									i,
									'closingCarryingAmount',
									row.closingCarryingAmount,
									'int.schedule.closing',
								)}
							title={onGoalSeek ? translate('int.goalseek.rightClickCell') : undefined}
						>
							{money(row.closingCarryingAmount)}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</section>

<style>
	.schedule-wrap {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		padding: 1rem;
		background: var(--panel);
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-md);
		min-width: 0;
	}

	.schedule-head {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 0.5rem;
	}

	.schedule-title {
		margin: 0;
		font-family: var(--font-display);
		font-size: 0.8125rem;
		font-weight: 700;
		color: var(--text-primary);
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}

	.schedule-hint {
		font-size: 0.6875rem;
		color: var(--accent-soft);
		font-style: italic;
	}

	.schedule-scroll {
		overflow-x: auto;
	}

	.schedule {
		width: 100%;
		border-collapse: collapse;
		font-family: var(--font-mono);
		font-size: 0.75rem;
		font-variant-numeric: tabular-nums;
	}

	.schedule th,
	.schedule td {
		padding: 0.4375rem 0.5rem;
		text-align: right;
		border-bottom: 1px solid var(--border-subtle);
	}

	.schedule thead th {
		font-family: var(--font-body);
		font-size: 0.625rem;
		font-weight: 700;
		color: var(--text-muted);
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}

	.num.period {
		color: var(--text-secondary);
		text-align: right;
	}

	.num {
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
</style>
