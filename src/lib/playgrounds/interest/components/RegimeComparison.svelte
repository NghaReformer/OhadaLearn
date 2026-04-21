<script lang="ts">
	import { t } from '$lib/i18n';
	import { currency$ } from '$lib/stores/preferences';
	import { fmtCurrency, fmtPct, CURRENCIES } from '$lib/format';
	import { InterestEngine } from '../engine';
	import type { InterestInputs } from '../types';
	import type { CompoundingFrequency } from '$lib/playgrounds/tvm/types';

	let { inputs }: { inputs: InterestInputs } = $props();

	let translate = $derived($t);
	let currencyCode = $derived($currency$);
	let currencySymbol = $derived(CURRENCIES[currencyCode]?.symbol ?? '$');

	const engine = new InterestEngine();

	interface Regime {
		key: string;
		labelKey: string;
		frequency: CompoundingFrequency | 'simple';
		stroke: string;
		dash?: string;
	}

	const regimes: Regime[] = [
		{ key: 'simple', labelKey: 'int.compare.simple', frequency: 'simple', stroke: 'var(--amber)', dash: '5,3' },
		{ key: 'annual', labelKey: 'int.compare.annual', frequency: 'annual', stroke: 'var(--accent-soft)' },
		{ key: 'semi', labelKey: 'int.compare.semi', frequency: 'semi', stroke: 'var(--accent)' },
		{ key: 'quarterly', labelKey: 'int.compare.quarterly', frequency: 'quarterly', stroke: 'var(--green-deep)' },
		{ key: 'monthly', labelKey: 'int.compare.monthly', frequency: 'monthly', stroke: 'var(--green)' },
		{ key: 'daily', labelKey: 'int.compare.daily', frequency: 'daily', stroke: 'var(--amber)' },
		{ key: 'continuous', labelKey: 'int.compare.continuous', frequency: 'continuous', stroke: 'var(--error)', dash: '3,3' },
	];

	// Compute all regimes from the same base inputs. Each entry carries the
	// final outcome plus the period-by-period balance series for chart overlay.
	let rows = $derived.by(() => {
		return regimes.map((r) => {
			if (r.frequency === 'simple') {
				const res = engine.simple(inputs);
				const series: Array<{ x: number; y: number }> = [
					{ x: 0, y: inputs.principal },
					...res.perPeriod.map((p, i) => ({
						x: (i + 1) / res.perPeriod.length,
						y: p.cumulativeTotal,
					})),
				];
				return {
					regime: r,
					final: res.total,
					interest: res.interest,
					ear: inputs.nominalRate, // Simple: effective ≡ nominal
					series,
				};
			}
			const res = engine.compound({ ...inputs, frequency: r.frequency });
			const series: Array<{ x: number; y: number }> = [
				{ x: 0, y: inputs.principal },
				...res.perPeriod.map((p, i) => ({
					x: (i + 1) / res.perPeriod.length,
					y: p.balanceEnd,
				})),
			];
			return {
				regime: r,
				final: res.futureValue,
				interest: res.interest,
				ear: res.effectiveAnnualRate,
				series,
			};
		});
	});

	let best = $derived(rows.reduce((best, row) => (row.final > best.final ? row : best)));
	let baseSimple = $derived(rows[0].final);

	function money(v: number): string {
		return fmtCurrency(v, currencyCode);
	}

	// Chart geometry — overlay all regimes
	const W = 620;
	const H = 260;
	const PAD = { left: 64, right: 120, top: 24, bottom: 32 };

	let maxY = $derived(Math.max(...rows.map((r) => r.final)) * 1.05);
	let minY = $derived(inputs.principal * 0.98);

	function xScale(t: number): number {
		return PAD.left + (W - PAD.left - PAD.right) * t;
	}
	function yScale(v: number): number {
		return (
			H - PAD.bottom - ((H - PAD.top - PAD.bottom) * (v - minY)) / Math.max(1, maxY - minY)
		);
	}

	let yTicks = $derived.by(() => {
		const count = 4;
		return Array.from({ length: count + 1 }, (_, i) => {
			const v = minY + ((maxY - minY) * i) / count;
			return { value: v, y: yScale(v) };
		});
	});

	function formatTick(v: number): string {
		if (v >= 1_000_000) return (v / 1_000_000).toFixed(v >= 10_000_000 ? 0 : 1) + 'M';
		if (v >= 1_000) return (v / 1_000).toFixed(v >= 10_000 ? 0 : 1) + 'K';
		return v.toFixed(0);
	}
</script>

