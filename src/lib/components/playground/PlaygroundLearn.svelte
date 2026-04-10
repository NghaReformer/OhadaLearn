<script lang="ts">
	import type { LearnSection } from '$lib/content/types';

	let { sections }: { sections: LearnSection[] } = $props();

	let sorted = $derived([...sections].sort((a, b) => a.order - b.order));
</script>

<div class="learn-content">
	{#each sorted as section (section.slug)}
		<article class="learn-section">
			{@html section.html}
		</article>
	{/each}
</div>

<style>
	.learn-content {
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	.learn-section {
		padding: 1.5rem;
		background: var(--panel);
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-lg);
	}

	/* Global element styling for rendered HTML content */
	.learn-section :global(h1) {
		font-family: var(--font-display);
		font-size: 1.75rem;
		font-weight: 700;
		color: var(--text-primary);
		margin: 0 0 1rem 0;
		line-height: 1.3;
	}

	.learn-section :global(h2) {
		font-family: var(--font-display);
		font-size: 1.25rem;
		font-weight: 600;
		color: var(--text-primary);
		margin: 1.5rem 0 0.75rem 0;
		line-height: 1.35;
	}

	.learn-section :global(h3) {
		font-family: var(--font-display);
		font-size: 1.05rem;
		font-weight: 600;
		color: var(--text-secondary);
		margin: 1.25rem 0 0.5rem 0;
		line-height: 1.4;
	}

	.learn-section :global(p) {
		font-size: 0.9375rem;
		color: var(--text-secondary);
		line-height: 1.7;
		margin: 0 0 0.75rem 0;
	}

	.learn-section :global(ul),
	.learn-section :global(ol) {
		color: var(--text-secondary);
		font-size: 0.9375rem;
		line-height: 1.7;
		padding-left: 1.5rem;
		margin: 0 0 0.75rem 0;
	}

	.learn-section :global(li) {
		margin-bottom: 0.25rem;
	}

	.learn-section :global(code) {
		font-family: var(--font-mono);
		font-size: 0.8125rem;
		color: var(--accent);
		background: var(--bg-subtle);
		padding: 0.125rem 0.375rem;
		border-radius: var(--radius-sm);
	}

	.learn-section :global(pre) {
		font-family: var(--font-mono);
		font-size: 0.8125rem;
		color: var(--text-primary);
		background: var(--bg);
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-md);
		padding: 1rem;
		overflow-x: auto;
		margin: 0.75rem 0;
		line-height: 1.6;
	}

	.learn-section :global(pre code) {
		background: none;
		padding: 0;
		color: inherit;
	}

	.learn-section :global(.katex-display) {
		margin: 1rem 0;
		overflow-x: auto;
		padding: 0.5rem 0;
	}

	.learn-section :global(table) {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.875rem;
		margin: 0.75rem 0;
	}

	.learn-section :global(th) {
		font-family: var(--font-mono);
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: var(--text-muted);
		background: var(--bg-subtle);
		padding: 0.5rem 0.75rem;
		text-align: left;
		border-bottom: 1px solid var(--border);
	}

	.learn-section :global(td) {
		padding: 0.5rem 0.75rem;
		border-bottom: 1px solid var(--border-subtle);
		color: var(--text-secondary);
	}

	.learn-section :global(strong) {
		color: var(--text-primary);
		font-weight: 600;
	}

	.learn-section :global(a) {
		color: var(--accent);
		text-decoration: none;
		border-bottom: 1px solid transparent;
		transition: border-color var(--transition-fast);
	}

	.learn-section :global(a:hover) {
		border-bottom-color: var(--accent);
	}

	.learn-section :global(blockquote) {
		border-left: 3px solid var(--accent);
		padding: 0.5rem 1rem;
		margin: 0.75rem 0;
		color: var(--text-secondary);
		background: var(--bg-subtle);
		border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
	}

	@media (max-width: 640px) {
		.learn-section {
			padding: 1rem;
		}

		.learn-section :global(h1) {
			font-size: 1.375rem;
		}

		.learn-section :global(h2) {
			font-size: 1.1rem;
		}
	}
</style>
