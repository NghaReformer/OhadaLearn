<script lang="ts">
	import { t } from '$lib/i18n';
	import { currency$ } from '$lib/stores/preferences';
	import { fmtCurrency } from '$lib/format';
	import type { DraftEntry, DraftLine, ValidationError, ValidationResult } from '../types';
	import AccountPicker from '$lib/components/playground/AccountPicker.svelte';
	import BalanceIndicator from '$lib/components/playground/BalanceIndicator.svelte';

	let {
		draft,
		onUpdate,
		onPost,
		validation,
	}: {
		draft: DraftEntry;
		onUpdate: (draft: DraftEntry) => void;
		onPost: () => void;
		validation: ValidationResult | null;
	} = $props();

	let totalDebit = $derived(
		draft.lines.reduce((sum, l) => sum + (typeof l.debit === 'number' ? l.debit : 0), 0)
	);

	let totalCredit = $derived(
		draft.lines.reduce((sum, l) => sum + (typeof l.credit === 'number' ? l.credit : 0), 0)
	);

	let canPost = $derived(validation !== null && validation.valid);
	let translate = $derived($t);
	let currency = $derived($currency$);

	function renderError(error: ValidationError): string {
		const message = translate(error.key);
		if (!error.params) return message;
		return message.replace(/\{(\w+)\}/g, (_, name: string) => {
			const value = error.params?.[name];
			if (value === undefined) return `{${name}}`;
			if (typeof value === 'number') return fmtCurrency(value, currency);
			return String(value);
		});
	}

	function updateDate(e: Event) {
		const target = e.target as HTMLInputElement;
		onUpdate({ ...draft, date: target.value });
	}

	function updateDescription(e: Event) {
		const target = e.target as HTMLInputElement;
		onUpdate({ ...draft, description: target.value });
	}

	function updateLineAccount(index: number, key: string) {
		const lines = [...draft.lines];
		lines[index] = { ...lines[index], accountKey: key };
		onUpdate({ ...draft, lines });
	}

	function updateLineDebit(index: number, e: Event) {
		const target = e.target as HTMLInputElement;
		const lines = [...draft.lines];
		const val = target.value === '' ? '' : parseFloat(target.value);
		lines[index] = {
			...lines[index],
			debit: val === '' || isNaN(val as number) ? '' : (val as number),
			credit: '',
		};
		onUpdate({ ...draft, lines });
	}

	function updateLineCredit(index: number, e: Event) {
		const target = e.target as HTMLInputElement;
		const lines = [...draft.lines];
		const val = target.value === '' ? '' : parseFloat(target.value);
		lines[index] = {
			...lines[index],
			credit: val === '' || isNaN(val as number) ? '' : (val as number),
			debit: '',
		};
		onUpdate({ ...draft, lines });
	}

	function removeLine(index: number) {
		if (draft.lines.length <= 2) return;
		const lines = draft.lines.filter((_, i) => i !== index);
		onUpdate({ ...draft, lines });
	}

	function addLine() {
		const newLine: DraftLine = { accountKey: '', debit: '', credit: '' };
		onUpdate({ ...draft, lines: [...draft.lines, newLine] });
	}
</script>

