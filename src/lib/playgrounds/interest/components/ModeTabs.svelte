<script lang="ts">
	import { t } from '$lib/i18n';
	import type { InterestMode } from '../types';

	let {
		mode,
		onChange,
	}: {
		mode: InterestMode;
		onChange: (next: InterestMode) => void;
	} = $props();

	let translate = $derived($t);

	const modes: Array<{ key: InterestMode; labelKey: string }> = [
		{ key: 'simple', labelKey: 'int.mode.simple.label' },
		{ key: 'compound', labelKey: 'int.mode.compound.label' },
		{ key: 'effective', labelKey: 'int.mode.effective.label' },
	];
</script>

<div class="mode-tabs" role="tablist" aria-label="Interest mode">
	{#each modes as m (m.key)}
		<button
			type="button"
			class="mode-tab"
			class:active={mode === m.key}
			role="tab"
			aria-selected={mode === m.key}
			onclick={() => onChange(m.key)}
		>
			{translate(m.labelKey)}
		</button>
	{/each}
</div>

<style>
	.mode-tabs {
		display: flex;
		gap: 0.25rem;
		padding: 0.25rem;
		background: var(--bg-subtle);
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-md);
	}

	.mode-tab {
		flex: 1;
		padding: 0.5rem 1rem;
		background: transparent;
		border: none;
		border-radius: var(--radius-sm);
		color: var(--text-secondary);
		font-family: var(--font-display);
		font-size: 0.8125rem;
		font-weight: 600;
		letter-spacing: 0.02em;
		cursor: pointer;
		transition:
			background var(--transition-fast),
			color var(--transition-fast);
	}

	.mode-tab:hover {
		color: var(--text-primary);
	}

	.mode-tab.active {
		background: var(--panel);
		color: var(--text-primary);
		box-shadow: var(--shadow-sm);
	}
</style>
