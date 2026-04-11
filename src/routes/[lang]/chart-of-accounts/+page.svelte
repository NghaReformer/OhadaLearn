<script lang="ts">
	import { t, locale } from '$lib/i18n';
	import { accountingStandard$ } from '$lib/stores/preferences';
	import {
		getAllAccounts,
		searchAccounts,
		type ResolvedAccount
	} from '$lib/shared/chart-of-accounts';
	import type { AccountingFramework } from '$lib/shared/chart-of-accounts/types';
	import type { AccountingStandard } from '$lib/contracts/playground';

	const standardToFramework: Record<AccountingStandard, AccountingFramework> = {
		syscohada: 'ohada',
		ifrs: 'ifrs',
		'french-pcg': 'pcg',
		'us-gaap': 'usgaap'
	};

	const CLASSES: { num: number; labelKey: string }[] = [
		{ num: 1, labelKey: 'coa.class.1' },
		{ num: 2, labelKey: 'coa.class.2' },
		{ num: 3, labelKey: 'coa.class.3' },
		{ num: 4, labelKey: 'coa.class.4' },
		{ num: 5, labelKey: 'coa.class.5' },
		{ num: 6, labelKey: 'coa.class.6' },
		{ num: 7, labelKey: 'coa.class.7' },
		{ num: 8, labelKey: 'coa.class.8' }
	];

	const FRAMEWORKS: { value: AccountingFramework; labelKey: string }[] = [
		{ value: 'ohada', labelKey: 'coa.fw.ohada' },
		{ value: 'pcg', labelKey: 'coa.fw.pcg' },
		{ value: 'ifrs', labelKey: 'coa.fw.ifrs' },
		{ value: 'usgaap', labelKey: 'coa.fw.usgaap' }
	];

	let query = $state('');
	let selectedFramework: AccountingFramework = $state(
		standardToFramework[$accountingStandard$]
	);
	let selectedClass: number | null = $state(null);

	let currentLocale = $derived($locale);

	let allAccounts = $derived(getAllAccounts(selectedFramework));

	let filtered: ResolvedAccount[] = $derived.by(() => {
		const base = query.trim()
			? searchAccounts(query.trim(), selectedFramework, currentLocale as 'en' | 'fr')
			: allAccounts;

		if (selectedClass == null) return base;
		const prefix = String(selectedClass);
		return base.filter((a) => a.frameworkCode.startsWith(prefix));
	});

	// Group by class for display
	let grouped = $derived.by(() => {
		const map = new Map<number, ResolvedAccount[]>();
		for (const acc of filtered) {
			const classNum = parseInt(acc.frameworkCode.charAt(0), 10);
			if (isNaN(classNum)) continue;
			if (!map.has(classNum)) map.set(classNum, []);
			map.get(classNum)!.push(acc);
		}
		return [...map.entries()]
			.sort((a, b) => a[0] - b[0])
			.map(([num, items]) => ({
				num,
				items: items.sort((a, b) =>
					a.frameworkCode.localeCompare(b.frameworkCode, undefined, { numeric: true })
				)
			}));
	});

	let totalCount = $derived(allAccounts.length);
	let filteredCount = $derived(filtered.length);

	function getName(acc: ResolvedAccount): string {
		return currentLocale === 'fr' ? acc.frameworkNameFr : acc.frameworkNameEn;
	}

	function clearFilters() {
		query = '';
		selectedClass = null;
	}
</script>

<svelte:head>
	<title>{$t('coa.title')} — OhadaLearn</title>
	<meta name="description" content={$t('coa.subtitle')} />
</svelte:head>

