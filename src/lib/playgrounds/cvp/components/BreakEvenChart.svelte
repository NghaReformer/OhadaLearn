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
	import type { CVPSingleResult, OverlayToggles, CVPSingleResult as CVR } from '../types';

	let {
		data,
		overlays,
		whatIfData = null,
	}: {
		data: CVPSingleResult;
		overlays: OverlayToggles;
		whatIfData?: CVR | null;
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

	let bepY = $derived(p * bep);
	let bepPx = $derived(isFinite(bep) ? xScale(bep) : 0);
	let bepPy = $derived(isFinite(bep) ? yScale(bepY) : 0);
	let canShowZones = $derived(isFinite(bep) && bep > 0);

	let rightRevY = $derived(p * maxQ);
	let rightCostY = $derived(fc + v * maxQ);

	let whatIfActive = $derived(
		!!whatIfData &&
			(whatIfData.price !== data.price ||
				whatIfData.variableCost !== data.variableCost ||
				whatIfData.fc !== data.fc ||
				whatIfData.volume !== data.volume),
	);

	let revLabelY = $derived(Math.max(yScale(p * maxQ) + 2, PAD.top + 6));
	let costLabelYRaw = $derived(yScale(fc + v * maxQ) + 2);
	let costLabelY = $derived(
		Math.abs(revLabelY - costLabelYRaw) < 18
			? costLabelYRaw + 18
			: Math.max(costLabelYRaw, PAD.top + 6),
	);
</script>

<svg viewBox="0 0 {W} {H}" preserveAspectRatio="xMidYMid meet" class="cvp-chart" role="img" aria-label={translate('cvp.chart.classic')}>
	<ChartDefs
		{xScale}
		{yScale}
		xLabel={translate('cvp.chart.unitsSold') + ' (Q)'}
		yLabel={translate('cvp.chart.amount') + ' (' + currencySymbol + ')'}
		xDomain={[0, maxQ]}
		yDomain={[0, maxY]}
	/>

	{#if canShowZones}
		<polygon
			points="{xScale(0)},{yScale(0)} {xScale(0)},{yScale(fc)} {bepPx},{bepPy} {xScale(0)},{yScale(0)}"
			fill="url(#cvp-lossFill)"
		/>
		<polygon
			points="{bepPx},{bepPy} {xScale(maxQ)},{yScale(rightRevY)} {xScale(maxQ)},{yScale(rightCostY)} {bepPx},{bepPy}"
			fill="url(#cvp-profitFill)"
		/>

		<text
			x={(PAD.left + bepPx) / 2}
			y={H - PAD.bottom - 20}
			fill="var(--error)"
			font-family="var(--font-display)"
			font-size="13"
			font-weight="500"
			font-style="italic"
			opacity="0.25"
			text-anchor="middle"
		>
			{translate('cvp.chart.loss')}
		</text>
		<text
			x={(bepPx + W - PAD.right) / 2}
			y={Math.max(yScale((rightRevY + rightCostY) / 2), PAD.top + 20)}
			fill="var(--green)"
			font-family="var(--font-display)"
			font-size="13"
			font-weight="500"
			font-style="italic"
			opacity="0.25"
			text-anchor="middle"
		>
			{translate('cvp.chart.profit')}
		</text>
	{/if}

	<!-- Fixed cost reference line -->
	<line
		x1={xScale(0)}
		y1={yScale(fc)}
		x2={xScale(maxQ)}
		y2={yScale(fc)}
		stroke="var(--amber)"
		stroke-width="1"
		stroke-dasharray="8,5"
		opacity="0.4"
	/>
	<text
		x={W - PAD.right + 4}
		y={yScale(fc) - 2}
		fill="var(--amber)"
		font-family="var(--font-body)"
		font-size="8"
		font-weight="600"
		opacity="0.5"
	>
		FC
	</text>

	<!-- Total Cost line -->
	<line
		x1={xScale(0)}
		y1={yScale(fc)}
		x2={xScale(maxQ)}
		y2={yScale(fc + v * maxQ)}
		stroke="url(#cvp-costLine)"
		stroke-width="2.5"
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

	<!-- Line labels -->
	<rect x={W - PAD.right - 66} y={revLabelY - 8} width="66" height="16" rx="4" fill="var(--panel)" opacity="0.8" />
	<text
		x={W - PAD.right - 33}
		y={revLabelY + 3}
		fill="var(--green)"
		font-family="var(--font-body)"
		font-size="9"
		font-weight="700"
		text-anchor="middle"
	>
		{translate('cvp.chart.revenue')}
	</text>

	<rect x={W - PAD.right - 70} y={costLabelY - 8} width="70" height="16" rx="4" fill="var(--panel)" opacity="0.8" />
	<text
		x={W - PAD.right - 35}
		y={costLabelY + 3}
		fill="var(--error)"
		font-family="var(--font-body)"
		font-size="9"
		font-weight="700"
		text-anchor="middle"
	>
		{translate('cvp.chart.totalCost')}
	</text>

	{#if whatIfActive && whatIfData}
		{@const wp = whatIfData.price}
		{@const wv = whatIfData.variableCost}
		{@const wfc = whatIfData.fc}
		{@const wBep = whatIfData.bepUnits}
		<line
			x1={xScale(0)}
			y1={yScale(0)}
			x2={xScale(maxQ)}
			y2={yScale(wp * maxQ)}
			stroke="var(--green)"
			stroke-width="1.5"
			stroke-dasharray="6,4"
			opacity="0.3"
			stroke-linecap="round"
		/>
		<line
			x1={xScale(0)}
			y1={yScale(wfc)}
			x2={xScale(maxQ)}
			y2={yScale(wfc + wv * maxQ)}
			stroke="var(--error)"
			stroke-width="1.5"
			stroke-dasharray="6,4"
			opacity="0.3"
			stroke-linecap="round"
		/>
		{#if isFinite(wBep) && wBep > 0}
			<circle
				cx={xScale(wBep)}
				cy={yScale(wp * wBep)}
				r="5"
				fill="none"
				stroke="var(--accent)"
				stroke-width="1"
				stroke-dasharray="3,2"
				opacity="0.3"
			/>
		{/if}
	{/if}

	<ChartOverlays {data} {overlays} {xScale} {yScale} bepYValue={bepY} />
</svg>

<style>
	.cvp-chart {
		display: block;
		width: 100%;
		height: 100%;
	}
</style>
