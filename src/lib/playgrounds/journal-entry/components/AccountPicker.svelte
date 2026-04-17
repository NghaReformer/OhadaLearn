<script lang="ts">
	import { t } from '$lib/i18n';
	import { locale } from '$lib/i18n';
	import { accountingStandard$ } from '$lib/stores/preferences';
	import { searchAccounts, getAccount, formatAccountLabel } from '$lib/shared/chart-of-accounts';
	import type { AccountingFramework } from '$lib/shared/chart-of-accounts/types';
	import type { AccountingStandard } from '$lib/contracts/playground';
	import type { ResolvedAccount } from '$lib/shared/chart-of-accounts';

	let {
		value,
		onchange,
	}: {
		value: string;
		onchange: (key: string) => void;
	} = $props();

	const standardToFramework: Record<AccountingStandard, AccountingFramework> = {
		syscohada: 'ohada',
		ifrs: 'ifrs',
		'french-pcg': 'pcg',
		'us-gaap': 'usgaap',
	};

	let inputEl: HTMLInputElement | undefined = $state(undefined);
	let listEl: HTMLUListElement | undefined = $state(undefined);
	let query = $state('');
	let isOpen = $state(false);
	let highlightIndex = $state(-1);

	let framework = $derived(standardToFramework[$accountingStandard$]);
	let currentLocale = $derived($locale);

	let selectedAccount = $derived.by(() => {
		if (!value) return null;
		return getAccount(value, framework);
	});

	let displayText = $derived.by(() => {
		if (!isOpen && selectedAccount) {
			return formatAccountLabel(selectedAccount, currentLocale);
		}
		return query;
	});

	let results = $derived.by(() => {
		if (!query || query.length === 0) return [];
		return searchAccounts(query, framework, currentLocale);
	});

	function handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		query = target.value;
		isOpen = true;
		highlightIndex = -1;
	}

	function handleFocus() {
		if (selectedAccount) {
			query = '';
		}
		isOpen = true;
		highlightIndex = -1;
	}

	function selectAccount(account: ResolvedAccount) {
		onchange(account.key);
		query = '';
		isOpen = false;
		highlightIndex = -1;
		inputEl?.blur();
	}

	function close() {
		isOpen = false;
		query = '';
		highlightIndex = -1;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (!isOpen || results.length === 0) {
			if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
				isOpen = true;
				e.preventDefault();
			}
			return;
		}

		switch (e.key) {
			case 'ArrowDown':
				e.preventDefault();
				highlightIndex = (highlightIndex + 1) % results.length;
				scrollToHighlighted();
				break;
			case 'ArrowUp':
				e.preventDefault();
				highlightIndex = highlightIndex <= 0 ? results.length - 1 : highlightIndex - 1;
				scrollToHighlighted();
				break;
			case 'Enter':
				e.preventDefault();
				if (highlightIndex >= 0 && highlightIndex < results.length) {
					selectAccount(results[highlightIndex]);
				}
				break;
			case 'Escape':
				e.preventDefault();
				close();
				break;
		}
	}

	function scrollToHighlighted() {
		if (!listEl) return;
		const item = listEl.children[highlightIndex] as HTMLElement | undefined;
		item?.scrollIntoView({ block: 'nearest' });
	}

	function handleClickOutside(e: MouseEvent) {
		const target = e.target as Node;
		if (inputEl && !inputEl.contains(target) && listEl && !listEl.contains(target)) {
			close();
		}
	}

	function getAccountDisplayName(account: ResolvedAccount): string {
		return currentLocale === 'fr' ? account.frameworkNameFr : account.frameworkNameEn;
	}
</script>

<svelte:document onclick={handleClickOutside} />

<!--
	The wrapper commits focus on mousedown (before the click fires) so that
	any click landing on the padding around the input — or on the sr-only
	label — synchronously transfers focus to our input and causes whatever
	input was previously focused (typically a sibling row's Debit/Credit
	number input) to blur before the user's next keystroke arrives. Without
	this, digits typed into the picker could leak into the previously
	focused number field. See Bug 1 in the QA report.
-->
<div
	class="account-picker"
	onmousedown={(e) => {
		if (inputEl && e.target !== inputEl) {
			e.preventDefault();
			inputEl.focus();
		}
	}}
	role="presentation"
