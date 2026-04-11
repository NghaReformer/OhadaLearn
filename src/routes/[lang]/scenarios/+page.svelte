<script lang="ts">
	import { page } from '$app/state';
	import { t } from '$lib/i18n';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let lang = $derived(page.params.lang);
</script>

<svelte:head>
	<title>{$t('library.scenarios.title')} — OhadaLearn</title>
	<meta name="description" content={$t('library.scenarios.subtitle')} />
</svelte:head>

<section class="library">
	<div class="library-container">
		<header class="library-header">
			<div class="library-breadcrumb">{$t('shell.tab.scenarios')}</div>
			<h1 class="library-title">{$t('library.scenarios.title')}</h1>
			<p class="library-subtitle">{$t('library.scenarios.subtitle')}</p>
		</header>

		{#if data.groups.length === 0}
			<div class="empty-state">
				<p>{$t('library.scenarios.empty')}</p>
			</div>
		{:else}
			<div class="groups">
				{#each data.groups as group (group.slug)}
					<section class="group">
						<header class="group-header">
							<span class="group-icon" aria-hidden="true">{group.icon}</span>
							<div class="group-meta">
								<h2 class="group-title">{$t(group.titleKey)}</h2>
								<p class="group-desc">
									{group.scenarios.length}
									{$t('library.scenarios.scenariosCount')}
								</p>
							</div>
							<a
								class="group-cta"
								href={`/${lang}/playgrounds/${group.slug}?tab=scenarios`}
							>
								{$t('library.scenarios.openIn')}
								<svg
									width="14"
									height="14"
									viewBox="0 0 16 16"
									fill="none"
									aria-hidden="true"
								>
									<path
										d="M3 8h10M9 4l4 4-4 4"
										stroke="currentColor"
										stroke-width="1.5"
										stroke-linecap="round"
										stroke-linejoin="round"
									/>
								</svg>
							</a>
						</header>
						<div class="scenario-grid">
							{#each group.scenarios as scenario (scenario.slug)}
								<a
									class="scenario-card"
									href={`/${lang}/playgrounds/${group.slug}?tab=scenarios#${scenario.slug}`}
								>
									<h3 class="scenario-title">{$t(scenario.titleKey)}</h3>
									<p class="scenario-desc">{$t(scenario.descKey)}</p>
									<span class="scenario-arrow">
										<svg
											width="14"
											height="14"
											viewBox="0 0 16 16"
											fill="none"
											aria-hidden="true"
										>
											<path
												d="M3 8h10M9 4l4 4-4 4"
												stroke="currentColor"
												stroke-width="1.5"
												stroke-linecap="round"
												stroke-linejoin="round"
											/>
										</svg>
									</span>
								</a>
							{/each}
						</div>
					</section>
				{/each}
			</div>
		{/if}
	</div>
</section>

<style>
	.library {
		padding: clamp(2.5rem, 5vw, 4rem) 0 4rem;
		min-height: calc(100vh - 60px);
	}

	.library-container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 1.5rem;
		display: flex;
		flex-direction: column;
		gap: 2.5rem;
	}

	.library-header {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.library-breadcrumb {
		font-family: var(--font-mono);
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--text-muted);
	}

	.library-title {
		font-family: var(--font-display);
		font-size: clamp(1.75rem, 4vw, 2.5rem);
		font-weight: 700;
		letter-spacing: -0.02em;
		color: var(--text-primary);
		margin: 0;
		line-height: 1.15;
	}

	.library-subtitle {
		font-size: 1rem;
		color: var(--text-secondary);
		line-height: 1.6;
		max-width: 60ch;
		margin: 0;
	}

	.empty-state {
		padding: 4rem 2rem;
		background: var(--panel);
		border: 1px dashed var(--border);
		border-radius: var(--radius-lg);
		text-align: center;
		color: var(--text-muted);
	}

	.groups {
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	.group {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.group-header {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding-bottom: 0.875rem;
		border-bottom: 1px solid var(--border-subtle);
	}

	.group-icon {
		font-size: 1.5rem;
		line-height: 1;
		flex-shrink: 0;
	}

	.group-meta {
		flex: 1;
		min-width: 0;
	}

	.group-title {
		font-family: var(--font-display);
		font-size: 1.25rem;
		font-weight: 600;
		color: var(--text-primary);
		margin: 0 0 0.125rem 0;
	}

	.group-desc {
		font-family: var(--font-mono);
		font-size: 0.7rem;
		color: var(--text-muted);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin: 0;
	}

	.group-cta {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.5rem 0.875rem;
		background: var(--panel);
		color: var(--accent);
		text-decoration: none;
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		font-family: var(--font-body);
		font-size: 0.8125rem;
		font-weight: 600;
		transition:
			background var(--transition-fast),
			border-color var(--transition-fast),
			box-shadow var(--transition-smooth);
		flex-shrink: 0;
	}

	.group-cta:hover {
		background: var(--accent-glow);
		border-color: var(--accent);
		box-shadow: 0 0 12px var(--accent-glow);
	}

	.scenario-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 0.875rem;
	}

	.scenario-card {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		padding: 1.25rem;
		background: var(--panel);
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-md);
		text-decoration: none;
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
		box-shadow: 0 0 18px var(--accent-glow);
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
		font-size: 0.825rem;
		color: var(--text-secondary);
		line-height: 1.55;
		margin: 0;
		flex: 1;
	}

	.scenario-arrow {
		display: inline-flex;
		align-items: center;
		color: var(--accent);
		margin-top: 0.25rem;
		transition: transform var(--transition-fast);
	}

	.scenario-card:hover .scenario-arrow {
		transform: translateX(4px);
	}

	@media (max-width: 640px) {
		.group-header {
			flex-wrap: wrap;
		}

		.group-cta {
			width: 100%;
			justify-content: center;
		}

		.scenario-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
