<script lang="ts">
	import { t } from '$lib/i18n';
	import { currency$ } from '$lib/stores/preferences';
	import { fmtCurrency } from '$lib/format';
	import type { AmortisationSchedule } from '../types';

	let {
		schedule,
	}: {
		schedule: AmortisationSchedule;
	} = $props();

	let translate = $derived($t);
	let currencyCode = $derived($currency$);

	function money(v: number): string {
		return fmtCurrency(v, currencyCode);
	}

	let titleKey = $derived(
		schedule.method === 'eir' ? 'int.schedule.methodEir' : 'int.schedule.methodSl',
	);
</script>

<section class="schedule-wrap">
	<h4 class="schedule-title">{translate(titleKey)}</h4>
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
					<tr>
						<td class="num period">{row.periodIndex}</td>
						<td class="num">{money(row.openingCarryingAmount)}</td>
						<td class="num muted">{money(row.cashInterest)}</td>
						<td class="num accent">{money(row.interestExpense)}</td>
						<td class="num">{money(row.discountAmortisation)}</td>
						<td class="num">{money(row.closingCarryingAmount)}</td>
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

	.schedule-title {
		margin: 0;
		font-family: var(--font-display);
		font-size: 0.8125rem;
		font-weight: 700;
		color: var(--text-primary);
		text-transform: uppercase;
		letter-spacing: 0.06em;
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
</style>
