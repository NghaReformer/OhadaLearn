<script lang="ts">
	import { t } from '$lib/i18n';
	import { currency$ } from '$lib/stores/preferences';
	import { fmtCurrency, fmtPct } from '$lib/format';

	let {
		principal,
		interest,
		total,
		effectiveRate = null,
	}: {
		principal: number;
		interest: number;
		total: number;
		effectiveRate?: number | null;
	} = $props();

	let translate = $derived($t);
	let currencyCode = $derived($currency$);

	function money(v: number): string {
		return fmtCurrency(v, currencyCode);
	}
</script>

<section class="summary" aria-label={translate('int.summary.label')}>
	<div class="tile">
		<span class="tile-label">{translate('int.summary.principal')}</span>
		<span class="tile-val">{money(principal)}</span>
	</div>
	<div class="tile">
		<span class="tile-label">{translate('int.summary.interest')}</span>
		<span class="tile-val">{money(interest)}</span>
	</div>
	<div class="tile accent">
		<span class="tile-label">{translate('int.summary.total')}</span>
		<span class="tile-val">{money(total)}</span>
	</div>
	{#if effectiveRate !== null}
		<div class="tile">
			<span class="tile-label">{translate('int.summary.effectiveRate')}</span>
			<span class="tile-val mono">{fmtPct(effectiveRate * 100, 3)}</span>
		</div>
	{/if}
</section>

<style>
	.summary {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
		gap: 0.75rem;
		padding: 0.875rem 1rem;
		background: var(--panel);
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-md);
	}

	.tile {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		padding: 0.5rem 0.75rem;
		background: var(--bg-subtle);
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-sm);
	}

	.tile.accent {
		border-color: color-mix(in srgb, var(--accent) 35%, transparent);
		background: color-mix(in srgb, var(--accent) 6%, transparent);
	}

	.tile-label {
		font-family: var(--font-body);
		font-size: 0.625rem;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--text-muted);
		font-weight: 600;
	}

	.tile-val {
		font-family: var(--font-mono);
		font-size: 1rem;
		font-weight: 700;
		color: var(--text-primary);
		font-variant-numeric: tabular-nums;
	}

	.tile.accent .tile-val {
		color: var(--accent);
	}

	.tile-val.mono {
		font-size: 0.9375rem;
	}
</style>
