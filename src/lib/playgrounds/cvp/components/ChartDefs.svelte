<script lang="ts">
	import {
		CHART_WIDTH as W,
		CHART_HEIGHT as H,
		CHART_PAD as PAD,
		compactNum,
		generateXTicks,
		generateYTicks,
	} from '../chart-utils';

	let {
		xScale,
		yScale,
		xLabel,
		yLabel,
		xDomain,
		yDomain,
	}: {
		xScale: (v: number) => number;
		yScale: (v: number) => number;
		xLabel: string;
		yLabel: string;
		xDomain: [number, number];
		yDomain: [number, number];
	} = $props();

	let yTicks = $derived(generateYTicks(yDomain, yScale));
	let xTicks = $derived(generateXTicks(xDomain, xScale));
</script>

<defs>
	<linearGradient id="cvp-profitFill" x1="0" y1="0" x2="0" y2="1">
		<stop offset="0%" stop-color="var(--green)" stop-opacity="0.14" />
		<stop offset="100%" stop-color="var(--green)" stop-opacity="0.01" />
	</linearGradient>
	<linearGradient id="cvp-lossFill" x1="0" y1="0" x2="0" y2="1">
		<stop offset="0%" stop-color="var(--error)" stop-opacity="0.01" />
		<stop offset="100%" stop-color="var(--error)" stop-opacity="0.14" />
	</linearGradient>
	<linearGradient id="cvp-revLine" x1="0" y1="1" x2="1" y2="0">
		<stop offset="0%" stop-color="var(--green-deep)" />
		<stop offset="100%" stop-color="var(--green)" />
	</linearGradient>
	<linearGradient id="cvp-costLine" x1="0" y1="1" x2="1" y2="0">
		<stop offset="0%" stop-color="var(--error-deep)" />
		<stop offset="100%" stop-color="var(--error)" />
	</linearGradient>
	<linearGradient id="cvp-pvLine" x1="0" y1="1" x2="1" y2="0">
		<stop offset="0%" stop-color="var(--accent-dim)" />
		<stop offset="100%" stop-color="var(--accent)" />
	</linearGradient>
	<filter id="cvp-glow">
		<feGaussianBlur stdDeviation="3" result="blur" />
		<feMerge>
			<feMergeNode in="blur" />
			<feMergeNode in="SourceGraphic" />
		</feMerge>
	</filter>
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

{#each yTicks as tick (tick.value)}
	<line
		x1={PAD.left}
		y1={tick.position}
		x2={W - PAD.right}
		y2={tick.position}
		stroke="var(--border-strong)"
		stroke-width="0.5"
		stroke-dasharray="3,4"
	/>
	<text
		x={PAD.left - 8}
		y={tick.position + 3}
		fill="var(--text-dim)"
		font-family="var(--font-mono)"
		font-size="8"
		text-anchor="end"
	>
		{compactNum(tick.value)}
	</text>
{/each}

{#each xTicks as tick (tick.value)}
	<text
		x={tick.position}
		y={H - PAD.bottom + 14}
		fill="var(--text-dim)"
		font-family="var(--font-mono)"
		font-size="8"
		text-anchor="middle"
	>
		{compactNum(tick.value)}
	</text>
{/each}

<text
	x={PAD.left}
	y={H - PAD.bottom + 14}
	fill="var(--text-dim)"
	font-family="var(--font-mono)"
	font-size="8"
	text-anchor="middle"
>
	0
</text>

<!-- Axis titles -->
<text
	x={(PAD.left + W - PAD.right) / 2}
	y={H - 6}
	fill="var(--text-dim)"
	font-family="var(--font-body)"
	font-size="9"
	font-weight="600"
	text-anchor="middle"
>
	{xLabel}
</text>
<text
	x="14"
	y={(PAD.top + H - PAD.bottom) / 2}
	fill="var(--text-dim)"
	font-family="var(--font-body)"
	font-size="9"
	font-weight="600"
	text-anchor="middle"
	transform="rotate(-90, 14, {(PAD.top + H - PAD.bottom) / 2})"
>
	{yLabel}
</text>
