<script lang="ts">
	import { CHART_WIDTH as W, CHART_HEIGHT as H, CHART_PAD as PAD, compactNum } from '../chart-utils';
	import type { CVPSingleResult, OverlayToggles } from '../types';

	let {
		data,
		overlays,
		xScale,
		yScale,
		bepYValue = 0,
	}: {
		data: CVPSingleResult;
		overlays: OverlayToggles;
		xScale: (v: number) => number;
		yScale: (v: number) => number;
		bepYValue?: number;
	} = $props();

	let showBEP = $derived(overlays.bep && isFinite(data.bepUnits) && data.bepUnits > 0);
	let showTarget = $derived(
		overlays.target && isFinite(data.targetUnits) && data.targetUnits > 0,
	);
	let showMoS = $derived(
		overlays.mos && isFinite(data.bepUnits) && !!data.volume && data.bepUnits > 0,
	);
	let showDOL = $derived(isFinite(data.dol) && data.dol !== 0 && data.operatingIncome > 0 && overlays.dol);

	let bepLabel = $derived(compactNum(data.bepUnits));
	let bepLabelLen = $derived(bepLabel.length * 6 + 14);
</script>

{#if showBEP}
	{@const bx = xScale(data.bepUnits)}
	{@const by = yScale(bepYValue)}
	<line
		x1={bx}
		y1={by}
		x2={bx}
		y2={H - PAD.bottom}
		stroke="var(--accent)"
		stroke-width="1"
		stroke-dasharray="4,3"
		opacity="0.4"
	/>
	<circle
		cx={bx}
		cy={by}
		r="8"
		fill="none"
		stroke="var(--accent)"
		stroke-width="1.5"
		opacity="0.3"
		filter="url(#cvp-glow)"
	/>
	<circle cx={bx} cy={by} r="4" fill="var(--accent)" filter="url(#cvp-glow)" />
	<rect
		x={bx - bepLabelLen / 2}
		y={by + 6}
		width={bepLabelLen}
		height="20"
		rx="6"
		fill="var(--panel)"
		stroke="var(--accent)"
		stroke-width="1"
		opacity="0.9"
	/>
	<text
		x={bx}
		y={by + 20}
		fill="var(--accent)"
		font-family="var(--font-mono)"
		font-size="9"
		font-weight="600"
		text-anchor="middle"
	>
		{bepLabel}
	</text>
{/if}

{#if showTarget}
	{@const tx = xScale(data.targetUnits)}
	{@const ty = yScale(data.targetRevenue)}
	<line
		x1={PAD.left}
		y1={ty}
		x2={W - PAD.right}
		y2={ty}
		stroke="var(--amber)"
		stroke-width="1"
		stroke-dasharray="6,3"
		opacity="0.6"
	/>
	<circle cx={tx} cy={ty} r="4" fill="var(--amber)" opacity="0.7" />
	<text
		x={tx + 8}
		y={ty - 6}
		fill="var(--amber)"
		font-family="var(--font-body)"
		font-size="8"
		font-weight="600"
		opacity="0.8"
	>
		Target: {compactNum(data.targetUnits)}
	</text>
{/if}

{#if showMoS}
	{@const bx = xScale(data.bepUnits)}
	{@const vx = xScale(data.volume)}
	{@const isNegative = data.volume < data.bepUnits}
	{@const bracketY = H - PAD.bottom - 8}
	{@const color = isNegative ? 'var(--error)' : 'var(--accent-soft)'}
	{@const leftX = isNegative ? vx : bx}
	{@const rightX = isNegative ? bx : vx}
	<line x1={leftX} y1={bracketY} x2={rightX} y2={bracketY} stroke={color} stroke-width="1.5" opacity="0.6" />
	<line x1={leftX} y1={bracketY - 4} x2={leftX} y2={bracketY + 4} stroke={color} stroke-width="1" opacity="0.6" />
	<line
		x1={rightX}
		y1={bracketY - 4}
		x2={rightX}
		y2={bracketY + 4}
		stroke={color}
		stroke-width="1"
		opacity="0.6"
	/>
	<text
		x={(leftX + rightX) / 2}
		y={bracketY - 4}
		fill={color}
		font-family="var(--font-mono)"
		font-size="8"
		font-weight="600"
		text-anchor="middle"
		opacity="0.8"
	>
		MoS {data.mosPct.toFixed(1)}%{isNegative ? ' ⚠' : ''}
	</text>
{/if}

{#if showDOL}
	{@const vx = xScale(data.volume)}
	{@const revY = yScale(data.totalRevenue)}
	{@const costY = yScale(data.totalVC + data.fc)}
	{@const vy = (revY + costY) / 2}
	<rect
		x={vx + 8}
		y={vy - 18}
		width="56"
		height="16"
		rx="4"
		fill="var(--panel)"
		opacity="0.85"
		stroke="var(--accent-soft)"
		stroke-width="0.5"
	/>
	<text
		x={vx + 36}
		y={vy - 7}
		fill="var(--accent-soft)"
		font-family="var(--font-mono)"
		font-size="8"
		font-weight="600"
		text-anchor="middle"
	>
		DOL {isFinite(data.dol) ? data.dol.toFixed(2) : '∞'}×
	</text>
	<circle cx={vx} cy={vy} r="3" fill={data.isProfit ? 'var(--green)' : 'var(--error)'} opacity="0.8" />
{/if}
