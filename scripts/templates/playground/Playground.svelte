<script lang="ts">
	import PlaygroundShell from '$lib/components/playground/PlaygroundShell.svelte';
	import { manifest } from './manifest';

	const stateDefaults = {};
</script>

<PlaygroundShell
	{manifest}
	storeKey="__SLUG___v1"
	{stateDefaults}
>
	{#snippet playground(state, updateState)}
		<p>__TITLE__ playground — implement calculator UI here.</p>
	{/snippet}
</PlaygroundShell>
