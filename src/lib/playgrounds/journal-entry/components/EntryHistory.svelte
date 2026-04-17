<script lang="ts">
	import { t } from '$lib/i18n';
	import { locale } from '$lib/i18n';
	import { currency$ } from '$lib/stores/preferences';
	import { accountingStandard$ } from '$lib/stores/preferences';
	import { fmtCurrency } from '$lib/format';
	import { getAccount } from '$lib/shared/chart-of-accounts';
	import type { AccountingFramework } from '$lib/shared/chart-of-accounts/types';
	import type { AccountingStandard } from '$lib/contracts/playground';
	import type { JournalEntry } from '../types';

	let {
		entries,
		selectedEntryId,
		onSelect,
		onDelete,
		onSelectAccount = () => {},
	}: {
		entries: JournalEntry[];
		selectedEntryId: string | null;
		onSelect: (id: string) => void;
		onDelete: (id: string) => void;
		onSelectAccount?: (accountKey: string) => void;
	} = $props();

	const standardToFramework: Record<AccountingStandard, AccountingFramework> = {
		syscohada: 'ohada',
		ifrs: 'ifrs',
		'french-pcg': 'pcg',
		'us-gaap': 'usgaap',
	};

	let expandedIds = $state(new Set<string>());
	let pendingDeleteId = $state<string | null>(null);
	let currency = $derived($currency$);
	let framework = $derived(standardToFramework[$accountingStandard$]);
	let currentLocale = $derived($locale);

	function toggleExpand(id: string) {
		const next = new Set(expandedIds);
		if (next.has(id)) {
			next.delete(id);
		} else {
			next.add(id);
		}
		expandedIds = next;
	}

	function getEntryTotal(entry: JournalEntry): number {
		return entry.lines.reduce((sum, l) => sum + l.debit, 0);
	}

	function getAccountDisplay(key: string): string {
		const account = getAccount(key, framework);
		if (!account) return key;
		const name = currentLocale === 'fr' ? account.frameworkNameFr : account.frameworkNameEn;
		return `${account.frameworkCode} ${name}`;
	}
</script>

