<script lang="ts">
	import { t } from '$lib/i18n';
	import { locale } from '$lib/i18n';
	import { currency$, accountingStandard$ } from '$lib/stores/preferences';
	import { fmtCurrency } from '$lib/format';
	import { getAccount } from '$lib/shared/chart-of-accounts';
	import type { AccountingFramework } from '$lib/shared/chart-of-accounts/types';
	import type { AccountingStandard } from '$lib/contracts/playground';
	import type {
		BalanceSheetData,
		CashFlowStatement,
		EntryImpact,
		IncomeStatementData,
		JournalEntry,
		LedgerAccount,
		PipelineStage,
		TrialBalanceCheck,
		TrialBalanceRow
	} from '../types';

	let {
		stage,
		counts,
		ledgerAccounts,
		trialBalance,
		trialBalanceCheck,
		incomeStatement,
		balanceSheet,
		cashFlow,
		selectedAccount,
		selectedEntry,
		selectedAccountKeys,
		entryImpact,
		onSelectStage,
		onSelectAccount
	}: {
		stage: PipelineStage;
		counts: Record<PipelineStage, number>;
		ledgerAccounts: LedgerAccount[];
		trialBalance: TrialBalanceRow[];
		trialBalanceCheck: TrialBalanceCheck;
		incomeStatement: IncomeStatementData;
		balanceSheet: BalanceSheetData;
		cashFlow: CashFlowStatement;
		selectedAccount: string | null;
		selectedEntry: JournalEntry | undefined;
		selectedAccountKeys: string[];
		entryImpact: EntryImpact;
		onSelectStage: (stage: PipelineStage) => void;
		onSelectAccount: (accountKey: string) => void;
	} = $props();

	const standardToFramework: Record<AccountingStandard, AccountingFramework> = {
		syscohada: 'ohada',
		ifrs: 'ifrs',
		'french-pcg': 'pcg',
		'us-gaap': 'usgaap'
	};

	let currency = $derived($currency$);
	let currentLocale = $derived($locale);
	let framework = $derived(standardToFramework[$accountingStandard$]);

	const stageMeta: Array<{ key: PipelineStage; labelKey: string }> = [
		{ key: 'ledger', labelKey: 'je.stage.ledger' },
		{ key: 'trialBalance', labelKey: 'je.stage.trialBalance' },
		{ key: 'incomeStatement', labelKey: 'je.stage.incomeStatement' },
		{ key: 'balanceSheet', labelKey: 'je.stage.balanceSheet' },
		{ key: 'cashFlow', labelKey: 'je.stage.cashFlow' }
	];

	function accountName(account: { frameworkNameEn: string; frameworkNameFr: string; frameworkCode: string }) {
		const label =
			currentLocale === 'fr' ? account.frameworkNameFr : account.frameworkNameEn;
		return `${account.frameworkCode} — ${label}`;
	}

	function accountKeyDisplay(key: string): string {
		const account = getAccount(key, framework);
		return account ? accountName(account) : key;
	}

	function isSelectedAccount(accountKey: string): boolean {
		return selectedAccount === accountKey || selectedAccountKeys.includes(accountKey);
	}

	function lineSide(line: { debit: number; credit: number }): string {
		return line.debit > 0 ? $t('je.form.debit') : $t('je.form.credit');
	}

	function lineAmount(line: { debit: number; credit: number }): number {
		return line.debit > 0 ? line.debit : line.credit;
	}
</script>

