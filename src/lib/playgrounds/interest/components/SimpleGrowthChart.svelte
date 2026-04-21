<script lang="ts">
	import { t } from '$lib/i18n';
	import { currency$ } from '$lib/stores/preferences';
	import { CURRENCIES } from '$lib/format';
	import type { InterestInputs, SimpleResult } from '../types';

	let {
		inputs,
		result,
	}: {
		inputs: InterestInputs;
		result: SimpleResult;
	} = $props();

	let translate = $derived($t);
	let currencyCode = $derived($currency$);
	let currencySymbol = $derived(CURRENCIES[currencyCode]?.symbol ?? '$');

	const W = 600;
	const H = 280;
	const PAD = { left: 52, right: 16, top: 16, bottom: 32 };

	let maxY = $derived(result.total * 1.05);
	let xScale = (i: number): number =>
		PAD.left + ((W - PAD.left - PAD.right) * i) / Math.max(1, result.perPeriod.length);
	let yScale = (v: number): number =>
		H - PAD.bottom - ((H - PAD.top - PAD.bottom) * v) / Math.max(1, maxY);

	let points = $derived(
		[
			`${xScale(0)},${yScale(inputs.principal)}`,
			...result.perPeriod.map((r, i) => `${xScale(i + 1)},${yScale(r.cumulativeTotal)}`),
		].join(' '),
	);

	let areaPath = $derived(
		`${xScale(0)},${yScale(inputs.principal)} ` +
			result.perPeriod.map((r, i) => `${xScale(i + 1)},${yScale(r.cumulativeTotal)}`).join(' ') +
			` ${xScale(result.perPeriod.length)},${yScale(inputs.principal)}`,
	);
</script>

<figure class="chart-wrap">
	<figcaption class="chart-caption">
		{translate('int.chart.simple.title')}
	</figcaption>
	<svg viewBox="0 0 {W} {H}" preserveAspectRatio="xMidYMid meet" class="chart" role="img">
		<defs>
			<linearGradient id="int-simple-area" x1="0" y1="0" x2="0" y2="1">
				<stop offset="0%" stop-color="var(--accent)" stop-opacity="0.22" />
				<stop offset="100%" stop-color="var(--accent)" stop-opacity="0.02" />
			</linearGradient>
		</defs>

		<line
			x1={PAD.left}
			y1={PAD.top}
			x2={PAD.left}
			y2={H - PAD.bottom}
			stroke="var(--border-strong)"
			stroke-width="1"
		/>
		<line
			x1={PAD.left}
			y1={H - PAD.bottom}
			x2={W - PAD.right}
			y2={H - PAD.bottom}
			stroke="var(--border-strong)"
			stroke-width="1"
		/>

		<line
			x1={PAD.left}
			y1={yScale(inputs.principal)}
			x2={W - PAD.right}
			y2={yScale(inputs.principal)}
			stroke="var(--text-dim)"
			stroke-width="0.5"
			stroke-dasharray="4,3"
		/>

		<polygon points={areaPath} fill="url(#int-simple-area)" />

		<polyline
			points={points}
			fill="none"
			stroke="var(--accent)"
			stroke-width="2"
			stroke-linecap="round"
		/>

		<text
			x={PAD.left + 6}
			y={yScale(inputs.principal) - 4}
			fill="var(--text-dim)"
			font-family="var(--font-mono)"
			font-size="9"
		>
			{translate('int.inputs.principal')}
		</text>

		<text
			x={W - PAD.right}
			y={PAD.top + 10}
			fill="var(--text-secondary)"
			font-family="var(--font-mono)"
			font-size="9"
			text-anchor="end"
		>
			{translate('int.chart.simple.yAxis')} ({currencySymbol})
		</text>
	</svg>
</figure>

<style>
	.chart-wrap {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		margin: 0;
		padding: 1rem;
		background: var(--panel);
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-md);
	}

	.chart-caption {
		font-family: var(--font-display);
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--text-primary);
	}

	.chart {
		width: 100%;
		height: auto;
		display: block;
	}
</style>
