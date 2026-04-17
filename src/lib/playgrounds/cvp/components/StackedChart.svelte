<script lang="ts">
	import { t } from '$lib/i18n';
	import { currency$ } from '$lib/stores/preferences';
	import { CURRENCIES } from '$lib/format';
	import {
		CHART_WIDTH as W,
		CHART_HEIGHT as H,
		CHART_PAD as PAD,
		scaleLinear,
	} from '../chart-utils';
	import ChartDefs from './ChartDefs.svelte';
	import ChartOverlays from './ChartOverlays.svelte';
	import type { CVPSingleResult, OverlayToggles } from '../types';

	let {
		data,
		overlays,
	}: {
		data: CVPSingleResult;
		overlays: OverlayToggles;
	} = $props();

	let translate = $derived($t);
	let currencyCode = $derived($currency$);
	let currencySymbol = $derived(CURRENCIES[currencyCode]?.symbol ?? '$');

	let p = $derived(data.price);
	let v = $derived(data.variableCost);
	let fc = $derived(data.fc);
	let bep = $derived(data.bepUnits);
	let vol = $derived(data.volume);

	let maxQ = $derived(Math.max((isFinite(bep) ? bep : 0) * 2, vol * 1.3, 100));
	let maxY = $derived(Math.max(p * maxQ, fc + v * maxQ) * 1.1);

	let xScale = $derived(scaleLinear([0, maxQ], [PAD.left, W - PAD.right]));
	let yScale = $derived(scaleLinear([0, maxY], [H - PAD.bottom, PAD.top]));
</script>

<svg viewBox="0 0 {W} {H}" preserveAspectRatio="xMidYMid meet" class="cvp-chart" role="img" aria-label={translate('cvp.chart.stack')}>
	<ChartDefs
		{xScale}
		{yScale}
		xLabel={translate('cvp.chart.unitsSold') + ' (Q)'}
		yLabel={translate('cvp.chart.amount') + ' (' + currencySymbol + ')'}
		xDomain={[0, maxQ]}
		yDomain={[0, maxY]}
	/>

	<!-- Fixed cost area -->
	<polygon
		points="{xScale(0)},{yScale(0)} {xScale(maxQ)},{yScale(0)} {xScale(maxQ)},{yScale(fc)} {xScale(0)},{yScale(fc)}"
		fill="#e8a840"
		opacity="0.1"
	/>

	<!-- Variable cost area stacked on FC -->
	<polygon
		points="{xScale(0)},{yScale(fc)} {xScale(maxQ)},{yScale(fc)} {xScale(maxQ)},{yScale(fc + v * maxQ)} {xScale(0)},{yScale(fc)}"
		fill="#f0605e"
		opacity="0.1"
	/>

	<!-- FC boundary -->
	<line
		x1={xScale(0)}
		y1={yScale(fc)}
		x2={xScale(maxQ)}
		y2={yScale(fc)}
		stroke="#e8a840"
		stroke-width="1"
		stroke-dasharray="6,4"
		opacity="0.5"
	/>

	<!-- Total Cost line -->
	<line
		x1={xScale(0)}
		y1={yScale(fc)}
		x2={xScale(maxQ)}
		y2={yScale(fc + v * maxQ)}
		stroke="url(#cvp-costLine)"
		stroke-width="2"
		stroke-linecap="round"
	/>

	<!-- Revenue line -->
	<line
		x1={xScale(0)}
		y1={yScale(0)}
		x2={xScale(maxQ)}
		y2={yScale(p * maxQ)}
		stroke="url(#cvp-revLine)"
		stroke-width="2.5"
		stroke-linecap="round"
	/>

	<!-- Area labels -->
	<text
		x={PAD.left + 16}
		y={yScale(fc / 2)}
		fill="#e8a840"
		font-family="DM Sans, sans-serif"
		font-size="9"
		font-weight="600"
		opacity="0.4"
	>
		{translate('cvp.chart.fixedCost')}
	</text>

	<text
		x={xScale(maxQ * 0.6)}
		y={yScale(fc + (v * maxQ * 0.6) / 2)}
		fill="#f0605e"
		font-family="DM Sans, sans-serif"
		font-size="9"
		font-weight="600"
		opacity="0.4"
		text-anchor="middle"
	>
		{translate('cvp.chart.variableCost')}
	</text>

	<ChartOverlays {data} {overlays} {xScale} {yScale} bepYValue={p * bep} />
</svg>

<style>
	.cvp-chart {
		display: block;
		width: 100%;
		height: 100%;
	}
</style>
