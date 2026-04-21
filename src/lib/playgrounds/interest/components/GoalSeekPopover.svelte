<script lang="ts">
	import { t } from '$lib/i18n';
	import { currency$ } from '$lib/stores/preferences';
	import { fmtCurrency, fmtPct } from '$lib/format';
	import type { SolveResult } from '../solvers';

	export type CellUnit = 'currency' | 'percent' | 'years' | 'number';

	export interface GoalSeekVariable {
		key: string;
		labelKey: string;
		unit: CellUnit;
	}

	export interface GoalSeekContext {
		/** Column label key (e.g. "int.schedule.runningTotal"). */
		columnLabelKey: string;
		/** Human-readable period identifier (e.g. "3" or "Year 3"). */
		periodLabel: string;
		currentValue: number;
		cellUnit: CellUnit;
	}

	let {
		position,
		context,
		variables,
		solve,
		onApply,
		onClose,
	}: {
		position: { x: number; y: number };
		context: GoalSeekContext;
		variables: GoalSeekVariable[];
		solve: (variableKey: string, target: number) => SolveResult;
		onApply: (variableKey: string, value: number) => void;
		onClose: () => void;
	} = $props();

	let translate = $derived($t);
	let currencyCode = $derived($currency$);

	// svelte-ignore state_referenced_locally
	let targetInput = $state(String(round(context.currentValue, context.cellUnit)));
	// svelte-ignore state_referenced_locally
	let selectedKey = $state(variables[0]?.key ?? '');
	let result = $state<SolveResult | null>(null);

	let selectedVar = $derived(variables.find((v) => v.key === selectedKey) ?? variables[0]);

	function round(v: number, unit: CellUnit): number {
		if (!Number.isFinite(v)) return 0;
		if (unit === 'currency') return Math.round(v * 100) / 100;
		if (unit === 'percent') return Math.round(v * 10000) / 100;
		return Math.round(v * 100) / 100;
	}

	function fmtValue(v: number, unit: CellUnit): string {
		if (!Number.isFinite(v)) return '—';
		if (unit === 'currency') return fmtCurrency(v, currencyCode);
		if (unit === 'percent') return fmtPct(v * 100, 4);
		if (unit === 'years') return `${v.toFixed(2)} y`;
		return v.toFixed(2);
	}

	function runSolve() {
		const raw = Number(targetInput);
		if (!Number.isFinite(raw)) {
			result = { success: false, reason: 'invalid-input' };
			return;
		}
		// If the cell shows a percent, the user types a percent (e.g. 12) but
		// the solver expects a decimal (0.12). Mirror the cell's unit.
		const target = context.cellUnit === 'percent' ? raw / 100 : raw;
		result = solve(selectedKey, target);
	}

	function applyResult() {
		if (result?.success && result.value !== undefined) {
			onApply(selectedKey, result.value);
			onClose();
		}
	}

	function handleKey(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			e.preventDefault();
			onClose();
		}
		if (e.key === 'Enter' && e.target instanceof HTMLInputElement) {
			e.preventDefault();
			runSolve();
		}
	}

	// Clamp popover within viewport so it never overflows on edge clicks.
	let clampedPos = $derived.by(() => {
		const w = 320;
		const h = 260;
		const maxX = typeof window !== 'undefined' ? window.innerWidth - w - 8 : position.x;
		const maxY = typeof window !== 'undefined' ? window.innerHeight - h - 8 : position.y;
		return {
			x: Math.max(8, Math.min(position.x, Math.max(8, maxX))),
			y: Math.max(8, Math.min(position.y, Math.max(8, maxY))),
		};
	});
</script>

<svelte:window onkeydown={handleKey} />

<div
	class="popover-backdrop"
	role="presentation"
	onclick={onClose}
	oncontextmenu={(e) => {
		e.preventDefault();
		onClose();
	}}
></div>

<div
	class="popover"
	role="dialog"
	aria-label={translate('int.goalseek.title')}
	style:left="{clampedPos.x}px"
	style:top="{clampedPos.y}px"
