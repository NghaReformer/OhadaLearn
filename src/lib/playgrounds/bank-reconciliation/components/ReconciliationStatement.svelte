<script lang="ts">
	import { t, locale } from '$lib/i18n';
	import { currency$ } from '$lib/stores/preferences';
	import { fmtCurrency } from '$lib/format';
	import type { BankReconciliationStatement, StatementSkin } from '../types';

	let {
		statement,
		skin = null,
		onSelectSkin = () => {},
	}: {
		statement: BankReconciliationStatement;
		skin?: StatementSkin | null;
		onSelectSkin?: (s: StatementSkin) => void;
	} = $props();

	let translate = $derived($t);
	let currency = $derived($currency$);
	let activeSkin: StatementSkin = $derived(skin ?? ($locale === 'fr' ? 'classic-fr' : 'modern'));

	function money(v: number) {
		return fmtCurrency(v, currency);
	}
</script>

<section class="statement-panel" aria-labelledby="br-statement-heading">
	<header class="statement-header">
		<h3 id="br-statement-heading">{translate('br.statement.title')}</h3>
		<div class="skin-toggle" role="tablist" aria-label="layout">
			<button
				type="button"
				role="tab"
				class="skin-btn"
				class:active={activeSkin === 'classic-fr'}
				aria-selected={activeSkin === 'classic-fr'}
				onclick={() => onSelectSkin('classic-fr')}
			>
				{translate('br.statement.skinClassic')}
			</button>
			<button
				type="button"
				role="tab"
				class="skin-btn"
				class:active={activeSkin === 'modern'}
				aria-selected={activeSkin === 'modern'}
				onclick={() => onSelectSkin('modern')}
			>
				{translate('br.statement.skinModern')}
			</button>
		</div>
	</header>

	<div class="grid" class:classic-fr={activeSkin === 'classic-fr'}>
		<div class="col bank-col">
			<h4>{translate('br.statement.bankSide')}</h4>
			<dl>
				<div class="row">
					<dt>{translate('br.statement.statementBalance')}</dt>
					<dd>{money(statement.bankSide.statementBalance)}</dd>
				</div>
				<div class="row">
					<dt>{translate('br.statement.addDepositsInTransit')}</dt>
					<dd>{money(statement.bankSide.addDepositsInTransit)}</dd>
				</div>
				<div class="row">
					<dt>{translate('br.statement.lessOutstandingChecks')}</dt>
					<dd>({money(statement.bankSide.lessOutstandingChecks)})</dd>
				</div>
				{#if statement.bankSide.addLessBankErrors !== 0}
					<div class="row">
						<dt>{translate('br.statement.bankErrors')}</dt>
						<dd>{money(statement.bankSide.addLessBankErrors)}</dd>
					</div>
				{/if}
				<div class="row total">
					<dt>{translate('br.statement.adjustedBalance')}</dt>
					<dd>{money(statement.bankSide.adjustedBalance)}</dd>
				</div>
			</dl>
		</div>

		<div class="col books-col">
			<h4>{translate('br.statement.booksSide')}</h4>
			<dl>
				<div class="row">
					<dt>{translate('br.statement.bookBalance')}</dt>
					<dd>{money(statement.booksSide.bookBalance)}</dd>
				</div>
				<div class="row">
					<dt>{translate('br.statement.addInterest')}</dt>
					<dd>{money(statement.booksSide.addInterest)}</dd>
				</div>
				<div class="row">
					<dt>{translate('br.statement.addStandingOrders')}</dt>
					<dd>{money(statement.booksSide.addStandingOrders)}</dd>
				</div>
				<div class="row">
					<dt>{translate('br.statement.lessBankCharges')}</dt>
					<dd>({money(statement.booksSide.lessBankCharges)})</dd>
				</div>
				<div class="row">
					<dt>{translate('br.statement.lessNsfChecks')}</dt>
					<dd>({money(statement.booksSide.lessNsfChecks)})</dd>
				</div>
				<div class="row">
					<dt>{translate('br.statement.lessDirectDebits')}</dt>
					<dd>({money(statement.booksSide.lessDirectDebits)})</dd>
				</div>
				{#if statement.booksSide.addLessCompanyErrors !== 0}
					<div class="row">
						<dt>{translate('br.statement.companyErrors')}</dt>
						<dd>{money(statement.booksSide.addLessCompanyErrors)}</dd>
					</div>
				{/if}
				<div class="row total">
					<dt>{translate('br.statement.adjustedBalance')}</dt>
					<dd>{money(statement.booksSide.adjustedBalance)}</dd>
				</div>
			</dl>
		</div>
	</div>

	<footer class="status-bar">
		<span class="status-label">{translate('br.statement.variance')}:</span>
		<span class="status-amount" class:positive={statement.variance > 0} class:negative={statement.variance < 0}>
			{money(statement.variance)}
		</span>
		<span
			class="status-pill"
			class:reconciled={statement.isReconciled}
			class:unbalanced={!statement.isReconciled}
		>
			{statement.isReconciled ? translate('br.statement.reconciled') : translate('br.statement.unbalanced')}
		</span>
	</footer>
</section>

<style>
	.statement-panel {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		padding: 1rem;
		background: var(--panel);
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-md);
	}

	.statement-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
	}

	.statement-header h3 {
		margin: 0;
		font-family: var(--font-display);
		font-size: 0.9375rem;
		font-weight: 600;
		color: var(--text-primary);
	}

	.skin-toggle {
		display: inline-flex;
		gap: 0.25rem;
		padding: 0.125rem;
		background: var(--bg-subtle);
		border-radius: var(--radius-sm);
	}

	.skin-btn {
		padding: 0.25rem 0.625rem;
		background: transparent;
		border: none;
		border-radius: calc(var(--radius-sm) - 1px);
		font-family: var(--font-body);
		font-size: 0.75rem;
		color: var(--text-secondary);
		cursor: pointer;
		transition: background var(--transition-fast), color var(--transition-fast);
	}

	.skin-btn.active {
		background: var(--panel);
		color: var(--text-primary);
		font-weight: 600;
	}

	.grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.75rem;
	}

	.grid.classic-fr {
		gap: 1rem;
	}

	.col {
		padding: 0.75rem;
		background: var(--bg-subtle);
		border-radius: var(--radius-sm);
	}

	.col h4 {
		margin: 0 0 0.5rem;
		font-family: var(--font-mono);
		font-size: 0.6875rem;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--text-muted);
		font-weight: 500;
	}

	dl {
		margin: 0;
	}

	.row {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
		padding: 0.25rem 0;
		font-size: 0.8125rem;
	}

	.row dt {
		color: var(--text-secondary);
	}

	.row dd {
		margin: 0;
		font-family: var(--font-mono);
		font-variant-numeric: tabular-nums;
		color: var(--text-primary);
	}

	.row.total {
		border-top: 1px solid var(--border-subtle);
		margin-top: 0.25rem;
		padding-top: 0.5rem;
		font-weight: 600;
	}

	.row.total dt,
	.row.total dd {
		color: var(--text-primary);
	}

	.status-bar {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding-top: 0.5rem;
		border-top: 1px solid var(--border-subtle);
	}

	.status-label {
		font-family: var(--font-mono);
		font-size: 0.6875rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--text-muted);
	}

	.status-amount {
		font-family: var(--font-mono);
		font-variant-numeric: tabular-nums;
		font-size: 0.8125rem;
		font-weight: 600;
	}

	.status-amount.positive {
		color: var(--green, #16a34a);
	}

	.status-amount.negative {
		color: var(--error, #ef4444);
	}

	.status-pill {
		margin-left: auto;
		padding: 0.25rem 0.625rem;
		font-family: var(--font-body);
		font-size: 0.75rem;
		font-weight: 600;
		border-radius: 999px;
	}

	.status-pill.reconciled {
		background: color-mix(in srgb, var(--green, #16a34a) 20%, transparent);
		color: var(--green, #16a34a);
	}

	.status-pill.unbalanced {
		background: color-mix(in srgb, var(--error, #ef4444) 20%, transparent);
		color: var(--error, #ef4444);
	}

	@media (max-width: 720px) {
		.grid {
			grid-template-columns: 1fr;
		}
	}
</style>
