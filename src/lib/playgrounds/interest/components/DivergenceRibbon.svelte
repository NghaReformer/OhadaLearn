<script lang="ts">
	import { t } from '$lib/i18n';
	import type { EirResult } from '../types';

	let {
		result,
	}: {
		result: EirResult;
	} = $props();

	let translate = $derived($t);

	const W = 600;
	const H = 300;
	const PAD = { left: 52, right: 16, top: 16, bottom: 32 };

	let series = $derived(result.divergenceSeries);
	let maxY = $derived(
		Math.max(
			...series.map((p) => Math.max(p.straightLineCarrying, p.eirCarrying)),
			result.eir.issuePrice,
		) * 1.02,
	);
	let minY = $derived(
		Math.min(
			...series.map((p) => Math.min(p.straightLineCarrying, p.eirCarrying)),
			result.eir.issuePrice,
		) * 0.98,
	);

	let xScale = (i: number): number =>
		PAD.left + ((W - PAD.left - PAD.right) * i) / Math.max(1, series.length);
	let yScale = (v: number): number =>
		H - PAD.bottom - ((H - PAD.top - PAD.bottom) * (v - minY)) / Math.max(1, maxY - minY);

	let slPoints = $derived(
		[
			`${xScale(0)},${yScale(result.eir.issuePrice)}`,
			...series.map((p, i) => `${xScale(i + 1)},${yScale(p.straightLineCarrying)}`),
		].join(' '),
	);

	let eirPoints = $derived(
		[
			`${xScale(0)},${yScale(result.eir.issuePrice)}`,
			...series.map((p, i) => `${xScale(i + 1)},${yScale(p.eirCarrying)}`),
		].join(' '),
	);

	// Ribbon polygon: SL forward + EIR reverse
	let ribbonPath = $derived(
		[
			`${xScale(0)},${yScale(result.eir.issuePrice)}`,
			...series.map((p, i) => `${xScale(i + 1)},${yScale(p.straightLineCarrying)}`),
			...series
				.slice()
				.reverse()
				.map((p, reverseI) => {
					const i = series.length - 1 - reverseI;
					return `${xScale(i + 1)},${yScale(p.eirCarrying)}`;
				}),
		].join(' '),
	);
</script>

<figure class="chart-wrap">
	<figcaption class="chart-caption">
		{translate('int.chart.divergence.title')}
	</figcaption>
	<svg viewBox="0 0 {W} {H}" preserveAspectRatio="xMidYMid meet" class="chart" role="img">
		<defs>
			<linearGradient id="int-divergence-ribbon" x1="0" y1="0" x2="1" y2="0">
				<stop offset="0%" stop-color="var(--accent)" stop-opacity="0.05" />
				<stop offset="50%" stop-color="var(--accent)" stop-opacity="0.22" />
				<stop offset="100%" stop-color="var(--accent)" stop-opacity="0.05" />
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

		<polygon points={ribbonPath} fill="url(#int-divergence-ribbon)" />

		<polyline
			points={slPoints}
			fill="none"
			stroke="var(--amber)"
			stroke-width="2"
			stroke-dasharray="5,4"
			stroke-linecap="round"
		/>

		<polyline
			points={eirPoints}
			fill="none"
			stroke="var(--accent)"
			stroke-width="2.5"
			stroke-linecap="round"
		/>

		<text
			x={W - PAD.right - 4}
			y={yScale(series[series.length - 1]?.straightLineCarrying ?? 0) + 4}
			fill="var(--amber)"
			font-family="var(--font-mono)"
			font-size="9"
			text-anchor="end"
		>
			{translate('int.chart.divergence.legendSl')}
		</text>

		<text
			x={W - PAD.right - 4}
			y={yScale(series[series.length - 1]?.eirCarrying ?? 0) - 4}
			fill="var(--accent)"
			font-family="var(--font-mono)"
			font-size="9"
			text-anchor="end"
			font-weight="700"
		>
			{translate('int.chart.divergence.legendEir')}
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
