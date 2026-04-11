<script lang="ts">
	import type { Snippet } from 'svelte';
	import { untrack } from 'svelte';
	import { page } from '$app/state';
	import { createPersistentStore } from '$lib/persistence';
	import { t } from '$lib/i18n';
	import type { PlaygroundManifest } from '$lib/contracts/playground';
	import type { LearnSection, Scenario, ExerciseTemplateFile } from '$lib/content/types';
	import PlaygroundTabs from './PlaygroundTabs.svelte';
	import PlaygroundSettings from './PlaygroundSettings.svelte';
	import PlaygroundLearn from './PlaygroundLearn.svelte';
	import PlaygroundScenarios from './PlaygroundScenarios.svelte';
	import ExercisePanel from './ExercisePanel.svelte';
	import ShareButton from './ShareButton.svelte';
	import { serializeShareValue, deserializeShareValue } from './share-state';

	type Tab = 'learn' | 'playground' | 'scenarios';

	let {
		manifest,
		storeKey,
		stateDefaults,
		learnSections = [],
		scenarios = [],
		exercises = [],
		shareableKeys = [],
		playground,
	}: {
		manifest: PlaygroundManifest;
		storeKey: string;
		stateDefaults: Record<string, unknown>;
		learnSections?: LearnSection[];
		scenarios?: Scenario[];
		exercises?: ExerciseTemplateFile[];
		shareableKeys?: string[];
		playground: Snippet<[state: Record<string, unknown>, updateState: (partial: Record<string, unknown>) => void]>;
	} = $props();

	// Read initial tab from URL ?tab= so library pages can deep-link.
	// Falls back to 'playground' for any unknown value.
	function readInitialTab(): Tab {
		const v = page.url.searchParams.get('tab');
		if (v === 'learn' || v === 'scenarios' || v === 'playground') return v;
		return 'playground';
	}

	let activeTab: Tab = $state(readInitialTab());
	let exercisesOpen = $state(false);

	// Store is created once at mount — storeKey/stateDefaults are initialization-only.
	// svelte-ignore state_referenced_locally
	const pgState = createPersistentStore(storeKey, stateDefaults);

	function updateState(partial: Record<string, unknown>) {
		pgState.update((s) => ({ ...s, ...partial }));
	}

	function loadScenario(presetValues: Record<string, number | string | boolean>) {
		pgState.update((s) => ({ ...s, ...presetValues }));
		activeTab = 'playground';
	}

	function handleTabChange(tab: Tab) {
		activeTab = tab;
	}

	let shareUrl = $derived.by(() => {
		const params = new URLSearchParams();
		const state = $pgState;
		for (const key of shareableKeys) {
			if (key in state) {
				params.set(key, serializeShareValue(state[key]));
			}
		}
		const base = page.url.origin + page.url.pathname;
		const qs = params.toString();
		return qs ? `${base}?${qs}` : base;
	});

	// Load state from URL params on mount (once only).
	// Uses untrack to avoid re-running when pgState changes.
	let urlApplied = false;
	$effect(() => {
		const urlParams = page.url.searchParams;
		untrack(() => {
			if (urlApplied) return;
			urlApplied = true;
			if (!urlParams.toString()) return;
			const fromUrl: Record<string, unknown> = {};
			for (const key of shareableKeys) {
				const val = urlParams.get(key);
				if (val !== null && val !== '') {
					fromUrl[key] = deserializeShareValue(val);
				}
			}
			if (Object.keys(fromUrl).length > 0) {
				updateState(fromUrl);
			}
		});
	});

	let pgStateValue = $derived($pgState);
	let hasExercises = $derived(exercises.length > 0);
</script>

