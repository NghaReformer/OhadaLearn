<script lang="ts">
	import { t } from '$lib/i18n';
	import { currency$ } from '$lib/stores/preferences';
	import { fmtCurrency, fmtPct } from '$lib/format';
	import { AnnuityEngine } from '../annuity-engine';
	import type {
		AnnuityMode,
		AnnuitySolveInput,
		CompoundingFrequency,
		PaymentFrequency,
		PaymentTiming,
		PeriodsUnit,
		TVMPlaygroundState,
		ValidationError
	} from '../types';

	let {
		state,
		onUpdate
	}: {
		state: TVMPlaygroundState;
		onUpdate: (partial: Partial<TVMPlaygroundState>) => void;
	} = $props();

	const engine = new AnnuityEngine();

	const annuityModes: AnnuityMode[] = [
		'annuityPv',
		'annuityFv',
		'growingAnnuityPv',
		'growingAnnuityFv',
		'perpetuityPv',
		'growingPerpetuityPv',
		'ear'
	];

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

	let pillRefs: HTMLButtonElement[] = [];

	function focusPillAt(index: number) {
		const wrapped = ((index % annuityModes.length) + annuityModes.length) % annuityModes.length;
		pillRefs[wrapped]?.focus();
		selectMode(annuityModes[wrapped]);
	}

	function handleTablistKeydown(e: KeyboardEvent) {
		const cur = annuityModes.indexOf(state.annMode);
		switch (e.key) {
			case 'ArrowRight':
			case 'ArrowDown':
				e.preventDefault();
				focusPillAt(cur + 1);
				break;
			case 'ArrowLeft':
			case 'ArrowUp':
				e.preventDefault();
				focusPillAt(cur - 1);
				break;
			case 'Home':
				e.preventDefault();
				focusPillAt(0);
				break;
			case 'End':
				e.preventDefault();
				focusPillAt(annuityModes.length - 1);
				break;
		}
	}

	function selectMode(mode: AnnuityMode) {
		onUpdate({ annMode: mode });
	}

	function handleNumber(
		field: 'annPmt' | 'annRate' | 'annGrowth' | 'annPeriods',
		event: Event
	) {
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

	let showsGrowth = $derived(
		['growingAnnuityPv', 'growingAnnuityFv', 'growingPerpetuityPv'].includes(state.annMode)
	);
	let showsPeriods = $derived(
		['annuityPv', 'annuityFv', 'growingAnnuityPv', 'growingAnnuityFv'].includes(state.annMode)
	);
	let showsPmt = $derived(state.annMode !== 'ear');
	let showsTiming = $derived(showsPeriods || state.annMode === 'perpetuityPv' || state.annMode === 'growingPerpetuityPv');

	let solveInput = $derived.by<AnnuitySolveInput>(() => ({
		mode: state.annMode,
		pmt: typeof state.annPmt === 'number' ? state.annPmt : undefined,
		rate: typeof state.annRate === 'number' ? state.annRate : undefined,
		growthRate: typeof state.annGrowth === 'number' ? state.annGrowth : undefined,
		periods: typeof state.annPeriods === 'number' ? state.annPeriods : undefined,
		periodsUnit: state.periodsUnit,
		compoundingFrequency: state.compoundingFrequency,
		paymentFrequency: state.paymentFrequency,
		paymentTiming: state.paymentTiming
	}));

	let validation = $derived(engine.validate(solveInput));
	let result = $derived(validation.valid ? engine.solve(solveInput) : null);

	let currency = $derived($currency$);
	let translate = $derived($t);

	let headlineText = $derived.by(() => {
		if (!result) return '';
		if (result.valueKind === 'rate') return fmtPct(result.value, 4);
		return fmtCurrency(result.value, currency);
	});

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
</script>

<section class="ann">
	<div class="mode-picker">
		<span class="mode-label" id="ann-mode-label">{$t('tvm.mode.solveFor')}</span>
		<div
			class="mode-pills"
			role="tablist"
			aria-labelledby="ann-mode-label"
			tabindex={-1}
			onkeydown={handleTablistKeydown}
		>
			{#each annuityModes as mode, i (mode)}
				<button
					bind:this={pillRefs[i]}
					class="mode-pill"
					class:active={state.annMode === mode}
					type="button"
					role="tab"
					aria-selected={state.annMode === mode}
					tabindex={state.annMode === mode ? 0 : -1}
					onclick={() => selectMode(mode)}
				>
					{$t(`tvm.ann.mode.${mode}`)}
				</button>
			{/each}
		</div>
	</div>

	<div class="panel-grid">
		<div class="panel-group">
			<header class="panel-head">
				<h3 class="panel-title">{$t('tvm.panel.inputs')}</h3>
			</header>

			<div class="field-grid">
				{#if showsPmt}
					<label class="field">
						<span class="field-label">{$t('tvm.ann.input.pmt')}</span>
						<input
							class="field-input"
							type="text"
							inputmode="decimal"
							autocomplete="off"
							value={typeof state.annPmt === 'number' ? state.annPmt : ''}
							oninput={(e) => handleNumber('annPmt', e)}
							placeholder="0"
						/>
					</label>
				{/if}

				<label class="field">
					<span class="field-label">{$t('tvm.ann.input.rate')}</span>
					<div class="suffix-wrap">
						<input
							class="field-input"
							type="text"
							inputmode="decimal"
							autocomplete="off"
							value={typeof state.annRate === 'number' ? state.annRate : ''}
							oninput={(e) => handleNumber('annRate', e)}
							placeholder="0"
						/>
						<span class="field-suffix" aria-hidden="true">%</span>
					</div>
				</label>

				{#if showsGrowth}
					<label class="field">
						<span class="field-label">{$t('tvm.ann.input.growth')}</span>
						<div class="suffix-wrap">
							<input
								class="field-input"
								type="text"
								inputmode="decimal"
								autocomplete="off"
								value={typeof state.annGrowth === 'number' ? state.annGrowth : ''}
								oninput={(e) => handleNumber('annGrowth', e)}
								placeholder="0"
							/>
							<span class="field-suffix" aria-hidden="true">%</span>
						</div>
					</label>
				{/if}

				{#if showsPeriods}
					<label class="field">
						<span class="field-label">{$t('tvm.ann.input.periods')}</span>
						<input
							class="field-input"
							type="text"
							inputmode="decimal"
							autocomplete="off"
							value={typeof state.annPeriods === 'number' ? state.annPeriods : ''}
							oninput={(e) => handleNumber('annPeriods', e)}
							placeholder="0"
						/>
					</label>
				{/if}
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
							onUpdate({
								compoundingFrequency: (e.currentTarget as HTMLSelectElement).value as CompoundingFrequency
							})}
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
							onUpdate({
								paymentFrequency: (e.currentTarget as HTMLSelectElement).value as PaymentFrequency
							})}
					>
						{#each paymentFrequencyOptions as opt (opt)}
							<option value={opt}>{$t(`tvm.freq.${opt}`)}</option>
						{/each}
					</select>
				</label>
				{#if showsPeriods}
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
				{/if}
				{#if showsTiming}
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
				{/if}
			</div>
		</div>
	</div>

	<!-- Result card -->
	<div class="result">
		<header class="result-head">
			<p class="eyebrow">{$t('tvm.panel.result')}</p>
			<h3 class="result-title">{$t(`tvm.ann.mode.${state.annMode}`)}</h3>
		</header>

		{#if !validation.valid && validation.errors.length > 0}
			<ul class="error-list" role="alert">
				{#each validation.errors as err, i (i)}
					<li class="error-item">{renderError(err)}</li>
				{/each}
			</ul>
		{:else if result}
			<output
				class="headline-value"
				class:outflow={result.signNote === 'outflow'}
				class:inflow={result.signNote === 'inflow'}
			>
				{headlineText}
			</output>

			<p class="interpretation">{$t(`tvm.ann.interpretation.${result.mode}`)}</p>

			<div class="workings">
				{#each result.workings as step (step.labelKey)}
					<div class="workings-step">
						<span class="workings-label">{$t(step.labelKey)}</span>
						<span class="workings-value">{step.value}</span>
					</div>
				{/each}
			</div>

			<div class="formula">
				<span class="formula-label">{$t(`tvm.workings.solve.${result.mode === 'ear' ? 'rate' : 'fv'}`)
					.replace('rate solver', 'EAR')}</span>
				<code class="formula-expr">{$t(result.formulaKey)}</code>
			</div>
		{:else}
			<p class="pending">{$t('tvm.result.pending')}</p>
		{/if}
	</div>
</section>

<style>
	.ann {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

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
		grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
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

	.panel-grid {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
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

	.panel-title {
		margin: 0;
		font-family: var(--font-body);
		font-size: 0.6875rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--text-muted);
	}

	.field-grid {
		display: grid;
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
		font-family: var(--font-body);
		font-size: 0.75rem;
		font-weight: 500;
		color: var(--text-secondary);
	}

	.suffix-wrap {
		position: relative;
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
		transition: border-color var(--transition-fast);
		box-sizing: border-box;
	}
	.field-input {
		text-align: right;
		padding-right: 1.75rem;
	}
	.field-select {
		font-family: var(--font-body);
		appearance: none;
		padding-right: 1.75rem;
	}
	.field-input:focus,
	.field-select:focus {
		border-color: var(--accent);
		box-shadow: 0 0 0 2px var(--accent-glow);
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

	.result {
		display: flex;
		flex-direction: column;
		gap: 0.875rem;
		padding: 1.125rem 1.25rem;
		background: var(--panel);
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-lg);
	}

	.eyebrow {
		margin: 0;
		font-family: var(--font-body);
		font-size: 0.6875rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--text-muted);
	}

	.result-title {
		margin: 0;
		font-family: var(--font-display);
		font-size: 1rem;
		font-weight: 600;
		color: var(--text-primary);
	}

	.headline-value {
		font-family: var(--font-mono);
		font-size: 2rem;
		font-weight: 700;
		letter-spacing: -0.01em;
		color: var(--text-primary);
		line-height: 1.1;
		word-break: break-word;
	}
	.headline-value.outflow {
		color: color-mix(in srgb, var(--error) 85%, var(--text-primary));
	}
	.headline-value.inflow {
		color: var(--green);
	}

	.interpretation {
		margin: 0;
		font-family: var(--font-body);
		font-size: 0.875rem;
		line-height: 1.45;
		color: var(--text-secondary);
	}

	.workings {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
		padding: 0.625rem 0.75rem;
		background: var(--bg-subtle);
		border-radius: var(--radius-sm);
		border: 1px solid var(--border-subtle);
	}

	.workings-step {
		display: grid;
		grid-template-columns: 1fr auto;
		align-items: baseline;
		gap: 0.5rem;
	}

	.workings-label {
		font-family: var(--font-body);
		font-size: 0.75rem;
		color: var(--text-secondary);
	}

	.workings-value {
		font-family: var(--font-mono);
		font-size: 0.8125rem;
		color: var(--text-primary);
	}

	.formula {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		padding: 0.625rem 0.75rem;
		background: var(--bg);
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-sm);
	}

	.formula-label {
		font-family: var(--font-body);
		font-size: 0.6875rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--text-muted);
	}

	.formula-expr {
		font-family: var(--font-mono);
		font-size: 0.75rem;
		color: var(--text-primary);
		line-height: 1.45;
		word-break: break-word;
	}

	.pending {
		margin: 0;
		padding: 1rem 0.5rem;
		text-align: center;
		font-family: var(--font-body);
		font-size: 0.8125rem;
		color: var(--text-muted);
	}

	.error-list {
		list-style: none;
		margin: 0;
		padding: 0.625rem 0.75rem;
		background: color-mix(in srgb, var(--error) 8%, transparent);
		border: 1px solid color-mix(in srgb, var(--error) 30%, transparent);
		border-radius: var(--radius-sm);
	}
	.error-item {
		color: var(--error);
		font-family: var(--font-body);
		font-size: 0.8125rem;
		padding: 0.125rem 0;
	}
	.error-item::before {
		content: '\2022  ';
		color: var(--error);
	}

	@media (max-width: 760px) {
		.panel-grid {
			grid-template-columns: 1fr;
		}
		.field-grid.two-col {
			grid-template-columns: 1fr;
		}
	}
</style>
