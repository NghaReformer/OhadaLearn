<script lang="ts">
	import { t } from '$lib/i18n';
	import { currency$ } from '$lib/stores/preferences';
	import { fmtCurrency } from '$lib/format';
	import type { Scenario, ScenarioMissingTransaction } from '$lib/content/types';

	let {
		scenario,
		addedIds,
		onAdd,
		onAddAll,
		onReset,
	}: {
		scenario: Scenario;
		addedIds: string[];
		onAdd: (item: ScenarioMissingTransaction) => void;
		onAddAll: () => void;
		onReset: () => void;
	} = $props();

	let translate = $derived($t);
	let currency = $derived($currency$);
	let addedSet = $derived(new Set(addedIds));
	let missing = $derived(scenario.missingTransactions ?? []);
	let total = $derived(missing.length);
	let added = $derived(missing.filter((m) => addedSet.has(m.id)).length);
	let progressPct = $derived(total > 0 ? (added / total) * 100 : 0);
	let allAdded = $derived(total > 0 && added === total);

	function describe(item: ScenarioMissingTransaction): string {
		const sign = item.amount >= 0 ? '+' : '−';
		return `${sign}${fmtCurrency(Math.abs(item.amount), currency)}`;
	}
</script>

<section class="walkthrough" aria-labelledby="br-walkthrough-title">
	<header class="wt-header">
		<div class="wt-titles">
			<h3 class="wt-title" id="br-walkthrough-title">
				{translate('br.walkthrough.title')}
			</h3>
			<p class="wt-subtitle">{translate(scenario.titleKey)}</p>
		</div>
		<div class="wt-actions">
			<span class="wt-progress" data-complete={allAdded}>
				{added} / {total}
			</span>
			{#if added > 0}
				<button class="wt-btn wt-btn-ghost" type="button" onclick={onReset}>
					{translate('br.walkthrough.reset')}
				</button>
			{/if}
			{#if !allAdded && total > 1}
				<button class="wt-btn wt-btn-primary-ghost" type="button" onclick={onAddAll}>
					{translate('br.walkthrough.addAll')}
				</button>
			{/if}
		</div>
	</header>

	<div class="wt-progress-bar" aria-hidden="true">
		<div class="wt-progress-fill" style="width: {progressPct}%" data-complete={allAdded}></div>
	</div>

	{#if total === 0}
		<p class="wt-empty">{translate('br.walkthrough.empty')}</p>
	{:else}
		<ul class="wt-list">
			{#each missing as item, idx (item.id)}
				{@const isAdded = addedSet.has(item.id)}
				<li class="wt-card" data-side={item.side} data-added={isAdded}>
					<div class="wt-card-head">
						<span class="wt-step">{idx + 1}</span>
						<span class="wt-side-pill" data-side={item.side}>
							{item.side === 'bank'
								? translate('br.walkthrough.sideBank')
								: translate('br.walkthrough.sideBooks')}
						</span>
						<span class="wt-amount" class:negative={item.amount < 0}>
							{describe(item)}
						</span>
					</div>
					<div class="wt-card-body">
						<p class="wt-desc">{item.description}</p>
						{#if item.hintKey}
							<p class="wt-hint">{translate(item.hintKey)}</p>
						{/if}
					</div>
					<div class="wt-card-foot">
						<span class="wt-meta">
							{item.date}{item.reference ? ` · ${item.reference}` : ''}
						</span>
						{#if isAdded}
							<span class="wt-added">
								<svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
									<path d="M3 8.5l3.5 3.5L13 5" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" />
								</svg>
								{translate('br.walkthrough.added')}
							</span>
						{:else}
							<button
								class="wt-btn wt-btn-add"
								type="button"
								onclick={() => onAdd(item)}
							>
								<svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
									<path d="M8 3v10M3 8h10" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" />
								</svg>
								{translate('br.walkthrough.add')}
							</button>
						{/if}
					</div>
				</li>
			{/each}
		</ul>
	{/if}

	{#if allAdded && total > 0}
		<div class="wt-celebration" role="status">
			<span class="wt-celebrate-icon" aria-hidden="true">✓</span>
			{translate('br.walkthrough.done')}
		</div>
	{/if}
</section>

<style>
	.walkthrough {
		display: flex;
		flex-direction: column;
		gap: 0.65rem;
		padding: 0.85rem 1rem 1rem;
		background: var(--panel);
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-sm);
	}

	.wt-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 0.5rem;
		flex-wrap: wrap;
	}
	.wt-titles {
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
	}
	.wt-title {
		margin: 0;
		font-family: var(--font-mono, monospace);
		font-size: 0.6875rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--text-muted);
	}
	.wt-subtitle {
		margin: 0;
		font-family: var(--font-display, system-ui);
		font-size: 0.95rem;
		font-weight: 600;
		color: var(--text-primary);
	}
	.wt-actions {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		flex-wrap: wrap;
	}
	.wt-progress {
		font-family: var(--font-mono, monospace);
		font-size: 0.78125rem;
		padding: 0.25rem 0.55rem;
		border-radius: 999px;
		background: var(--bg-subtle);
		color: var(--text-secondary);
		transition: background 0.4s ease, color 0.4s ease;
	}
	.wt-progress[data-complete='true'] {
		background: color-mix(in srgb, var(--green, #22c55e) 18%, transparent);
		color: var(--green, #22c55e);
		font-weight: 600;
	}

	.wt-progress-bar {
		height: 4px;
		border-radius: 2px;
		background: var(--bg-subtle);
		overflow: hidden;
	}
	.wt-progress-fill {
		height: 100%;
		background: var(--accent, #6ea8fe);
		transition: width 0.6s cubic-bezier(0.22, 1, 0.36, 1), background 0.4s ease;
	}
	.wt-progress-fill[data-complete='true'] {
		background: var(--green, #22c55e);
	}

	.wt-empty {
		margin: 0.25rem 0;
		font-style: italic;
		color: var(--text-muted);
		font-size: 0.8125rem;
		text-align: center;
	}

	.wt-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
		gap: 0.5rem;
	}

	.wt-card {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
		padding: 0.65rem 0.75rem;
		background: var(--bg-subtle);
		border: 1px solid var(--border-subtle);
		border-left-width: 3px;
		border-radius: var(--radius-sm);
		transition: opacity 0.3s ease, background 0.3s ease, border-color 0.3s ease;
	}
	.wt-card[data-side='bank'] {
		border-left-color: var(--accent, #6ea8fe);
	}
	.wt-card[data-side='books'] {
		border-left-color: var(--orange, #f59e0b);
	}
	.wt-card[data-added='true'] {
		opacity: 0.55;
		background: color-mix(in srgb, var(--green, #22c55e) 6%, transparent);
		border-left-color: var(--green, #22c55e);
	}

	.wt-card-head {
		display: flex;
		align-items: center;
		gap: 0.4rem;
	}
	.wt-step {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 18px;
		height: 18px;
		border-radius: 50%;
		background: var(--bg, var(--panel));
		color: var(--text-muted);
		font-family: var(--font-mono, monospace);
		font-size: 0.6875rem;
		font-weight: 700;
	}
	.wt-side-pill {
		font-family: var(--font-mono, monospace);
		font-size: 0.625rem;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		padding: 0.1rem 0.4rem;
		border-radius: 4px;
		background: var(--bg, var(--panel));
		color: var(--text-secondary);
	}
	.wt-side-pill[data-side='bank'] {
		color: var(--accent, #6ea8fe);
	}
	.wt-side-pill[data-side='books'] {
		color: var(--orange, #f59e0b);
	}
	.wt-amount {
		margin-left: auto;
		font-family: var(--font-mono, monospace);
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--text-primary);
	}
	.wt-amount.negative {
		color: var(--error, #ef4444);
	}

	.wt-card-body {
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
	}
	.wt-desc {
		margin: 0;
		font-size: 0.8125rem;
		color: var(--text-primary);
		font-weight: 500;
	}
	.wt-hint {
		margin: 0;
		font-size: 0.75rem;
		line-height: 1.35;
		color: var(--text-secondary);
		font-style: italic;
	}

	.wt-card-foot {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.4rem;
	}
	.wt-meta {
		font-family: var(--font-mono, monospace);
		font-size: 0.6875rem;
		color: var(--text-muted);
	}

	.wt-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		padding: 0.3rem 0.6rem;
		font-family: var(--font-body);
		font-size: 0.75rem;
		font-weight: 600;
		border: 1px solid transparent;
		border-radius: 4px;
		cursor: pointer;
		transition: all 0.15s ease;
	}
	.wt-btn-add {
		background: var(--accent, #6ea8fe);
		color: white;
	}
	.wt-btn-add:hover {
		background: color-mix(in srgb, var(--accent, #6ea8fe) 88%, white);
	}
	.wt-btn-ghost {
		background: transparent;
		color: var(--text-secondary);
		border-color: var(--border-subtle);
	}
	.wt-btn-ghost:hover {
		color: var(--text-primary);
		border-color: var(--text-secondary);
	}
	.wt-btn-primary-ghost {
		background: transparent;
		color: var(--accent, #6ea8fe);
		border-color: var(--accent, #6ea8fe);
	}
	.wt-btn-primary-ghost:hover {
		background: color-mix(in srgb, var(--accent, #6ea8fe) 12%, transparent);
	}

	.wt-added {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		font-family: var(--font-body);
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--green, #22c55e);
	}

	.wt-celebration {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 0.5rem 0.75rem;
		background: color-mix(in srgb, var(--green, #22c55e) 14%, transparent);
		color: var(--green, #22c55e);
		border-radius: var(--radius-sm);
		font-family: var(--font-body);
		font-size: 0.875rem;
		font-weight: 600;
		animation: celebrate 0.6s cubic-bezier(0.22, 1, 0.36, 1);
	}
	.wt-celebrate-icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 22px;
		height: 22px;
		background: var(--green, #22c55e);
		color: white;
		border-radius: 50%;
		font-weight: 700;
	}
	@keyframes celebrate {
		0% { opacity: 0; transform: scale(0.94); }
		100% { opacity: 1; transform: scale(1); }
	}

	@media (prefers-reduced-motion: reduce) {
		.wt-progress-fill, .wt-celebration, .wt-card { transition: none; animation: none; }
	}
</style>
