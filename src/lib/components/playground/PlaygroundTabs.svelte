<script lang="ts">
	import { t } from '$lib/i18n';

	type Tab = 'learn' | 'playground' | 'scenarios';

	let { activeTab = 'playground', onTabChange }: {
		activeTab?: Tab;
		onTabChange: (tab: Tab) => void;
	} = $props();

	const tabs: { key: Tab; labelKey: string; icon: string }[] = [
		{ key: 'learn', labelKey: 'shell.tab.learn', icon: '📖' },
		{ key: 'playground', labelKey: 'shell.tab.playground', icon: '🧮' },
		{ key: 'scenarios', labelKey: 'shell.tab.scenarios', icon: '📋' },
	];
</script>

<div class="tab-bar" role="tablist" aria-label="Playground sections">
	{#each tabs as tab (tab.key)}
		<button
			role="tab"
			aria-selected={activeTab === tab.key}
			class="tab"
			class:active={activeTab === tab.key}
			onclick={() => onTabChange(tab.key)}
		>
			<span class="tab-icon" aria-hidden="true">{tab.icon}</span>
			<span class="tab-label">{$t(tab.labelKey)}</span>
		</button>
	{/each}
</div>

<style>
	.tab-bar {
		display: flex;
		gap: 0.25rem;
		padding: 0.25rem;
		background: var(--bg-subtle);
		border-radius: var(--radius-lg);
		border: 1px solid var(--border-subtle);
	}

	.tab {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 0.625rem 1rem;
		border: none;
		border-radius: var(--radius-md);
		background: transparent;
		color: var(--text-muted);
		font-family: var(--font-body);
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition:
			background var(--transition-fast),
			color var(--transition-fast),
			box-shadow var(--transition-fast);
		white-space: nowrap;
	}

	.tab:hover:not(.active) {
		color: var(--text-secondary);
		background: var(--panel-hover);
	}

	.tab.active {
		background: var(--panel);
		color: var(--text-primary);
		box-shadow: var(--shadow-sm);
		font-weight: 600;
	}

	.tab-icon {
		font-size: 1rem;
		line-height: 1;
	}

	@media (max-width: 480px) {
		.tab-label {
			display: none;
		}

		.tab {
			padding: 0.625rem 0.75rem;
		}

		.tab-icon {
			font-size: 1.25rem;
		}
	}
</style>
