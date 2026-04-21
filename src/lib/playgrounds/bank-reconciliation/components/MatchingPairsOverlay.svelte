<script lang="ts">
	import type { MatchPair, MatchType } from '../types';

	let {
		matches,
		container,
		highlightId = null,
	}: {
		matches: MatchPair[];
		container: HTMLElement | null;
		highlightId?: string | null;
	} = $props();

	type Pair = {
		m: MatchPair;
		x1: number;
		y1: number;
		x2: number;
		y2: number;
	};

	let containerSize = $state<{ w: number; h: number; left: number; top: number }>({
		w: 0,
		h: 0,
		left: 0,
		top: 0,
	});
	let pairs = $state<Pair[]>([]);

	const COLOR: Record<MatchType, string> = {
		'exact-amount-ref': '#22c55e',
		'exact-amount-date': '#10b981',
		fuzzy: '#f59e0b',
		manual: '#6ea8fe',
	};

	function recompute(): void {
		if (!container) {
			pairs = [];
			return;
		}
		const rect = container.getBoundingClientRect();
		containerSize = { w: rect.width, h: rect.height, left: rect.left, top: rect.top };
		const next: Pair[] = [];
		for (const m of matches) {
			const bankEl = container.querySelector<HTMLElement>(`[data-bank-tx-id="${m.bankTxId}"]`);
			const ledgerEl = container.querySelector<HTMLElement>(`[data-ledger-entry-id="${m.ledgerEntryId}"]`);
			if (!bankEl || !ledgerEl) continue;
			const b = bankEl.getBoundingClientRect();
			const l = ledgerEl.getBoundingClientRect();
			next.push({
				m,
				x1: b.right - rect.left,
				y1: b.top + b.height / 2 - rect.top,
				x2: l.left - rect.left,
				y2: l.top + l.height / 2 - rect.top,
			});
		}
		pairs = next;
	}

	$effect(() => {
		// Re-derive whenever matches list or container reference changes
		matches;
		container;
		recompute();
		if (!container) return;
		const ro = new ResizeObserver(() => recompute());
		ro.observe(container);
		// Observe each row too — rows may resize when matched/unmatched class toggles
		container.querySelectorAll('[data-bank-tx-id], [data-ledger-entry-id]').forEach((el) => {
			ro.observe(el);
		});
		const onScroll = () => recompute();
		window.addEventListener('scroll', onScroll, true);
		window.addEventListener('resize', onScroll);
		return () => {
			ro.disconnect();
			window.removeEventListener('scroll', onScroll, true);
			window.removeEventListener('resize', onScroll);
		};
	});
</script>

{#if containerSize.w > 0 && pairs.length > 0}
	<svg
		class="overlay"
		style="width: {containerSize.w}px; height: {containerSize.h}px;"
		aria-hidden="true"
	>
		<defs>
			<filter id="brMatchGlow" x="-30%" y="-30%" width="160%" height="160%">
				<feGaussianBlur stdDeviation="2" />
			</filter>
		</defs>
		{#each pairs as pair, i (pair.m.bankTxId + '_' + pair.m.ledgerEntryId)}
			{@const midX = (pair.x1 + pair.x2) / 2}
			{@const isHi = highlightId === pair.m.bankTxId || highlightId === pair.m.ledgerEntryId}
			<path
				class="match-line"
				class:highlight={isHi}
				d="M {pair.x1} {pair.y1} C {midX} {pair.y1}, {midX} {pair.y2}, {pair.x2} {pair.y2}"
				stroke={COLOR[pair.m.matchType]}
				stroke-width={isHi ? 3 : 2}
				stroke-opacity={isHi ? 1 : 0.55}
				fill="none"
				stroke-linecap="round"
				style="animation-delay: {i * 60}ms"
			/>
			<circle cx={pair.x1} cy={pair.y1} r="3" fill={COLOR[pair.m.matchType]} />
			<circle cx={pair.x2} cy={pair.y2} r="3" fill={COLOR[pair.m.matchType]} />
		{/each}
	</svg>
{/if}

<style>
	.overlay {
		position: absolute;
		left: 0;
		top: 0;
		pointer-events: none;
		z-index: 5;
		overflow: visible;
	}
	.match-line {
		stroke-dasharray: 600;
		stroke-dashoffset: 600;
		animation: draw-in 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards;
		transition: stroke-width 0.2s ease, stroke-opacity 0.2s ease;
	}
	.match-line.highlight {
		filter: drop-shadow(0 0 4px currentColor);
	}
	@keyframes draw-in {
		to {
			stroke-dashoffset: 0;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.match-line {
			animation: none;
			stroke-dashoffset: 0;
		}
	}
</style>
