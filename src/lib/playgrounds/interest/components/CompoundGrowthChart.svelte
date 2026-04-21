<script lang="ts">
	import { t } from '$lib/i18n';
	import { currency$ } from '$lib/stores/preferences';
	import { CURRENCIES } from '$lib/format';
	import type { CompoundResult, InterestInputs } from '../types';

	let {
		inputs,
		result,
		showContinuous = false,
	}: {
		inputs: InterestInputs;
		result: CompoundResult;
		showContinuous?: boolean;
	} = $props();

	let translate = $derived($t);
	let currencyCode = $derived($currency$);
	let currencySymbol = $derived(CURRENCIES[currencyCode]?.symbol ?? '$');

	const W = 600;
	const H = 300;
	const PAD = { left: 52, right: 16, top: 16, bottom: 32 };

	let maxY = $derived(
		Math.max(result.futureValue, result.continuousEquivalent, inputs.principal) * 1.05,
	);

	let xScale = (i: number): number =>
		PAD.left + ((W - PAD.left - PAD.right) * i) / Math.max(1, result.perPeriod.length);
	let yScale = (v: number): number =>
		H - PAD.bottom - ((H - PAD.top - PAD.bottom) * v) / Math.max(1, maxY);

	let compoundPoints = $derived(
		[
			`${xScale(0)},${yScale(inputs.principal)}`,
			...result.perPeriod.map((r, i) => `${xScale(i + 1)},${yScale(r.balanceEnd)}`),
		].join(' '),
	);

	// Simple-interest baseline (flat line reference)
	let simpleAtEnd = $derived(
		inputs.principal + inputs.principal * inputs.nominalRate * result.years,
	);

	// Continuous overlay
	let continuousPoints = $derived(
		showContinuous
			? result.perPeriod
					.map((r, i) => {
						const tYear = (result.years * (i + 1)) / result.perPeriod.length;
						const cont = inputs.principal * Math.exp(inputs.nominalRate * tYear);
						return `${xScale(i + 1)},${yScale(cont)}`;
					})
					.join(' ')
			: '',
	);
	let continuousStart = $derived(showContinuous ? `${xScale(0)},${yScale(inputs.principal)} ` : '');
</script>

<figure class="chart-wrap">
	<figcaption class="chart-caption">
		{translate('int.chart.compound.title')}
	</figcaption>
	<svg viewBox="0 0 {W} {H}" preserveAspectRatio="xMidYMid meet" class="chart" role="img">
		<defs>
			<linearGradient id="int-compound-area" x1="0" y1="0" x2="0" y2="1">
				<stop offset="0%" stop-color="var(--green)" stop-opacity="0.22" />
				<stop offset="100%" stop-color="var(--green)" stop-opacity="0.02" />
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
			y2={yScale(simpleAtEnd)}
			stroke="var(--accent-soft)"
			stroke-width="1"
			stroke-dasharray="6,4"
			opacity="0.7"
		/>

		<polyline
			points={compoundPoints}
			fill="none"
			stroke="var(--green)"
			stroke-width="2.5"
			stroke-linecap="round"
		/>

		{#if showContinuous}
			<polyline
				points={continuousStart + continuousPoints}
				fill="none"
				stroke="var(--amber)"
				stroke-width="1.5"
				stroke-dasharray="5,3"
				opacity="0.85"
			/>
		{/if}

		<text
			x={W - PAD.right - 4}
			y={yScale(simpleAtEnd) - 4}
			fill="var(--accent-soft)"
			font-family="var(--font-mono)"
			font-size="9"
			text-anchor="end"
		>
			{translate('int.chart.compound.legendSimple')}
		</text>

		<text
			x={W - PAD.right - 4}
			y={yScale(result.futureValue) - 4}
			fill="var(--green)"
			font-family="var(--font-mono)"
			font-size="9"
			text-anchor="end"
			font-weight="700"
		>
			{translate('int.chart.compound.legendCompound')}
		</text>

		{#if showContinuous}
			<text
				x={W - PAD.right - 4}
				y={yScale(result.continuousEquivalent) - 4}
				fill="var(--amber)"
				font-family="var(--font-mono)"
				font-size="9"
				text-anchor="end"
			>
				{translate('int.chart.compound.legendContinuous')}
			</text>
		{/if}

		<text
			x={W - PAD.right}
			y={PAD.top + 10}
			fill="var(--text-secondary)"
			font-family="var(--font-mono)"
			font-size="9"
			text-anchor="end"
		>
			{translate('int.chart.compound.yAxis')} ({currencySymbol})
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
