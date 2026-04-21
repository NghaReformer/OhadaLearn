<script lang="ts">
	import { t } from '$lib/i18n';
	import type { ChartView, OverlayToggles } from '../types';

	let {
		view,
		overlays,
		onChangeView,
		onToggleOverlay,
	}: {
		view: ChartView;
		overlays: OverlayToggles;
		onChangeView: (v: ChartView) => void;
		onToggleOverlay: (key: keyof OverlayToggles) => void;
	} = $props();

	let translate = $derived($t);

	const views: Array<{ key: ChartView; labelKey: string }> = [
		{ key: 'classic', labelKey: 'cvp.chart.classic' },
		{ key: 'pv', labelKey: 'cvp.chart.pv' },
		{ key: 'stack', labelKey: 'cvp.chart.stack' },
	];

	const overlayDefs: Array<{ key: keyof OverlayToggles; labelKey: string; color: string }> = [
		{ key: 'bep', labelKey: 'cvp.overlay.bep', color: 'var(--accent)' },
		{ key: 'target', labelKey: 'cvp.overlay.target', color: 'var(--amber)' },
		{ key: 'mos', labelKey: 'cvp.overlay.mos', color: 'var(--accent-soft)' },
		{ key: 'dol', labelKey: 'cvp.overlay.dol', color: 'var(--accent-soft)' },
	];
</script>

<div class="toolbar">
	<div class="group views" role="tablist" aria-label="Chart views">
		{#each views as v (v.key)}
			<button
				type="button"
				class="view-btn"
				class:active={view === v.key}
				role="tab"
				aria-selected={view === v.key}
				onclick={() => onChangeView(v.key)}
			>
				{translate(v.labelKey)}
			</button>
		{/each}
	</div>

	<div class="divider" aria-hidden="true"></div>

	<div class="group overlays">
		{#each overlayDefs as ov (ov.key)}
			{@const on = overlays[ov.key]}
			<button
				type="button"
				class="overlay-btn"
				class:on
				onclick={() => onToggleOverlay(ov.key)}
				aria-pressed={on}
				style:--overlay-color={ov.color}
			>
				<span class="dot" aria-hidden="true"></span>
				{translate(ov.labelKey)}
			</button>
		{/each}
	</div>
</div>

<style>
	.toolbar {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 0.75rem;
		background: var(--panel);
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-md);
	}

	.group {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		flex-wrap: wrap;
	}

	.divider {
		width: 1px;
		height: 18px;
		background: var(--border-subtle);
		margin: 0 0.25rem;
	}

	.view-btn,
	.overlay-btn {
		padding: 0.3125rem 0.625rem;
		background: transparent;
		border: 1px solid transparent;
		border-radius: var(--radius-sm);
		font-family: var(--font-mono);
		font-size: 0.6875rem;
		font-weight: 600;
		color: var(--text-muted);
		cursor: pointer;
		letter-spacing: 0.03em;
		transition:
			color var(--transition-fast),
			background var(--transition-fast),
			border-color var(--transition-fast);
	}

	.view-btn:hover,
	.overlay-btn:hover {
		color: var(--text-primary);
		background: var(--panel-hover, rgba(255, 255, 255, 0.03));
	}

	.view-btn.active {
		color: var(--accent);
		background: color-mix(in srgb, var(--accent) 14%, transparent);
		border-color: color-mix(in srgb, var(--accent) 25%, transparent);
	}

	.overlay-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
	}

	.dot {
		width: 7px;
		height: 7px;
		border-radius: 50%;
		background: var(--overlay-color, var(--text-muted));
		opacity: 0.4;
		transition: opacity var(--transition-fast);
	}

	.overlay-btn.on {
		color: var(--overlay-color, var(--accent));
		background: color-mix(in srgb, var(--overlay-color, var(--accent)) 10%, transparent);
	}

	.overlay-btn.on .dot {
		opacity: 1;
		box-shadow: 0 0 6px var(--overlay-color, var(--accent));
	}
</style>