>
	<label class="picker-label" for={undefined}>
		<span class="sr-only">{$t('je.form.account')}</span>
	</label>
	<input
		bind:this={inputEl}
		type="text"
		class="picker-input"
		placeholder={$t('je.form.account')}
		value={displayText}
		oninput={handleInput}
		onfocus={handleFocus}
		onkeydown={handleKeydown}
		role="combobox"
		aria-expanded={isOpen && results.length > 0}
		aria-haspopup="listbox"
		aria-autocomplete="list"
		aria-controls="account-picker-listbox"
		autocomplete="off"
	/>

	{#if isOpen && results.length > 0}
		<ul
			bind:this={listEl}
			class="picker-dropdown"
			role="listbox"
			id="account-picker-listbox"
		>
			{#each results as account, i (account.key)}
				{@const hasCode = account.frameworkCode && account.frameworkCode !== '-'}
				<li
					class="picker-option"
					class:highlighted={i === highlightIndex}
					role="option"
					aria-selected={i === highlightIndex}
					title={formatAccountLabel(account, currentLocale)}
					onmousedown={(e) => { e.preventDefault(); selectAccount(account); }}
					onmouseenter={() => (highlightIndex = i)}
				>
					{#if hasCode}
						<span class="option-code">{account.frameworkCode}</span>
					{/if}
					<span class="option-name">{getAccountDisplayName(account)}</span>
					<span class="option-side" aria-label={account.normalBalance === 'debit' ? 'debit-normal' : 'credit-normal'}>
						{account.normalBalance === 'debit' ? 'Dr' : 'Cr'}
					</span>
					<span class="option-type">{account.type}</span>
				</li>
			{/each}
		</ul>
	{/if}
</div>

<style>
	.account-picker {
		position: relative;
		width: 100%;
	}

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}

	.picker-input {
		width: 100%;
		padding: 0.5rem 0.625rem;
		background: var(--bg);
		color: var(--text-primary);
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-sm);
		font-family: var(--font-body);
		font-size: 0.8125rem;
		transition: border-color var(--transition-fast);
		outline: none;
		box-sizing: border-box;
	}

	.picker-input:focus {
		border-color: var(--accent);
		box-shadow: 0 0 0 2px var(--accent-glow);
	}

	.picker-input::placeholder {
		color: var(--text-muted);
	}

	.picker-dropdown {
		position: absolute;
		top: 100%;
		left: 0;
		z-index: 50;
		margin: 0.25rem 0 0;
		padding: 0.25rem 0;
		background: var(--panel);
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		box-shadow: var(--shadow-sm);
		max-height: 280px;
		overflow-y: auto;
		list-style: none;
		/* Let the dropdown extend well beyond the narrow account column so
		   long SYSCOHADA labels are readable without being clipped. */
		min-width: 100%;
		width: max-content;
		max-width: min(420px, 96vw);
	}

	.picker-option {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.4375rem 0.625rem;
		cursor: pointer;
		transition: background var(--transition-fast);
		font-size: 0.8125rem;
	}

	.picker-option:hover {
		background: var(--panel-hover);
	}

	.picker-option.highlighted {
		/* Distinct, high-contrast state so keyboard users can clearly track
		   the focused row. Uses the accent glow plus a left border marker. */
		background: var(--accent-glow);
		box-shadow: inset 3px 0 0 0 var(--accent);
	}

	.picker-option.highlighted .option-name {
		color: var(--accent);
	}

	.option-code {
		font-family: var(--font-mono);
		font-size: 0.75rem;
		color: var(--accent);
		flex-shrink: 0;
		min-width: 3rem;
	}

	.option-name {
		color: var(--text-primary);
		flex: 1;
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.option-side {
		font-family: var(--font-mono);
		font-size: 0.6875rem;
		color: var(--text-secondary);
		flex-shrink: 0;
		padding: 0.0625rem 0.3125rem;
		border-radius: var(--radius-sm);
		background: var(--bg-subtle);
	}

	.option-type {
		font-size: 0.6875rem;
		color: var(--text-muted);
		text-transform: uppercase;
		letter-spacing: 0.03em;
		flex-shrink: 0;
	}

	.picker-dropdown::-webkit-scrollbar {
		width: 5px;
	}

	.picker-dropdown::-webkit-scrollbar-track {
		background: transparent;
	}

	.picker-dropdown::-webkit-scrollbar-thumb {
		background: var(--border);
		border-radius: 3px;
	}
</style>
