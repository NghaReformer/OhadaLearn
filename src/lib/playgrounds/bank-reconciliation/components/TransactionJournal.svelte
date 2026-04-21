<script lang="ts">
	import NumberField from '$lib/components/playground/NumberField.svelte';
	import { currency$ } from '$lib/stores/preferences';
	import { fmtCurrency } from '$lib/format';
	import type { BankTransaction, LedgerEntry, ReconciliationInputs } from '../types';

	let {
		inputs,
		variance,
		isReconciled,
		onAddBank,
		onAddLedger,
		titleLabel,
		sideBankLabel,
		sideBooksLabel,
		directionInflowLabel,
		directionOutflowLabel,
		dateLabel,
		descriptionLabel,
		descriptionPlaceholder,
		referenceLabel,
		referencePlaceholder,
		amountLabel,
		addLabel,
		hintReconciled,
		hintBankHeavier,
		hintBooksHeavier,
	}: {
		inputs: ReconciliationInputs;
		variance: number;
		isReconciled: boolean;
		onAddBank: (tx: BankTransaction) => void;
		onAddLedger: (entry: LedgerEntry) => void;
		titleLabel: string;
		sideBankLabel: string;
		sideBooksLabel: string;
		directionInflowLabel: string;
		directionOutflowLabel: string;
		dateLabel: string;
		descriptionLabel: string;
		descriptionPlaceholder: string;
		referenceLabel: string;
		referencePlaceholder: string;
		amountLabel: string;
		addLabel: string;
		hintReconciled: string;
		hintBankHeavier: string;
		hintBooksHeavier: string;
	} = $props();

	let currency = $derived($currency$);

	let side = $state<'bank' | 'books'>('bank');
	let direction = $state<'inflow' | 'outflow'>('outflow');
	let date = $state<string>('');
	let description = $state<string>('');
	let reference = $state<string>('');
	let amount = $state<number>(0);

	$effect(() => {
		if (!date) date = inputs.periodEnd;
	});

	let canSubmit = $derived(amount > 0 && description.trim().length > 0);

	function nextId(prefix: string): string {
		return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
	}

	function submit(e?: Event): void {
		e?.preventDefault();
		if (!canSubmit) return;
		const signedAmount = direction === 'inflow' ? amount : -amount;
		const ref = reference.trim() || undefined;
		if (side === 'bank') {
			const tx: BankTransaction = {
				id: nextId('br-bank'),
				date: date || inputs.periodEnd,
				description: description.trim(),
				reference: ref,
				amount: signedAmount,
				cleared: true,
			};
			onAddBank(tx);
		} else {
			const entry: LedgerEntry = {
				id: nextId('br-ledger'),
				date: date || inputs.periodEnd,
				description: description.trim(),
				reference: ref,
				amount: signedAmount,
				recorded: true,
			};
			onAddLedger(entry);
		}
		description = '';
		reference = '';
		amount = 0;
	}

	let hintText = $derived.by(() => {
		if (isReconciled) return hintReconciled;
		const formatted = fmtCurrency(Math.abs(variance), currency);
		const tpl = variance > 0 ? hintBankHeavier : hintBooksHeavier;
		return tpl.replace('{amount}', formatted);
	});
</script>

