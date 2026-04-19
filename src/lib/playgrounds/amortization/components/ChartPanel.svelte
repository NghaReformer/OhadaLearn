<script lang="ts">
	import { t } from '$lib/i18n';
	import { currency$ } from '$lib/stores/preferences';
	import { fmtCurrency } from '$lib/format';
	import type { AmortizationResult } from '../types';

	type ChartKind = 'stacked' | 'balance' | 'donut' | 'cumulative';

	let {
		result,
		selectedChart,
		overlays,
		onSelectChart,
		onToggleOverlay
	}: {
		result: AmortizationResult;
		selectedChart: ChartKind;
		overlays: Record<string, boolean>;
		onSelectChart: (kind: ChartKind) => void;
		onToggleOverlay: (key: string) => void;
	} = $props();

	const charts: Array<{ key: ChartKind; labelKey: string }> = [
		{ key: 'stacked', labelKey: 'am.chart.stacked' },
		{ key: 'balance', labelKey: 'am.chart.balance' },
		{ key: 'donut', labelKey: 'am.chart.donut' },
		{ key: 'cumulative', labelKey: 'am.chart.cumulative' }
	];

	const overlayKeys = ['interest', 'principal', 'insurance', 'extra'] as const;

	let currency = $derived($currency$);
	let translate = $derived($t);
	let rows = $derived(result.rows);
	let hasData = $derived(rows.length > 0);

	const WIDTH = 640;
	const HEIGHT = 280;
	const PAD_L = 52;
	const PAD_R = 16;
	const PAD_T = 16;
	const PAD_B = 32;
	const INNER_W = WIDTH - PAD_L - PAD_R;
	const INNER_H = HEIGHT - PAD_T - PAD_B;

	function money(v: number): string {
		if (!Number.isFinite(v)) return '—';
		return fmtCurrency(v, currency);
	}

	function compactMoney(v: number): string {
		const abs = Math.abs(v);
		if (abs >= 1e9) return (v / 1e9).toFixed(1) + 'B';
		if (abs >= 1e6) return (v / 1e6).toFixed(1) + 'M';
		if (abs >= 1e3) return (v / 1e3).toFixed(0) + 'k';
		return Math.round(v).toString();
	}

	function scaleX(i: number, n: number): number {
		if (n <= 1) return PAD_L + INNER_W / 2;
		return PAD_L + (i / (n - 1)) * INNER_W;
	}

	function scaleY(v: number, max: number): number {
		if (max <= 0) return PAD_T + INNER_H;
		return PAD_T + INNER_H - (v / max) * INNER_H;
	}

	// ─── Stacked payment chart ──────────────────────────────────────────
	let stackedMax = $derived.by(() => {
		if (!hasData) return 0;
		let m = 0;
		for (const r of rows) m = Math.max(m, r.totalPayment);
		return m * 1.05;
	});

	let stackedBars = $derived.by(() => {
		if (!hasData) return [];
		const barWidth = Math.max(1, INNER_W / rows.length - 1);
		return rows.map((row, i) => {
			const x = PAD_L + (i / rows.length) * INNER_W;
			const parts: Array<{ y: number; h: number; cls: string }> = [];
			let yCursor = PAD_T + INNER_H;
			const scale = stackedMax > 0 ? INNER_H / stackedMax : 0;
			if (overlays.interest !== false) {
				const h = row.interest * scale;
				yCursor -= h;
				parts.push({ y: yCursor, h, cls: 'bar-interest' });
			}
			if (overlays.principal !== false) {
				const h = row.principal * scale;
				yCursor -= h;
				parts.push({ y: yCursor, h, cls: 'bar-principal' });
			}
			if (overlays.insurance) {
				const h = row.insurance * scale;
				yCursor -= h;
				parts.push({ y: yCursor, h, cls: 'bar-insurance' });
			}
			if (overlays.extra) {
				const h = row.extra * scale;
				yCursor -= h;
				parts.push({ y: yCursor, h, cls: 'bar-extra' });
			}
			return { x, w: barWidth, parts, period: row.period };
		});
	});

	// ─── Balance line chart ─────────────────────────────────────────────
	let balanceMax = $derived(
		hasData ? Math.max(...rows.map((r) => r.openingBalance)) * 1.05 : 0
	);

	let balancePath = $derived.by(() => {
		if (!hasData) return '';
		const segs = rows.map((r, i) => {
			const x = scaleX(i, rows.length);
			const y = scaleY(r.openingBalance, balanceMax);
			return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
		});
		return segs.join(' ');
	});

	// ─── Donut ─────────────────────────────────────────────────────────
	let donutSlices = $derived.by(() => {
		const total =
			result.totals.interest + result.totals.principal + result.totals.insurance;
		if (total <= 0) return [];
		const data = [
			{ key: 'principal', value: result.totals.principal, cls: 'slice-principal' },
			{ key: 'interest', value: result.totals.interest, cls: 'slice-interest' },
			{ key: 'insurance', value: result.totals.insurance, cls: 'slice-insurance' }
		].filter((d) => d.value > 0);
		const cx = WIDTH / 2;
		const cy = HEIGHT / 2;
		const rOuter = 90;
		const rInner = 56;
		let angle = -Math.PI / 2;
		return data.map((d) => {
			const a = (d.value / total) * 2 * Math.PI;
			const start = angle;
			const end = angle + a;
			angle = end;
			const large = a > Math.PI ? 1 : 0;
			const sx0 = cx + rOuter * Math.cos(start);
			const sy0 = cy + rOuter * Math.sin(start);
			const sx1 = cx + rOuter * Math.cos(end);
			const sy1 = cy + rOuter * Math.sin(end);
			const ix1 = cx + rInner * Math.cos(end);
			const iy1 = cy + rInner * Math.sin(end);
			const ix0 = cx + rInner * Math.cos(start);
			const iy0 = cy + rInner * Math.sin(start);
			const path = [
				`M${sx0.toFixed(2)},${sy0.toFixed(2)}`,
				`A${rOuter},${rOuter} 0 ${large} 1 ${sx1.toFixed(2)},${sy1.toFixed(2)}`,
				`L${ix1.toFixed(2)},${iy1.toFixed(2)}`,
				`A${rInner},${rInner} 0 ${large} 0 ${ix0.toFixed(2)},${iy0.toFixed(2)}`,
				'Z'
			].join(' ');
			return { path, cls: d.cls, key: d.key, value: d.value, share: d.value / total };
		});
	});

	// ─── Cumulative ────────────────────────────────────────────────────
	let cumulative = $derived.by(() => {
		if (!hasData) return { paths: [], max: 0 };
		const cI: number[] = [];
		const cP: number[] = [];
		let sumI = 0;
		let sumP = 0;
		for (const r of rows) {
			sumI += r.interest;
			sumP += r.principal;
			cI.push(sumI);
			cP.push(sumP);
		}
		const max = Math.max(sumI, sumP) * 1.05 || 1;
		const pathI = cI
			.map((v, i) => `${i === 0 ? 'M' : 'L'}${scaleX(i, rows.length).toFixed(1)},${scaleY(v, max).toFixed(1)}`)
			.join(' ');
		const pathP = cP
			.map((v, i) => `${i === 0 ? 'M' : 'L'}${scaleX(i, rows.length).toFixed(1)},${scaleY(v, max).toFixed(1)}`)
			.join(' ');
		return {
			paths: [
				{ d: pathI, cls: 'line-interest' },
				{ d: pathP, cls: 'line-principal' }
			],
			max
		};
	});

	function yTicks(max: number): number[] {
		if (max <= 0) return [];
		const step = max / 4;
		return [0, step, step * 2, step * 3, max];
	}
