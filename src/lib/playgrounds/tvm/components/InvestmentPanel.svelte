<script lang="ts">
	import { t } from '$lib/i18n';
	import { currency$ } from '$lib/stores/preferences';
	import { fmtCurrency, fmtNumber, fmtPct } from '$lib/format';
	import { InvestmentEngine } from '../investment-engine';
	import type { CashFlow, InvestmentSolveInput, TVMPlaygroundState, ValidationError } from '../types';

	let {
		state,
		onUpdate
	}: {
		state: TVMPlaygroundState;
		onUpdate: (partial: Partial<TVMPlaygroundState>) => void;
	} = $props();

	const engine = new InvestmentEngine();

	let currency = $derived($currency$);
	let translate = $derived($t);

	let discountRate = $derived(typeof state.invDiscountRate === 'number' ? state.invDiscountRate : 0);
	let financeRate = $derived(typeof state.invFinanceRate === 'number' ? state.invFinanceRate : discountRate);
	let reinvestRate = $derived(typeof state.invReinvestRate === 'number' ? state.invReinvestRate : discountRate);

	let solveInput = $derived.by<InvestmentSolveInput>(() => ({
		flows: state.invFlows,
		discountRate,
		financeRate,
		reinvestRate,
		periodsPerYear: 1
	}));

	let validation = $derived(engine.validate(solveInput));
	let metrics = $derived(engine.metrics(solveInput));

	function updateFlow(index: number, field: 'period' | 'amount', rawValue: string) {
		const parsed = Number(rawValue.replace(/\s/g, '').replace(',', '.'));
		if (!Number.isFinite(parsed)) return;
		const next = [...state.invFlows];
		next[index] = { ...next[index], [field]: parsed };
		onUpdate({ invFlows: next });
	}

	function addFlow() {
		const nextPeriod = state.invFlows.length
			? Math.max(...state.invFlows.map((f) => f.period)) + 1
			: 0;
		onUpdate({ invFlows: [...state.invFlows, { period: nextPeriod, amount: 0 }] });
	}

	function removeFlow(index: number) {
		if (state.invFlows.length <= 1) return;
		onUpdate({ invFlows: state.invFlows.filter((_, i) => i !== index) });
	}

	function renderError(err: ValidationError): string {
		const msg = translate(err.key);
		if (!err.params) return msg;
		return msg.replace(/\{(\w+)\}/g, (_, key: string) => {
			const v = err.params?.[key];
			if (v === undefined) return `{${key}}`;
			if (typeof v === 'string' && v.startsWith('tvm.')) return translate(v);
			return String(v);
		});
	}

	function fmtPeriods(value: number | null): string {
		if (value === null) return translate('tvm.inv.metric.noPayback');
		return `${fmtNumber(value, 2)} ${translate(value === 1 ? 'tvm.unit.year' : 'tvm.unit.yearsLower')}`;
	}
</script>

