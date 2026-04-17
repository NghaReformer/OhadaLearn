<script lang="ts">
	import PlaygroundLearn from '$lib/components/playground/PlaygroundLearn.svelte';
	import type { LearnSection } from '$lib/content/types';

	let { sections = [] }: { sections: LearnSection[] } = $props();
</script>

<PlaygroundLearn {sections} />
