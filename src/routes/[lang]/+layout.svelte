<script lang="ts">
	import type { Snippet } from 'svelte';
	import { page } from '$app/state';
	import Nav from '$lib/components/Nav.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { setLocale } from '$lib/i18n';
	import type { Locale } from '$lib/i18n/types';

	let { children }: { children: Snippet } = $props();

	let lang = $derived(page.params.lang as Locale);

	let isPlaygroundPage = $derived(
		!!page.url.pathname.match(/^\/[a-z]{2}\/playgrounds\/[^/]+$/)
	);

	$effect(() => {
		if (lang) setLocale(lang);
	});

	let currentPath = $derived(page.url.pathname);
	let enPath = $derived(currentPath.replace(/^\/fr(\/|$)/, '/en$1'));
	let frPath = $derived(currentPath.replace(/^\/en(\/|$)/, '/fr$1'));
</script>

<svelte:head>
	<link rel="alternate" hreflang="en" href="https://ohadalearn.com{enPath}" />
	<link rel="alternate" hreflang="fr" href="https://ohadalearn.com{frPath}" />
	<link rel="alternate" hreflang="x-default" href="https://ohadalearn.com{enPath}" />
</svelte:head>

<Nav hideLanguageToggle={isPlaygroundPage} />

<main class="app-main">
	{@render children()}
</main>

{#if !isPlaygroundPage}
	<Footer />
{/if}

<style>
	.app-main {
		flex: 1;
	}
</style>
