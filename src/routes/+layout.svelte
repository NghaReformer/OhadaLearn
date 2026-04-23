<script lang="ts">
	import type { Snippet } from 'svelte';
	import '../app.css';
	import { defaultTheme, generateCssVars } from '$lib/theme';
	import { buildFontFaceCss } from '$lib/theme/fonts';
	import { locale } from '$lib/i18n';
	import FeedbackLauncher from '$lib/components/feedback/FeedbackLauncher.svelte';
	import favicon from '$lib/assets/favicon.svg';

	let { children }: { children: Snippet } = $props();

	const fontFaceCss = buildFontFaceCss(defaultTheme);
	const cssVars = generateCssVars(defaultTheme);

	$effect(() => {
		document.documentElement.lang = $locale;
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	{@html `<style>${fontFaceCss}\n:root{${cssVars}}</style>`}
</svelte:head>

<div class="app-shell">
	{@render children()}
</div>

<FeedbackLauncher />

<style>
	.app-shell {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}
</style>
