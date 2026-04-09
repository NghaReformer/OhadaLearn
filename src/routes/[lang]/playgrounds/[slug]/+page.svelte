<script lang="ts">
	import { page } from '$app/state';
	import { t } from '$lib/i18n';
	import { locale$, currency$ } from '$lib/stores/preferences';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let lang = $derived(page.params.lang);
	let pg = $derived(data.pg);
	let iframeEl: HTMLIFrameElement | undefined = $state();
	let iframeLoaded = $state(false);
	let isFullscreen = $state(false);

	// ─── Sync shell language/currency into iframe playgrounds ───
	// The existing HTML playgrounds have independent i18n/currency selectors.
	// This postMessage bridge keeps them in sync with the SvelteKit shell.
	function syncIframeSettings() {
		if (!iframeEl?.contentWindow || !iframeLoaded) return;
		iframeEl.contentWindow.postMessage(
			{ type: 'ohadalearn:settings', locale: $locale$, currency: $currency$ },
			'*'
		);
	}

	$effect(() => {
		// Re-sync whenever locale or currency changes
		if ($locale$ && $currency$ && iframeLoaded) syncIframeSettings();
	});

	function onIframeLoad() {
		iframeLoaded = true;
		syncIframeSettings();
	}

	function toggleFullscreen() {
		if (!iframeEl) return;
		if (!document.fullscreenElement) {
			iframeEl.requestFullscreen();
			isFullscreen = true;
		} else {
			document.exitFullscreen();
			isFullscreen = false;
		}
	}
</script>

<svelte:head>
	<title>{$t(pg.titleKey)} — OhadaLearn</title>
</svelte:head>

<div class="pg-wrapper">
	<header class="pg-header">
		<div class="pg-header-left">
			<a href={`/${lang}/playgrounds`} class="back-link">
				<svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
					<path d="M10 4l-4 4 4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
				</svg>
				{$t('playgrounds.back')}
			</a>
		</div>
		<div class="pg-header-center">
			<span class="pg-icon" aria-hidden="true">{pg.icon}</span>
			<h1 class="pg-title">{$t(pg.titleKey)}</h1>
			<span class="pg-badge">{$t('badge.free')}</span>
		</div>
		<div class="pg-header-right">
			<button class="fullscreen-btn" onclick={toggleFullscreen} aria-label={$t('playgrounds.fullscreen')}>
				{#if isFullscreen}
					<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
						<path d="M6 2v4H2M10 14v-4h4M2 10h4v4M14 6h-4V2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
					</svg>
					<span class="fullscreen-label">{$t('playgrounds.exit_fullscreen')}</span>
				{:else}
					<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
						<path d="M2 6V2h4M14 10v4h-4M2 10v4h4M14 6V2h-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
					</svg>
					<span class="fullscreen-label">{$t('playgrounds.fullscreen')}</span>
				{/if}
			</button>
		</div>
	</header>

	<div class="iframe-container">
		{#if !iframeLoaded}
			<div class="iframe-loading">
				<div class="spinner"></div>
				<span>{$t('playgrounds.loading')}</span>
			</div>
		{/if}
		<iframe
			bind:this={iframeEl}
			src={pg.staticFile}
			title={$t(pg.titleKey)}
			sandbox="allow-scripts allow-same-origin allow-popups"
			class:loaded={iframeLoaded}
			onload={onIframeLoad}
		></iframe>
	</div>
</div>

<style>
	.pg-wrapper {
		display: flex;
		flex-direction: column;
		height: calc(100vh - 60px);
	}

	/* ---- Header bar ---- */
	.pg-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.625rem 1.25rem;
		background: var(--panel);
		border-bottom: 1px solid var(--border-subtle);
		flex-shrink: 0;
		gap: 0.75rem;
	}

	.pg-header-left,
	.pg-header-right {
		flex: 0 0 auto;
		min-width: 0;
	}

	.pg-header-center {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		min-width: 0;
	}

	.back-link {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		font-size: 0.8125rem;
		font-weight: 500;
		color: var(--text-muted);
		text-decoration: none;
		white-space: nowrap;
		transition: color var(--transition-fast);
	}

	.back-link:hover {
		color: var(--accent);
	}

	.pg-icon {
		font-size: 1.125rem;
		line-height: 1;
		flex-shrink: 0;
	}

	.pg-title {
		font-family: var(--font-display);
		font-size: 0.9375rem;
		font-weight: 600;
		color: var(--text-primary);
		line-height: 1.3;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.pg-badge {
		font-family: var(--font-mono);
		font-size: 0.65rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--green);
		background: var(--green-glow);
		padding: 2px 7px;
		border-radius: var(--radius-sm);
		flex-shrink: 0;
	}

	.fullscreen-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
		font-family: var(--font-mono);
		font-size: 0.75rem;
		font-weight: 500;
		color: var(--text-secondary);
		background: var(--panel);
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		padding: 5px 10px;
		cursor: pointer;
		white-space: nowrap;
		transition:
			color var(--transition-fast),
			border-color var(--transition-fast),
			background var(--transition-fast);
	}

	.fullscreen-btn:hover {
		color: var(--text-primary);
		border-color: var(--accent);
		background: var(--panel-hover);
	}

	/* ---- Iframe container ---- */
	.iframe-container {
		position: relative;
		flex: 1;
		border-top: 1px solid var(--border-subtle);
	}

	.iframe-loading {
		position: absolute;
		inset: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 1rem;
		color: var(--text-muted);
		font-size: 0.875rem;
		z-index: 1;
	}

	.spinner {
		width: 32px;
		height: 32px;
		border: 3px solid var(--border);
		border-top-color: var(--accent);
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	iframe {
		width: 100%;
		height: 100%;
		border: none;
		opacity: 0;
		transition: opacity 0.3s ease;
	}

	iframe.loaded {
		opacity: 1;
	}

	/* ---- Responsive ---- */
	@media (max-width: 768px) {
		.fullscreen-btn {
			display: none;
		}

		.pg-header {
			flex-wrap: wrap;
			justify-content: center;
			padding: 0.5rem 1rem;
		}

		.pg-header-left {
			order: 1;
			width: 100%;
			text-align: center;
		}

		.pg-header-center {
			order: 2;
		}

		.pg-header-right {
			display: none;
		}

		.pg-title {
			font-size: 0.8125rem;
		}
	}
</style>
