<script lang="ts">
	import { t } from '$lib/i18n';
	import type { Scenario } from '$lib/content/types';

	let { scenarios, onSelect }: {
		scenarios: Scenario[];
		onSelect: (presetValues: Record<string, number | string | boolean>) => void;
	} = $props();
</script>

<div class="scenarios-grid">
	{#each scenarios as scenario (scenario.slug)}
		<button
			class="scenario-card"
			onclick={() => onSelect(scenario.presetValues)}
			type="button"
		>
			<h3 class="scenario-title">{$t(scenario.titleKey)}</h3>
			<p class="scenario-desc">{$t(scenario.descKey)}</p>
			<span class="scenario-action">
				<svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
					<path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
				</svg>
			</span>
		</button>
	{/each}
</div>

<style>
	.scenarios-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 1rem;
	}

	.scenario-card {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		padding: 1.25rem;
		background: var(--panel);
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-lg);
		cursor: pointer;
		text-align: left;
		color: var(--text-primary);
		font-family: var(--font-body);
		transition:
			transform var(--transition-fast),
			border-color var(--transition-smooth),
			box-shadow var(--transition-smooth);
	}

	.scenario-card:hover {
		transform: translateY(-2px);
		border-color: var(--accent);
		box-shadow: var(--shadow-md), 0 0 20px var(--accent-glow);
	}

	.scenario-card:active {
		transform: translateY(0);
	}

	.scenario-title {
		font-family: var(--font-display);
		font-size: 1rem;
		font-weight: 600;
		color: var(--text-primary);
		margin: 0;
		line-height: 1.35;
	}

	.scenario-desc {
		font-size: 0.8375rem;
		color: var(--text-secondary);
		line-height: 1.55;
		margin: 0;
		flex: 1;
	}

	.scenario-action {
		display: inline-flex;
		align-items: center;
		color: var(--accent);
		margin-top: 0.25rem;
		transition: transform var(--transition-fast);
	}

	.scenario-card:hover .scenario-action {
		transform: translateX(4px);
	}

	@media (max-width: 480px) {
		.scenarios-grid {
			grid-template-columns: 1fr;
		}

		.scenario-card {
			padding: 1rem;
		}
	}
</style>
