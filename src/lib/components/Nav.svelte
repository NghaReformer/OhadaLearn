<script lang="ts">
	import { page } from '$app/state';
	import { t } from '$lib/i18n';
	import LanguageToggle from './LanguageToggle.svelte';

	let { hideLanguageToggle = false }: { hideLanguageToggle?: boolean } = $props();

	let mobileOpen = $state(false);
	let lang = $derived(page.params.lang || 'en');

	function closeMobile() {
		mobileOpen = false;
	}
</script>

<nav class="nav" aria-label="Main navigation">
	<div class="nav-inner">
		<a href={`/${lang}/`} class="brand" onclick={closeMobile}>
			<span class="logo-mark" aria-hidden="true">OL</span>
			<span class="wordmark">OhadaLearn</span>
		</a>

		<button
			class="hamburger"
			class:open={mobileOpen}
			onclick={() => (mobileOpen = !mobileOpen)}
			aria-expanded={mobileOpen}
			aria-label="Toggle menu"
		>
			<span class="bar"></span>
			<span class="bar"></span>
			<span class="bar"></span>
		</button>

		<div class="nav-body" class:open={mobileOpen}>
			<div class="nav-links">
				<a href={`/${lang}/`} class="nav-link" onclick={closeMobile}>{$t('nav.home')}</a>
				<a href={`/${lang}/playgrounds`} class="nav-link" onclick={closeMobile}>{$t('nav.playgrounds')}</a>
			</div>

			<div class="nav-actions">
				{#if !hideLanguageToggle}
					<LanguageToggle />
				{/if}
				<a href={`/${lang}/#waitlist`} class="cta-btn" onclick={closeMobile}>{$t('nav.waitlist')}</a>
			</div>
		</div>
	</div>
</nav>

<style>
	.nav {
		position: sticky;
		top: 0;
		z-index: 100;
		background: color-mix(in srgb, var(--bg) 85%, transparent);
		backdrop-filter: blur(16px) saturate(1.4);
		-webkit-backdrop-filter: blur(16px) saturate(1.4);
		border-bottom: 1px solid var(--border-subtle);
	}

	.nav-inner {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 1.5rem;
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: 60px;
	}

	/* Brand */
	.brand {
		display: flex;
		align-items: center;
		gap: 10px;
		text-decoration: none;
		color: var(--text-primary);
		flex-shrink: 0;
	}

	.brand:hover {
		color: var(--text-primary);
	}

	.logo-mark {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		background: var(--panel);
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		color: var(--accent);
		font-family: var(--font-mono);
		font-size: 0.75rem;
		font-weight: 700;
		letter-spacing: -0.02em;
		line-height: 1;
	}

	.wordmark {
		font-family: var(--font-display);
		font-size: 1.15rem;
		font-weight: 600;
		letter-spacing: -0.01em;
	}

	/* Nav body — links + actions */
	.nav-body {
		display: flex;
		align-items: center;
		gap: 2rem;
	}

	.nav-links {
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}

	.nav-link {
		font-family: var(--font-body);
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--text-secondary);
		padding: 6px 12px;
		border-radius: var(--radius-sm);
		transition: color var(--transition-fast), background var(--transition-fast);
		text-decoration: none;
	}

	.nav-link:hover {
		color: var(--text-primary);
		background: var(--panel-hover);
	}

	.nav-actions {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	/* CTA button */
	.cta-btn {
		font-family: var(--font-body);
		font-size: 0.82rem;
		font-weight: 600;
		color: var(--bg);
		background: var(--accent);
		padding: 7px 18px;
		border-radius: var(--radius-sm);
		text-decoration: none;
		transition: background var(--transition-fast), box-shadow var(--transition-fast), transform var(--transition-fast);
		white-space: nowrap;
	}

	.cta-btn:hover {
		background: var(--accent-dim);
		color: var(--bg);
		box-shadow: var(--shadow-glow);
		transform: translateY(-1px);
	}

	/* Hamburger */
	.hamburger {
		display: none;
		flex-direction: column;
		justify-content: center;
		gap: 5px;
		width: 36px;
		height: 36px;
		padding: 6px;
		background: transparent;
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-sm);
		cursor: pointer;
		z-index: 101;
	}

	.bar {
		display: block;
		width: 100%;
		height: 2px;
		background: var(--text-secondary);
		border-radius: 1px;
		transition: transform var(--transition-smooth), opacity var(--transition-fast);
		transform-origin: center;
	}

	.hamburger.open .bar:nth-child(1) {
		transform: translateY(7px) rotate(45deg);
	}

	.hamburger.open .bar:nth-child(2) {
		opacity: 0;
	}

	.hamburger.open .bar:nth-child(3) {
		transform: translateY(-7px) rotate(-45deg);
	}

	/* Mobile breakpoint */
	@media (max-width: 768px) {
		.hamburger {
			display: flex;
		}

		.nav-body {
			display: none;
			position: absolute;
			top: 60px;
			left: 0;
			right: 0;
			flex-direction: column;
			gap: 0;
			padding: 1rem 1.5rem 1.25rem;
			background: color-mix(in srgb, var(--bg) 95%, transparent);
			backdrop-filter: blur(20px);
			-webkit-backdrop-filter: blur(20px);
			border-bottom: 1px solid var(--border-subtle);
		}

		.nav-body.open {
			display: flex;
		}

		.nav-links {
			flex-direction: column;
			align-items: stretch;
			gap: 0;
			width: 100%;
		}

		.nav-link {
			padding: 10px 12px;
			border-radius: var(--radius-sm);
		}

		.nav-actions {
			margin-top: 0.75rem;
			padding-top: 0.75rem;
			border-top: 1px solid var(--border-subtle);
			width: 100%;
			justify-content: space-between;
		}

		.cta-btn {
			flex: 1;
			text-align: center;
		}
	}
</style>
