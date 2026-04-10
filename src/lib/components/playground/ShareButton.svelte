<script lang="ts">
	import { t } from '$lib/i18n';

	let { url }: { url: string } = $props();

	let copied = $state(false);
	let timer: ReturnType<typeof setTimeout> | null = null;

	async function handleCopy() {
		try {
			if (navigator.clipboard && window.isSecureContext) {
				await navigator.clipboard.writeText(url);
			} else {
				// Fallback for older browsers or non-secure contexts
				const textarea = document.createElement('textarea');
				textarea.value = url;
				textarea.style.position = 'fixed';
				textarea.style.left = '-9999px';
				textarea.style.opacity = '0';
				document.body.appendChild(textarea);
				textarea.select();
				document.execCommand('copy');
				document.body.removeChild(textarea);
			}

			copied = true;
			if (timer) clearTimeout(timer);
			timer = setTimeout(() => {
				copied = false;
			}, 2000);
		} catch {
			// Silently fail — user can manually copy from URL bar
		}
	}
</script>

<button class="share-btn" class:copied onclick={handleCopy} type="button" title={$t('shell.share')}>
	{#if copied}
		<svg class="icon" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
			<path d="M3 8.5l3.5 3.5L13 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
		</svg>
		<span class="label">{$t('shell.copied')}</span>
	{:else}
		<svg class="icon" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
			<path d="M10.5 1.5h-7a1 1 0 00-1 1v9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
			<rect x="5.5" y="3.5" width="8" height="11" rx="1" stroke="currentColor" stroke-width="1.5"/>
		</svg>
		<span class="label">{$t('shell.share')}</span>
	{/if}
</button>

<style>
	.share-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.4375rem 0.75rem;
		background: var(--bg-subtle);
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-md);
		color: var(--text-secondary);
		font-family: var(--font-body);
		font-size: 0.8125rem;
		font-weight: 500;
		cursor: pointer;
		transition:
			border-color var(--transition-fast),
			color var(--transition-fast),
			background var(--transition-fast);
		white-space: nowrap;
	}

	.share-btn:hover {
		border-color: var(--accent);
		color: var(--accent);
	}

	.share-btn:active {
		background: var(--panel-hover);
	}

	.share-btn.copied {
		border-color: var(--green);
		color: var(--green);
		background: var(--green-glow);
	}

	.icon {
		flex-shrink: 0;
	}

	.label {
		line-height: 1;
	}

	@media (max-width: 480px) {
		.label {
			display: none;
		}

		.share-btn {
			padding: 0.4375rem;
		}
	}
</style>