<div class="je-form">
	<!-- Header fields -->
	<div class="form-header">
		<div class="field">
			<label class="field-label" for="je-date">{$t('je.form.date')}</label>
			<input
				id="je-date"
				type="date"
				class="field-input"
				value={draft.date}
				oninput={updateDate}
			/>
		</div>
		<div class="field field-desc">
			<label class="field-label" for="je-desc">{$t('je.form.description')}</label>
			<input
				id="je-desc"
				type="text"
				class="field-input"
				value={draft.description}
				oninput={updateDescription}
				placeholder={$t('je.form.description')}
			/>
		</div>
	</div>

	<!-- Lines table -->
	<div class="lines-table" role="table" aria-label="Journal entry lines">
		<div class="lines-header" role="row">
			<span class="col-account" role="columnheader">{$t('je.form.account')}</span>
			<span class="col-debit" role="columnheader">{$t('je.form.debit')}</span>
			<span class="col-credit" role="columnheader">{$t('je.form.credit')}</span>
			<span class="col-actions" role="columnheader" aria-label="Actions"></span>
		</div>

		{#each draft.lines as line, i (i)}
			<div class="line-row" role="row">
				<div class="col-account" role="cell">
					<AccountPicker
						value={line.accountKey}
						onchange={(key) => updateLineAccount(i, key)}
						placeholder={$t('je.form.account')}
						ariaLabel={$t('je.form.account')}
					/>
				</div>
				<div class="col-debit" role="cell">
					<input
						type="number"
						class="amount-input"
						value={typeof line.debit === 'number' ? line.debit : ''}
						oninput={(e) => updateLineDebit(i, e)}
						disabled={typeof line.credit === 'number' && line.credit > 0}
						placeholder="0"
						min="0"
						step="any"
						aria-label="{$t('je.form.debit')} {i + 1}"
					/>
				</div>
				<div class="col-credit" role="cell">
					<input
						type="number"
						class="amount-input"
						value={typeof line.credit === 'number' ? line.credit : ''}
						oninput={(e) => updateLineCredit(i, e)}
						disabled={typeof line.debit === 'number' && line.debit > 0}
						placeholder="0"
						min="0"
						step="any"
						aria-label="{$t('je.form.credit')} {i + 1}"
					/>
				</div>
				<div class="col-actions" role="cell">
					<button
						class="btn-remove"
						type="button"
						onclick={() => removeLine(i)}
						disabled={draft.lines.length <= 2}
						aria-label={$t('je.form.removeLine')}
						title={$t('je.form.removeLine')}
					>
						<svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
							<path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
						</svg>
					</button>
				</div>
			</div>
		{/each}
	</div>

	<!-- Add line button -->
	<button class="btn-add-line" type="button" onclick={addLine}>
		<svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
			<path d="M8 3v10M3 8h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
		</svg>
		{$t('je.form.addLine')}
	</button>

	<!-- Balance indicator -->
	<BalanceIndicator
		{totalDebit}
		{totalCredit}
		debitLabel={$t('je.form.debit')}
		creditLabel={$t('je.form.credit')}
		balancedLabel={$t('je.form.balanced')}
		unbalancedLabel={$t('je.form.unbalanced')}
	/>

	<!-- Validation errors -->
	{#if validation && !validation.valid && validation.errors.length > 0}
		<ul class="validation-errors" role="alert">
			{#each validation.errors as error, i (i)}
				<li class="validation-error">{renderError(error)}</li>
			{/each}
		</ul>
	{/if}

	<!-- Post button -->
	<button
		class="btn-post"
		type="button"
		onclick={onPost}
		disabled={!canPost}
	>
		{$t('je.form.post')}
	</button>
</div>

<style>
	.je-form {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	/* ---- Header fields ---- */
	.form-header {
		display: flex;
		gap: 0.75rem;
		flex-wrap: wrap;
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.field-desc {
		flex: 1;
		min-width: 160px;
	}

	.field-label {
		font-family: var(--font-body);
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.03em;
	}

	.field-input {
		padding: 0.5rem 0.625rem;
		background: var(--bg);
		color: var(--text-primary);
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-sm);
		font-family: var(--font-body);
		font-size: 0.875rem;
		outline: none;
		transition: border-color var(--transition-fast);
	}

	.field-input:focus {
		border-color: var(--accent);
		box-shadow: 0 0 0 2px var(--accent-glow);
	}

	/* Fix date input styling in dark mode */
	input[type='date'] {
		color-scheme: dark;
	}

	/* ---- Lines table ---- */
	/*
	 * NOTE: no `overflow: hidden` here. Account picker dropdowns are
	 * position:absolute inside `.account-picker` and must be allowed to
	 * escape this container, otherwise the dropdown for the last row gets
	 * clipped to 0px and users cannot select accounts. Rounded corners are
	 * preserved by radiusing the header and last row explicitly.
	 */
	.lines-table {
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-md);
		position: relative;
	}

	.lines-header {
		display: grid;
		grid-template-columns: 1fr 100px 100px 36px;
		gap: 0;
		padding: 0.5rem 0.625rem;
		background: var(--bg-subtle);
		border-bottom: 1px solid var(--border-subtle);
		border-top-left-radius: var(--radius-md);
		border-top-right-radius: var(--radius-md);
		font-family: var(--font-body);
		font-size: 0.6875rem;
		font-weight: 700;
		color: var(--text-muted);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.col-debit,
	.col-credit {
		text-align: right;
	}

	.col-actions {
		text-align: center;
	}

	.line-row {
		display: grid;
		grid-template-columns: 1fr 100px 100px 36px;
		gap: 0;
		padding: 0.375rem 0.625rem;
		border-bottom: 1px solid var(--border-subtle);
		align-items: center;
	}

	.line-row:last-child {
		border-bottom: none;
		border-bottom-left-radius: var(--radius-md);
		border-bottom-right-radius: var(--radius-md);
	}

	.amount-input {
		width: 100%;
		padding: 0.375rem 0.5rem;
		background: var(--bg);
		color: var(--text-primary);
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-sm);
		font-family: var(--font-mono);
		font-size: 0.8125rem;
		text-align: right;
		outline: none;
		transition: border-color var(--transition-fast);
		box-sizing: border-box;
		appearance: textfield;
		-moz-appearance: textfield;
	}

	.amount-input::-webkit-inner-spin-button,
	.amount-input::-webkit-outer-spin-button {
		appearance: none;
		-webkit-appearance: none;
		margin: 0;
	}

	.amount-input:focus {
		border-color: var(--accent);
		box-shadow: 0 0 0 2px var(--accent-glow);
	}

	.amount-input:disabled {
		opacity: 0.35;
		cursor: not-allowed;
		background: var(--bg-subtle);
	}

	.btn-remove {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 28px;
		margin: 0 auto;
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
		opacity: 0.25;
		cursor: not-allowed;
	}

	/* ---- Add line button ---- */
	.btn-add-line {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.4375rem 0.75rem;
		background: none;
		border: 1px dashed var(--border);
		border-radius: var(--radius-sm);
		color: var(--text-secondary);
		font-family: var(--font-body);
		font-size: 0.8125rem;
		cursor: pointer;
		transition: all var(--transition-fast);
		align-self: flex-start;
	}

	.btn-add-line:hover {
		border-color: var(--accent);
		color: var(--accent);
	}

	/* ---- Validation errors ---- */
	.validation-errors {
		list-style: none;
		margin: 0;
		padding: 0.5rem 0.75rem;
		background: color-mix(in srgb, var(--error) 8%, transparent);
		border: 1px solid color-mix(in srgb, var(--error) 30%, transparent);
		border-radius: var(--radius-sm);
	}

	.validation-error {
		color: var(--error);
		font-size: 0.8125rem;
		font-family: var(--font-body);
		padding: 0.125rem 0;
	}

	.validation-error::before {
		content: '\2022  ';
	}

	/* ---- Post button ---- */
	.btn-post {
		padding: 0.625rem 1.25rem;
		background: var(--accent);
		color: var(--text-primary);
		border: none;
		border-radius: var(--radius-sm);
		font-family: var(--font-body);
		font-size: 0.875rem;
		font-weight: 600;
		cursor: pointer;
		transition: all var(--transition-fast);
		align-self: flex-end;
	}

	.btn-post:hover:not(:disabled) {
		box-shadow: 0 0 12px var(--accent-glow);
	}

	.btn-post:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	/* ---- Responsive ---- */
	@media (max-width: 560px) {
		.lines-header {
			grid-template-columns: 1fr 72px 72px 32px;
			font-size: 0.625rem;
		}

		.line-row {
			grid-template-columns: 1fr 72px 72px 32px;
			padding: 0.25rem 0.375rem;
		}

		.amount-input {
			padding: 0.25rem 0.375rem;
			font-size: 0.75rem;
		}

		.form-header {
			flex-direction: column;
		}
	}

	@media (max-width: 400px) {
		.lines-header,
		.line-row {
			grid-template-columns: 1fr;
			gap: 0.25rem;
		}

		.col-debit,
		.col-credit {
			text-align: left;
		}

		.lines-header .col-actions,
		.lines-header .col-debit,
		.lines-header .col-credit {
			display: none;
		}
	}
</style>
