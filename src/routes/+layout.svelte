<script lang="ts">
	import type { Snippet } from 'svelte';
	import { page } from '$app/state';
	import '../app.css';
	import Nav from '$lib/components/Nav.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import {
		defaultTheme,
		buildGoogleFontsUrl,
		buildPreconnectLinks,
		generateCssVars,
	} from '$lib/theme';
	import { locale } from '$lib/i18n';
	import favicon from '$lib/assets/favicon.svg';

	let { children }: { children: Snippet } = $props();

	const preconnects = buildPreconnectLinks();
	const fontsUrl = buildGoogleFontsUrl(defaultTheme);
	const cssVars = generateCssVars(defaultTheme);

	let isPlaygroundPage = $derived(
		!!page.url.pathname.match(/^\/playgrounds\/[^/]+$/)
	);

	$effect(() => {
		document.documentElement.lang = $locale;
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	{#each preconnects as href}
		<link rel="preconnect" href={href} crossorigin="anonymous" />
	{/each}
	<link rel="stylesheet" href={fontsUrl} />
	{@html `<style>:root{${cssVars}}</style>`}
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
