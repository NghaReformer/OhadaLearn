<script lang="ts">
	import { onMount } from 'svelte';
	import { env } from '$env/dynamic/public';
	import { t } from '$lib/i18n';
	import FeedbackDrawer from './FeedbackDrawer.svelte';

	let open = $state(false);
	let mounted = $state(false);

	const showBadge = env.PUBLIC_SHOW_FEEDBACK_BADGE !== 'false';

	onMount(() => {
		mounted = true;
		function onKey(e: KeyboardEvent) {
			const isToggle =
				(e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'f';
			if (isToggle) {
				e.preventDefault();
				open = !open;
			}
		}
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	});

	function close() {
		open = false;
	}
</script>

{#if mounted}
	<button
		type="button"
		class="launcher"
		class:hidden={open}
		onclick={() => (open = true)}
		aria-label={$t('feedback.launcher.aria')}
		aria-haspopup="dialog"
		aria-expanded={open}
	>
		<span class="launcher-icon" aria-hidden="true">
			<svg width="16" height="16" viewBox="0 0 24 24" fill="none">
				<path
					d="M4 5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H8l-4 4V5Z"
					stroke="currentColor"
					stroke-width="1.75"
					stroke-linejoin="round"
				/>
			</svg>
		</span>
		<span class="launcher-label">{$t('feedback.launcher.label')}</span>
		{#if showBadge}
			<span class="launcher-badge" aria-hidden="true">{$t('feedback.launcher.badge')}</span>
		{/if}
	</button>

	<FeedbackDrawer {open} onclose={close} />
{/if}

<style>
	.launcher {
		position: fixed;
		bottom: 1.25rem;
		right: 1.25rem;
		z-index: 90;
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		font-family: var(--font-body);
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--text-primary);
		background: var(--panel);
		border: 1px solid var(--border);
		border-radius: 999px;
		padding: 0.625rem 0.95rem 0.625rem 0.85rem;
		cursor: pointer;
		box-shadow: var(--shadow-md);
		transition:
			transform var(--transition-smooth),
			border-color var(--transition-fast),
			background var(--transition-fast),
			box-shadow var(--transition-fast),
			opacity var(--transition-fast);
	}

	.launcher:hover {
		background: var(--panel-hover);
		border-color: var(--accent);
		box-shadow: var(--shadow-glow), var(--shadow-md);
		transform: translateY(-1px);
	}

	.launcher:focus-visible {
		outline: none;
		border-color: var(--accent);
		box-shadow: 0 0 0 3px var(--accent-glow), var(--shadow-md);
	}

	.launcher.hidden {
		opacity: 0;
		pointer-events: none;
		transform: translateY(8px);
	}

	.launcher-icon {
		display: inline-flex;
		color: var(--accent);
	}

	.launcher-label {
		letter-spacing: 0.01em;
	}

	.launcher-badge {
		font-size: 0.65rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--accent);
		background: var(--accent-glow);
		border: 1px solid color-mix(in srgb, var(--accent) 35%, transparent);
		border-radius: 999px;
		padding: 0.15rem 0.45rem;
		margin-left: 0.15rem;
	}

	@media (max-width: 640px) {
		.launcher {
			bottom: 1rem;
			right: 1rem;
			padding: 0.55rem 0.8rem;
			font-size: 0.8125rem;
		}
	}
</style>
