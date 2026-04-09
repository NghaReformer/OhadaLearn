<script lang="ts">
	import { page } from '$app/state';
	import { t } from '$lib/i18n';

	let status = $derived(page.status);
	let message = $derived(
		page.error?.message ||
			(status === 404 ? $t('error.not_found') : $t('error.generic'))
	);
</script>

<div class="error-page">
	<span class="error-code">{status}</span>
	<p class="error-message">{message}</p>
	<a href="/" class="error-link">{$t('error.back_home')}</a>
</div>

<style>
	.error-page {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 60vh;
		text-align: center;
		padding: 2rem;
		gap: 1rem;
	}

	.error-code {
		font-family: var(--font-display);
		font-size: clamp(4rem, 12vw, 8rem);
		font-weight: 700;
		line-height: 1;
		color: var(--accent);
		opacity: 0.9;
		letter-spacing: -0.04em;
	}

	.error-message {
		font-size: 1.1rem;
		color: var(--text-secondary);
		max-width: 36ch;
	}

	.error-link {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		margin-top: 0.5rem;
		font-size: 0.9rem;
		font-weight: 500;
		color: var(--accent);
		padding: 8px 20px;
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		text-decoration: none;
		transition: background var(--transition-fast), border-color var(--transition-fast);
	}

	.error-link:hover {
		background: var(--panel-hover);
		border-color: var(--accent-dim);
		color: var(--text-primary);
	}
</style>