</script>

<section class="ch-panel">
	<header class="ch-header">
		<h2 class="ch-title">{translate('am.chart.title')}</h2>
		<div class="ch-tabs" role="tablist">
			{#each charts as chart (chart.key)}
				<button
					type="button"
					class="ch-tab"
					class:active={selectedChart === chart.key}
					role="tab"
					aria-selected={selectedChart === chart.key}
					onclick={() => onSelectChart(chart.key)}
				>
					{translate(chart.labelKey)}
				</button>
			{/each}
		</div>
	</header>

	{#if selectedChart === 'stacked' || selectedChart === 'cumulative'}
		<div class="ch-overlays">
			{#each overlayKeys as key (key)}
				<label class="ch-overlay">
					<input
						type="checkbox"
						checked={overlays[key] ?? false}
						onchange={() => onToggleOverlay(key)}
					/>
					<span class={`ch-dot ch-dot-${key}`}></span>
					<span>{translate(`am.chart.overlay.${key}`)}</span>
				</label>
			{/each}
		</div>
	{/if}

	<div class="ch-canvas" role="figure" aria-label={translate(charts.find((c) => c.key === selectedChart)?.labelKey ?? '')}>
		{#if !hasData}
			<p class="ch-empty">{translate('am.chart.empty')}</p>
		{:else if selectedChart === 'stacked'}
			<svg class="ch-svg" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} preserveAspectRatio="xMidYMid meet">
				{#each yTicks(stackedMax) as v (v)}
					<line
						class="grid"
						x1={PAD_L}
						x2={PAD_L + INNER_W}
						y1={scaleY(v, stackedMax)}
						y2={scaleY(v, stackedMax)}
					/>
					<text class="axis-label" x={PAD_L - 6} y={scaleY(v, stackedMax) + 4} text-anchor="end">
						{compactMoney(v)}
					</text>
				{/each}
				{#each stackedBars as bar (bar.period)}
					{#each bar.parts as part, i (i)}
						<rect class={part.cls} x={bar.x} y={part.y} width={bar.w} height={part.h} />
					{/each}
				{/each}
				<line
					class="axis"
					x1={PAD_L}
					x2={PAD_L + INNER_W}
					y1={PAD_T + INNER_H}
					y2={PAD_T + INNER_H}
				/>
			</svg>
		{:else if selectedChart === 'balance'}
			<svg class="ch-svg" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} preserveAspectRatio="xMidYMid meet">
				{#each yTicks(balanceMax) as v (v)}
					<line
						class="grid"
						x1={PAD_L}
						x2={PAD_L + INNER_W}
						y1={scaleY(v, balanceMax)}
						y2={scaleY(v, balanceMax)}
					/>
					<text class="axis-label" x={PAD_L - 6} y={scaleY(v, balanceMax) + 4} text-anchor="end">
						{compactMoney(v)}
					</text>
				{/each}
				<path class="line-balance" d={balancePath} fill="none" />
				<line
					class="axis"
					x1={PAD_L}
					x2={PAD_L + INNER_W}
					y1={PAD_T + INNER_H}
					y2={PAD_T + INNER_H}
				/>
			</svg>
		{:else if selectedChart === 'donut'}
			<svg class="ch-svg" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} preserveAspectRatio="xMidYMid meet">
				{#each donutSlices as slice (slice.key)}
					<path class={slice.cls} d={slice.path} />
				{/each}
				<text class="donut-total-label" x={WIDTH / 2} y={HEIGHT / 2 - 6} text-anchor="middle">
					{translate('am.kpis.totalPaid')}
				</text>
				<text class="donut-total-value" x={WIDTH / 2} y={HEIGHT / 2 + 16} text-anchor="middle">
					{compactMoney(result.totals.paid)}
				</text>
			</svg>
			<ul class="donut-legend">
				{#each donutSlices as slice (slice.key)}
					<li class="legend-row">
						<span class={`ch-dot ch-dot-${slice.key}`}></span>
						<span class="legend-label">{translate(`am.chart.overlay.${slice.key}`)}</span>
						<span class="legend-value">{money(slice.value)}</span>
						<span class="legend-pct">{(slice.share * 100).toFixed(1)}%</span>
					</li>
				{/each}
			</ul>
		{:else if selectedChart === 'cumulative'}
			<svg class="ch-svg" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} preserveAspectRatio="xMidYMid meet">
				{#each yTicks(cumulative.max) as v (v)}
					<line
						class="grid"
						x1={PAD_L}
						x2={PAD_L + INNER_W}
						y1={scaleY(v, cumulative.max)}
						y2={scaleY(v, cumulative.max)}
					/>
					<text class="axis-label" x={PAD_L - 6} y={scaleY(v, cumulative.max) + 4} text-anchor="end">
						{compactMoney(v)}
					</text>
				{/each}
				{#each cumulative.paths as p (p.cls)}
					<path class={p.cls} d={p.d} fill="none" />
				{/each}
				<line
					class="axis"
					x1={PAD_L}
					x2={PAD_L + INNER_W}
					y1={PAD_T + INNER_H}
					y2={PAD_T + INNER_H}
				/>
			</svg>
		{/if}
	</div>
</section>

<style>
	.ch-panel {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		background: var(--panel);
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-md);
		padding: 1rem;
		min-height: 0;
	}

	.ch-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: 0.75rem;
	}

	.ch-title {
		font-family: var(--font-display);
		font-size: 0.9375rem;
		font-weight: 600;
		color: var(--text-primary);
		margin: 0;
		letter-spacing: -0.01em;
	}

	.ch-tabs {
		display: flex;
		gap: 2px;
		background: var(--bg);
		padding: 2px;
		border-radius: var(--radius-sm);
		border: 1px solid var(--border-subtle);
	}

	.ch-tab {
		font-family: var(--font-mono);
		font-size: 0.6875rem;
		font-weight: 500;
		color: var(--text-muted);
		background: transparent;
		border: none;
		padding: 0.375rem 0.625rem;
		border-radius: calc(var(--radius-sm) - 2px);
		cursor: pointer;
		transition:
			background var(--transition-fast),
			color var(--transition-fast);
	}

	.ch-tab:hover {
		color: var(--text-primary);
	}

	.ch-tab:focus-visible {
		outline: 2px solid var(--accent);
		outline-offset: 2px;
	}

	.ch-tab.active {
		background: var(--panel);
		color: var(--text-primary);
	}

	.ch-overlays {
		display: flex;
		gap: 0.875rem;
		flex-wrap: wrap;
	}

	.ch-overlay {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
		font-family: var(--font-mono);
		font-size: 0.6875rem;
		color: var(--text-secondary);
		cursor: pointer;
	}

	.ch-overlay input {
		width: 14px;
		height: 14px;
		accent-color: var(--accent);
	}

	.ch-dot {
		display: inline-block;
		width: 10px;
		height: 10px;
		border-radius: 2px;
	}

	.ch-dot-interest {
		background: var(--orange, #f59e0b);
	}

	.ch-dot-principal {
		background: var(--accent);
	}

	.ch-dot-insurance {
		background: var(--blue, #3b82f6);
	}

	.ch-dot-extra {
		background: var(--green, #22c55e);
	}

	.ch-canvas {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: stretch;
		gap: 0.75rem;
		min-height: 280px;
	}

	.ch-svg {
		width: 100%;
		height: auto;
		display: block;
	}

	.ch-empty {
		padding: 2rem;
		font-family: var(--font-mono);
		font-size: 0.8125rem;
		color: var(--text-muted);
		text-align: center;
		margin: 0;
	}

	:global(.grid) {
		stroke: var(--border-subtle);
		stroke-width: 1;
		stroke-dasharray: 2 3;
	}

	:global(.axis) {
		stroke: var(--border);
		stroke-width: 1;
	}

	:global(.axis-label) {
		font-family: var(--font-mono);
		font-size: 9px;
		fill: var(--text-muted);
	}

	:global(.bar-interest) {
		fill: var(--orange, #f59e0b);
	}

	:global(.bar-principal) {
		fill: var(--accent);
	}

	:global(.bar-insurance) {
		fill: var(--blue, #3b82f6);
	}

	:global(.bar-extra) {
		fill: var(--green, #22c55e);
	}

	:global(.line-balance) {
		stroke: var(--accent);
		stroke-width: 2;
		fill: none;
	}

	:global(.line-interest) {
		stroke: var(--orange, #f59e0b);
		stroke-width: 2;
	}

	:global(.line-principal) {
		stroke: var(--accent);
		stroke-width: 2;
	}

	:global(.slice-principal) {
		fill: var(--accent);
	}

	:global(.slice-interest) {
		fill: var(--orange, #f59e0b);
	}

	:global(.slice-insurance) {
		fill: var(--blue, #3b82f6);
	}

	:global(.donut-total-label) {
		font-family: var(--font-mono);
		font-size: 10px;
		fill: var(--text-muted);
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}

	:global(.donut-total-value) {
		font-family: var(--font-display);
		font-size: 18px;
		font-weight: 600;
		fill: var(--text-primary);
	}

	.donut-legend {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
	}

	.legend-row {
		display: grid;
		grid-template-columns: auto 1fr auto auto;
		align-items: center;
		gap: 0.625rem;
		font-family: var(--font-mono);
		font-size: 0.75rem;
		color: var(--text-primary);
	}

	.legend-label {
		color: var(--text-secondary);
	}

	.legend-value {
		font-variant-numeric: tabular-nums;
	}

	.legend-pct {
		color: var(--text-muted);
		font-size: 0.6875rem;
	}
</style>
