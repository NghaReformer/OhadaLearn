<script lang="ts">
	import { t } from '$lib/i18n';
	import { currency$ } from '$lib/stores/preferences';
	import { fmtCurrency, fmtPct } from '$lib/format';
	import type { SolveResult } from '../solvers';

	export type GoalSeekUnit = 'currency' | 'percent' | 'years';

	export interface GoalSeekVariableDef {
		key: string;
		labelKey: string;
		unit: GoalSeekUnit;
	}

	export interface GoalSeekTargetDef {
		/** Identifier for the quantity being solved for (e.g., "total", "futureValue", "issuePrice"). */
		key: string;
		labelKey: string;
		unit: GoalSeekUnit;
	}

	let {
		titleKey,
		variables,
		target,
		solve,
		onApply,
	}: {
		titleKey: string;
		variables: GoalSeekVariableDef[];
		target: GoalSeekTargetDef;
		/** Given the chosen variable key and a numeric target value, returns the solver result. */
		solve: (variableKey: string, targetValue: number) => SolveResult;
		/** Apply the solved value back into the main inputs. */
		onApply: (variableKey: string, value: number) => void;
	} = $props();

	let translate = $derived($t);
	let currencyCode = $derived($currency$);

	// svelte-ignore state_referenced_locally
	let selectedKey = $state(variables[0]?.key ?? '');
	let targetInput = $state('');
	let lastResult = $state<SolveResult | null>(null);

	let selectedVar = $derived(variables.find((v) => v.key === selectedKey) ?? variables[0]);

	function runSolve() {
		const parsed = Number(targetInput);
		if (!Number.isFinite(parsed)) {
			lastResult = { success: false, reason: 'invalid-input' };
			return;
		}
		lastResult = solve(selectedKey, parsed);
	}

	function applyResult() {
		if (lastResult?.success && lastResult.value !== undefined) {
			onApply(selectedKey, lastResult.value);
		}
	}

	function fmt(v: number, unit: GoalSeekUnit): string {
		if (!Number.isFinite(v)) return '—';
		if (unit === 'currency') return fmtCurrency(v, currencyCode);
		if (unit === 'percent') return fmtPct(v * 100, 4);
		return v.toFixed(2);
	}
</script>

<section class="gs">
	<header class="gs-head">
		<h4 class="gs-title">{translate(titleKey)}</h4>
	</header>

	<div class="gs-body">
		<label class="gs-field">
			<span class="gs-label">{translate('int.goalseek.solveFor')}</span>
			<select
				class="gs-sel"
				value={selectedKey}
				onchange={(e) => {
					selectedKey = (e.target as HTMLSelectElement).value;
					lastResult = null;
				}}
			>
				{#each variables as v (v.key)}
					<option value={v.key}>{translate(v.labelKey)}</option>
				{/each}
			</select>
		</label>

		<label class="gs-field">
			<span class="gs-label">
				{translate('int.goalseek.targetLabel')} · {translate(target.labelKey)}
				{#if target.unit === 'percent'}
					<span class="gs-unit">(%)</span>
				{/if}
			</span>
			<input
				type="number"
				step={target.unit === 'percent' ? '0.01' : '1'}
				class="gs-input"
				bind:value={targetInput}
			/>
		</label>

		<button type="button" class="gs-solve" onclick={runSolve}>
			{translate('int.goalseek.solve')}
		</button>
	</div>

	{#if lastResult}
		{#if lastResult.success && lastResult.value !== undefined && selectedVar}
			<div class="result-box ok">
				<div class="result-main">
					<span class="result-label">{translate(selectedVar.labelKey)}</span>
					<span class="result-val">{fmt(lastResult.value, selectedVar.unit)}</span>
				</div>
				{#if lastResult.approximate}
					<p class="result-note">{translate('int.goalseek.approximate')}</p>
				{/if}
				<button type="button" class="apply-btn" onclick={applyResult}>
					{translate('int.goalseek.apply')} →
				</button>
			</div>
		{:else}
			<div class="result-box err">
				<p class="result-note">
					{translate(
						lastResult.reason === 'invalid-input'
							? 'int.goalseek.invalid'
							: 'int.goalseek.noSolution',
					)}
				</p>
			</div>
		{/if}
	{/if}
</section>

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

	.gs-unit {
		color: var(--text-dim);
		font-weight: 500;
	}

	.gs-sel,
	.gs-input {
		min-height: 40px;
		padding: 0.5rem 0.625rem;
		background: var(--bg-subtle);
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

	.gs-solve {
		min-height: 40px;
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
		border-color: color-mix(in srgb, var(--green) 30%, transparent);
		background: color-mix(in srgb, var(--green) 6%, transparent);
	}

	.result-box.err {
		border-color: color-mix(in srgb, var(--error) 30%, transparent);
		background: color-mix(in srgb, var(--error) 6%, transparent);
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
		color: var(--green);
	}

	.result-note {
		margin: 0;
		font-size: 0.6875rem;
		color: var(--text-muted);
		font-style: italic;
	}

	.apply-btn {
		min-height: 36px;
		padding: 0.375rem 0.625rem;
		background: transparent;
		border: 1px solid var(--green);
		border-radius: var(--radius-sm);
		color: var(--green);
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
		background: var(--green);
		color: var(--bg);
	}
</style>