<form class="journal" aria-labelledby="br-journal-title" onsubmit={submit}>
	<header class="journal-header">
		<h3 class="journal-title" id="br-journal-title">{titleLabel}</h3>
	</header>

	<div class="hint" data-state={isReconciled ? 'ok' : variance > 0 ? 'bank-heavy' : 'books-heavy'}>
		<svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
			{#if isReconciled}
				<path d="M3 8.5l3.5 3.5L13 5" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" />
			{:else}
				<circle cx="8" cy="8" r="6.4" stroke="currentColor" stroke-width="1.4" fill="none" />
				<path d="M8 4.5v4.5M8 11.5v.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
			{/if}
		</svg>
		<span>{hintText}</span>
	</div>

	<div class="side-toggle" role="tablist" aria-label="Transaction side">
		<button
			type="button"
			class="side-btn"
			class:active={side === 'bank'}
			role="tab"
			aria-selected={side === 'bank'}
			onclick={() => (side = 'bank')}
		>
			{sideBankLabel}
		</button>
		<button
			type="button"
			class="side-btn"
			class:active={side === 'books'}
			role="tab"
			aria-selected={side === 'books'}
			onclick={() => (side = 'books')}
		>
			{sideBooksLabel}
		</button>
	</div>

	<div class="form-grid">
		<label class="field date-field">
			<span class="field-label">{dateLabel}</span>
			<input
				type="date"
				class="field-input"
				bind:value={date}
				aria-label={dateLabel}
			/>
		</label>

		<label class="field desc-field">
			<span class="field-label">{descriptionLabel}</span>
			<input
				type="text"
				class="field-input"
				bind:value={description}
				placeholder={descriptionPlaceholder}
				aria-label={descriptionLabel}
			/>
		</label>

		<label class="field ref-field">
			<span class="field-label">{referenceLabel}</span>
			<input
				type="text"
				class="field-input"
				bind:value={reference}
				placeholder={referencePlaceholder}
				aria-label={referenceLabel}
			/>
		</label>

		<div class="field direction-field">
			<span class="field-label" id="br-journal-direction">&nbsp;</span>
			<div class="direction-toggle" role="radiogroup" aria-labelledby="br-journal-direction">
				<button
					type="button"
					class="dir-btn inflow"
					class:active={direction === 'inflow'}
					role="radio"
					aria-checked={direction === 'inflow'}
					onclick={() => (direction = 'inflow')}
				>
					+ {directionInflowLabel}
				</button>
				<button
					type="button"
					class="dir-btn outflow"
					class:active={direction === 'outflow'}
					role="radio"
					aria-checked={direction === 'outflow'}
					onclick={() => (direction = 'outflow')}
				>
					− {directionOutflowLabel}
				</button>
			</div>
		</div>

		<div class="field amount-field">
			<NumberField
				label={amountLabel}
				value={amount}
				onChange={(v) => (amount = v)}
				min={0}
			/>
		</div>

		<button
			type="submit"
			class="add-btn"
			disabled={!canSubmit}
			aria-label={addLabel}
		>
			<svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
				<path d="M8 3v10M3 8h10" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" />
			</svg>
			{addLabel}
		</button>
	</div>
</form>

<style>
	.journal {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
		padding: 0.85rem 1rem 1rem;
		background: var(--panel);
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-sm);
	}

	.journal-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	.journal-title {
		margin: 0;
		font-family: var(--font-mono, monospace);
		font-size: 0.6875rem;
		font-weight: 600;
		color: var(--text-muted);
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	.hint {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 0.7rem;
		border-radius: var(--radius-sm);
		font-size: 0.78125rem;
		line-height: 1.4;
		background: var(--bg-subtle);
		color: var(--text-secondary);
		transition: background 0.4s ease, color 0.4s ease;
	}
	.hint[data-state='ok'] {
		background: color-mix(in srgb, var(--green, #22c55e) 14%, transparent);
		color: var(--green, #22c55e);
	}
	.hint[data-state='bank-heavy'],
	.hint[data-state='books-heavy'] {
		background: color-mix(in srgb, var(--accent, #6ea8fe) 12%, transparent);
		color: var(--text-primary);
	}
	.hint svg {
		flex-shrink: 0;
	}

	.side-toggle {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 4px;
		padding: 4px;
		background: var(--bg-subtle);
		border-radius: var(--radius-sm);
	}
	.side-btn {
		padding: 0.4rem 0.6rem;
		background: transparent;
		border: none;
		border-radius: calc(var(--radius-sm) - 2px);
		font-family: var(--font-body);
		font-size: 0.8125rem;
		font-weight: 500;
		color: var(--text-secondary);
		cursor: pointer;
		transition: background 0.2s ease, color 0.2s ease;
	}
	.side-btn:hover {
		color: var(--text-primary);
	}
	.side-btn.active {
		background: var(--panel);
		color: var(--accent, #6ea8fe);
		font-weight: 600;
		box-shadow: var(--shadow-sm);
	}

	.form-grid {
		display: grid;
		grid-template-columns: 130px 1fr 130px;
		grid-template-areas:
			'date desc ref'
			'dir amount add';
		gap: 0.5rem 0.6rem;
		align-items: end;
	}
	.date-field { grid-area: date; }
	.desc-field { grid-area: desc; }
	.ref-field { grid-area: ref; }
	.direction-field { grid-area: dir; }
	.amount-field { grid-area: amount; }

	.field {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		min-width: 0;
	}
	.field-label {
		font-family: var(--font-body);
		font-size: 0.6875rem;
		font-weight: 600;
		color: var(--text-secondary);
		letter-spacing: 0.02em;
	}
	.field-input {
		padding: 0.45rem 0.55rem;
		background: var(--bg, var(--panel));
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-sm);
		color: var(--text-primary);
		font-family: var(--font-mono, monospace);
		font-size: 0.8125rem;
		transition: border-color 0.15s ease, box-shadow 0.15s ease;
	}
	.field-input:focus {
		outline: none;
		border-color: var(--accent, #6ea8fe);
		box-shadow: 0 0 0 2px var(--accent-glow, rgba(110, 168, 254, 0.18));
	}

	.direction-toggle {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 2px;
		padding: 2px;
		background: var(--bg-subtle);
		border-radius: var(--radius-sm);
	}
	.dir-btn {
		padding: 0.4rem 0.4rem;
		background: transparent;
		border: none;
		border-radius: calc(var(--radius-sm) - 2px);
		font-family: var(--font-mono, monospace);
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--text-muted);
		cursor: pointer;
		transition: background 0.15s ease, color 0.15s ease;
	}
	.dir-btn.inflow.active {
		background: color-mix(in srgb, var(--green, #22c55e) 18%, transparent);
		color: var(--green, #22c55e);
	}
	.dir-btn.outflow.active {
		background: color-mix(in srgb, var(--orange, #f59e0b) 22%, transparent);
		color: var(--orange, #f59e0b);
	}

	.add-btn {
		grid-area: add;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.4rem;
		padding: 0.55rem 0.85rem;
		height: fit-content;
		background: var(--accent, #6ea8fe);
		color: white;
		border: none;
		border-radius: var(--radius-sm);
		font-family: var(--font-body);
		font-size: 0.8125rem;
		font-weight: 600;
		cursor: pointer;
		transition: background 0.15s ease, transform 0.1s ease;
	}
	.add-btn:hover:not(:disabled) {
		background: color-mix(in srgb, var(--accent, #6ea8fe) 88%, white);
	}
	.add-btn:active:not(:disabled) {
		transform: scale(0.97);
	}
	.add-btn:disabled {
		background: var(--bg-subtle);
		color: var(--text-muted);
		cursor: not-allowed;
	}

	@media (max-width: 720px) {
		.form-grid {
			grid-template-columns: 1fr 1fr;
			grid-template-areas:
				'date ref'
				'desc desc'
				'dir amount'
				'add add';
		}
	}
</style>
