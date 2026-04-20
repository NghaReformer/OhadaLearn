<script lang="ts">
	import type { KpiItem } from './kpi-strip-types';

	let {
		items,
	}: {
		items: KpiItem[];
	} = $props();
</script>

<div class="kpi-strip">
	{#each items as item (item.label)}
		<div
			class="kpi"
			class:kpi-accent={item.variant === 'accent'}
			class:kpi-warn={item.variant === 'warn'}
		>
			<span class="kpi-label">{item.label}</span>
			<span class="kpi-value">{item.value}</span>
		</div>
	{/each}
</div>

<style>
	.kpi-strip {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(148px, 1fr));
		gap: 1px;
		background: var(--border-subtle);
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-md);
		overflow: hidden;
	}

	.kpi {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		padding: 0.75rem 1rem;
		background: var(--panel);
		min-width: 0;
	}

	.kpi-label {
		font-family: var(--font-mono);
		font-size: 0.6875rem;
		font-weight: 500;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--text-muted);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.kpi-value {
		font-family: var(--font-display);
		font-size: 1.0625rem;
		font-weight: 600;
		color: var(--text-primary);
		letter-spacing: -0.015em;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.kpi-accent {
		background: var(--panel-hover, var(--panel));
	}

	.kpi-accent .kpi-value {
		color: var(--accent);
	}

	.kpi-warn .kpi-value {
		color: var(--orange, #f59e0b);
	}
</style>