<div class="shell">
	<!-- ─── Header ─── -->
	<header class="shell-header">
		<div class="header-left">
			<span class="shell-icon" aria-hidden="true">{manifest.icon}</span>
			<h1 class="shell-title">{$t(manifest.titleKey)}</h1>
		</div>

		<div class="header-tabs">
			<PlaygroundTabs {activeTab} onTabChange={handleTabChange} />
		</div>

		<div class="header-right">
			<PlaygroundSettings />
			<ShareButton url={shareUrl} />
		</div>
	</header>

	<!-- ─── Body ─── -->
	<div class="shell-body" class:has-sidebar={hasExercises && activeTab === 'playground'}>
		<main class="shell-main">
			{#if activeTab === 'learn'}
				<PlaygroundLearn sections={learnSections} />
			{:else if activeTab === 'playground'}
				{@render playground(pgStateValue, updateState)}
			{:else if activeTab === 'scenarios'}
				<PlaygroundScenarios {scenarios} onSelect={loadScenario} />
			{/if}
		</main>

		{#if hasExercises && activeTab === 'playground'}
			<aside class="shell-sidebar" class:open={exercisesOpen}>
				<button
					class="sidebar-toggle"
					type="button"
					aria-expanded={exercisesOpen}
					onclick={() => (exercisesOpen = !exercisesOpen)}
				>
					<span class="toggle-label">{$t('shell.exercises')}</span>
					<svg
						class="toggle-chevron"
						class:rotated={exercisesOpen}
						width="14"
						height="14"
						viewBox="0 0 16 16"
						fill="none"
						aria-hidden="true"
					>
						<path
							d="M4 6l4 4 4-4"
							stroke="currentColor"
							stroke-width="1.5"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
					</svg>
				</button>
				<div class="sidebar-content" class:collapsed={!exercisesOpen}>
					<ExercisePanel {exercises} />
				</div>
			</aside>
		{/if}
	</div>
</div>

<style>
	/* ─── Shell Container ─── */
	.shell {
		display: flex;
		flex-direction: column;
		height: 100%;
		min-height: 0;
	}

	/* ─── Header ─── */
	.shell-header {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 0.625rem 1.25rem;
		background: var(--panel);
		border-bottom: 1px solid var(--border-subtle);
		flex-shrink: 0;
	}

	.header-left {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		flex-shrink: 0;
	}

	.shell-icon {
		font-size: 1.25rem;
		line-height: 1;
	}

	.shell-title {
		font-family: var(--font-display);
		font-size: 1rem;
		font-weight: 600;
		color: var(--text-primary);
		margin: 0;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.header-tabs {
		flex: 1;
		min-width: 0;
		display: flex;
		justify-content: center;
	}

	.header-right {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		flex-shrink: 0;
	}

	/* ─── Body ─── */
	.shell-body {
		display: flex;
		flex: 1;
		min-height: 0;
		overflow: hidden;
	}

	.shell-main {
		flex: 1;
		min-width: 0;
		overflow-y: auto;
		padding: 1.5rem;
	}

	/* ─── Sidebar (Desktop) ─── */
	.shell-sidebar {
		display: flex;
		flex-direction: column;
		width: 320px;
		flex-shrink: 0;
		border-left: 1px solid var(--border-subtle);
		background: var(--panel);
		overflow: hidden;
	}

	.sidebar-toggle {
		display: none;
	}

	.sidebar-content {
		flex: 1;
		overflow-y: auto;
		padding: 1.25rem;
	}

	/* Desktop: sidebar always visible, toggle hidden */
	@media (min-width: 1025px) {
		.shell-sidebar {
			display: flex;
		}

		.sidebar-content.collapsed {
			/* On desktop, never collapse */
			display: block;
		}
	}

	/* ─── Mobile Layout ─── */
	@media (max-width: 1024px) {
		.shell-header {
			flex-wrap: wrap;
			gap: 0.5rem;
			padding: 0.5rem 1rem;
		}

		.header-left {
			order: 1;
			width: 100%;
			justify-content: center;
		}

		.header-tabs {
			order: 2;
			width: 100%;
		}

		.header-right {
			order: 3;
			width: 100%;
			justify-content: center;
		}

		.shell-body {
			flex-direction: column;
		}

		.shell-main {
			padding: 1rem;
		}

		.shell-sidebar {
			width: 100%;
			border-left: none;
			border-top: 1px solid var(--border-subtle);
			flex-shrink: 0;
		}

		.sidebar-toggle {
			display: flex;
			align-items: center;
			justify-content: space-between;
			width: 100%;
			padding: 0.75rem 1rem;
			background: var(--bg-subtle);
			border: none;
			border-bottom: 1px solid var(--border-subtle);
			color: var(--text-secondary);
			font-family: var(--font-body);
			font-size: 0.875rem;
			font-weight: 600;
			cursor: pointer;
			transition: color var(--transition-fast);
		}

		.sidebar-toggle:hover {
			color: var(--text-primary);
		}

		.toggle-label {
			display: flex;
			align-items: center;
			gap: 0.375rem;
		}

		.toggle-chevron {
			transition: transform var(--transition-fast);
		}

		.toggle-chevron.rotated {
			transform: rotate(180deg);
		}

		.sidebar-content {
			padding: 1rem;
		}

		.sidebar-content.collapsed {
			display: none;
		}
	}

	/* ─── Scroll styling ─── */
	.shell-main::-webkit-scrollbar,
	.sidebar-content::-webkit-scrollbar {
		width: 6px;
	}

	.shell-main::-webkit-scrollbar-track,
	.sidebar-content::-webkit-scrollbar-track {
		background: transparent;
	}

	.shell-main::-webkit-scrollbar-thumb,
	.sidebar-content::-webkit-scrollbar-thumb {
		background: var(--border);
		border-radius: 3px;
	}

	.shell-main::-webkit-scrollbar-thumb:hover,
	.sidebar-content::-webkit-scrollbar-thumb:hover {
		background: var(--text-muted);
	}
</style>
