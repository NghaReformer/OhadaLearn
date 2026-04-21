<script lang="ts">
	import { t } from '$lib/i18n';
	import type { InterestMode } from '../types';

	let {
		mode,
		continuous = false,
	}: {
		mode: InterestMode;
		continuous?: boolean;
	} = $props();

	let translate = $derived($t);

	let formula = $derived.by(() => {
		if (mode === 'simple') return 'I = P × r × t';
		if (mode === 'compound') return continuous ? 'FV = P × e^(r · t)' : 'FV = P × (1 + r/m)^(m · t)';
		return 'EIR = (1 + r/m)^m − 1';
	});

	let captionKey = $derived.by(() => {
		if (mode === 'simple') return 'int.formula.simple.caption';
		if (mode === 'compound')
			return continuous ? 'int.formula.continuous.caption' : 'int.formula.compound.caption';
		return 'int.formula.eirConversion.caption';
	});
</script>

<section class="formula" aria-label={translate('int.formula.label')}>
	<span class="formula-label">{translate('int.formula.label')}</span>
	<code class="formula-expr">{formula}</code>
	<span class="formula-caption">{translate(captionKey)}</span>
</section>

<style>
	.formula {
		display: flex;
		align-items: center;
		gap: 0.875rem;
		padding: 0.625rem 1rem;
		background: var(--panel);
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-md);
		flex-wrap: wrap;
	}

	.formula-label {
		font-family: var(--font-body);
		font-size: 0.625rem;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--text-muted);
		font-weight: 700;
	}

	.formula-expr {
		font-family: var(--font-mono);
		font-size: 0.9375rem;
		font-weight: 600;
		color: var(--accent);
		background: color-mix(in srgb, var(--accent) 8%, transparent);
		padding: 0.25rem 0.625rem;
		border-radius: var(--radius-sm);
		letter-spacing: 0.02em;
	}

	.formula-caption {
		font-family: var(--font-body);
		font-size: 0.75rem;
		color: var(--text-secondary);
		line-height: 1.35;
		flex: 1;
		min-width: 200px;
	}
</style>
