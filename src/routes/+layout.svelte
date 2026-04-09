<script lang="ts">
	import type { Snippet } from 'svelte';
	import { page } from '$app/state';
	import '../app.css';
	import Nav from '$lib/components/Nav.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { defaultTheme, generateCssVars } from '$lib/theme';
	import { buildFontFaceCss } from '$lib/theme/fonts';
	import { locale } from '$lib/i18n';
	import favicon from '$lib/assets/favicon.svg';

	let { children }: { children: Snippet } = $props();

	// Theme-derived values (self-hosted fonts, no CDN dependency)
	const fontFaceCss = buildFontFaceCss(defaultTheme);
	const cssVars = generateCssVars(defaultTheme);

	let isPlaygroundPage = $derived(
		!!page.url.pathname.match(/^\/playgrounds\/[^/]+$/)
	);

	$effect(() => {
		document.documentElement.lang = $locale;
	});
</script>

<!-- Theme injection: self-hosted fonts + CSS variables from centralized token system -->
<svelte:head>
	<link rel="icon" href={favicon} />
	{@html `<style>${fontFaceCss}\n:root{${cssVars}}</style>`}
</svelte:head>

<div class="app-shell">
	<Nav hideLanguageToggle={isPlaygroundPage} />
	<main class="app-main">
		{@render children()}
	</main>
	{#if !isPlaygroundPage}
		<Footer />
	{/if}
</div>

<style>
	.app-shell {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	.app-main {
		flex: 1;
	}
</style>
