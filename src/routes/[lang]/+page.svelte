<script lang="ts">
	import { page } from '$app/state';
	import { t } from '$lib/i18n';
	import { playgrounds } from '$lib/data/playgrounds';
	import PlaygroundCard from '$lib/components/PlaygroundCard.svelte';
	import WaitlistForm from '$lib/components/WaitlistForm.svelte';

	let lang = $derived(page.params.lang);

	const previewPlaygrounds = playgrounds.slice(0, 3);

	const features = [
		{ key: 'interactive', icon: '\u2756' },
		{ key: 'bilingual', icon: '\u2B50' },
		{ key: 'syscohada', icon: '\u2696' },
		{ key: 'free', icon: '\u2661' },
	] as const;
</script>

<svelte:head>
	<title>OhadaLearn — SYSCOHADA Accounting Education</title>
	<meta name="description" content="Interactive playgrounds to master SYSCOHADA accounting. Free, bilingual (EN/FR), and built for students and professionals across OHADA member states." />
</svelte:head>

<!-- Hero -->
<section class="hero">
	<div class="container hero-inner">
		<span class="hero-badge">SYSCOHADA Revisé 2017</span>
		<h1 class="hero-title">{$t('hero.title')}</h1>
		<p class="hero-subtitle">{$t('hero.subtitle')}</p>
		<div class="hero-ctas">
			<a href={`/${lang}/playgrounds`} class="btn btn-primary">{$t('hero.cta.playgrounds')}</a>
			<a href="#waitlist" class="btn btn-secondary">{$t('hero.cta.waitlist')}</a>
		</div>
	</div>
	<div class="hero-glow" aria-hidden="true"></div>
</section>

