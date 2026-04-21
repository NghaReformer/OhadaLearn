<script lang="ts">
	import { t } from '$lib/i18n';
	import { currency$ } from '$lib/stores/preferences';
	import { fmtCurrency, fmtNumber, getCurrencyLocale } from '$lib/format';
	import { calcIndifference } from '../engine';
	import NumberField from '$lib/components/playground/NumberField.svelte';
	import type { IndifferenceInputs } from '../types';

	let {
		inputs,
		onChange,
	}: {
		inputs: IndifferenceInputs;
		onChange: (partial: Partial<IndifferenceInputs>) => void;
	} = $props();

	let translate = $derived($t);
	let currencyCode = $derived($currency$);
	let locale = $derived(getCurrencyLocale(currencyCode));

	let result = $derived(calcIndifference(inputs.fcA, inputs.vA, inputs.fcB, inputs.vB));

	function fmt(v: number): string {
		return fmtCurrency(v, currencyCode);
	}

	function fmtUnits(v: number): string {
		if (!isFinite(v) || v <= 0) return '∞';
		return fmtNumber(Math.ceil(v - 0.0001), 0, locale);
	}
</script>

<div class="compare">
	<header class="cmp-head">
		<h4 class="cmp-title">{translate('cvp.right.compare')}</h4>
	</header>

	<div class="structures">
		<div class="struct struct-a">
			<span class="struct-label">{translate('cvp.compare.structA')}</span>
			<NumberField
				label={translate('cvp.compare.fc')}
				value={inputs.fcA}
				suffix={translate('cvp.general.currency')}
				onChange={(v) => onChange({ fcA: v })}
			/>
			<NumberField
				label={translate('cvp.compare.vc')}
				value={inputs.vA}
				suffix={translate('cvp.general.currency')}
				onChange={(v) => onChange({ vA: v })}
			/>
		</div>

		<div class="struct struct-b">
			<span class="struct-label">{translate('cvp.compare.structB')}</span>
			<NumberField
				label={translate('cvp.compare.fc')}
				value={inputs.fcB}
				suffix={translate('cvp.general.currency')}
				onChange={(v) => onChange({ fcB: v })}
			/>
			<NumberField
				label={translate('cvp.compare.vc')}
				value={inputs.vB}
				suffix={translate('cvp.general.currency')}
				onChange={(v) => onChange({ vB: v })}
			/>
		</div>
	</div>

	<section class="outcome">
		<h5 class="outcome-title">{translate('cvp.compare.indifference')}</h5>

		{#if result.parallel}
			<div class="result-block info">
				<span class="result-icon" aria-hidden="true">◆</span>
				<div class="result-text">
					<p class="result-head">{translate('cvp.compare.parallel')}</p>
					{#if result.dominator}
						<p class="result-sub">
							<strong>{translate('cvp.compare.structA').slice(-1) === result.dominator ? translate('cvp.compare.structA') : translate('cvp.compare.structB')}</strong>
							{translate('cvp.compare.dominated')}
						</p>
					{/if}
				</div>
			</div>
		{:else if result.dominated}
			<div class="result-block warn">
				<span class="result-icon" aria-hidden="true">⚠</span>
				<div class="result-text">
					<p class="result-head">
						{result.dominator === 'A' ? translate('cvp.compare.structA') : translate('cvp.compare.structB')}
						{translate('cvp.compare.dominated')}
					</p>
				</div>
			</div>
		{:else}
			<div class="result-block ok">
				<span class="result-val">{fmtUnits(result.volume)}</span>
				<span class="result-unit">{translate('cvp.compare.units')}</span>
			</div>
			<ul class="rules">
				<li>
					<strong>{result.cheaperBelow === 'A' ? translate('cvp.compare.structA') : translate('cvp.compare.structB')}</strong>
					{translate('cvp.compare.cheaperBelow')} {fmtUnits(result.volume)}
				</li>
				<li>
					<strong>{result.cheaperAbove === 'A' ? translate('cvp.compare.structA') : translate('cvp.compare.structB')}</strong>
					{translate('cvp.compare.cheaperAbove')} {fmtUnits(result.volume)}
				</li>
			</ul>
		{/if}
	</section>
</div>

<style>
	.compare {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		padding: 1rem;
		background: var(--panel);
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-md);
	}

	.cmp-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.cmp-title {
		margin: 0;
		font-family: var(--font-display);
		font-size: 0.8125rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--text-primary);
	}

	.structures {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.75rem;
	}

	.struct {
		display: flex;
		flex-direction: column;
		gap: 0.625rem;
		padding: 0.625rem;
		background: rgba(255, 255, 255, 0.015);
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-sm);
	}

	.struct-a {
		border-left: 2px solid var(--green);
	}

	.struct-b {
		border-left: 2px solid var(--accent);
	}

	.struct-label {
		font-family: var(--font-display);
		font-size: 0.6875rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--text-muted);
	}

	.outcome {
		display: flex;
		flex-direction: column;
		gap: 0.625rem;
		padding-top: 0.75rem;
		border-top: 1px solid var(--border-subtle);
	}

	.outcome-title {
		margin: 0;
		font-family: var(--font-display);
		font-size: 0.6875rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--text-muted);
	}

	.result-block {
		display: flex;
		align-items: baseline;
		gap: 0.5rem;
		padding: 0.75rem;
		border-radius: var(--radius-sm);
		background: rgba(255, 255, 255, 0.02);
		border: 1px solid var(--border-subtle);
	}

	.result-block.ok {
		border-color: color-mix(in srgb, var(--green) 30%, transparent);
		background: color-mix(in srgb, var(--green) 6%, transparent);
	}

	.result-block.warn {
		border-color: color-mix(in srgb, var(--amber) 30%, transparent);
		background: color-mix(in srgb, var(--amber) 6%, transparent);
	}

	.result-block.info {
		border-color: color-mix(in srgb, var(--accent) 30%, transparent);
		background: color-mix(in srgb, var(--accent) 6%, transparent);
	}

	.result-icon {
		font-size: 1rem;
		color: var(--text-muted);
	}

	.result-text {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.result-head {
		margin: 0;
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--text-primary);
	}

	.result-sub {
		margin: 0;
		font-size: 0.75rem;
		color: var(--text-secondary);
	}

	.result-val {
		font-family: var(--font-mono);
		font-size: 1.5rem;
		font-weight: 700;
		color: var(--green);
		letter-spacing: -0.01em;
	}

	.result-unit {
		font-family: var(--font-mono);
		font-size: 0.75rem;
		color: var(--text-muted);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.rules {
		margin: 0;
		padding-left: 1.125rem;
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
		list-style: '▸  ';
	}

	.rules li {
		font-size: 0.75rem;
		color: var(--text-secondary);
		padding-left: 0.25rem;
	}

	.rules strong {
		color: var(--text-primary);
	}
</style>
