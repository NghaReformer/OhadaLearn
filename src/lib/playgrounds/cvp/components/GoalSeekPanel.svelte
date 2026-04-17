<script lang="ts">
	import { t } from '$lib/i18n';
	import { currency$ } from '$lib/stores/preferences';
	import { CURRENCIES, fmtCurrency, fmtNumber, getCurrencyLocale, parseLocaleNumber } from '$lib/format';
	import { calcSingle } from '../engine';
	import { solve } from '../goal-seek';
	import type { GoalSeekVariable } from '../types';

	let {
		price,
		variableCost,
		fixedCosts,
		volume,
		targetProfit,
		taxRate,
		onApply,
	}: {
		price: number;
		variableCost: number;
		fixedCosts: number;
		volume: number;
		targetProfit: number;
		taxRate: number;
		onApply: (variable: GoalSeekVariable, value: number) => void;
	} = $props();

	let translate = $derived($t);
	let currencyCode = $derived($currency$);
	let currencySymbol = $derived(CURRENCIES[currencyCode]?.symbol ?? '$');
	let locale = $derived(getCurrencyLocale(currencyCode));

	const variables: Array<{ key: GoalSeekVariable; labelKey: string; unit: 'currency' | 'units' | 'percent' }> = [
		{ key: 'price', labelKey: 'cvp.goalseek.price', unit: 'currency' },
		{ key: 'variableCost', labelKey: 'cvp.goalseek.vc', unit: 'currency' },
		{ key: 'fixedCosts', labelKey: 'cvp.goalseek.fc', unit: 'currency' },
		{ key: 'volume', labelKey: 'cvp.goalseek.volume', unit: 'units' },
	];

	let selectedVar = $state<GoalSeekVariable>('volume');
	let targetProfitInput = $state('');
	let lastResult = $state<{ success: boolean; value?: number; approximate?: boolean; reason?: string } | null>(null);

	$effect(() => {
		if (targetProfitInput === '') {
			targetProfitInput = fmtNumber(targetProfit || 20000, 0, locale);
		}
	});

	function runSolve() {
		const parsedTarget = parseLocaleNumber(targetProfitInput);
		if (isNaN(parsedTarget)) {
			lastResult = { success: false, reason: 'invalid-input' };
			return;
		}

		const evaluate = (x: number): number => {
			const p = selectedVar === 'price' ? x : price;
			const v = selectedVar === 'variableCost' ? x : variableCost;
			const fc = selectedVar === 'fixedCosts' ? x : fixedCosts;
			const q = selectedVar === 'volume' ? x : volume;
			return calcSingle(p, v, fc, q, targetProfit, taxRate).operatingIncome;
		};

		const result = solve({
			evaluate,
			target: parsedTarget,
			variable: selectedVar,
		});

		lastResult = result;
	}

	function applyResult() {
		if (lastResult?.success && lastResult.value !== undefined) {
			onApply(selectedVar, lastResult.value);
		}
	}

	function formatValue(v: number, unit: string): string {
		if (unit === 'currency') return fmtCurrency(v, currencyCode);
		return fmtNumber(v, 2, locale);
	}

	let selectedUnit = $derived(variables.find((x) => x.key === selectedVar)?.unit ?? 'currency');
</script>

