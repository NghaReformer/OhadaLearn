<script lang="ts">
	import { t } from '$lib/i18n';

	let {
		scenarioSlug,
	}: {
		scenarioSlug: string | null;
	} = $props();

	let translate = $derived($t);

	// Map slug to framing prompt key; null means no scenario active.
	let framingKey = $derived.by(() => {
		if (!scenarioSlug) return null;
		return `int.scenario.${scenarioSlug}.framing`;
	});
</script>

{#if framingKey}
	<aside class="framing" role="note">
		<span class="framing-label">{translate('int.scenario.frameBadge')}</span>
		<p class="framing-body">{translate(framingKey)}</p>
	</aside>
{/if}

<style>
	.framing {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
		padding: 0.75rem 1rem;
		background: color-mix(in srgb, var(--accent) 6%, transparent);
		border: 1px solid color-mix(in srgb, var(--accent) 25%, transparent);
		border-radius: var(--radius-md);
		border-left: 3px solid var(--accent);
	}

	.framing-label {
		font-family: var(--font-body);
		font-size: 0.625rem;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--accent);
		font-weight: 700;
	}

	.framing-body {
		margin: 0;
		font-family: var(--font-body);
		font-size: 0.8125rem;
		line-height: 1.5;
		color: var(--text-primary);
	}
</style>