<section class="compare">
	<header class="cmp-head">
		<h4 class="cmp-title">{translate('int.compare.title')}</h4>
		<span class="cmp-sub">{translate('int.compare.sub')}</span>
	</header>

	<!-- Overlay chart — all regimes on one canvas -->
	<div class="chart-wrap">
		<svg viewBox="0 0 {W} {H}" preserveAspectRatio="xMidYMid meet" class="chart" role="img">
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
					opacity="0.45"
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

			{#each rows as row (row.regime.key)}
				{@const pts = row.series.map((p) => `${xScale(p.x)},${yScale(p.y)}`).join(' ')}
				<polyline
					points={pts}
					fill="none"
					stroke={row.regime.stroke}
					stroke-width="1.75"
					stroke-linecap="round"
					stroke-dasharray={row.regime.dash ?? ''}
					opacity="0.9"
				/>
			{/each}

			<!-- Legend on the right -->
			{#each rows as row, i (row.regime.key)}
				<g transform="translate({W - PAD.right + 8}, {PAD.top + i * 16 + 4})">
					<line
						x1="0"
						y1="0"
						x2="14"
						y2="0"
						stroke={row.regime.stroke}
						stroke-width="2"
						stroke-dasharray={row.regime.dash ?? ''}
					/>
					<text
						x="18"
						y="3"
						fill="var(--text-secondary)"
						font-family="var(--font-mono)"
						font-size="9"
					>
						{translate(row.regime.labelKey)}
					</text>
				</g>
			{/each}

			<text
				x={PAD.left}
				y={PAD.top - 8}
				fill="var(--text-secondary)"
				font-family="var(--font-body)"
				font-size="9"
				font-weight="600"
			>
				{translate('int.compare.chartAxis')} ({currencySymbol})
			</text>
		</svg>
	</div>

	<div class="table-scroll">
		<table class="cmp-table">
			<thead>
				<tr>
					<th>{translate('int.compare.regime')}</th>
					<th class="num">{translate('int.compare.frequency')}</th>
					<th class="num">{translate('int.compare.final')}</th>
					<th class="num">{translate('int.compare.interest')}</th>
					<th class="num">{translate('int.compare.ear')}</th>
					<th class="num">{translate('int.compare.gainOverSimple')}</th>
				</tr>
			</thead>
			<tbody>
				{#each rows as row, i (row.regime.key)}
					{@const gain = row.final - baseSimple}
					<tr class:highlight={row === best}>
						<td class="regime">
							<span class="dot" style:background={row.regime.stroke}></span>
							{translate(row.regime.labelKey)}
							{#if row === best}
								<span class="best-badge">{translate('int.compare.best')}</span>
							{/if}
						</td>
						<td class="num muted">{translate(`int.freq.${row.regime.frequency === 'simple' ? 'annual' : row.regime.frequency}`)}</td>
						<td class="num strong">{money(row.final)}</td>
						<td class="num accent">{money(row.interest)}</td>
						<td class="num">{fmtPct(row.ear * 100, 4)}</td>
						<td class="num" class:pos={gain > 0} class:muted={i === 0}>
							{i === 0 ? '—' : (gain > 0 ? '+' : '') + money(gain)}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</section>

<style>
	.compare {
		display: flex;
		flex-direction: column;
		gap: 0.875rem;
		padding: 1rem;
		background: var(--panel);
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-md);
	}

	.cmp-head {
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
	}

	.cmp-title {
		margin: 0;
		font-family: var(--font-display);
		font-size: 0.8125rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--text-primary);
	}

	.cmp-sub {
		font-size: 0.6875rem;
		color: var(--text-muted);
	}

	.chart-wrap {
		display: block;
	}

	.chart {
		width: 100%;
		height: auto;
	}

	.table-scroll {
		overflow-x: auto;
	}

	.cmp-table {
		width: 100%;
		border-collapse: collapse;
		font-family: var(--font-mono);
		font-size: 0.75rem;
		font-variant-numeric: tabular-nums;
	}

	.cmp-table th,
	.cmp-table td {
		padding: 0.4375rem 0.5rem;
		border-bottom: 1px solid var(--border-subtle);
		text-align: left;
	}

	.cmp-table thead th {
		font-family: var(--font-body);
		font-size: 0.625rem;
		font-weight: 700;
		color: var(--text-muted);
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}

	tr.highlight td {
		background: color-mix(in srgb, var(--accent) 8%, transparent);
	}

	.regime {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		color: var(--text-primary);
	}

	.dot {
		display: inline-block;
		width: 10px;
		height: 10px;
		border-radius: 50%;
	}

	.best-badge {
		font-family: var(--font-body);
		font-size: 0.625rem;
		font-weight: 700;
		color: var(--accent);
		background: color-mix(in srgb, var(--accent) 15%, transparent);
		padding: 0.0625rem 0.375rem;
		border-radius: var(--radius-sm);
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}

	.num {
		text-align: right;
		white-space: nowrap;
	}

	.num.muted {
		color: var(--text-muted);
	}

	.num.accent {
		color: var(--accent);
		font-weight: 600;
	}

	.num.strong {
		color: var(--text-primary);
		font-weight: 700;
	}

	.num.pos {
		color: var(--green);
	}
</style>
