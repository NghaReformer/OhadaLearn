<script lang="ts">
	import PlaygroundShell from '$lib/components/playground/PlaygroundShell.svelte';
	import { manifest } from './manifest';

	const stateDefaults = {};
</script>

<PlaygroundShell
	{manifest}
	storeKey="journal-entry_v1"
	{stateDefaults}
>
	{#snippet playground(state, updateState)}
		<p>Journal Entries playground — implement calculator UI here.</p>
	{/snippet}
</PlaygroundShell>