<section class="inv">
	<div class="panel-grid">
		<!-- Cash flow editor -->
		<div class="panel-group flows">
			<header class="panel-head">
				<h3 class="panel-title">{$t('tvm.inv.panel.flows')}</h3>
				<button class="btn-ghost" type="button" onclick={addFlow}>+ {$t('tvm.inv.flows.add')}</button>
			</header>

			<div class="flow-header">
				<span>{$t('tvm.inv.flows.period')}</span>
				<span>{$t('tvm.inv.flows.amount')}</span>
				<span></span>
			</div>

			{#each state.invFlows as flow, i (i)}
				<div class="flow-row">
					<input
						class="field-input"
						type="number"
						step="1"
						min="0"
						value={flow.period}
						oninput={(e) => updateFlow(i, 'period', (e.currentTarget as HTMLInputElement).value)}
						aria-label={`${translate('tvm.inv.flows.period')} ${i + 1}`}
					/>
					<input
						class="field-input"
						type="text"
						inputmode="decimal"
						value={flow.amount}
						oninput={(e) => updateFlow(i, 'amount', (e.currentTarget as HTMLInputElement).value)}
						aria-label={`${translate('tvm.inv.flows.amount')} ${i + 1}`}
					/>
					<button
						class="btn-remove"
						type="button"
						onclick={() => removeFlow(i)}
						disabled={state.invFlows.length <= 1}
						aria-label={$t('tvm.inv.flows.remove')}
						title={$t('tvm.inv.flows.remove')}
					>
						<svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
							<path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
						</svg>
					</button>
				</div>
			{/each}

			{#if validation.warnings.length > 0}
				<ul class="warning-list">
					{#each validation.warnings as w, i (i)}
						<li>{renderError(w)}</li>
					{/each}
				</ul>
			{/if}
		</div>

		<!-- Rates -->
		<div class="panel-group rates">
			<header class="panel-head">
				<h3 class="panel-title">{$t('tvm.inv.panel.rates')}</h3>
			</header>

			<div class="rate-grid">
				<label class="field">
					<span class="field-label">{$t('tvm.inv.rate.discount')}</span>
					<div class="suffix-wrap">
						<input
							class="field-input"
							type="text"
							inputmode="decimal"
							value={typeof state.invDiscountRate === 'number' ? state.invDiscountRate : ''}
							oninput={(e) => {
								const v = Number((e.currentTarget as HTMLInputElement).value.replace(',', '.'));
								if (Number.isFinite(v)) onUpdate({ invDiscountRate: v });
							}}
						/>
						<span class="field-suffix">%</span>
					</div>
				</label>

				<label class="field">
					<span class="field-label">{$t('tvm.inv.rate.finance')}</span>
					<div class="suffix-wrap">
						<input
							class="field-input"
							type="text"
							inputmode="decimal"
							value={typeof state.invFinanceRate === 'number' ? state.invFinanceRate : ''}
							oninput={(e) => {
								const v = Number((e.currentTarget as HTMLInputElement).value.replace(',', '.'));
								if (Number.isFinite(v)) onUpdate({ invFinanceRate: v });
							}}
						/>
						<span class="field-suffix">%</span>
					</div>
					<small class="hint">{$t('tvm.inv.rate.financeHint')}</small>
				</label>

				<label class="field">
					<span class="field-label">{$t('tvm.inv.rate.reinvest')}</span>
					<div class="suffix-wrap">
						<input
							class="field-input"
							type="text"
							inputmode="decimal"
							value={typeof state.invReinvestRate === 'number' ? state.invReinvestRate : ''}
							oninput={(e) => {
								const v = Number((e.currentTarget as HTMLInputElement).value.replace(',', '.'));
								if (Number.isFinite(v)) onUpdate({ invReinvestRate: v });
							}}
						/>
						<span class="field-suffix">%</span>
					</div>
					<small class="hint">{$t('tvm.inv.rate.reinvestHint')}</small>
				</label>
			</div>
		</div>
	</div>

	<!-- Metrics dashboard -->
	<div class="panel-group metrics">
		<header class="panel-head">
			<h3 class="panel-title">{$t('tvm.inv.panel.metrics')}</h3>
		</header>

		{#if !validation.valid}
			<ul class="error-list" role="alert">
				{#each validation.errors as err, i (i)}
					<li class="error-item">{renderError(err)}</li>
				{/each}
			</ul>
		{:else}
			<div class="metric-grid">
				<div class="metric" class:positive={metrics.npv > 0} class:negative={metrics.npv < 0}>
					<span class="metric-label">{$t('tvm.inv.metric.npv')}</span>
					<span class="metric-value">{fmtCurrency(metrics.npv, currency)}</span>
					<span class="metric-hint">{$t('tvm.inv.metric.npvDecision')}</span>
				</div>

				<div class="metric">
					<span class="metric-label">{$t('tvm.inv.metric.irr')}</span>
					<span class="metric-value">{metrics.irr === null ? '—' : fmtPct(metrics.irr, 4)}</span>
					<span class="metric-hint">{metrics.irr === null ? $t('tvm.inv.metric.noIrr') : $t('tvm.inv.metric.irrDecision')}</span>
				</div>

				<div class="metric">
					<span class="metric-label">{$t('tvm.inv.metric.mirr')}</span>
					<span class="metric-value">{metrics.mirr === null ? '—' : fmtPct(metrics.mirr, 4)}</span>
					<span class="metric-hint">{metrics.mirr === null ? $t('tvm.inv.metric.noMirr') : ''}</span>
				</div>

				<div class="metric" class:positive={metrics.profitabilityIndex !== null && metrics.profitabilityIndex > 1} class:negative={metrics.profitabilityIndex !== null && metrics.profitabilityIndex < 1}>
					<span class="metric-label">{$t('tvm.inv.metric.pi')}</span>
					<span class="metric-value">{metrics.profitabilityIndex === null ? '—' : fmtNumber(metrics.profitabilityIndex, 4)}</span>
					<span class="metric-hint">{$t('tvm.inv.metric.piDecision')}</span>
				</div>

				<div class="metric">
					<span class="metric-label">{$t('tvm.inv.metric.payback')}</span>
					<span class="metric-value">{fmtPeriods(metrics.payback)}</span>
				</div>

				<div class="metric">
					<span class="metric-label">{$t('tvm.inv.metric.discountedPayback')}</span>
					<span class="metric-value">{fmtPeriods(metrics.discountedPayback)}</span>
				</div>

				<div class="metric small">
					<span class="metric-label">{$t('tvm.inv.metric.totalInflow')}</span>
					<span class="metric-value">{fmtCurrency(metrics.totalInflow, currency)}</span>
				</div>

				<div class="metric small">
					<span class="metric-label">{$t('tvm.inv.metric.totalOutflow')}</span>
					<span class="metric-value">{fmtCurrency(metrics.totalOutflow, currency)}</span>
				</div>
			</div>
		{/if}
	</div>
</section>

<style>
	.inv {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.panel-grid {
		display: grid;
		grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
		gap: 1rem;
	}

	.panel-group {
		display: flex;
		flex-direction: column;
		gap: 0.625rem;
		padding: 0.875rem;
		background: var(--panel);
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-md);
	}

	.panel-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.panel-title {
		margin: 0;
		font-family: var(--font-body);
		font-size: 0.6875rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--text-muted);
	}

	.btn-ghost {
		background: transparent;
		border: 1px dashed var(--border);
		color: var(--text-secondary);
		padding: 0.25rem 0.5rem;
		border-radius: var(--radius-sm);
		font-family: var(--font-body);
		font-size: 0.75rem;
		cursor: pointer;
		transition: all var(--transition-fast);
	}
	.btn-ghost:hover {
		border-color: var(--accent);
		color: var(--accent);
	}

	.flow-header,
	.flow-row {
		display: grid;
		grid-template-columns: 80px 1fr 36px;
		gap: 0.5rem;
		align-items: center;
	}

	.flow-header {
		font-family: var(--font-body);
		font-size: 0.6875rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: var(--text-muted);
		padding: 0 0.125rem 0.125rem;
		border-bottom: 1px solid var(--border-subtle);
	}

	.field-input {
		padding: 0.4375rem 0.5rem;
		background: var(--bg);
		color: var(--text-primary);
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-sm);
		font-family: var(--font-mono);
		font-size: 0.8125rem;
		text-align: right;
		outline: none;
		box-sizing: border-box;
		appearance: textfield;
		-moz-appearance: textfield;
	}
	.field-input::-webkit-inner-spin-button,
	.field-input::-webkit-outer-spin-button {
		appearance: none;
		-webkit-appearance: none;
	}

	.field-input:focus {
		border-color: var(--accent);
		box-shadow: 0 0 0 2px var(--accent-glow);
	}

	.btn-remove {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 28px;
		background: none;
		border: 1px solid transparent;
		border-radius: var(--radius-sm);
		color: var(--text-muted);
		cursor: pointer;
		transition: all var(--transition-fast);
	}
	.btn-remove:hover:not(:disabled) {
		color: var(--error);
		border-color: var(--error);
		background: color-mix(in srgb, var(--error) 10%, transparent);
	}
	.btn-remove:disabled {
		opacity: 0.3;
		cursor: not-allowed;
	}

	.rate-grid {
		display: flex;
		flex-direction: column;
		gap: 0.625rem;
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}
	.field-label {
		font-family: var(--font-body);
		font-size: 0.75rem;
		font-weight: 500;
		color: var(--text-secondary);
	}
	.suffix-wrap {
		position: relative;
	}
	.suffix-wrap .field-input {
		width: 100%;
		padding-right: 1.75rem;
	}
	.field-suffix {
		position: absolute;
		right: 0.625rem;
		top: 50%;
		transform: translateY(-50%);
		pointer-events: none;
		font-family: var(--font-mono);
		font-size: 0.75rem;
		color: var(--text-muted);
	}
	.hint {
		font-family: var(--font-body);
		font-size: 0.6875rem;
		color: var(--text-muted);
		line-height: 1.3;
	}

	.metric-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
		gap: 0.75rem;
	}

	.metric {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		padding: 0.75rem 0.875rem;
		background: var(--bg-subtle);
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-sm);
	}

	.metric.positive {
		border-color: color-mix(in srgb, var(--green) 45%, var(--border-subtle));
	}
	.metric.negative {
		border-color: color-mix(in srgb, var(--error) 45%, var(--border-subtle));
	}

	.metric-label {
		font-family: var(--font-body);
		font-size: 0.6875rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--text-muted);
	}

	.metric-value {
		font-family: var(--font-mono);
		font-size: 1.125rem;
		font-weight: 700;
		color: var(--text-primary);
	}
	.metric.positive .metric-value {
		color: var(--green);
	}
	.metric.negative .metric-value {
		color: color-mix(in srgb, var(--error) 85%, var(--text-primary));
	}

	.metric-hint {
		font-family: var(--font-body);
		font-size: 0.6875rem;
		color: var(--text-muted);
		line-height: 1.35;
	}

	.metric.small .metric-value {
		font-size: 0.9375rem;
	}

	.warning-list {
		list-style: none;
		margin: 0;
		padding: 0.5rem 0.625rem;
		background: color-mix(in srgb, var(--accent) 8%, transparent);
		border: 1px solid color-mix(in srgb, var(--accent) 30%, transparent);
		border-radius: var(--radius-sm);
		font-family: var(--font-body);
		font-size: 0.75rem;
		color: var(--text-secondary);
	}

	.error-list {
		list-style: none;
		margin: 0;
		padding: 0.5rem 0.75rem;
		background: color-mix(in srgb, var(--error) 8%, transparent);
		border: 1px solid color-mix(in srgb, var(--error) 30%, transparent);
		border-radius: var(--radius-sm);
	}
	.error-item {
		color: var(--error);
		font-family: var(--font-body);
		font-size: 0.8125rem;
	}
	.error-item::before {
		content: '\2022  ';
	}

	@media (max-width: 760px) {
		.panel-grid {
			grid-template-columns: 1fr;
		}
		.flow-header,
		.flow-row {
			grid-template-columns: 60px 1fr 32px;
		}
	}
</style>