<section class="coa">
	<div class="coa-container">
		<header class="coa-header">
			<div class="coa-breadcrumb">{$t('coa.breadcrumb')}</div>
			<h1 class="coa-title">{$t('coa.title')}</h1>
			<p class="coa-subtitle">{$t('coa.subtitle')}</p>
			<div class="coa-meta">
				<span class="meta-pill">{totalCount} {$t('coa.accountsCount')}</span>
				<span class="meta-pill meta-pill--muted">{$t('coa.sharedResource')}</span>
			</div>
		</header>

		<div class="coa-controls">
			<div class="control-row">
				<div class="search-wrap">
					<svg
						class="search-icon"
						width="16"
						height="16"
						viewBox="0 0 16 16"
						fill="none"
						aria-hidden="true"
					>
						<circle cx="7" cy="7" r="5" stroke="currentColor" stroke-width="1.5" />
						<path
							d="M11 11l3 3"
							stroke="currentColor"
							stroke-width="1.5"
							stroke-linecap="round"
						/>
					</svg>
					<input
						type="search"
						class="search-input"
						placeholder={$t('coa.searchPlaceholder')}
						bind:value={query}
						aria-label={$t('coa.searchPlaceholder')}
					/>
				</div>

				<div class="framework-switcher" role="radiogroup" aria-label={$t('coa.framework')}>
					<span class="framework-label">{$t('coa.framework')}</span>
					<div class="framework-buttons">
						{#each FRAMEWORKS as fw (fw.value)}
							<button
								type="button"
								role="radio"
								aria-checked={selectedFramework === fw.value}
								class="framework-btn"
								class:active={selectedFramework === fw.value}
								onclick={() => (selectedFramework = fw.value)}
							>
								{$t(fw.labelKey)}
							</button>
						{/each}
					</div>
				</div>
			</div>

			<div class="class-filters" role="tablist" aria-label={$t('coa.filterByClass')}>
				<button
					type="button"
					class="class-chip"
					class:active={selectedClass == null}
					onclick={() => (selectedClass = null)}
				>
					{$t('coa.allClasses')}
				</button>
				{#each CLASSES as cls (cls.num)}
					<button
						type="button"
						class="class-chip"
						class:active={selectedClass === cls.num}
						onclick={() => (selectedClass = selectedClass === cls.num ? null : cls.num)}
					>
						<span class="chip-num">{cls.num}</span>
						<span class="chip-label">{$t(cls.labelKey)}</span>
					</button>
				{/each}
			</div>

			{#if query || selectedClass != null}
				<div class="filter-summary">
					<span>
						{filteredCount} / {totalCount} {$t('coa.accountsCount')}
					</span>
					<button type="button" class="clear-btn" onclick={clearFilters}>
						{$t('coa.clearFilters')}
					</button>
				</div>
			{/if}
		</div>

		{#if filtered.length === 0}
			<div class="empty-state">
				<p>{$t('coa.noResults')}</p>
				<button type="button" class="clear-btn" onclick={clearFilters}>
					{$t('coa.clearFilters')}
				</button>
			</div>
		{:else}
			<div class="class-groups">
				{#each grouped as group (group.num)}
					<section class="class-group">
						<header class="class-group-header">
							<span class="class-badge">{$t('coa.classPrefix')} {group.num}</span>
							<h2 class="class-group-title">{$t(`coa.class.${group.num}`)}</h2>
							<span class="class-group-count">
								{group.items.length}
								{$t('coa.accountsCount')}
							</span>
						</header>
						<div class="account-grid">
							{#each group.items as acc (acc.key)}
								<article class="account-card" data-type={acc.type}>
									<div class="account-card-top">
										<span class="account-code">{acc.frameworkCode}</span>
										<span class="account-type" data-type={acc.type}>
											{$t(`coa.type.${acc.type}`)}
										</span>
									</div>
									<h3 class="account-name">{getName(acc)}</h3>
									<div class="account-meta">
										<span class="meta-item">
											<span class="meta-label">{$t('coa.normalBalance')}:</span>
											<span
												class="meta-value balance-{acc.normalBalance}"
											>
												{$t(`coa.balance.${acc.normalBalance}`)}
											</span>
										</span>
										{#if acc.cfClass}
											<span class="meta-item">
												<span class="meta-label">{$t('coa.cashFlow')}:</span>
												<span class="meta-value">
													{$t(`coa.cf.${acc.cfClass}`)}
												</span>
											</span>
										{/if}
									</div>
								</article>
							{/each}
						</div>
					</section>
				{/each}
			</div>
		{/if}
	</div>
</section>

<style>
	.coa {
		padding: clamp(2.5rem, 5vw, 4rem) 0 4rem;
		min-height: calc(100vh - 60px);
	}

	.coa-container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 1.5rem;
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	/* ── Header ── */
	.coa-header {
		display: flex;
		flex-direction: column;
		gap: 0.625rem;
	}

	.coa-breadcrumb {
		font-family: var(--font-mono);
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--text-muted);
	}

	.coa-title {
		font-family: var(--font-display);
		font-size: clamp(1.75rem, 4vw, 2.5rem);
		font-weight: 700;
		letter-spacing: -0.02em;
		color: var(--text-primary);
		margin: 0;
		line-height: 1.15;
	}

	.coa-subtitle {
		font-size: 1rem;
		color: var(--text-secondary);
		line-height: 1.6;
		max-width: 65ch;
		margin: 0;
	}

	.coa-meta {
		display: flex;
		gap: 0.5rem;
		margin-top: 0.5rem;
	}

	.meta-pill {
		display: inline-flex;
		align-items: center;
		padding: 0.25rem 0.625rem;
		background: var(--panel);
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		font-family: var(--font-mono);
		font-size: 0.7rem;
		font-weight: 600;
		color: var(--accent);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.meta-pill--muted {
		color: var(--text-muted);
	}

	/* ── Controls ── */
	.coa-controls {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		padding: 1.25rem;
		background: var(--panel);
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-lg);
	}

	.control-row {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
		align-items: center;
	}

	.search-wrap {
		position: relative;
		flex: 1;
		min-width: 240px;
	}

	.search-icon {
		position: absolute;
		left: 0.75rem;
		top: 50%;
		transform: translateY(-50%);
		color: var(--text-muted);
		pointer-events: none;
	}

	.search-input {
		width: 100%;
		padding: 0.625rem 0.75rem 0.625rem 2.25rem;
		background: var(--bg);
		color: var(--text-primary);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		font-family: var(--font-body);
		font-size: 0.9rem;
		outline: none;
		transition: border-color var(--transition-fast);
		box-sizing: border-box;
	}

	.search-input:focus {
		border-color: var(--accent);
		box-shadow: 0 0 0 2px var(--accent-glow);
	}

	.search-input::placeholder {
		color: var(--text-muted);
	}

	.framework-switcher {
		display: flex;
		align-items: center;
		gap: 0.625rem;
		flex-shrink: 0;
	}

	.framework-label {
		font-family: var(--font-mono);
		font-size: 0.7rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--text-muted);
	}

	.framework-buttons {
		display: flex;
		gap: 0.125rem;
		padding: 0.25rem;
		background: var(--bg);
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-md);
	}

	.framework-btn {
		padding: 0.375rem 0.75rem;
		background: transparent;
		color: var(--text-muted);
		border: none;
		border-radius: var(--radius-sm);
		font-family: var(--font-mono);
		font-size: 0.72rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		cursor: pointer;
		transition:
			background var(--transition-fast),
			color var(--transition-fast);
	}

	.framework-btn:hover:not(.active) {
		color: var(--text-secondary);
		background: var(--panel-hover);
	}

	.framework-btn.active {
		background: var(--accent);
		color: #fff;
	}

	.class-filters {
		display: flex;
		flex-wrap: wrap;
		gap: 0.375rem;
	}

	.class-chip {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.4375rem 0.75rem;
		background: var(--bg);
		color: var(--text-secondary);
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-sm);
		font-family: var(--font-body);
		font-size: 0.8125rem;
		font-weight: 500;
		cursor: pointer;
		transition:
			background var(--transition-fast),
			border-color var(--transition-fast),
			color var(--transition-fast);
	}

	.class-chip:hover:not(.active) {
		border-color: var(--accent);
		color: var(--text-primary);
	}

	.class-chip.active {
		background: var(--accent);
		color: #fff;
		border-color: var(--accent);
	}

	.chip-num {
		font-family: var(--font-mono);
		font-weight: 700;
	}

	.filter-summary {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding-top: 0.75rem;
		border-top: 1px solid var(--border-subtle);
		font-size: 0.8125rem;
		color: var(--text-muted);
	}

	.clear-btn {
		background: none;
		border: none;
		color: var(--accent);
		font-family: var(--font-body);
		font-size: 0.8125rem;
		font-weight: 500;
		cursor: pointer;
		padding: 0.25rem 0.5rem;
		border-radius: var(--radius-sm);
		transition: background var(--transition-fast);
	}

	.clear-btn:hover {
		background: var(--accent-glow);
	}

	/* ── Empty state ── */
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
		padding: 4rem 2rem;
		background: var(--panel);
		border: 1px dashed var(--border);
		border-radius: var(--radius-lg);
		color: var(--text-muted);
	}

	/* ── Class groups ── */
	.class-groups {
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	.class-group {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.class-group-header {
		display: flex;
		align-items: baseline;
		gap: 0.875rem;
		padding-bottom: 0.625rem;
		border-bottom: 1px solid var(--border-subtle);
	}

	.class-badge {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0.25rem 0.625rem;
		background: var(--accent-glow);
		color: var(--accent);
		border-radius: var(--radius-sm);
		font-family: var(--font-mono);
		font-size: 0.7rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}

	.class-group-title {
		font-family: var(--font-display);
		font-size: 1.25rem;
		font-weight: 600;
		color: var(--text-primary);
		margin: 0;
		flex: 1;
	}

	.class-group-count {
		font-family: var(--font-mono);
		font-size: 0.75rem;
		color: var(--text-muted);
	}

	.account-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 0.75rem;
	}

	/* ── Account card ── */
	.account-card {
		display: flex;
		flex-direction: column;
		gap: 0.625rem;
		padding: 1rem;
		background: var(--panel);
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-md);
		transition:
			border-color var(--transition-fast),
			box-shadow var(--transition-smooth),
			transform var(--transition-fast);
	}

	.account-card:hover {
		border-color: var(--accent);
		box-shadow: 0 0 16px var(--accent-glow);
		transform: translateY(-1px);
	}

	.account-card-top {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
	}

	.account-code {
		font-family: var(--font-mono);
		font-size: 0.9rem;
		font-weight: 700;
		color: var(--accent);
		letter-spacing: 0.01em;
	}

	.account-type {
		font-family: var(--font-mono);
		font-size: 0.65rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		padding: 0.125rem 0.5rem;
		border-radius: var(--radius-sm);
		background: var(--bg-subtle);
		color: var(--text-muted);
	}

	.account-type[data-type='asset'] {
		color: var(--green);
		background: var(--green-glow);
	}

	.account-type[data-type='liability'] {
		color: var(--amber);
		background: var(--amber-glow);
	}

	.account-type[data-type='equity'] {
		color: var(--accent);
		background: var(--accent-glow);
	}

	.account-type[data-type='revenue'] {
		color: var(--green);
		background: var(--green-glow);
	}

	.account-type[data-type='expense'] {
		color: var(--error);
		background: color-mix(in srgb, var(--error) 15%, transparent);
	}

	.account-name {
		font-family: var(--font-body);
		font-size: 0.9rem;
		font-weight: 500;
		color: var(--text-primary);
		margin: 0;
		line-height: 1.4;
	}

	.account-meta {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		margin-top: auto;
		padding-top: 0.5rem;
		border-top: 1px solid var(--border-subtle);
	}

	.meta-item {
		display: flex;
		gap: 0.375rem;
		font-size: 0.75rem;
		color: var(--text-muted);
	}

	.meta-label {
		font-family: var(--font-mono);
		text-transform: uppercase;
		letter-spacing: 0.04em;
		font-size: 0.65rem;
	}

	.meta-value {
		color: var(--text-secondary);
		font-weight: 500;
	}

	.meta-value.balance-debit {
		color: var(--green);
	}

	.meta-value.balance-credit {
		color: var(--amber);
	}

	/* ── Responsive ── */
	@media (max-width: 720px) {
		.control-row {
			flex-direction: column;
			align-items: stretch;
		}

		.framework-switcher {
			justify-content: space-between;
		}

		.account-grid {
			grid-template-columns: 1fr;
		}

		.class-group-header {
			flex-wrap: wrap;
		}
	}
</style>