<div class="entry-history">
	<h3 class="history-title">{$t('je.history.title')}</h3>

	{#if entries.length === 0}
		<div class="empty-state">
			<svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
				<rect x="6" y="4" width="20" height="24" rx="2" stroke="currentColor" stroke-width="1.5" fill="none" />
				<line x1="10" y1="10" x2="22" y2="10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
				<line x1="10" y1="14" x2="22" y2="14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
				<line x1="10" y1="18" x2="18" y2="18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
			</svg>
			<p class="empty-text">{$t('je.history.empty')}</p>
		</div>
	{:else}
		<ul class="entries-list">
			{#each entries as entry (entry.id)}
				{@const isSelected = entry.id === selectedEntryId}
				{@const isExpanded = expandedIds.has(entry.id)}
				<li class="entry-card" class:selected={isSelected}>
					<button
						class="entry-header"
						type="button"
						onclick={() => { onSelect(entry.id); toggleExpand(entry.id); }}
						aria-expanded={isExpanded}
					>
						<div class="entry-meta">
							<span class="entry-date">{entry.date}</span>
							<span class="entry-desc">{entry.description}</span>
						</div>
						<span class="entry-total">{fmtCurrency(getEntryTotal(entry), currency)}</span>
						<svg
							class="expand-chevron"
							class:rotated={isExpanded}
							width="12"
							height="12"
							viewBox="0 0 16 16"
							fill="none"
							aria-hidden="true"
						>
							<path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
						</svg>
					</button>

					{#if isExpanded}
						<div class="entry-details">
							<table class="details-table">
								<thead>
									<tr>
										<th>{$t('je.form.account')}</th>
										<th class="col-right">{$t('je.form.debit')}</th>
										<th class="col-right">{$t('je.form.credit')}</th>
									</tr>
								</thead>
								<tbody>
									{#each entry.lines as line}
										<tr>
											<td class="line-account">
												<button
													class="account-link"
													type="button"
													onclick={(event) => {
														event.stopPropagation();
														onSelectAccount(line.accountKey);
													}}
												>
													{getAccountDisplay(line.accountKey)}
												</button>
											</td>
											<td class="col-right mono">{line.debit > 0 ? fmtCurrency(line.debit, currency) : ''}</td>
											<td class="col-right mono">{line.credit > 0 ? fmtCurrency(line.credit, currency) : ''}</td>
										</tr>
									{/each}
								</tbody>
							</table>
							{#if pendingDeleteId === entry.id}
								<div class="delete-confirm" role="alertdialog" aria-label={$t('je.history.deleteConfirmTitle')}>
									<p class="delete-confirm-text">{$t('je.history.deleteConfirm')}</p>
									<div class="delete-confirm-actions">
										<button
											class="btn-confirm"
											type="button"
											onclick={(e) => { e.stopPropagation(); pendingDeleteId = null; onDelete(entry.id); }}
										>
											{$t('je.history.deleteConfirmYes')}
										</button>
										<button
											class="btn-cancel"
											type="button"
											onclick={(e) => { e.stopPropagation(); pendingDeleteId = null; }}
										>
											{$t('je.history.deleteConfirmNo')}
										</button>
									</div>
								</div>
							{:else}
								<button
									class="btn-delete"
									type="button"
									onclick={(e) => { e.stopPropagation(); pendingDeleteId = entry.id; }}
								>
									<svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
										<path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
									</svg>
									{$t('je.history.delete')}
								</button>
							{/if}
						</div>
					{/if}
				</li>
			{/each}
		</ul>
	{/if}
</div>

<style>
	.entry-history {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.history-title {
		font-family: var(--font-display);
		font-size: 0.9375rem;
		font-weight: 600;
		color: var(--text-primary);
		margin: 0 0 0.25rem;
	}

	/* ---- Empty state ---- */
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		padding: 2rem 1rem;
		color: var(--text-muted);
		text-align: center;
	}

	.empty-text {
		font-size: 0.8125rem;
		margin: 0;
		max-width: 24ch;
		line-height: 1.5;
	}

	/* ---- Entries list ---- */
	.entries-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
	}

	.entry-card {
		background: var(--panel);
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-sm);
		overflow: hidden;
		transition: border-color var(--transition-fast);
	}

	.entry-card.selected {
		border-color: var(--accent);
	}

	.entry-header {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		width: 100%;
		padding: 0.5rem 0.625rem;
		background: none;
		border: none;
		color: var(--text-primary);
		cursor: pointer;
		text-align: left;
		font-family: var(--font-body);
		font-size: 0.8125rem;
		transition: background var(--transition-fast);
	}

	.entry-header:hover {
		background: var(--panel-hover);
	}

	.entry-meta {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
	}

	.entry-date {
		font-family: var(--font-mono);
		font-size: 0.6875rem;
		color: var(--text-muted);
	}

	.entry-desc {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.account-link {
		border: none;
		background: none;
		padding: 0;
		color: var(--text-secondary);
		cursor: pointer;
		font: inherit;
		text-align: left;
	}

	.account-link:hover {
		color: var(--accent);
	}

	.entry-total {
		font-family: var(--font-mono);
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--accent);
		flex-shrink: 0;
	}

	.expand-chevron {
		color: var(--text-muted);
		flex-shrink: 0;
		transition: transform var(--transition-fast);
	}

	.expand-chevron.rotated {
		transform: rotate(180deg);
	}

	/* ---- Entry details ---- */
	.entry-details {
		padding: 0.5rem 0.625rem 0.625rem;
		border-top: 1px solid var(--border-subtle);
		background: var(--bg-subtle);
	}

	.details-table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.75rem;
	}

	.details-table th {
		font-family: var(--font-body);
		font-weight: 600;
		color: var(--text-muted);
		text-transform: uppercase;
		letter-spacing: 0.04em;
		font-size: 0.625rem;
		padding: 0.25rem 0.375rem;
		border-bottom: 1px solid var(--border-subtle);
		text-align: left;
	}

	.details-table td {
		padding: 0.25rem 0.375rem;
		color: var(--text-primary);
	}

	.col-right {
		text-align: right;
	}

	.mono {
		font-family: var(--font-mono);
	}

	.line-account {
		font-size: 0.75rem;
		max-width: 200px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.btn-delete {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		margin-top: 0.5rem;
		padding: 0.3125rem 0.625rem;
		background: none;
		border: 1px solid color-mix(in srgb, var(--error) 30%, transparent);
		border-radius: var(--radius-sm);
		color: var(--error);
		font-family: var(--font-body);
		font-size: 0.75rem;
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	.btn-delete:hover {
		background: color-mix(in srgb, var(--error) 10%, transparent);
		border-color: var(--error);
	}

	.delete-confirm {
		margin-top: 0.5rem;
		padding: 0.5rem 0.625rem;
		background: color-mix(in srgb, var(--error) 6%, transparent);
		border: 1px solid color-mix(in srgb, var(--error) 30%, transparent);
		border-radius: var(--radius-sm);
	}

	.delete-confirm-text {
		margin: 0 0 0.375rem;
		font-size: 0.75rem;
		color: var(--text-primary);
	}

	.delete-confirm-actions {
		display: flex;
		gap: 0.375rem;
	}

	.btn-confirm,
	.btn-cancel {
		padding: 0.25rem 0.625rem;
		border-radius: var(--radius-sm);
		font-family: var(--font-body);
		font-size: 0.75rem;
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	.btn-confirm {
		background: var(--error);
		border: 1px solid var(--error);
		color: #fff;
	}

	.btn-confirm:hover {
		filter: brightness(1.1);
	}

	.btn-cancel {
		background: none;
		border: 1px solid var(--border-subtle);
		color: var(--text-secondary);
	}

	.btn-cancel:hover {
		border-color: var(--border);
		color: var(--text-primary);
	}
</style>