<section class="pipeline-panel">
	{#if selectedEntry}
		<div class="impact-card">
			<div class="impact-header">
				<div>
					<p class="eyebrow">{$t('je.impact.title')}</p>
					<h3 class="impact-title">{selectedEntry.description}</h3>
					<p class="impact-meta">{selectedEntry.date}</p>
				</div>

				<div class="impact-badges">
					<span
						class="impact-badge"
						class:active={entryImpact.affectsBalanceSheet}
						title={$t('je.stage.balanceSheet')}
					>{entryImpact.affectsBalanceSheet ? $t('je.impact.bs') : '—'}</span>
					<span
						class="impact-badge"
						class:active={entryImpact.affectsIncomeStatement}
						title={$t('je.stage.incomeStatement')}
					>{entryImpact.affectsIncomeStatement ? $t('je.impact.is') : '—'}</span>
					<span
						class="impact-badge"
						class:active={entryImpact.affectsCashFlow}
						title={$t('je.stage.cashFlow')}
					>{entryImpact.affectsCashFlow ? $t('je.impact.cfs') : '—'}</span>
				</div>
			</div>

			<div class="impact-lines">
				{#each selectedEntry.lines as line, index (index)}
					<button
						class="impact-line"
						type="button"
						onclick={() => onSelectAccount(line.accountKey)}
					>
						<span class="impact-account">{accountKeyDisplay(line.accountKey)}</span>
						<span class="impact-side">{lineSide(line)}</span>
						<span class="impact-amount">{fmtCurrency(lineAmount(line), currency)}</span>
					</button>
				{/each}
			</div>
		</div>
	{/if}

	<div class="stage-tabs" role="tablist" aria-label={$t('je.stage.title')}>
		{#each stageMeta as item (item.key)}
			<button
				class="stage-tab"
				class:active={item.key === stage}
				type="button"
				role="tab"
				aria-selected={item.key === stage}
				onclick={() => onSelectStage(item.key)}
			>
				<span>{$t(item.labelKey)}</span>
				<span class="stage-count">{counts[item.key]}</span>
			</button>
		{/each}
	</div>

	{#if stage === 'ledger'}
		<div class="panel-section">
			<h3 class="panel-title">{$t('je.stage.ledger')}</h3>
			{#if ledgerAccounts.length === 0}
				<p class="empty-text">{$t('je.empty.ledger')}</p>
			{:else}
				<div class="ledger-list">
					{#each ledgerAccounts as account (account.accountKey)}
						<div class="ledger-card" class:selected={isSelectedAccount(account.accountKey)}>
							<button
								class="ledger-header"
								type="button"
								onclick={() => onSelectAccount(account.accountKey)}
							>
								<div>
									<p class="ledger-name">{accountName(account.account)}</p>
									<p class="ledger-meta">
										{$t('je.stage.balance')}: {fmtCurrency(account.balance, currency)}
									</p>
								</div>
								<span class="ledger-balance">{fmtCurrency(account.balance, currency)}</span>
							</button>

							<table class="data-table">
								<thead>
									<tr>
										<th>{$t('je.form.date')}</th>
										<th>{$t('je.form.description')}</th>
										<th class="col-right">{$t('je.form.debit')}</th>
										<th class="col-right">{$t('je.form.credit')}</th>
									</tr>
								</thead>
								<tbody>
									{#each account.entries as line}
										<tr class:highlight={line.entryId === selectedEntry?.id}>
											<td>{line.date}</td>
											<td>{line.description}</td>
											<td class="col-right">{line.debit > 0 ? fmtCurrency(line.debit, currency) : ''}</td>
											<td class="col-right">{line.credit > 0 ? fmtCurrency(line.credit, currency) : ''}</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	{:else if stage === 'trialBalance'}
		<div class="panel-section">
			<div class="panel-heading">
				<h3 class="panel-title">{$t('je.stage.trialBalance')}</h3>
				<div class="totals-pill">
					<span>{fmtCurrency(trialBalanceCheck.totalDebit, currency)}</span>
					<span>/</span>
					<span>{fmtCurrency(trialBalanceCheck.totalCredit, currency)}</span>
				</div>
			</div>

			{#if trialBalance.length === 0}
				<p class="empty-text">{$t('je.empty.trialBalance')}</p>
			{:else}
				<table class="data-table">
					<thead>
						<tr>
							<th>{$t('je.form.account')}</th>
							<th class="col-right">{$t('je.form.debit')}</th>
							<th class="col-right">{$t('je.form.credit')}</th>
							<th class="col-right">{$t('je.stage.balance')}</th>
						</tr>
					</thead>
					<tbody>
						{#each trialBalance as row (row.accountKey)}
							<tr class:highlight={isSelectedAccount(row.accountKey)}>
								<td>
									<button class="account-button" type="button" onclick={() => onSelectAccount(row.accountKey)}>
										{accountName(row.account)}
									</button>
								</td>
								<td class="col-right">{fmtCurrency(row.debitTotal, currency)}</td>
								<td class="col-right">{fmtCurrency(row.creditTotal, currency)}</td>
								<td class="col-right">{fmtCurrency(row.balance, currency)}</td>
							</tr>
						{/each}
					</tbody>
					<tfoot>
						<tr>
							<td>{$t('je.stage.total')}</td>
							<td class="col-right">{fmtCurrency(trialBalanceCheck.totalDebit, currency)}</td>
							<td class="col-right">{fmtCurrency(trialBalanceCheck.totalCredit, currency)}</td>
							<td class="col-right">
								{trialBalanceCheck.balanced ? $t('je.form.balanced') : $t('je.form.unbalanced')}
							</td>
						</tr>
					</tfoot>
				</table>
			{/if}
		</div>
	{:else if stage === 'incomeStatement'}
		<div class="panel-section">
			<h3 class="panel-title">{$t('je.stage.incomeStatement')}</h3>
			{#if incomeStatement.revenues.length === 0 && incomeStatement.expenses.length === 0}
				<p class="empty-text">{$t('je.empty.incomeStatement')}</p>
			{:else}
				<div class="statement-grid">
					<div class="statement-card">
						<h4>{$t('je.statement.revenue')}</h4>
						<ul>
							{#each incomeStatement.revenues as item (item.accountKey)}
								<li class:highlight={isSelectedAccount(item.accountKey)}>
									<button class="account-button" type="button" onclick={() => onSelectAccount(item.accountKey)}>
										{accountName(item.account)}
									</button>
									<span>{fmtCurrency(item.amount, currency)}</span>
								</li>
							{/each}
						</ul>
						<div class="statement-total">
							<span>{$t('je.statement.totalRevenue')}</span>
							<span>{fmtCurrency(incomeStatement.totalRevenue, currency)}</span>
						</div>
					</div>

					<div class="statement-card">
						<h4>{$t('je.statement.expenses')}</h4>
						<ul>
							{#each incomeStatement.expenses as item (item.accountKey)}
								<li class:highlight={isSelectedAccount(item.accountKey)}>
									<button class="account-button" type="button" onclick={() => onSelectAccount(item.accountKey)}>
										{accountName(item.account)}
									</button>
									<span>{fmtCurrency(item.amount, currency)}</span>
								</li>
							{/each}
						</ul>
						<div class="statement-total">
							<span>{$t('je.statement.totalExpense')}</span>
							<span>{fmtCurrency(incomeStatement.totalExpense, currency)}</span>
						</div>
					</div>
				</div>

				<div class="grand-total">
					<span>{$t('je.statement.netIncome')}</span>
					<span>{fmtCurrency(incomeStatement.netIncome, currency)}</span>
				</div>
			{/if}
		</div>
	{:else if stage === 'balanceSheet'}
		<div class="panel-section">
			<h3 class="panel-title">{$t('je.stage.balanceSheet')}</h3>
			{#if balanceSheet.nonCurrentAssets.length === 0 && balanceSheet.currentAssets.length === 0 && balanceSheet.nonCurrentLiabilities.length === 0 && balanceSheet.currentLiabilities.length === 0 && balanceSheet.equity.length === 0 && Math.abs(balanceSheet.derivedNetIncome) < 0.01}
				<p class="empty-text">{$t('je.empty.balanceSheet')}</p>
			{:else}
				<div class="statement-grid">
					<div class="statement-card">
						<h4>{$t('je.statement.assets')}</h4>
						<p class="section-label">{$t('je.statement.nonCurrentAssets')}</p>
						<ul>
							{#each balanceSheet.nonCurrentAssets as item (item.accountKey)}
								<li class:highlight={isSelectedAccount(item.accountKey)}>
									<button class="account-button" type="button" onclick={() => onSelectAccount(item.accountKey)}>
										{accountName(item.account)}
									</button>
									<span>{fmtCurrency(item.amount, currency)}</span>
								</li>
							{/each}
						</ul>
						<p class="section-label">{$t('je.statement.currentAssets')}</p>
						<ul>
							{#each balanceSheet.currentAssets as item (item.accountKey)}
								<li class:highlight={isSelectedAccount(item.accountKey)}>
									<button class="account-button" type="button" onclick={() => onSelectAccount(item.accountKey)}>
										{accountName(item.account)}
									</button>
									<span>{fmtCurrency(item.amount, currency)}</span>
								</li>
							{/each}
						</ul>
						<div class="statement-total">
							<span>{$t('je.statement.totalAssets')}</span>
							<span>{fmtCurrency(balanceSheet.totalAssets, currency)}</span>
						</div>
					</div>

					<div class="statement-card">
						<h4>{$t('je.statement.liabilitiesEquity')}</h4>
						<p class="section-label">{$t('je.statement.nonCurrentLiabilities')}</p>
						<ul>
							{#each balanceSheet.nonCurrentLiabilities as item (item.accountKey)}
								<li class:highlight={isSelectedAccount(item.accountKey)}>
									<button class="account-button" type="button" onclick={() => onSelectAccount(item.accountKey)}>
										{accountName(item.account)}
									</button>
									<span>{fmtCurrency(item.amount, currency)}</span>
								</li>
							{/each}
						</ul>
						<p class="section-label">{$t('je.statement.currentLiabilities')}</p>
						<ul>
							{#each balanceSheet.currentLiabilities as item (item.accountKey)}
								<li class:highlight={isSelectedAccount(item.accountKey)}>
									<button class="account-button" type="button" onclick={() => onSelectAccount(item.accountKey)}>
										{accountName(item.account)}
									</button>
									<span>{fmtCurrency(item.amount, currency)}</span>
								</li>
							{/each}
						</ul>
						<p class="section-label">{$t('je.statement.equity')}</p>
						<ul>
							{#each balanceSheet.equity as item (item.accountKey)}
								<li class:highlight={isSelectedAccount(item.accountKey)}>
									<button class="account-button" type="button" onclick={() => onSelectAccount(item.accountKey)}>
										{accountName(item.account)}
									</button>
									<span>{fmtCurrency(item.amount, currency)}</span>
								</li>
							{/each}
							{#if Math.abs(balanceSheet.derivedNetIncome) > 0.009}
								<li>
									<span>{$t('je.statement.currentPeriodResult')}</span>
									<span>{fmtCurrency(balanceSheet.derivedNetIncome, currency)}</span>
								</li>
							{/if}
						</ul>
						<div class="statement-total">
							<span>{$t('je.statement.totalLiabilitiesEquity')}</span>
							<span>{fmtCurrency(balanceSheet.totalLiabilitiesAndEquity, currency)}</span>
						</div>
					</div>
				</div>
			{/if}
		</div>
	{:else if stage === 'cashFlow'}
		<div class="panel-section">
			<h3 class="panel-title">{$t('je.stage.cashFlow')}</h3>
			{#if cashFlow.operating.length === 0 && cashFlow.investing.length === 0 && cashFlow.financing.length === 0}
				<p class="empty-text">{$t('je.empty.cashFlow')}</p>
			{:else}
				<div class="statement-grid">
					<div class="statement-card">
						<h4>{$t('je.statement.operating')}</h4>
						<ul>
							{#each cashFlow.operating as item}
								<li class:highlight={item.entryId === selectedEntry?.id}>
									<span>{item.description}</span>
									<span>{fmtCurrency(item.amount, currency)}</span>
								</li>
							{/each}
						</ul>
						<div class="statement-total">
							<span>{$t('je.statement.totalOperating')}</span>
							<span>{fmtCurrency(cashFlow.totalOperating, currency)}</span>
						</div>
					</div>

					<div class="statement-card">
						<h4>{$t('je.statement.investing')}</h4>
						<ul>
							{#each cashFlow.investing as item}
								<li class:highlight={item.entryId === selectedEntry?.id}>
									<span>{item.description}</span>
									<span>{fmtCurrency(item.amount, currency)}</span>
								</li>
							{/each}
						</ul>
						<div class="statement-total">
							<span>{$t('je.statement.totalInvesting')}</span>
							<span>{fmtCurrency(cashFlow.totalInvesting, currency)}</span>
						</div>
					</div>

					<div class="statement-card">
						<h4>{$t('je.statement.financing')}</h4>
						<ul>
							{#each cashFlow.financing as item}
								<li class:highlight={item.entryId === selectedEntry?.id}>
									<span>{item.description}</span>
									<span>{fmtCurrency(item.amount, currency)}</span>
								</li>
							{/each}
						</ul>
						<div class="statement-total">
							<span>{$t('je.statement.totalFinancing')}</span>
							<span>{fmtCurrency(cashFlow.totalFinancing, currency)}</span>
						</div>
					</div>
				</div>

				<div class="grand-total">
					<span>{$t('je.statement.netCashChange')}</span>
					<span>{fmtCurrency(cashFlow.netChangeInCash, currency)}</span>
				</div>
			{/if}
		</div>
	{/if}
</section>

<style>
	.pipeline-panel {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.impact-card,
	.panel-section {
		padding: 1rem;
		background: var(--panel);
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-lg);
	}

	.impact-header,
	.panel-heading {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 1rem;
	}

	.impact-title,
	.panel-title {
		margin: 0;
		font-family: var(--font-display);
		font-size: 1rem;
		color: var(--text-primary);
	}

	.eyebrow,
	.impact-meta,
	.section-label {
		margin: 0;
		font-size: 0.75rem;
		color: var(--text-muted);
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	.impact-badges,
	.stage-tabs,
	.impact-lines {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.impact-badge,
	.stage-count,
	.totals-pill {
		font-family: var(--font-mono);
		font-size: 0.75rem;
	}

	.impact-badge,
	.totals-pill {
		padding: 0.25rem 0.5rem;
		border-radius: var(--radius-md);
		background: var(--bg-subtle);
		color: var(--text-muted);
	}

	.impact-badge.active {
		background: color-mix(in srgb, var(--accent) 15%, transparent);
		color: var(--accent);
	}

	.impact-lines {
		margin-top: 0.75rem;
	}

	.impact-line,
	.stage-tab,
	.account-button {
		border: none;
		background: none;
		color: inherit;
		font: inherit;
		cursor: pointer;
	}

	.impact-line {
		display: grid;
		grid-template-columns: 1fr auto auto;
		gap: 0.75rem;
		width: 100%;
		padding: 0.625rem 0.75rem;
		background: var(--bg-subtle);
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-md);
		text-align: left;
	}

	.impact-account,
	.ledger-name {
		color: var(--text-primary);
	}

	.impact-side,
	.impact-amount,
	.ledger-meta,
	.ledger-balance {
		font-family: var(--font-mono);
		color: var(--text-secondary);
	}

	.stage-tabs {
		border-bottom: 1px solid var(--border-subtle);
		padding-bottom: 0.25rem;
	}

	.stage-tab {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.625rem 0.875rem;
		border-radius: var(--radius-md);
		color: var(--text-secondary);
	}

	.stage-tab.active {
		background: var(--panel);
		color: var(--text-primary);
		border: 1px solid var(--border-subtle);
	}

	.panel-section {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.empty-text {
		margin: 0;
		color: var(--text-muted);
	}

	.ledger-list,
	.statement-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: 0.75rem;
	}

	.ledger-card,
	.statement-card {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		padding: 0.875rem;
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-md);
		background: var(--bg-subtle);
	}

	.ledger-card.selected {
		border-color: var(--accent);
	}

	.ledger-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 0.75rem;
		border: none;
		background: none;
		padding: 0;
		cursor: pointer;
		text-align: left;
	}

	.data-table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.8125rem;
	}

	.data-table th,
	.data-table td {
		padding: 0.5rem;
		border-bottom: 1px solid var(--border-subtle);
		color: var(--text-secondary);
		text-align: left;
	}

	.data-table th {
		color: var(--text-muted);
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	.col-right {
		text-align: right !important;
	}

	.highlight {
		background: var(--accent-glow);
	}

	.account-button {
		color: var(--text-secondary);
		text-align: left;
		padding: 0;
	}

	.account-button:hover {
		color: var(--accent);
	}

	.statement-card h4 {
		margin: 0;
		font-size: 0.9375rem;
		color: var(--text-primary);
	}

	.statement-card ul {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.statement-card li,
	.statement-total,
	.grand-total {
		display: grid;
		grid-template-columns: 1fr auto;
		gap: 0.75rem;
		align-items: baseline;
		color: var(--text-secondary);
	}

	.statement-total,
	.grand-total {
		padding-top: 0.5rem;
		border-top: 1px solid var(--border-subtle);
		font-weight: 700;
		color: var(--text-primary);
	}

	.grand-total {
		padding: 0.875rem 1rem;
		border-radius: var(--radius-md);
		background: var(--panel);
		border: 1px solid var(--border-subtle);
	}
</style>
