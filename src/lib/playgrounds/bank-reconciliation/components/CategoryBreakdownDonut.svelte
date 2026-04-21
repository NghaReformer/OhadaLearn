<script lang="ts">
	import { tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
	import type { ItemCategory, BankReconciliationKpis } from '../types';

	let {
		kpis,
		categoryLabels,
		emptyLabel,
		titleLabel,
	}: {
		kpis: BankReconciliationKpis;
		categoryLabels: Record<ItemCategory, string>;
		emptyLabel: string;
		titleLabel: string;
	} = $props();

	const CATEGORY_ORDER: ItemCategory[] = [
		'outstanding-check',
		'deposit-in-transit',
		'bank-charge',
		'interest-earned',
		'nsf-check',
		'direct-debit',
		'standing-order',
		'bank-error',
		'company-error',
	];

	const CATEGORY_COLORS: Record<ItemCategory, string> = {
		'outstanding-check': '#6ea8fe',
		'deposit-in-transit': '#22c55e',
		'bank-charge': '#f59e0b',
		'interest-earned': '#10b981',
		'nsf-check': '#ef4444',
		'direct-debit': '#a855f7',
		'standing-order': '#06b6d4',
		'bank-error': '#ec4899',
		'company-error': '#fb923c',
	};

	const RADIUS = 56;
	const STROKE = 18;
	const CIRC = 2 * Math.PI * RADIUS;

	let segments = $derived.by(() => {
		const total = CATEGORY_ORDER.reduce((sum, c) => sum + kpis.itemsByCategory[c], 0);
		if (total === 0) return [];
		let offset = 0;
		const out: Array<{ cat: ItemCategory; count: number; pct: number; offset: number; color: string }> = [];
		for (const cat of CATEGORY_ORDER) {
			const count = kpis.itemsByCategory[cat];
			if (count === 0) continue;
			const pct = count / total;
			out.push({ cat, count, pct, offset, color: CATEGORY_COLORS[cat] });
			offset += pct;
		}
		return out;
	});

	let totalCount = $derived(
		CATEGORY_ORDER.reduce((sum, c) => sum + kpis.itemsByCategory[c], 0),
	);

	const totalTween = tweened(0, { duration: 500, easing: cubicOut });
	$effect(() => { totalTween.set(totalCount); });

	let hoveredCat = $state<ItemCategory | null>(null);
</script>

<div class="donut-card">
	<div class="donut-header">
		<span class="donut-title">{titleLabel}</span>
	</div>

	<div class="donut-body">
		<svg viewBox="0 0 160 160" class="donut-svg" role="img" aria-label={titleLabel}>
			<circle
				class="donut-track"
				cx="80"
				cy="80"
				r={RADIUS}
				fill="none"
				stroke-width={STROKE}
			/>
			{#each segments as seg (seg.cat)}
				<circle
					class="donut-seg"
					class:hovered={hoveredCat === seg.cat}
					cx="80"
					cy="80"
					r={RADIUS}
					fill="none"
					stroke={seg.color}
					stroke-width={STROKE}
					stroke-dasharray="{seg.pct * CIRC} {CIRC}"
					stroke-dashoffset={-seg.offset * CIRC}
					transform="rotate(-90, 80, 80)"
					onmouseenter={() => (hoveredCat = seg.cat)}
					onmouseleave={() => (hoveredCat = null)}
					role="presentation"
				/>
			{/each}
			<text class="donut-center-num" x="80" y="78">{Math.round($totalTween)}</text>
			<text class="donut-center-label" x="80" y="96">items</text>
		</svg>

		<ul class="legend">
			{#if segments.length === 0}
				<li class="legend-empty">{emptyLabel}</li>
			{/if}
			{#each segments as seg (seg.cat)}
				<li
					class="legend-row"
					class:hovered={hoveredCat === seg.cat}
					onmouseenter={() => (hoveredCat = seg.cat)}
					onmouseleave={() => (hoveredCat = null)}
					role="presentation"
				>
					<span class="legend-swatch" style="background: {seg.color}"></span>
					<span class="legend-label">{categoryLabels[seg.cat]}</span>
					<span class="legend-count">{seg.count}</span>
				</li>
			{/each}
		</ul>
	</div>
</div>

<style>
	.donut-card {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		padding: 0.75rem 1rem;
		background: var(--panel);
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-sm);
	}
	.donut-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	.donut-title {
		font-family: var(--font-mono, monospace);
		font-size: 0.6875rem;
		font-weight: 600;
		color: var(--text-muted);
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}
	.donut-body {
		display: grid;
		grid-template-columns: 160px 1fr;
		gap: 0.75rem;
		align-items: center;
	}
	.donut-svg {
		width: 100%;
		max-width: 160px;
		height: auto;
	}
	.donut-track {
		stroke: var(--bg-subtle, rgba(255, 255, 255, 0.04));
	}
	.donut-seg {
		transition: stroke-dasharray 0.6s cubic-bezier(0.22, 1, 0.36, 1),
			stroke-dashoffset 0.6s cubic-bezier(0.22, 1, 0.36, 1),
			opacity 0.2s ease,
			stroke-width 0.2s ease;
		opacity: 0.85;
		cursor: pointer;
	}
	.donut-seg.hovered {
		opacity: 1;
		stroke-width: 22;
	}
	.donut-center-num {
		text-anchor: middle;
		font-family: var(--font-display, system-ui);
		font-size: 22px;
		font-weight: 700;
		fill: var(--text-primary);
	}
	.donut-center-label {
		text-anchor: middle;
		font-family: var(--font-mono, monospace);
		font-size: 9px;
		fill: var(--text-muted);
		text-transform: uppercase;
		letter-spacing: 0.1em;
	}
	.legend {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
		font-size: 0.75rem;
	}
	.legend-empty {
		color: var(--text-muted);
		font-style: italic;
		padding: 0.25rem 0;
	}
	.legend-row {
		display: grid;
		grid-template-columns: 10px 1fr auto;
		gap: 0.5rem;
		align-items: center;
		padding: 0.2rem 0.4rem;
		border-radius: var(--radius-sm);
		transition: background 0.15s ease;
		cursor: pointer;
	}
	.legend-row.hovered {
		background: var(--bg-subtle);
	}
	.legend-swatch {
		width: 10px;
		height: 10px;
		border-radius: 2px;
	}
	.legend-label {
		color: var(--text-secondary);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.legend-count {
		font-family: var(--font-mono, monospace);
		color: var(--text-primary);
		font-weight: 600;
	}

	@media (max-width: 540px) {
		.donut-body {
			grid-template-columns: 120px 1fr;
		}
	}
</style>
