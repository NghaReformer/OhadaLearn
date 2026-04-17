<script lang="ts">
	import { t } from '$lib/i18n';
	import { fmtNumber, fmtPct } from '$lib/format';
	import type { SolveResult } from '../types';

	let {
		result,
		open,
		onToggle
	}: {
		result: SolveResult | null;
		open: boolean;
		onToggle: (next: boolean) => void;
	} = $props();

	let translate = $derived($t);
</script>

<section class="workings" class:open>
	<button
		class="workings-toggle"
		type="button"
		aria-expanded={open}
		onclick={() => onToggle(!open)}
	>
		<span class="toggle-label">
			{open ? $t('tvm.advanced.hide') : $t('tvm.advanced.toggle')}
		</span>
		<svg
			class="toggle-chevron"
			class:rotated={open}
			width="12"
			height="12"
			viewBox="0 0 16 16"
			fill="none"
			aria-hidden="true"
		>
			<path
				d="M4 6l4 4 4-4"
				stroke="currentColor"
				stroke-width="1.5"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
		</svg>
	</button>

	{#if open && result}
		<div class="workings-body">
			<header class="workings-head">
				<h4 class="workings-title">{$t('tvm.advanced.title')}</h4>
				<span class="formula-badge" title={$t(result.formulaKey)}>ƒ</span>
			</header>

			<dl class="steps">
				<div class="step">
					<dt>{$t('tvm.workings.effectiveRate')}</dt>
					<dd class="mono">{fmtPct(result.effectivePeriodicRate * 100, 6)}</dd>
				</div>
				<div class="step">
					<dt>{$t('tvm.workings.totalPeriods')}</dt>
					<dd class="mono">{fmtNumber(result.totalPeriods, 4)}</dd>
				</div>
			</dl>

			<div class="formula">
				<span class="formula-label">{$t(`tvm.workings.solve.${result.mode}`)}</span>
				<code class="formula-expr">{$t(result.formulaKey)}</code>
			</div>
		</div>
	{/if}
</section>

<style>
	.workings {
		display: flex;
		flex-direction: column;
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-md);
		background: var(--panel);
		overflow: hidden;
	}

	.workings-toggle {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
		padding: 0.625rem 0.875rem;
		background: transparent;
		border: none;
		cursor: pointer;
		font-family: var(--font-body);
		font-size: 0.8125rem;
		font-weight: 500;
		color: var(--text-secondary);
		transition: color var(--transition-fast), background var(--transition-fast);
	}

	.workings-toggle:hover {
		color: var(--text-primary);
		background: var(--panel-hover);
	}

	.toggle-label {
		flex: 1;
		text-align: left;
	}

	.toggle-chevron {
		color: var(--text-muted);
		transition: transform var(--transition-fast);
	}

	.toggle-chevron.rotated {
		transform: rotate(180deg);
	}

	/* ── Body ── */
	.workings-body {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		padding: 0.75rem 0.875rem 0.875rem;
		border-top: 1px solid var(--border-subtle);
		background: var(--bg-subtle);
	}

	.workings-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.workings-title {
		margin: 0;
		font-family: var(--font-body);
		font-size: 0.6875rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--text-muted);
	}

	.formula-badge {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 22px;
		height: 22px;
		border-radius: 50%;
		background: color-mix(in srgb, var(--accent) 15%, transparent);
		color: var(--accent);
		font-family: var(--font-mono);
		font-style: italic;
		font-size: 0.75rem;
		font-weight: 600;
	}

	.steps {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
		margin: 0;
	}

	.step {
		display: grid;
		grid-template-columns: 1fr auto;
		align-items: baseline;
		gap: 0.75rem;
		padding: 0.3125rem 0;
		border-bottom: 1px dashed var(--border-subtle);
	}

	.step:last-child {
		border-bottom: none;
	}

	.step dt {
		font-family: var(--font-body);
		font-size: 0.75rem;
		color: var(--text-secondary);
	}

	.step dd {
		margin: 0;
		color: var(--text-primary);
		font-size: 0.8125rem;
	}

	.mono {
		font-family: var(--font-mono);
	}

	.formula {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		padding: 0.625rem 0.75rem;
		background: var(--bg);
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-sm);
	}

	.formula-label {
		font-family: var(--font-body);
		font-size: 0.6875rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--text-muted);
	}

	.formula-expr {
		font-family: var(--font-mono);
		font-size: 0.75rem;
		color: var(--text-primary);
		line-height: 1.45;
		word-break: break-word;
	}
</style>
