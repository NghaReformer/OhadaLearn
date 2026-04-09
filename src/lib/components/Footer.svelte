<script lang="ts">
	import { t } from '$lib/i18n';

	let year = new Date().getFullYear();
	let copyright = $derived($t('footer.copyright').replace('{year}', String(year)));
</script>

<footer class="footer">
	<div class="footer-inner">
		<div class="footer-brand">
			<span class="footer-name">OhadaLearn</span>
			<p class="footer-tagline">{$t('footer.tagline')}</p>
		</div>

		<div class="footer-links">
			<a href="/playgrounds">{$t('footer.links.playgrounds')}</a>
			<a href="/waitlist">{$t('footer.links.waitlist')}</a>
		</div>

		<p class="footer-copy">{copyright}</p>
	</div>
</footer>

<style>
	.footer {
		border-top: 1px solid var(--border-subtle);
		padding: 2.5rem 1.5rem 2rem;
		margin-top: auto;
	}

	.footer-inner {
		max-width: 1200px;
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1.25rem;
		text-align: center;
	}

	.footer-name {
		font-family: var(--font-display);
		font-weight: 600;
		font-size: 1rem;
		color: var(--text-secondary);
	}

	.footer-tagline {
		font-size: 0.82rem;
		color: var(--text-muted);
		margin-top: 0.25rem;
		line-height: 1.4;
	}

	.footer-links {
		display: flex;
		gap: 1.5rem;
	}

	.footer-links a {
		font-size: 0.82rem;
		color: var(--text-muted);
		text-decoration: none;
		transition: color var(--transition-fast);
	}

	.footer-links a:hover {
		color: var(--accent);
	}

	.footer-copy {
		font-size: 0.75rem;
		color: var(--text-muted);
		opacity: 0.7;
	}
</style>
