<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { locale, t } from '$lib/i18n';

	let currentLocale = $derived($locale);
	let label = $derived($t('lang.switch'));

	function switchTo(targetLang: 'en' | 'fr') {
		if (targetLang === currentLocale) return;
		const currentPath = page.url.pathname;
		const newPath = currentPath.replace(/^\/[a-z]{2}(\/|$)/, `/${targetLang}$1`);
		goto(newPath);
	}
</script>

<div class="lang-toggle" role="radiogroup" aria-label={label}>
	<button
		class="lang-option"
		class:active={currentLocale === 'en'}
		aria-checked={currentLocale === 'en'}
		role="radio"
		onclick={() => switchTo('en')}
	>
		EN
	</button>
	<button
		class="lang-option"
		class:active={currentLocale === 'fr'}
		aria-checked={currentLocale === 'fr'}
		role="radio"
		onclick={() => switchTo('fr')}
	>
		FR
	</button>
</div>

<style>
	.lang-toggle {
		display: flex;
		align-items: center;
		gap: 2px;
		background: var(--bg-subtle);
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-sm);
		padding: 2px;
	}

	.lang-option {
		font-family: var(--font-mono);
		font-size: 0.72rem;
		font-weight: 600;
		letter-spacing: 0.04em;
		padding: 4px 10px;
		border: none;
		border-radius: 4px;
		background: transparent;
		color: var(--text-muted);
		cursor: pointer;
		transition: all var(--transition-fast);
		line-height: 1;
	}

	.lang-option:hover:not(.active) {
		color: var(--text-secondary);
		background: var(--panel-hover);
	}

	.lang-option.active {
		background: var(--accent);
		color: var(--bg);
		box-shadow: 0 1px 4px var(--accent-glow);
	}
</style>
