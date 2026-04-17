<script lang="ts">
	import { t } from '$lib/i18n';
	import type {
		CompoundingFrequency,
		PaymentFrequency,
		PaymentTiming,
		PeriodsUnit,
		SolveMode,
		TVMPlaygroundState
	} from '../types';

	let {
		state,
		onUpdate
	}: {
		state: TVMPlaygroundState;
		onUpdate: (partial: Partial<TVMPlaygroundState>) => void;
	} = $props();

	const modes: SolveMode[] = ['pv', 'fv', 'pmt', 'rate', 'periods'];
	const compoundingOptions: CompoundingFrequency[] = [
		'annual',
		'semi',
		'quarterly',
		'monthly',
		'daily',
		'continuous'
	];
	const paymentFrequencyOptions: PaymentFrequency[] = [
		'annual',
		'semi',
		'quarterly',
		'monthly',
		'daily'
	];

	type NumericField = 'pv' | 'fv' | 'pmt' | 'rate' | 'periods';

	const numericFieldOrder: NumericField[] = ['pv', 'fv', 'pmt', 'rate', 'periods'];

	function handleNumber(field: NumericField, event: Event) {
		const target = event.target as HTMLInputElement;
		const raw = target.value.trim();
		if (raw === '') {
			onUpdate({ [field]: '' } as Partial<TVMPlaygroundState>);
			return;
		}
		const parsed = Number(raw.replace(/\s/g, '').replace(',', '.'));
		if (!Number.isFinite(parsed)) return;
		onUpdate({ [field]: parsed } as Partial<TVMPlaygroundState>);
	}

	function selectMode(mode: SolveMode) {
		onUpdate({ mode });
	}

	function fieldLabelKey(field: NumericField): string {
		switch (field) {
			case 'pv':
				return 'tvm.global.pv';
			case 'fv':
				return 'tvm.global.fv';
			case 'pmt':
				return 'tvm.global.pmt';
			case 'rate':
				return 'tvm.global.rate';
			case 'periods':
				return 'tvm.global.periods';
		}
	}

	function fieldStep(field: NumericField): string {
		if (field === 'rate') return '0.01';
		if (field === 'periods') return '0.01';
		return 'any';
	}

	function fieldSuffix(field: NumericField): string {
		if (field === 'rate') return '%';
		return '';
	}

	let pmtDisabledByContinuous = $derived(state.compoundingFrequency === 'continuous');

	let pillRefs: HTMLButtonElement[] = [];

	function focusPillAt(index: number) {
		const wrapped = ((index % modes.length) + modes.length) % modes.length;
		const btn = pillRefs[wrapped];
		if (btn) btn.focus();
		selectMode(modes[wrapped]);
	}

	function handleTablistKeydown(event: KeyboardEvent) {
		const currentIndex = modes.indexOf(state.mode);
		switch (event.key) {
			case 'ArrowRight':
			case 'ArrowDown':
				event.preventDefault();
				focusPillAt(currentIndex + 1);
				break;
			case 'ArrowLeft':
			case 'ArrowUp':
				event.preventDefault();
				focusPillAt(currentIndex - 1);
				break;
			case 'Home':
				event.preventDefault();
				focusPillAt(0);
				break;
			case 'End':
				event.preventDefault();
				focusPillAt(modes.length - 1);
				break;
		}
	}
</script>

