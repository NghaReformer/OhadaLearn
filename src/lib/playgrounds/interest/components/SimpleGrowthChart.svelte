<script lang="ts">
	import { t } from '$lib/i18n';
	import { currency$ } from '$lib/stores/preferences';
	import { CURRENCIES } from '$lib/format';
	import type { CompoundResult, InterestInputs, SimpleResult } from '../types';

	let {
		inputs,
		result,
		compoundResult = null,
	}: {
		inputs: InterestInputs;
		result: SimpleResult;
		compoundResult?: CompoundResult | null;
	} = $props();

	let translate = $derived($t);
	let currencyCode = $derived($currency$);
	let currencySymbol = $derived(CURRENCIES[currencyCode]?.symbol ?? '$');

	const W = 620;
	const H = 300;
	const PAD = { left: 64, right: 24, top: 24, bottom: 40 };

	let maxY = $derived(
		Math.max(
			result.total,
			compoundResult?.futureValue ?? result.total,
			inputs.principal,
		) * 1.05,
	);

	function xScale(i: number): number {
		return PAD.left + ((W - PAD.left - PAD.right) * i) / Math.max(1, result.perPeriod.length);
	}
	function yScale(v: number): number {
		return H - PAD.bottom - ((H - PAD.top - PAD.bottom) * v) / Math.max(1, maxY);
	}

	let simplePoints = $derived(
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

	// Compound overlay (user request: see both curves in Simple mode).
	let compoundPoints = $derived(
		compoundResult
			? [
					`${xScale(0)},${yScale(inputs.principal)}`,
					...compoundResult.perPeriod.map((r, i) => {
						const xi =
							(result.perPeriod.length * (i + 1)) / compoundResult.perPeriod.length;
						return `${xScale(xi)},${yScale(r.balanceEnd)}`;
					}),
				].join(' ')
			: '',
	);

	// Y-axis ticks — 5 evenly spaced labels.
	let yTicks = $derived.by(() => {
		const count = 5;
		const ticks: Array<{ value: number; y: number }> = [];
		for (let i = 0; i <= count; i++) {
			const v = (maxY * i) / count;
			ticks.push({ value: v, y: yScale(v) });
		}
		return ticks;
	});

	// X-axis ticks — calendar-year labels at regular intervals.
	let xTicks = $derived.by(() => {
		const n = result.perPeriod.length;
		if (n === 0) return [];
		const desired = Math.min(n, 6);
		const step = Math.max(1, Math.round(n / desired));
		const ticks: Array<{ label: string; x: number }> = [
			{ label: inputs.startDate.slice(0, 4), x: xScale(0) },
		];
		for (let i = step; i <= n; i += step) {
			const endDate = result.perPeriod[i - 1]?.periodEnd ?? '';
			ticks.push({ label: endDate.slice(0, 4), x: xScale(i) });
		}
		return ticks;
	});

	function formatTick(v: number): string {
		if (v >= 1_000_000) return (v / 1_000_000).toFixed(v >= 10_000_000 ? 0 : 1) + 'M';
		if (v >= 1_000) return (v / 1_000).toFixed(v >= 10_000 ? 0 : 1) + 'K';
		return v.toFixed(0);
	}
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

		<!-- Axes -->
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

		<!-- Y-axis grid + tick labels -->
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

		<!-- X-axis tick labels -->
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

		<!-- Simple interest area + line -->
		<polygon points={areaPath} fill="url(#int-simple-area)" />
		<polyline
			points={simplePoints}
			fill="none"
			stroke="var(--accent)"
			stroke-width="2.5"
			stroke-linecap="round"
		/>

		<!-- Compound overlay (user request — dashed green) -->
		{#if compoundResult}
			<polyline
				points={compoundPoints}
				fill="none"
				stroke="var(--green)"
				stroke-width="1.75"
				stroke-dasharray="6,4"
				opacity="0.85"
				stroke-linecap="round"
			/>
		{/if}

		<!-- Axis titles -->
		<text
			x={PAD.left}
			y={PAD.top - 8}
			fill="var(--text-secondary)"
			font-family="var(--font-body)"
			font-size="9"
			font-weight="600"
		>
			{translate('int.chart.simple.yAxis')} ({currencySymbol})
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
			{translate('int.chart.simple.xAxis')}
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
				font-weight="600"
			>
				{translate('int.chart.compound.legendSimple')}
			</text>
			{#if compoundResult}
				<rect x="120" y="0" width="12" height="2.5" fill="var(--green)" />
				<text
					x="136"
					y="4"
					fill="var(--green)"
					font-family="var(--font-mono)"
					font-size="9"
					font-weight="600"
				>
					{translate('int.chart.compound.legendCompound')}
				</text>
			{/if}
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