<!-- Features -->
<section class="features">
	<div class="container">
		<h2 class="section-title">{$t('features.title')}</h2>
		<div class="features-grid">
			{#each features as feat}
				<div class="feature-card">
					<span class="feature-icon" aria-hidden="true">{feat.icon}</span>
					<h3 class="feature-title">{$t(`features.${feat.key}.title`)}</h3>
					<p class="feature-desc">{$t(`features.${feat.key}.desc`)}</p>
				</div>
			{/each}
		</div>
	</div>
</section>

<!-- Playground Preview -->
<section class="playgrounds-preview">
	<div class="container">
		<h2 class="section-title">{$t('playgrounds.title')}</h2>
		<p class="section-subtitle">{$t('playgrounds.subtitle')}</p>
		<div class="playgrounds-grid">
			{#each previewPlaygrounds as pg}
				<PlaygroundCard {pg} />
			{/each}
		</div>
		<div class="section-cta">
			<a href={`/${lang}/playgrounds`} class="link-arrow">
				{$t('hero.cta.playgrounds')}
				<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
					<path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
				</svg>
			</a>
		</div>
	</div>
</section>

<!-- Waitlist -->
<section class="waitlist" id="waitlist">
	<div class="container waitlist-inner">
		<div class="waitlist-text">
			<h2 class="section-title">{$t('waitlist.title')}</h2>
			<p class="section-subtitle">{$t('waitlist.subtitle')}</p>
		</div>
		<WaitlistForm />
	</div>
</section>

<style>
	/* --------------------------------------------------------
	   Hero
	   -------------------------------------------------------- */
	.hero {
		position: relative;
		overflow: hidden;
		padding: clamp(4rem, 10vw, 8rem) 0 clamp(3rem, 8vw, 6rem);
		text-align: center;
	}

	.hero-inner {
		position: relative;
		z-index: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1.25rem;
	}

	.hero-badge {
		display: inline-block;
		font-family: var(--font-mono);
		font-size: 0.75rem;
		font-weight: 600;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		color: var(--accent);
		background: var(--accent-glow);
		border: 1px solid color-mix(in srgb, var(--accent) 25%, transparent);
		padding: 0.3rem 0.875rem;
		border-radius: 100px;
	}

	.hero-title {
		font-family: var(--font-display);
		font-size: clamp(2.25rem, 5.5vw, 4rem);
		font-weight: 700;
		line-height: 1.1;
		letter-spacing: -0.025em;
		max-width: 14ch;
		background: linear-gradient(135deg, var(--text-primary) 0%, var(--accent) 100%);
		-webkit-background-clip: text;
		background-clip: text;
		-webkit-text-fill-color: transparent;
	}

	.hero-subtitle {
		font-size: clamp(1rem, 2vw, 1.25rem);
		color: var(--text-secondary);
		max-width: 48ch;
		line-height: 1.6;
	}

	.hero-ctas {
		display: flex;
		gap: 0.75rem;
		margin-top: 0.75rem;
		flex-wrap: wrap;
		justify-content: center;
	}

	.hero-glow {
		position: absolute;
		top: -30%;
		left: 50%;
		transform: translateX(-50%);
		width: 600px;
		height: 600px;
		background: radial-gradient(circle, var(--accent-glow) 0%, transparent 70%);
		border-radius: 50%;
		pointer-events: none;
		opacity: 0.5;
	}

	/* --------------------------------------------------------
	   Buttons
	   -------------------------------------------------------- */
	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		font-family: var(--font-body);
		font-size: 0.9375rem;
		font-weight: 600;
		padding: 0.7rem 1.75rem;
		border-radius: var(--radius-md);
		text-decoration: none;
		transition:
			background var(--transition-fast),
			color var(--transition-fast),
			box-shadow var(--transition-fast),
			transform var(--transition-fast);
	}

	.btn-primary {
		color: var(--bg);
		background: var(--accent);
	}

	.btn-primary:hover {
		background: var(--accent-dim);
		color: var(--bg);
		box-shadow: var(--shadow-glow);
		transform: translateY(-1px);
	}

	.btn-secondary {
		color: var(--text-primary);
		background: var(--panel);
		border: 1px solid var(--border);
	}

	.btn-secondary:hover {
		background: var(--panel-hover);
		border-color: var(--accent);
		color: var(--text-primary);
		transform: translateY(-1px);
	}

	/* --------------------------------------------------------
	   Section Headings
	   -------------------------------------------------------- */
	.section-title {
		font-family: var(--font-display);
		font-size: clamp(1.5rem, 3.5vw, 2.25rem);
		font-weight: 700;
		letter-spacing: -0.02em;
		color: var(--text-primary);
	}

	.section-subtitle {
		font-size: 1rem;
		color: var(--text-secondary);
		max-width: 50ch;
		line-height: 1.6;
		margin-top: 0.5rem;
	}

	/* --------------------------------------------------------
	   Features
	   -------------------------------------------------------- */
	.features {
		padding: clamp(3rem, 6vw, 5rem) 0;
	}

	.features .container {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2.5rem;
	}

	.features-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 1rem;
		width: 100%;
	}

	.feature-card {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		padding: 1.5rem;
		background: var(--panel);
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-lg);
		transition:
			border-color var(--transition-smooth),
			box-shadow var(--transition-smooth);
	}

	.feature-card:hover {
		border-color: var(--accent);
		box-shadow: 0 0 24px var(--accent-glow);
	}

	.feature-icon {
		font-size: 1.5rem;
		line-height: 1;
		color: var(--accent);
		margin-bottom: 0.25rem;
	}

	.feature-title {
		font-family: var(--font-display);
		font-size: 1.05rem;
		font-weight: 600;
		color: var(--text-primary);
	}

	.feature-desc {
		font-size: 0.875rem;
		color: var(--text-secondary);
		line-height: 1.6;
	}

	/* --------------------------------------------------------
	   Playground Preview
	   -------------------------------------------------------- */
	.playgrounds-preview {
		padding: clamp(3rem, 6vw, 5rem) 0;
	}

	.playgrounds-preview .container {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2rem;
	}

	.playgrounds-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: 1rem;
		width: 100%;
	}

	.section-cta {
		margin-top: 0.5rem;
	}

	.link-arrow {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
		font-size: 0.9375rem;
		font-weight: 600;
		color: var(--accent);
		transition:
			gap var(--transition-smooth),
			color var(--transition-fast);
	}

	.link-arrow:hover {
		gap: 0.75rem;
		color: var(--text-primary);
	}

	/* --------------------------------------------------------
	   Waitlist
	   -------------------------------------------------------- */
	.waitlist {
		padding: clamp(3rem, 6vw, 5rem) 0 clamp(4rem, 8vw, 6rem);
	}

	.waitlist-inner {
		display: flex;
		gap: 3rem;
		align-items: flex-start;
	}

	.waitlist-text {
		flex: 1;
		min-width: 0;
	}

	/* --------------------------------------------------------
	   Responsive
	   -------------------------------------------------------- */
	@media (max-width: 768px) {
		.waitlist-inner {
			flex-direction: column;
			align-items: stretch;
		}

		.waitlist-inner :global(.form) {
			max-width: 100%;
		}
	}

	@media (max-width: 480px) {
		.hero-ctas {
			flex-direction: column;
			width: 100%;
			padding: 0 1rem;
		}

		.btn {
			width: 100%;
		}
	}
</style>
