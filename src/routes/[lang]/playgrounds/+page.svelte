<script lang="ts">
	import { t } from '$lib/i18n';
	import { playgrounds } from '$lib/data/playgrounds';
	import PlaygroundCard from '$lib/components/PlaygroundCard.svelte';
</script>

<svelte:head>
	<title>{$t('playgrounds.title')} — OhadaLearn</title>
</svelte:head>

<section class="catalog">
	<div class="container">
		<h1 class="catalog-title">{$t('playgrounds.title')}</h1>
		<p class="catalog-subtitle">{$t('playgrounds.subtitle')}</p>
		<div class="catalog-grid">
			{#each playgrounds as pg}
				<PlaygroundCard {pg} />
			{/each}
		</div>
	</div>
</section>

<style>
	.catalog {
		padding: clamp(3rem, 6vw, 5rem) 0;
	}

	.catalog .container {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2rem;
	}

	.catalog-title {
		font-family: var(--font-display);
		font-size: clamp(1.75rem, 4vw, 2.5rem);
		font-weight: 700;
		letter-spacing: -0.02em;
		color: var(--text-primary);
	}

	.catalog-subtitle {
		font-size: 1.05rem;
		color: var(--text-secondary);
		max-width: 50ch;
		line-height: 1.6;
		text-align: center;
		margin-top: -0.75rem;
	}

	.catalog-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 1rem;
		width: 100%;
	}
</style>