<section class="solver">
	<div class="mode-picker">
		<span class="mode-label" id="tvm-mode-label">{$t('tvm.mode.solveFor')}</span>
		<div
			class="mode-pills"
			role="tablist"
			aria-labelledby="tvm-mode-label"
			tabindex={-1}
			onkeydown={handleTablistKeydown}
		>
			{#each modes as mode, i (mode)}
				<button
					bind:this={pillRefs[i]}
					class="mode-pill"
					class:active={state.mode === mode}
					type="button"
					role="tab"
					aria-selected={state.mode === mode}
					tabindex={state.mode === mode ? 0 : -1}
					onclick={() => selectMode(mode)}
				>
					{$t(`tvm.mode.${mode}`)}
				</button>
			{/each}
		</div>
	</div>

	<div class="panel-group">
		<header class="panel-head">
			<h3 class="panel-title">{$t('tvm.panel.cashflow')}</h3>
		</header>

		<div class="field-grid">
			{#each numericFieldOrder as field (field)}
				{@const isSolveTarget = state.mode === field}
				{@const isDisabledPmt = field === 'pmt' && pmtDisabledByContinuous}
				<label class="field" class:target={isSolveTarget} class:disabled={isDisabledPmt}>
					<span class="field-label">
						{$t(fieldLabelKey(field))}
						{#if isSolveTarget}
							<span class="target-badge">{$t('tvm.mode.solveFor')}</span>
						{/if}
					</span>
					<div class="field-input-wrap">
						<input
							class="field-input"
							type="text"
							inputmode="decimal"
							autocomplete="off"
							value={isSolveTarget ? '' : (typeof state[field] === 'number' ? state[field] : '')}
							disabled={isSolveTarget || isDisabledPmt}
							placeholder={isSolveTarget ? '—' : '0'}
							oninput={(e) => handleNumber(field, e)}
						/>
						{#if fieldSuffix(field)}
							<span class="field-suffix" aria-hidden="true">{fieldSuffix(field)}</span>
						{/if}
					</div>
				</label>
			{/each}
		</div>
	</div>

	<div class="panel-group">
		<header class="panel-head">
			<h3 class="panel-title">{$t('tvm.panel.global')}</h3>
		</header>

		<div class="field-grid two-col">
			<label class="field">
				<span class="field-label">{$t('tvm.global.compounding')}</span>
				<select
					class="field-select"
					value={state.compoundingFrequency}
					onchange={(e) =>
						onUpdate({ compoundingFrequency: (e.currentTarget as HTMLSelectElement).value as CompoundingFrequency })}
				>
					{#each compoundingOptions as opt (opt)}
						<option value={opt}>{$t(`tvm.freq.${opt}`)}</option>
					{/each}
				</select>
			</label>

			<label class="field">
				<span class="field-label">{$t('tvm.global.payFreq')}</span>
				<select
					class="field-select"
					value={state.paymentFrequency}
					disabled={state.compoundingFrequency === 'continuous'}
					onchange={(e) =>
						onUpdate({ paymentFrequency: (e.currentTarget as HTMLSelectElement).value as PaymentFrequency })}
				>
					{#each paymentFrequencyOptions as opt (opt)}
						<option value={opt}>{$t(`tvm.freq.${opt}`)}</option>
					{/each}
				</select>
			</label>

			<label class="field">
				<span class="field-label">{$t('tvm.global.periodsUnit')}</span>
				<select
					class="field-select"
					value={state.periodsUnit}
					onchange={(e) =>
						onUpdate({ periodsUnit: (e.currentTarget as HTMLSelectElement).value as PeriodsUnit })}
				>
					<option value="years">{$t('tvm.unit.years')}</option>
					<option value="months">{$t('tvm.unit.months')}</option>
				</select>
			</label>

			<div class="field">
				<span class="field-label">{$t('tvm.global.timing')}</span>
				<div class="timing-toggle" role="group" aria-label={$t('tvm.global.timing')}>
					{#each ['end', 'begin'] as timing (timing)}
						<button
							class="timing-btn"
							class:active={state.paymentTiming === timing}
							type="button"
							onclick={() => onUpdate({ paymentTiming: timing as PaymentTiming })}
						>
							{$t(`tvm.timing.${timing}Short`)}
						</button>
					{/each}
				</div>
			</div>
		</div>
	</div>
</section>

<style>
	.solver {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	/* ── Mode picker (segmented control) ── */
	.mode-picker {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
	}

	.mode-label {
		font-family: var(--font-body);
		font-size: 0.6875rem;
		font-weight: 600;
		color: var(--text-muted);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.mode-pills {
		display: grid;
		grid-template-columns: repeat(5, 1fr);
		gap: 0;
		padding: 0.25rem;
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-md);
		background: var(--bg-subtle);
	}

	.mode-pill {
		padding: 0.4375rem 0.5rem;
		background: transparent;
		color: var(--text-muted);
		border: none;
		border-radius: calc(var(--radius-md) - 2px);
		font-family: var(--font-body);
		font-size: 0.75rem;
		font-weight: 600;
		letter-spacing: 0.01em;
		cursor: pointer;
		transition: color var(--transition-fast), background var(--transition-fast);
	}

	.mode-pill:hover:not(.active) {
		color: var(--text-secondary);
	}

	.mode-pill:focus-visible {
		outline: 2px solid var(--accent);
		outline-offset: 2px;
	}

	.mode-pill.active {
		background: var(--panel);
		color: var(--text-primary);
		box-shadow: var(--shadow-sm);
	}

	/* ── Panel groups ── */
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
		align-items: baseline;
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

	/* ── Fields ── */
	.field-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 0.5rem;
	}

	.field-grid.two-col {
		grid-template-columns: repeat(2, 1fr);
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.field-label {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
		font-family: var(--font-body);
		font-size: 0.75rem;
		font-weight: 500;
		color: var(--text-secondary);
	}

	.target-badge {
		font-family: var(--font-mono);
		font-size: 0.625rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--accent);
		background: color-mix(in srgb, var(--accent) 15%, transparent);
		padding: 0.125rem 0.375rem;
		border-radius: var(--radius-sm);
	}

	.field-input-wrap {
		position: relative;
		display: flex;
		align-items: center;
	}

	.field-input,
	.field-select {
		width: 100%;
		padding: 0.5rem 0.625rem;
		background: var(--bg);
		color: var(--text-primary);
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-sm);
		font-family: var(--font-mono);
		font-size: 0.8125rem;
		outline: none;
		transition: border-color var(--transition-fast), background var(--transition-fast);
		box-sizing: border-box;
	}

	.field-input {
		text-align: right;
		padding-right: 1.75rem;
	}

	.field-select {
		font-family: var(--font-body);
		appearance: none;
		background-image: linear-gradient(45deg, transparent 50%, var(--text-muted) 50%),
			linear-gradient(135deg, var(--text-muted) 50%, transparent 50%);
		background-position: calc(100% - 14px) 55%, calc(100% - 9px) 55%;
		background-size: 5px 5px, 5px 5px;
		background-repeat: no-repeat;
		padding-right: 1.75rem;
	}

	.field-input:focus,
	.field-select:focus {
		border-color: var(--accent);
		box-shadow: 0 0 0 2px var(--accent-glow);
	}

	.field-input:disabled,
	.field-select:disabled {
		opacity: 0.5;
		cursor: not-allowed;
		background: var(--bg-subtle);
	}

	.field.target .field-input {
		background: color-mix(in srgb, var(--accent) 6%, var(--bg));
		border-color: color-mix(in srgb, var(--accent) 40%, var(--border-subtle));
	}

	.field.disabled {
		opacity: 0.55;
	}

	.field-suffix {
		position: absolute;
		right: 0.625rem;
		pointer-events: none;
		font-family: var(--font-mono);
		font-size: 0.75rem;
		color: var(--text-muted);
	}

	/* ── Timing toggle (segmented) ── */
	.timing-toggle {
		display: grid;
		grid-template-columns: 1fr 1fr;
		padding: 0.25rem;
		background: var(--bg-subtle);
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-sm);
	}

	.timing-btn {
		padding: 0.375rem 0.5rem;
		background: transparent;
		color: var(--text-muted);
		border: none;
		border-radius: calc(var(--radius-sm) - 2px);
		font-family: var(--font-body);
		font-size: 0.75rem;
		font-weight: 600;
		cursor: pointer;
		transition: color var(--transition-fast), background var(--transition-fast);
	}

	.timing-btn.active {
		background: var(--panel);
		color: var(--text-primary);
	}

	/* ── Responsive ── */
	@media (max-width: 680px) {
		.mode-pills {
			grid-template-columns: repeat(3, 1fr);
		}

		.field-grid.two-col {
			grid-template-columns: 1fr;
		}
	}
</style>
