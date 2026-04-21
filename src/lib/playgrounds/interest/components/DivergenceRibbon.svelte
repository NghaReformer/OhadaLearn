<script lang="ts">
	import { t } from '$lib/i18n';
	import { currency$ } from '$lib/stores/preferences';
	import { CURRENCIES } from '$lib/format';
	import type { EirResult } from '../types';

	let {
		result,
	}: {
		result: EirResult;
	} = $props();

	let translate = $derived($t);
	let currencyCode = $derived($currency$);
	let currencySymbol = $derived(CURRENCIES[currencyCode]?.symbol ?? '$');

	const W = 620;
	const H = 320;
	const PAD = { left: 72, right: 24, top: 24, bottom: 40 };

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

	function xScale(i: number): number {
		return PAD.left + ((W - PAD.left - PAD.right) * i) / Math.max(1, series.length);
	}
	function yScale(v: number): number {
		return H - PAD.bottom - ((H - PAD.top - PAD.bottom) * (v - minY)) / Math.max(1, maxY - minY);
	}

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

	let yTicks = $derived.by(() => {
		const count = 5;
		const ticks: Array<{ value: number; y: number }> = [];
		for (let i = 0; i <= count; i++) {
			const v = minY + ((maxY - minY) * i) / count;
			ticks.push({ value: v, y: yScale(v) });
		}
		return ticks;
	});

	let xTicks = $derived.by(() => {
		const n = series.length;
		const ticks: Array<{ label: string; x: number }> = [{ label: '0', x: xScale(0) }];
		for (let i = 1; i <= n; i++) {
			ticks.push({ label: String(i), x: xScale(i) });
		}
		return ticks;
	});

	function formatTick(v: number): string {
		if (v >= 1_000_000) return (v / 1_000_000).toFixed(v >= 10_000_000 ? 0 : 2) + 'M';
		if (v >= 1_000) return (v / 1_000).toFixed(v >= 10_000 ? 0 : 1) + 'K';
		return v.toFixed(0);
	}
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

		{#each yTicks as tick (tick.value)}
			<line
				x1={PAD.left}
				y1={tick.y}
				x2={W - PAD.right}
				y2={tick.y}
				stroke="var(--border-strong)"
				stroke-width="0.5"
				stroke-dasharray="3,4"
				opacity="0.5"
			/>
			<text
				x={PAD.left - 6}
				y={tick.y + 3}
				fill="var(--text-dim)"
				font-family="var(--font-mono)"
				font-size="9"
				text-anchor="end"
			>
				{formatTick(tick.value)}
			</text>
		{/each}

		{#each xTicks as tick (tick.x)}
			<text
				x={tick.x}
				y={H - PAD.bottom + 14}
				fill="var(--text-dim)"
				font-family="var(--font-mono)"
				font-size="9"
				text-anchor="middle"
			>
				{tick.label}
			</text>
		{/each}

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
			x={PAD.left}
			y={PAD.top - 8}
			fill="var(--text-secondary)"
			font-family="var(--font-body)"
			font-size="9"
			font-weight="600"
		>
			{translate('int.chart.divergence.yAxis')} ({currencySymbol})
		</text>
		<text
			x={W - PAD.right}
			y={H - 6}
			fill="var(--text-secondary)"
			font-family="var(--font-body)"
			font-size="9"
			font-weight="600"
			text-anchor="end"
		>
			{translate('int.chart.divergence.xAxis')}
		</text>

		<!-- Legend -->
		<g transform="translate({PAD.left + 8}, {PAD.top + 8})">
			<rect x="0" y="0" width="12" height="2.5" fill="var(--accent)" />
			<text
				x="16"
				y="4"
				fill="var(--accent)"
				font-family="var(--font-mono)"
				font-size="9"
				font-weight="700"
			>
				{translate('int.chart.divergence.legendEir')}
			</text>
			<rect x="200" y="0" width="12" height="2.5" fill="var(--amber)" />
			<text
				x="216"
				y="4"
				fill="var(--amber)"
				font-family="var(--font-mono)"
				font-size="9"
				font-weight="600"
			>
				{translate('int.chart.divergence.legendSl')}
			</text>
		</g>
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