<div class="gs">
	<header class="gs-head">
		<h4 class="gs-title">{translate('cvp.goalseek.header')}</h4>
	</header>

	<div class="gs-body">
		<label class="gs-field">
			<span class="gs-label">{translate('cvp.goalseek.solveFor')}</span>
			<select
				class="gs-sel"
				value={selectedVar}
				onchange={(e) => {
					selectedVar = (e.target as HTMLSelectElement).value as GoalSeekVariable;
					lastResult = null;
				}}
			>
				{#each variables as v (v.key)}
					<option value={v.key}>{translate(v.labelKey)}</option>
				{/each}
			</select>
		</label>

		<label class="gs-field">
			<span class="gs-label">{translate('cvp.input.targetProfit')}</span>
			<div class="gs-input-wrap">
				<input
					type="text"
					inputmode="decimal"
					class="gs-input"
					bind:value={targetProfitInput}
				/>
				<span class="gs-suffix">{currencySymbol}</span>
			</div>
		</label>

		<button type="button" class="gs-solve" onclick={runSolve}>
			{translate('cvp.goalseek.apply')}
		</button>
	</div>

	{#if lastResult}
		{#if lastResult.success && lastResult.value !== undefined}
			<div class="result-box ok">
				<div class="result-main">
					<span class="result-label">{translate(variables.find((x) => x.key === selectedVar)?.labelKey ?? '')}</span>
					<span class="result-val">{formatValue(lastResult.value, selectedUnit)}</span>
				</div>
				{#if lastResult.approximate}
					<p class="result-note">{translate('cvp.goalseek.approximate')}</p>
				{/if}
				<button type="button" class="apply-btn" onclick={applyResult}>
					{translate('cvp.goalseek.apply')} →
				</button>
			</div>
		{:else}
			<div class="result-box err">
				<p class="result-note">{translate('cvp.goalseek.noSolution')}</p>
			</div>
		{/if}
	{/if}
</div>

<style>
	.gs {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		padding: 1rem;
		background: var(--panel);
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-md);
	}

	.gs-head {
		display: flex;
		align-items: center;
	}

	.gs-title {
		margin: 0;
		font-family: var(--font-display);
		font-size: 0.8125rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--text-primary);
	}

	.gs-body {
		display: flex;
		flex-direction: column;
		gap: 0.625rem;
	}

	.gs-field {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.gs-label {
		font-size: 0.625rem;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--text-muted);
		font-weight: 600;
	}

	.gs-sel,
	.gs-input {
		padding: 0.375rem 0.5rem;
		background: rgba(255, 255, 255, 0.02);
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-sm);
		color: var(--text-primary);
		font-family: var(--font-mono);
		font-size: 0.8125rem;
	}

	.gs-sel {
		font-family: var(--font-body);
		cursor: pointer;
	}

	.gs-sel:focus,
	.gs-input:focus {
		outline: none;
		border-color: var(--accent);
	}

	.gs-input-wrap {
		position: relative;
	}

	.gs-input {
		width: 100%;
		padding-right: 2.25rem;
	}

	.gs-suffix {
		position: absolute;
		right: 0.5rem;
		top: 50%;
		transform: translateY(-50%);
		color: var(--text-muted);
		font-family: var(--font-mono);
		font-size: 0.75rem;
		pointer-events: none;
	}

	.gs-solve {
		padding: 0.5rem 0.875rem;
		background: var(--accent);
		border: 1px solid var(--accent);
		border-radius: var(--radius-sm);
		color: var(--bg);
		font-family: var(--font-mono);
		font-size: 0.75rem;
		font-weight: 700;
		cursor: pointer;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		transition: background var(--transition-fast);
	}

	.gs-solve:hover {
		background: color-mix(in srgb, var(--accent) 85%, white);
	}

	.result-box {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		padding: 0.75rem;
		border-radius: var(--radius-sm);
		border: 1px solid var(--border-subtle);
	}

	.result-box.ok {
		border-color: color-mix(in srgb, #2dd4a0 30%, transparent);
		background: color-mix(in srgb, #2dd4a0 6%, transparent);
	}

	.result-box.err {
		border-color: color-mix(in srgb, #f0605e 30%, transparent);
		background: color-mix(in srgb, #f0605e 6%, transparent);
	}

	.result-main {
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
	}

	.result-label {
		font-size: 0.625rem;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--text-muted);
	}

	.result-val {
		font-family: var(--font-mono);
		font-size: 1.125rem;
		font-weight: 700;
		color: #2dd4a0;
	}

	.result-note {
		margin: 0;
		font-size: 0.6875rem;
		color: var(--text-muted);
		font-style: italic;
	}

	.apply-btn {
		padding: 0.375rem 0.625rem;
		background: transparent;
		border: 1px solid #2dd4a0;
		border-radius: var(--radius-sm);
		color: #2dd4a0;
		font-family: var(--font-mono);
		font-size: 0.6875rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		cursor: pointer;
		transition:
			background var(--transition-fast),
			color var(--transition-fast);
	}

	.apply-btn:hover {
		background: #2dd4a0;
		color: var(--bg);
	}
</style>
