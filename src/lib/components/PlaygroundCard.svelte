<script lang="ts">
	import { page } from '$app/state';
	import { t } from '$lib/i18n';
	import type { PlaygroundMeta } from '$lib/data/playgrounds';

	let { pg }: { pg: PlaygroundMeta } = $props();

	let lang = $derived(page.params.lang || 'en');
</script>

<a href={`/${lang}/playgrounds/${pg.slug}`} class="card">
	<span class="badge">{$t('badge.free')}</span>
	<span class="icon" aria-hidden="true">{pg.icon}</span>
	<h3 class="title">{$t(pg.titleKey)}</h3>
	<p class="desc">{$t(pg.descKey)}</p>
	<span class="open-link">
		{$t('playgrounds.open')}
		<svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
			<path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
		</svg>
	</span>
</a>

<style>
	.card {
		position: relative;
		display: flex;
		flex-direction: column;
		gap: 0.625rem;
		padding: 1.5rem;
		background: var(--panel);
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-lg);
		text-decoration: none;
		color: var(--text-primary);
		transition:
			transform var(--transition-spring),
			border-color var(--transition-smooth),
			box-shadow var(--transition-smooth);
	}

	.card:hover {
		transform: translateY(-3px);
		border-color: var(--accent);
		box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3), var(--shadow-glow);
		color: var(--text-primary);
	}

	.badge {
		position: absolute;
		top: 1rem;
		right: 1rem;
		font-family: var(--font-mono);
		font-size: 0.68rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--green);
		background: var(--green-glow);
		padding: 3px 8px;
		border-radius: var(--radius-sm);
	}

	.icon {
		font-size: 1.75rem;
		line-height: 1;
	}

	.title {
		font-family: var(--font-display);
		font-size: 1.05rem;
		font-weight: 600;
		color: var(--text-primary);
		line-height: 1.3;
	}

	.desc {
		font-size: 0.875rem;
		color: var(--text-secondary);
		line-height: 1.55;
		flex: 1;
	}

	.open-link {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--accent);
		margin-top: 0.25rem;
		transition: gap var(--transition-smooth);
	}

	.card:hover .open-link {
		gap: 0.625rem;
	}
</style>