>
	<header class="gp-head">
		<h4 class="gp-title">{translate('int.goalseek.title')}</h4>
		<button class="gp-close" type="button" onclick={onClose} aria-label={translate('int.popover.close')}>×</button>
	</header>

	<div class="gp-context">
		<span class="gp-context-label">{translate(context.columnLabelKey)}</span>
		<span class="gp-context-period">{translate('int.goalseek.atPeriod')} {context.periodLabel}</span>
		<span class="gp-context-current">
			{translate('int.goalseek.current')}: <strong>{fmtValue(context.currentValue, context.cellUnit)}</strong>
		</span>
	</div>

	<div class="gp-body">
		<label class="gp-field">
			<span class="gp-label">{translate('int.goalseek.setTo')}</span>
			<input
				type="number"
				step={context.cellUnit === 'percent' ? '0.01' : '1'}
				class="gp-input"
				bind:value={targetInput}
				onkeydown={handleKey}
			/>
		</label>

		<label class="gp-field">
			<span class="gp-label">{translate('int.goalseek.byChanging')}</span>
			<select
				class="gp-sel"
				value={selectedKey}
				onchange={(e) => {
					selectedKey = (e.target as HTMLSelectElement).value;
					result = null;
				}}
			>
				{#each variables as v (v.key)}
					<option value={v.key}>{translate(v.labelKey)}</option>
				{/each}
			</select>
		</label>

		<button type="button" class="gp-solve" onclick={runSolve}>
			{translate('int.goalseek.solve')}
		</button>
	</div>

	{#if result}
		{#if result.success && result.value !== undefined && selectedVar}
			<div class="gp-result ok">
				<span class="gp-result-label">{translate(selectedVar.labelKey)}</span>
				<span class="gp-result-value">{fmtValue(result.value, selectedVar.unit)}</span>
				{#if result.approximate}
					<span class="gp-result-note">{translate('int.goalseek.approximate')}</span>
				{/if}
				<button type="button" class="gp-apply" onclick={applyResult}>
					{translate('int.goalseek.apply')} →
				</button>
			</div>
		{:else}
			<div class="gp-result err">
				<span class="gp-result-note">
					{translate(
						result.reason === 'invalid-input'
							? 'int.goalseek.invalid'
							: 'int.goalseek.noSolution',
					)}
				</span>
			</div>
		{/if}
	{/if}
</div>

<style>
	.popover-backdrop {
		position: fixed;
		inset: 0;
		background: transparent;
		z-index: 1000;
	}

	.popover {
		position: fixed;
		width: 320px;
		z-index: 1001;
		background: var(--panel);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-lg);
		padding: 0.75rem;
		display: flex;
		flex-direction: column;
		gap: 0.625rem;
	}

	.gp-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding-bottom: 0.375rem;
		border-bottom: 1px solid var(--border-subtle);
	}

	.gp-title {
		margin: 0;
		font-family: var(--font-display);
		font-size: 0.75rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--text-primary);
	}

	.gp-close {
		background: transparent;
		border: none;
		color: var(--text-muted);
		font-size: 1.25rem;
		line-height: 1;
		cursor: pointer;
		padding: 0 0.375rem;
		border-radius: var(--radius-sm);
	}

	.gp-close:hover {
		color: var(--text-primary);
		background: var(--bg-subtle);
	}

	.gp-context {
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
		padding: 0.5rem 0.625rem;
		background: var(--bg-subtle);
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-sm);
	}

	.gp-context-label {
		font-family: var(--font-body);
		font-size: 0.625rem;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--text-muted);
		font-weight: 700;
	}

	.gp-context-period {
		font-family: var(--font-mono);
		font-size: 0.6875rem;
		color: var(--text-secondary);
	}

	.gp-context-current {
		font-family: var(--font-body);
		font-size: 0.75rem;
		color: var(--text-secondary);
	}

	.gp-context-current strong {
		color: var(--text-primary);
		font-family: var(--font-mono);
		font-weight: 700;
	}

	.gp-body {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.gp-field {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.gp-label {
		font-size: 0.625rem;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--text-muted);
		font-weight: 600;
	}

	.gp-input,
	.gp-sel {
		min-height: 36px;
		padding: 0.375rem 0.5rem;
		background: var(--bg-subtle);
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-sm);
		color: var(--text-primary);
		font-family: var(--font-mono);
		font-size: 0.8125rem;
	}

	.gp-sel {
		font-family: var(--font-body);
		cursor: pointer;
	}

	.gp-input:focus,
	.gp-sel:focus {
		outline: none;
		border-color: var(--accent);
	}

	.gp-solve {
		min-height: 36px;
		padding: 0.375rem 0.625rem;
		background: var(--accent);
		border: 1px solid var(--accent);
		border-radius: var(--radius-sm);
		color: var(--bg);
		font-family: var(--font-mono);
		font-size: 0.6875rem;
		font-weight: 700;
		cursor: pointer;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		transition: background var(--transition-fast);
	}

	.gp-solve:hover {
		background: color-mix(in srgb, var(--accent) 85%, white);
	}

	.gp-result {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
		padding: 0.5rem 0.625rem;
		border-radius: var(--radius-sm);
		border: 1px solid var(--border-subtle);
	}

	.gp-result.ok {
		border-color: color-mix(in srgb, var(--green) 30%, transparent);
		background: color-mix(in srgb, var(--green) 6%, transparent);
	}

	.gp-result.err {
		border-color: color-mix(in srgb, var(--error) 30%, transparent);
		background: color-mix(in srgb, var(--error) 6%, transparent);
	}

	.gp-result-label {
		font-family: var(--font-body);
		font-size: 0.625rem;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--text-muted);
		font-weight: 600;
	}

	.gp-result-value {
		font-family: var(--font-mono);
		font-size: 1rem;
		font-weight: 700;
		color: var(--green);
	}

	.gp-result-note {
		font-size: 0.6875rem;
		color: var(--text-muted);
		font-style: italic;
	}

	.gp-apply {
		min-height: 32px;
		padding: 0.3125rem 0.625rem;
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
		align-self: flex-start;
	}

	.gp-apply:hover {
		background: var(--green);
		color: var(--bg);
	}
</style>
