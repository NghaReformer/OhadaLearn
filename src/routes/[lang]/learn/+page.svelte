<script lang="ts">
	import { page } from '$app/state';
	import { t } from '$lib/i18n';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let lang = $derived(page.params.lang);
</script>

<svelte:head>
	<title>{$t('library.learn.title')} — OhadaLearn</title>
	<meta name="description" content={$t('library.learn.subtitle')} />
</svelte:head>

<section class="library">
	<div class="library-container">
		<header class="library-header">
			<div class="library-breadcrumb">{$t('shell.tab.learn')}</div>
			<h1 class="library-title">{$t('library.learn.title')}</h1>
			<p class="library-subtitle">{$t('library.learn.subtitle')}</p>
		</header>

		{#if data.groups.length === 0}
			<div class="empty-state">
				<p>{$t('library.learn.empty')}</p>
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
									{group.sections.length}
									{$t('library.learn.sectionsCount')}
								</p>
							</div>
							<a
								class="group-cta"
								href={`/${lang}/playgrounds/${group.slug}?tab=learn`}
							>
								{$t('library.learn.openIn')}
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
						<ol class="lesson-list">
							{#each group.sections as section (section.slug)}
								<li class="lesson-item">
									<a
										class="lesson-link"
										href={`/${lang}/playgrounds/${group.slug}?tab=learn#${section.slug}`}
									>
										<span class="lesson-order">
											{String(section.order).padStart(2, '0')}
										</span>
										<span class="lesson-title">{section.title}</span>
									</a>
								</li>
							{/each}
						</ol>
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
		max-width: 960px;
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
		gap: 1.5rem;
	}

	.group {
		background: var(--panel);
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-lg);
		overflow: hidden;
		transition: border-color var(--transition-smooth);
	}

	.group:hover {
		border-color: var(--border);
	}

	.group-header {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1.25rem 1.5rem;
		border-bottom: 1px solid var(--border-subtle);
		background: var(--bg-subtle);
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
		font-size: 1.125rem;
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
		background: var(--accent);
		color: #fff;
		text-decoration: none;
		border-radius: var(--radius-sm);
		font-family: var(--font-body);
		font-size: 0.8125rem;
		font-weight: 600;
		transition:
			background var(--transition-fast),
			box-shadow var(--transition-smooth);
		flex-shrink: 0;
	}

	.group-cta:hover {
		background: var(--accent-dim);
		box-shadow: 0 0 16px var(--accent-glow);
	}

	.lesson-list {
		list-style: none;
		margin: 0;
		padding: 0.5rem 0;
	}

	.lesson-item {
		border-bottom: 1px solid var(--border-subtle);
	}

	.lesson-item:last-child {
		border-bottom: none;
	}

	.lesson-link {
		display: flex;
		align-items: center;
		gap: 0.875rem;
		padding: 0.75rem 1.5rem;
		text-decoration: none;
		color: var(--text-secondary);
		transition:
			background var(--transition-fast),
			color var(--transition-fast);
	}

	.lesson-link:hover {
		background: var(--panel-hover);
		color: var(--text-primary);
	}

	.lesson-order {
		font-family: var(--font-mono);
		font-size: 0.75rem;
		font-weight: 700;
		color: var(--accent);
		min-width: 1.5rem;
	}

	.lesson-title {
		font-family: var(--font-body);
		font-size: 0.9rem;
		font-weight: 500;
	}

	@media (max-width: 640px) {
		.group-header {
			flex-wrap: wrap;
		}

		.group-cta {
			width: 100%;
			justify-content: center;
		}

		.lesson-link {
			padding: 0.625rem 1rem;
		}
	}
</style>
