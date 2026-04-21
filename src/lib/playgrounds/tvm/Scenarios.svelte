<script lang="ts">
	import PlaygroundScenarios from '$lib/components/playground/PlaygroundScenarios.svelte';
	import type { Scenario } from '$lib/content/types';

	let { scenarios = [], onSelect }: {
		scenarios: Scenario[];
		onSelect: (presetValues: Record<string, unknown>) => void;
	} = $props();
</script>

<PlaygroundScenarios {scenarios} {onSelect} />
