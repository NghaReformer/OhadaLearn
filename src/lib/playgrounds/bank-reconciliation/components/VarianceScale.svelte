<script lang="ts">
	import { tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
	import { currency$ } from '$lib/stores/preferences';
	import { fmtCurrency } from '$lib/format';

	let {
		adjustedBank,
		adjustedBooks,
		variance,
		isReconciled,
		bankItemCount,
		booksItemCount,
		bankLabel,
		booksLabel,
		reconciledLabel,
		unbalancedLabel,
		varianceLabel,
	}: {
		adjustedBank: number;
		adjustedBooks: number;
		variance: number;
		isReconciled: boolean;
		bankItemCount: number;
		booksItemCount: number;
		bankLabel: string;
		booksLabel: string;
		reconciledLabel: string;
		unbalancedLabel: string;
		varianceLabel: string;
	} = $props();

	const MAX_TILT_DEG = 12;
	const PIVOT_X = 300;
	const PIVOT_Y = 120;
	const HALF_BEAM = 200;
	const CHAIN_LENGTH = 70;

	let currency = $derived($currency$);

	let tiltTarget = $derived.by(() => {
		const maxBalance = Math.max(Math.abs(adjustedBank), Math.abs(adjustedBooks), 1);
		const clamped = Math.max(-1, Math.min(1, variance / maxBalance));
		// In SVG, +deg rotates clockwise → left side rises. Bank is on the left.
		// When bank > books (variance > 0), bank pan should dip → left side DOWN
		// → we need NEGATIVE rotation.
		return -clamped * MAX_TILT_DEG;
	});

	const tiltTween = tweened(0, { duration: 600, easing: cubicOut });
	const bankTween = tweened(0, { duration: 700, easing: cubicOut });
	const booksTween = tweened(0, { duration: 700, easing: cubicOut });

	$effect(() => {
		tiltTween.set(tiltTarget);
	});
	$effect(() => {
		bankTween.set(adjustedBank);
	});
	$effect(() => {
		booksTween.set(adjustedBooks);
	});

	let leftEnd = $derived.by(() => {
		const rad = ($tiltTween * Math.PI) / 180;
		return {
			x: PIVOT_X - HALF_BEAM * Math.cos(rad),
			y: PIVOT_Y - HALF_BEAM * Math.sin(rad),
		};
	});

	let rightEnd = $derived.by(() => {
		const rad = ($tiltTween * Math.PI) / 180;
		return {
			x: PIVOT_X + HALF_BEAM * Math.cos(rad),
			y: PIVOT_Y + HALF_BEAM * Math.sin(rad),
		};
	});

	let bankPan = $derived({ x: leftEnd.x, y: leftEnd.y + CHAIN_LENGTH });
	let booksPan = $derived({ x: rightEnd.x, y: rightEnd.y + CHAIN_LENGTH });

	let severity = $derived.by((): 'reconciled' | 'minor' | 'major' | 'critical' => {
		if (isReconciled) return 'reconciled';
		const maxBalance = Math.max(Math.abs(adjustedBank), Math.abs(adjustedBooks), 1);
		const pct = Math.abs(variance) / maxBalance;
		if (pct < 0.05) return 'minor';
		if (pct < 0.25) return 'major';
		return 'critical';
	});

	let bankCoinCount = $derived(Math.min(bankItemCount, 8));
	let booksCoinCount = $derived(Math.min(booksItemCount, 8));

	function fmt(value: number): string {
		return fmtCurrency(Math.round(value), currency);
	}
</script>

<div class="scale-card" data-severity={severity}>
	<div class="scale-header">
		<span class="status-pill" data-severity={severity}>
			{#if isReconciled}
				<svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
					<path d="M3 8.5l3.5 3.5L13 5" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" />
				</svg>
				{reconciledLabel}
			{:else}
				<svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
					<path d="M8 3v6M8 12v.5" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" />
					<circle cx="8" cy="8" r="6.4" stroke="currentColor" stroke-width="1.4" fill="none" />
				</svg>
				{unbalancedLabel}
			{/if}
		</span>
	</div>

	<svg class="scale-svg" viewBox="0 0 600 340" role="img" aria-label="{bankLabel}: {fmt(adjustedBank)}, {booksLabel}: {fmt(adjustedBooks)}">
		<defs>
			<linearGradient id="brBeam" x1="0" y1="0" x2="1" y2="0">
				<stop offset="0%" stop-color="var(--accent-glow, rgba(110, 168, 254, 0.6))" />
				<stop offset="50%" stop-color="var(--accent, #6ea8fe)" />
				<stop offset="100%" stop-color="var(--accent-glow, rgba(110, 168, 254, 0.6))" />
			</linearGradient>
			<radialGradient id="brPivot" cx="50%" cy="50%" r="50%">
				<stop offset="0%" stop-color="var(--accent, #6ea8fe)" />
				<stop offset="100%" stop-color="var(--text-muted, #6b7280)" />
			</radialGradient>
			<filter id="brGlow" x="-30%" y="-30%" width="160%" height="160%">
				<feGaussianBlur stdDeviation="3" result="blur" />
				<feMerge>
					<feMergeNode in="blur" />
					<feMergeNode in="SourceGraphic" />
				</feMerge>
			</filter>
		</defs>

		<!-- Pedestal -->
		<rect class="pedestal" x="240" y="300" width="120" height="20" rx="6" />
		<rect class="pedestal-shadow" x="245" y="318" width="110" height="6" rx="3" opacity="0.25" />

		<!-- Post -->
		<rect class="post" x="294" y="120" width="12" height="180" rx="3" />

		<!-- Beam (rotates around pivot) -->
		<g style="transform: rotate({$tiltTween}deg); transform-origin: 300px 120px; transform-box: fill-box;" class="beam-group" data-severity={severity}>
			<rect class="beam" x="92" y="113" width="416" height="14" rx="7" fill="url(#brBeam)" />
			<circle class="beam-end" cx="100" cy="120" r="7" />
			<circle class="beam-end" cx="500" cy="120" r="7" />
		</g>

		<!-- Pivot (drawn after beam so it sits on top) -->
		<circle class="pivot" cx="300" cy="120" r="11" fill="url(#brPivot)" filter="url(#brGlow)" />
		<circle class="pivot-inner" cx="300" cy="120" r="4" />

		<!-- Chains -->
		<line class="chain" x1={leftEnd.x} y1={leftEnd.y} x2={bankPan.x} y2={bankPan.y - 6} />
		<line class="chain" x1={rightEnd.x} y1={rightEnd.y} x2={booksPan.x} y2={booksPan.y - 6} />

		<!-- Bank pan -->
		<g class="pan bank-pan" transform="translate({bankPan.x}, {bankPan.y})">
			<path class="pan-bowl" d="M -85 0 Q 0 38 85 0 Z" />
			<ellipse class="pan-rim" cx="0" cy="0" rx="85" ry="9" />
			<!-- Coin stack -->
			{#each Array(bankCoinCount) as _, i (i)}
				<ellipse
					class="coin"
					cx={(i - bankCoinCount / 2 + 0.5) * 14}
					cy={-3}
					rx="8"
					ry="3"
					data-i={i}
				/>
			{/each}
			<!-- Labels -->
			<text class="pan-label" x="0" y="-26">{bankLabel}</text>
			<text class="pan-balance" x="0" y="60">{fmt($bankTween)}</text>
			<text class="pan-count" x="0" y="78">{bankItemCount} items</text>
		</g>

		<!-- Books pan -->
		<g class="pan books-pan" transform="translate({booksPan.x}, {booksPan.y})">
			<path class="pan-bowl" d="M -85 0 Q 0 38 85 0 Z" />
			<ellipse class="pan-rim" cx="0" cy="0" rx="85" ry="9" />
			{#each Array(booksCoinCount) as _, i (i)}
				<ellipse
					class="coin"
					cx={(i - booksCoinCount / 2 + 0.5) * 14}
					cy={-3}
					rx="8"
					ry="3"
					data-i={i}
				/>
			{/each}
			<text class="pan-label" x="0" y="-26">{booksLabel}</text>
			<text class="pan-balance" x="0" y="60">{fmt($booksTween)}</text>
			<text class="pan-count" x="0" y="78">{booksItemCount} items</text>
		</g>
	</svg>

	<div class="variance-strip" data-severity={severity}>
		<span class="variance-label">{varianceLabel}</span>
		<span class="variance-value">{fmt(Math.abs(variance))}</span>
		{#if !isReconciled}
			<span class="variance-arrow">{variance > 0 ? '←' : '→'}</span>
		{/if}
	</div>
</div>

<style>
	.scale-card {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		padding: 1rem 1rem 1.25rem;
		background: var(--panel);
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-sm);
		transition: border-color 0.4s ease;
	}
	.scale-card[data-severity='reconciled'] {
		border-color: var(--green, #22c55e);
		box-shadow: 0 0 0 1px var(--green, #22c55e), 0 0 18px -8px var(--green, #22c55e);
	}
	.scale-card[data-severity='critical'] {
		border-color: var(--error, #ef4444);
	}
	.scale-card[data-severity='major'] {
		border-color: var(--orange, #f59e0b);
	}

	.scale-header {
		display: flex;
		justify-content: center;
		margin-bottom: 0.25rem;
	}

	.status-pill {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.4rem 0.85rem;
		border-radius: 999px;
		font-family: var(--font-body);
		font-size: 0.8125rem;
		font-weight: 600;
		letter-spacing: 0.02em;
		transition: background 0.4s ease, color 0.4s ease;
	}
	.status-pill[data-severity='reconciled'] {
		background: color-mix(in srgb, var(--green, #22c55e) 18%, transparent);
		color: var(--green, #22c55e);
	}
	.status-pill[data-severity='minor'] {
		background: var(--bg-subtle);
		color: var(--text-secondary);
	}
	.status-pill[data-severity='major'] {
		background: color-mix(in srgb, var(--orange, #f59e0b) 18%, transparent);
		color: var(--orange, #f59e0b);
	}
	.status-pill[data-severity='critical'] {
		background: color-mix(in srgb, var(--error, #ef4444) 22%, transparent);
		color: var(--error, #ef4444);
	}

	.scale-svg {
		width: 100%;
		height: auto;
		max-height: 320px;
	}

	.pedestal,
	.pedestal-shadow {
		fill: var(--text-muted, #6b7280);
		opacity: 0.6;
	}
	.post {
		fill: var(--text-muted, #6b7280);
		opacity: 0.55;
	}
	.beam-group {
		transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
	}
	.beam {
		filter: drop-shadow(0 1px 0 rgba(0, 0, 0, 0.2));
	}
	.beam-end {
		fill: var(--accent, #6ea8fe);
	}
	.pivot-inner {
		fill: var(--bg, #0d1117);
	}

	.chain {
		stroke: var(--text-muted, #6b7280);
		stroke-width: 1.5;
		stroke-dasharray: 3 3;
		opacity: 0.7;
		transition: opacity 0.4s ease;
	}

	.pan-bowl {
		fill: var(--bg-subtle, rgba(255, 255, 255, 0.04));
		stroke: var(--accent, #6ea8fe);
		stroke-width: 1.5;
		opacity: 0.85;
	}
	.pan-rim {
		fill: var(--accent, #6ea8fe);
		opacity: 0.9;
	}

	.beam-group[data-severity='reconciled'] ~ g .pan-bowl,
	[data-severity='reconciled'] .pan-bowl {
		stroke: var(--green, #22c55e);
	}
	[data-severity='reconciled'] .pan-rim,
	[data-severity='reconciled'] .beam-end {
		fill: var(--green, #22c55e);
	}
	[data-severity='critical'] .pan-bowl {
		stroke: var(--error, #ef4444);
	}
	[data-severity='critical'] .pan-rim,
	[data-severity='critical'] .beam-end {
		fill: var(--error, #ef4444);
	}
	[data-severity='major'] .pan-bowl {
		stroke: var(--orange, #f59e0b);
	}
	[data-severity='major'] .pan-rim,
	[data-severity='major'] .beam-end {
		fill: var(--orange, #f59e0b);
	}

	.coin {
		fill: var(--accent, #6ea8fe);
		opacity: 0.9;
		animation: coin-drop 0.55s cubic-bezier(0.22, 1, 0.36, 1) backwards;
	}
	.coin[data-i='0'] { animation-delay: 0ms; }
	.coin[data-i='1'] { animation-delay: 60ms; }
	.coin[data-i='2'] { animation-delay: 120ms; }
	.coin[data-i='3'] { animation-delay: 180ms; }
	.coin[data-i='4'] { animation-delay: 240ms; }
	.coin[data-i='5'] { animation-delay: 300ms; }
	.coin[data-i='6'] { animation-delay: 360ms; }
	.coin[data-i='7'] { animation-delay: 420ms; }

	@keyframes coin-drop {
		0% {
			opacity: 0;
			transform: translateY(-30px);
		}
		100% {
			opacity: 0.9;
			transform: translateY(0);
		}
	}

	[data-severity='reconciled'] .coin {
		fill: var(--green, #22c55e);
	}
	[data-severity='critical'] .coin {
		fill: var(--error, #ef4444);
	}
	[data-severity='major'] .coin {
		fill: var(--orange, #f59e0b);
	}

	.pan-label {
		font-family: var(--font-mono, monospace);
		font-size: 11px;
		font-weight: 500;
		text-anchor: middle;
		fill: var(--text-muted, #6b7280);
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}
	.pan-balance {
		font-family: var(--font-display, system-ui);
		font-size: 17px;
		font-weight: 700;
		text-anchor: middle;
		fill: var(--text-primary, #e6edf3);
		letter-spacing: -0.015em;
	}
	.pan-count {
		font-family: var(--font-mono, monospace);
		font-size: 10px;
		text-anchor: middle;
		fill: var(--text-muted, #6b7280);
	}

	.variance-strip {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.6rem;
		padding: 0.55rem 0.85rem;
		border-radius: var(--radius-sm);
		background: var(--bg-subtle);
		font-family: var(--font-mono, monospace);
		font-size: 0.875rem;
		transition: background 0.4s ease;
	}
	.variance-strip[data-severity='reconciled'] {
		background: color-mix(in srgb, var(--green, #22c55e) 12%, transparent);
	}
	.variance-strip[data-severity='critical'] {
		background: color-mix(in srgb, var(--error, #ef4444) 14%, transparent);
	}
	.variance-strip[data-severity='major'] {
		background: color-mix(in srgb, var(--orange, #f59e0b) 14%, transparent);
	}
	.variance-label {
		color: var(--text-muted, #6b7280);
		font-size: 0.6875rem;
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}
	.variance-value {
		color: var(--text-primary, #e6edf3);
		font-weight: 700;
		font-size: 1rem;
	}
	.variance-arrow {
		color: var(--text-secondary, #9ba3af);
		font-size: 1.1rem;
	}

	@media (max-width: 600px) {
		.scale-card {
			padding: 0.75rem 0.5rem 1rem;
		}
		.pan-balance {
			font-size: 15px;
		}
		.pan-label {
			font-size: 10px;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.beam-group,
		.status-pill,
		.scale-card,
		.variance-strip {
			transition: none;
		}
		.coin {
			animation: none;
		}
	}
</style>
