<script lang="ts">
	import { t } from '$lib/i18n';
	import { currency$ } from '$lib/stores/preferences';
	import { fmtCurrency, fmtNumber, fmtPct } from '$lib/format';
	import type { SolveResult, ValidationError, ValidationResult } from '../types';

	let {
		result,
		validation
	}: {
		result: SolveResult | null;
		validation: ValidationResult;
	} = $props();

	let currency = $derived($currency$);
	let translate = $derived($t);
	let copied = $state(false);

	let headlineText = $derived.by(() => {
		if (!result) return '';
		switch (result.mode) {
			case 'rate':
				return fmtPct(result.value, 4);
			case 'periods':
				return `${fmtNumber(result.value, 2)} ${translate(`tvm.unit.${result.mode === 'periods' ? 'years' : 'years'}`)}`;
			default:
				return fmtCurrency(result.value, currency);
		}
	});

	let interpretationKey = $derived(result ? `tvm.result.interpretation.${result.mode}` : '');

	function renderError(err: ValidationError): string {
		const msg = translate(err.key);
		if (!err.params) return msg;
		return msg.replace(/\{(\w+)\}/g, (_, name: string) => {
			const value = err.params?.[name];
			if (value === undefined) return `{${name}}`;
			if (typeof value === 'string' && value.startsWith('tvm.')) {
				return translate(value);
			}
			return String(value);
		});
	}

	async function copyValue() {
		if (!result) return;
		try {
			await navigator.clipboard.writeText(headlineText);
			copied = true;
			setTimeout(() => (copied = false), 1600);
		} catch {
			/* clipboard may be unavailable — ignore */
		}
	}
</script>

<section class="result">
	<header class="result-head">
		<p class="eyebrow">{$t('tvm.panel.result')}</p>
		<h3 class="result-title">{$t(`tvm.mode.${result?.mode ?? 'fv'}`)}</h3>
	</header>

	{#if !validation.valid && validation.errors.length > 0}
		<ul class="error-list" role="alert">
			{#each validation.errors as err, i (i)}
				<li class="error-item">{renderError(err)}</li>
			{/each}
		</ul>
	{:else if result}
		<div class="headline">
			<output class="headline-value" class:outflow={result.signNote === 'outflow'} class:inflow={result.signNote === 'inflow'}>
				{headlineText}
			</output>
			<button
				class="copy-btn"
				type="button"
				aria-label={$t('tvm.result.copy')}
				title={$t('tvm.result.copy')}
				onclick={copyValue}
			>
				{#if copied}
					<svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
						<path d="M3 8.5l3.5 3.5L13 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
					</svg>
					<span>{$t('tvm.result.copied')}</span>
				{:else}
					<svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
						<rect x="4.5" y="4.5" width="8" height="9" rx="1.25" stroke="currentColor" stroke-width="1.5" />
						<path d="M3 11V3a1 1 0 0 1 1-1h7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
					</svg>
					<span>{$t('tvm.result.copy')}</span>
				{/if}
			</button>
		</div>

		<p class="interpretation">{$t(interpretationKey)}</p>

		{#if result.signNote !== 'neutral' && (result.mode === 'pv' || result.mode === 'fv' || result.mode === 'pmt')}
			<div class="sign-banner" class:sign-outflow={result.signNote === 'outflow'} class:sign-inflow={result.signNote === 'inflow'}>
				<span class="sign-mark" aria-hidden="true">
					{#if result.signNote === 'outflow'}&#x2296;{:else}&#x2295;{/if}
				</span>
				<div class="sign-copy">
					<span class="sign-label">
						{result.signNote === 'outflow' ? $t('tvm.signConvention.outflow') : $t('tvm.signConvention.inflow')}
					</span>
					<span class="sign-explain">{$t('tvm.signConvention.explain')}</span>
				</div>
			</div>
		{/if}
	{:else}
		<p class="pending">{$t('tvm.result.pending')}</p>
	{/if}
</section>

<style>
	.result {
		display: flex;
		flex-direction: column;
		gap: 0.875rem;
		padding: 1.125rem 1.25rem;
		background: var(--panel);
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-lg);
	}

	.result-head {
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
	}

	.eyebrow {
		margin: 0;
		font-family: var(--font-body);
		font-size: 0.6875rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--text-muted);
	}

	.result-title {
		margin: 0;
		font-family: var(--font-display);
		font-size: 1rem;
		font-weight: 600;
		color: var(--text-primary);
	}

	/* ── Headline ── */
	.headline {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 0.75rem;
	}

	.headline-value {
		font-family: var(--font-mono);
		font-size: 2rem;
		font-weight: 700;
		letter-spacing: -0.01em;
		color: var(--text-primary);
		line-height: 1.1;
		word-break: break-word;
	}

	.headline-value.outflow {
		color: color-mix(in srgb, var(--error) 85%, var(--text-primary));
	}

	.headline-value.inflow {
		color: var(--green);
	}

	.copy-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.375rem 0.625rem;
		background: var(--bg-subtle);
		color: var(--text-secondary);
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-sm);
		font-family: var(--font-body);
		font-size: 0.75rem;
		font-weight: 500;
		cursor: pointer;
		transition: all var(--transition-fast);
		flex-shrink: 0;
	}

	.copy-btn:hover {
		color: var(--text-primary);
		border-color: var(--accent);
		background: var(--panel-hover);
	}

	.interpretation {
		margin: 0;
		font-family: var(--font-body);
		font-size: 0.875rem;
		line-height: 1.45;
		color: var(--text-secondary);
	}

	.pending {
		margin: 0;
		padding: 1.5rem 0.5rem;
		text-align: center;
		font-family: var(--font-body);
		font-size: 0.8125rem;
		color: var(--text-muted);
	}

	/* ── Sign banner ── */
	.sign-banner {
		display: flex;
		align-items: center;
		gap: 0.625rem;
		padding: 0.625rem 0.75rem;
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-md);
		background: var(--bg-subtle);
	}

	.sign-outflow {
		border-color: color-mix(in srgb, var(--error) 35%, transparent);
		background: color-mix(in srgb, var(--error) 6%, var(--bg-subtle));
	}

	.sign-inflow {
		border-color: color-mix(in srgb, var(--green) 35%, transparent);
		background: color-mix(in srgb, var(--green) 6%, var(--bg-subtle));
	}

	.sign-mark {
		font-family: var(--font-mono);
		font-size: 1.25rem;
		line-height: 1;
		color: var(--text-primary);
	}

	.sign-outflow .sign-mark {
		color: var(--error);
	}

	.sign-inflow .sign-mark {
		color: var(--green);
	}

	.sign-copy {
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
		min-width: 0;
	}

	.sign-label {
		font-family: var(--font-body);
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: var(--text-primary);
	}

	.sign-explain {
		font-family: var(--font-body);
		font-size: 0.75rem;
		color: var(--text-muted);
		line-height: 1.35;
	}

	/* ── Errors ── */
	.error-list {
		list-style: none;
		margin: 0;
		padding: 0.625rem 0.75rem;
		background: color-mix(in srgb, var(--error) 8%, transparent);
		border: 1px solid color-mix(in srgb, var(--error) 30%, transparent);
		border-radius: var(--radius-sm);
	}

	.error-item {
		color: var(--error);
		font-family: var(--font-body);
		font-size: 0.8125rem;
		padding: 0.125rem 0;
	}

	.error-item::before {
		content: '\2022  ';
		color: var(--error);
	}
</style>
