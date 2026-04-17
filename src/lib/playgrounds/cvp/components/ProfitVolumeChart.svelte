<script lang="ts">
	import { t } from '$lib/i18n';
	import {
		CHART_WIDTH as W,
		CHART_HEIGHT as H,
		CHART_PAD as PAD,
		scaleLinear,
		compactNum,
	} from '../chart-utils';
	import ChartDefs from './ChartDefs.svelte';
	import ChartOverlays from './ChartOverlays.svelte';
	import type { CVPSingleResult, OverlayToggles } from '../types';

	let {
		data,
		overlays,
		whatIfData = null,
	}: {
		data: CVPSingleResult;
		overlays: OverlayToggles;
		whatIfData?: CVPSingleResult | null;
	} = $props();

	let translate = $derived($t);

	let cm = $derived(data.cm);
	let fc = $derived(data.fc);
	let vol = $derived(data.volume);
	let bep = $derived(data.bepUnits);

	let maxQ = $derived(Math.max((isFinite(bep) ? bep : 0) * 2, vol * 1.3, 100));
	let profitAtMax = $derived(cm * maxQ - fc);
	let yMin = $derived(-fc * 1.1);
	let yMax = $derived(Math.max(profitAtMax * 1.1, fc * 0.2));

	let xScale = $derived(scaleLinear([0, maxQ], [PAD.left, W - PAD.right]));
	let yScale = $derived(scaleLinear([yMin, yMax], [H - PAD.bottom, PAD.top]));

	let curProfit = $derived(cm * vol - fc);
	let opColor = $derived(curProfit >= 0 ? '#2dd4a0' : '#f0605e');

	let whatIfActive = $derived(
		!!whatIfData &&
			(whatIfData.price !== data.price ||
				whatIfData.variableCost !== data.variableCost ||
				whatIfData.fc !== data.fc ||
				whatIfData.volume !== data.volume),
	);
</script>

<svg viewBox="0 0 {W} {H}" preserveAspectRatio="xMidYMid meet" class="cvp-chart" role="img" aria-label={translate('cvp.chart.pv')}>
	<ChartDefs
		{xScale}
		{yScale}
		xLabel={translate('cvp.chart.unitsSold') + ' (Q)'}
		yLabel={translate('cvp.chart.profit') + ' / ' + translate('cvp.chart.loss')}
		xDomain={[0, maxQ]}
		yDomain={[yMin, yMax]}
	/>

	<line
		x1={PAD.left}
		y1={yScale(0)}
		x2={W - PAD.right}
		y2={yScale(0)}
		stroke="#4a5578"
		stroke-width="0.5"
		opacity="0.5"
	/>

	<line
		x1={xScale(0)}
		y1={yScale(-fc)}
		x2={xScale(maxQ)}
		y2={yScale(profitAtMax)}
		stroke="url(#cvp-pvLine)"
		stroke-width="2.5"
		stroke-linecap="round"
	/>

	<circle cx={xScale(vol)} cy={yScale(curProfit)} r="5" fill={opColor} opacity="0.85" />
	<text
		x={xScale(vol) + 8}
		y={yScale(curProfit) - 6}
		fill={opColor}
		font-family="JetBrains Mono, monospace"
		font-size="8"
		font-weight="600"
	>
		{compactNum(curProfit)}
	</text>

	{#if whatIfActive && whatIfData}
		{@const wcm = whatIfData.price - whatIfData.variableCost}
		{@const wfc = whatIfData.fc}
		<line
			x1={xScale(0)}
			y1={yScale(-wfc)}
			x2={xScale(maxQ)}
			y2={yScale(wcm * maxQ - wfc)}
			stroke="#7c7fff"
			stroke-width="1.5"
			stroke-dasharray="6,4"
			opacity="0.3"
			stroke-linecap="round"
		/>
	{/if}

	<ChartOverlays {data} {overlays} {xScale} {yScale} bepYValue={0} />
</svg>

<style>
	.cvp-chart {
		display: block;
		width: 100%;
		height: 100%;
	}
</style>
