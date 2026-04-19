<script lang="ts">
	import { t } from '$lib/i18n';
	import type {
		AmortizationInputs,
		AmortMethod,
		Frequency,
		DayCount,
		GraceType,
		InsuranceBasis,
	} from '../types';

	let {
		inputs,
		onChange
	}: {
		inputs: AmortizationInputs;
		onChange: (patch: Partial<AmortizationInputs>) => void;
	} = $props();

	const methods: AmortMethod[] = ['annuity', 'linear', 'bullet', 'progressive', 'balloon'];
	const frequencies: Frequency[] = ['monthly', 'quarterly', 'semiannual', 'annual', 'custom'];
	const dayCounts: Array<{ value: DayCount; labelKey: string }> = [
		{ value: '30/360', labelKey: 'am.inputs.dayCount.30360' },
		{ value: 'actual/365', labelKey: 'am.inputs.dayCount.actual365' },
		{ value: 'actual/360', labelKey: 'am.inputs.dayCount.actual360' },
		{ value: 'actual/actual', labelKey: 'am.inputs.dayCount.actualActual' }
	];
	const graceTypes: GraceType[] = ['none', 'partial', 'total'];
	const insuranceBases: InsuranceBasis[] = ['initial', 'remaining'];

	function toNumber(value: string): number {
		const n = parseFloat(value);
		return Number.isFinite(n) ? n : 0;
	}

	function updatePrincipal(e: Event) {
		onChange({ principal: toNumber((e.target as HTMLInputElement).value) });
	}

	function updateRate(e: Event) {
		// input is in percent (e.g. 8.5), stored as decimal (0.085)
		onChange({ nominalRate: toNumber((e.target as HTMLInputElement).value) / 100 });
	}

	function updateTerm(e: Event) {
		onChange({ termPeriods: Math.max(1, Math.round(toNumber((e.target as HTMLInputElement).value))) });
	}

	function updateMethod(m: AmortMethod) {
		onChange({ method: m });
	}

	function updateFrequency(e: Event) {
		onChange({ frequency: (e.target as HTMLSelectElement).value as Frequency });
	}

	function updateCustomPeriods(e: Event) {
		onChange({ customPeriodsPerYear: Math.max(1, Math.round(toNumber((e.target as HTMLInputElement).value))) });
	}

	function updateDayCount(e: Event) {
		onChange({ dayCount: (e.target as HTMLSelectElement).value as DayCount });
	}

	function updateStartDate(e: Event) {
		onChange({ startDate: (e.target as HTMLInputElement).value });
	}

	function updateFirstPaymentDate(e: Event) {
		onChange({ firstPaymentDate: (e.target as HTMLInputElement).value });
	}

	function updateGraceType(e: Event) {
		const type = (e.target as HTMLSelectElement).value as GraceType;
		onChange({ grace: { ...inputs.grace, type, periods: type === 'none' ? 0 : inputs.grace.periods } });
	}

	function updateGracePeriods(e: Event) {
		onChange({ grace: { ...inputs.grace, periods: Math.max(0, Math.round(toNumber((e.target as HTMLInputElement).value))) } });
	}

	function updateInsuranceRate(e: Event) {
		onChange({ insurance: { ...inputs.insurance, rate: toNumber((e.target as HTMLInputElement).value) / 100 } });
	}

	function updateInsuranceBasis(e: Event) {
		onChange({ insurance: { ...inputs.insurance, basis: (e.target as HTMLSelectElement).value as InsuranceBasis } });
	}

	function updateOrigFee(e: Event) {
		onChange({ fees: { ...inputs.fees, origination: toNumber((e.target as HTMLInputElement).value) } });
	}

	function updatePrepayFee(e: Event) {
		onChange({ fees: { ...inputs.fees, prepaymentPenaltyPct: toNumber((e.target as HTMLInputElement).value) / 100 } });
	}

	function updateExtraPerPeriod(e: Event) {
		onChange({ extras: { ...inputs.extras, perPeriod: toNumber((e.target as HTMLInputElement).value) } });
	}

	function updateLumpSum(e: Event) {
		onChange({ extras: { ...inputs.extras, lumpSum: toNumber((e.target as HTMLInputElement).value) } });
	}

	function updateLumpPeriod(e: Event) {
		onChange({ extras: { ...inputs.extras, lumpPeriod: Math.max(0, Math.round(toNumber((e.target as HTMLInputElement).value))) } });
	}

	function updateProgressiveStep(e: Event) {
		onChange({ progressiveStep: toNumber((e.target as HTMLInputElement).value) / 100 });
	}

	function updateBalloonDueAt(e: Event) {
		onChange({ balloonDueAt: Math.max(0, Math.round(toNumber((e.target as HTMLInputElement).value))) });
	}

	function addVariableRate() {
		const lastPeriod = inputs.variableRates[inputs.variableRates.length - 1]?.fromPeriod ?? 0;
		const from = Math.min(lastPeriod + 12, inputs.termPeriods);
		onChange({ variableRates: [...inputs.variableRates, { fromPeriod: from, newRate: inputs.nominalRate }] });
	}

	function removeVariableRate(index: number) {
		onChange({ variableRates: inputs.variableRates.filter((_, i) => i !== index) });
	}

	function updateVariableRate(index: number, patch: { fromPeriod?: number; newRate?: number }) {
		const next = inputs.variableRates.map((r, i) => (i === index ? { ...r, ...patch } : r));
		onChange({ variableRates: next });
	}
</script>

<aside class="ip-panel">
	<header class="ip-header">
		<h2 class="ip-title">{$t('am.inputs.title')}</h2>
	</header>

	<section class="ip-section">
		<div class="ip-row">
			<label class="ip-field">
				<span class="ip-label">{$t('am.inputs.principal')}</span>
				<input type="number" min="0" step="1000" value={inputs.principal} oninput={updatePrincipal} />
			</label>
			<label class="ip-field">
				<span class="ip-label">{$t('am.inputs.rate')} (%)</span>
				<input
					type="number"
					min="0"
					step="0.05"
					value={(inputs.nominalRate * 100).toFixed(3)}
					oninput={updateRate}
				/>
			</label>
		</div>
		<div class="ip-row">
			<label class="ip-field">
				<span class="ip-label">{$t('am.inputs.term')}</span>
				<input type="number" min="1" step="1" value={inputs.termPeriods} oninput={updateTerm} />
			</label>
			<label class="ip-field">
				<span class="ip-label">{$t('am.inputs.frequency')}</span>
				<select value={inputs.frequency} onchange={updateFrequency}>
					{#each frequencies as freq (freq)}
						<option value={freq}>{$t(`am.inputs.frequency.${freq}`)}</option>
					{/each}
				</select>
			</label>
		</div>
		{#if inputs.frequency === 'custom'}
			<label class="ip-field">
				<span class="ip-label">{$t('am.inputs.customPeriods')}</span>
				<input
					type="number"
					min="1"
					step="1"
					value={inputs.customPeriodsPerYear}
					oninput={updateCustomPeriods}
				/>
			</label>
		{/if}
	</section>

	<section class="ip-section">
		<h3 class="ip-section-title">{$t('am.inputs.method')}</h3>
		<div class="ip-method-grid">
			{#each methods as m (m)}
				<button
					type="button"
					class="ip-method"
					class:active={inputs.method === m}
					aria-pressed={inputs.method === m}
					onclick={() => updateMethod(m)}
				>
					<span class="ip-method-name">{$t(`am.inputs.method.${m}`)}</span>
					<span class="ip-method-desc">{$t(`am.inputs.method.${m}.desc`)}</span>
				</button>
			{/each}
		</div>

		{#if inputs.method === 'progressive'}
			<label class="ip-field">
				<span class="ip-label">{$t('am.inputs.progressiveStep')} (%)</span>
				<input
					type="number"
					step="0.1"
					value={(inputs.progressiveStep * 100).toFixed(2)}
					oninput={updateProgressiveStep}
				/>
			</label>
		{/if}
		{#if inputs.method === 'balloon'}
			<label class="ip-field">
				<span class="ip-label">{$t('am.inputs.balloonDueAt')}</span>
				<input
					type="number"
					min="1"
					max={inputs.termPeriods}
					step="1"
					value={inputs.balloonDueAt}
					oninput={updateBalloonDueAt}
				/>
			</label>
		{/if}
	</section>

	<section class="ip-section">
		<h3 class="ip-section-title">{$t('am.inputs.startDate')}</h3>
		<div class="ip-row">
			<label class="ip-field">
				<span class="ip-label">{$t('am.inputs.startDate')}</span>
				<input type="date" value={inputs.startDate} onchange={updateStartDate} />
			</label>
			<label class="ip-field">
				<span class="ip-label">{$t('am.inputs.firstPaymentDate')}</span>
				<input type="date" value={inputs.firstPaymentDate} onchange={updateFirstPaymentDate} />
			</label>
		</div>
		<label class="ip-field">
			<span class="ip-label">{$t('am.inputs.dayCount')}</span>
			<select value={inputs.dayCount} onchange={updateDayCount}>
				{#each dayCounts as dc (dc.value)}
					<option value={dc.value}>{$t(dc.labelKey)}</option>
				{/each}
			</select>
		</label>
	</section>

	<section class="ip-section">
		<h3 class="ip-section-title">{$t('am.inputs.grace.title')}</h3>
		<div class="ip-row">
			<label class="ip-field">
				<span class="ip-label">{$t('am.inputs.grace.type')}</span>
				<select value={inputs.grace.type} onchange={updateGraceType}>
					{#each graceTypes as gt (gt)}
						<option value={gt}>{$t(`am.inputs.grace.type.${gt}`)}</option>
					{/each}
				</select>
			</label>
			{#if inputs.grace.type !== 'none'}
				<label class="ip-field">
					<span class="ip-label">{$t('am.inputs.grace.periods')}</span>
					<input
						type="number"
						min="0"
						max={inputs.termPeriods - 1}
						step="1"
						value={inputs.grace.periods}
						oninput={updateGracePeriods}
					/>
				</label>
			{/if}
		</div>
	</section>

	<section class="ip-section">
		<h3 class="ip-section-title">{$t('am.inputs.insurance.title')}</h3>
		<div class="ip-row">
			<label class="ip-field">
				<span class="ip-label">{$t('am.inputs.insurance.rate')} (%)</span>
				<input
					type="number"
					min="0"
					step="0.05"
					value={(inputs.insurance.rate * 100).toFixed(3)}
					oninput={updateInsuranceRate}
				/>
			</label>
			<label class="ip-field">
				<span class="ip-label">{$t('am.inputs.insurance.basis')}</span>
				<select value={inputs.insurance.basis} onchange={updateInsuranceBasis}>
					{#each insuranceBases as b (b)}
						<option value={b}>{$t(`am.inputs.insurance.basis.${b}`)}</option>
					{/each}
				</select>
			</label>
		</div>
	</section>

	<section class="ip-section">
		<h3 class="ip-section-title">{$t('am.inputs.fees.title')}</h3>
		<div class="ip-row">
			<label class="ip-field">
				<span class="ip-label">{$t('am.inputs.fees.origination')}</span>
				<input
					type="number"
					min="0"
					step="100"
					value={inputs.fees.origination}
					oninput={updateOrigFee}
				/>
			</label>
			<label class="ip-field">
				<span class="ip-label">{$t('am.inputs.fees.prepayment')}</span>
				<input
					type="number"
					min="0"
					step="0.1"
					value={(inputs.fees.prepaymentPenaltyPct * 100).toFixed(2)}
					oninput={updatePrepayFee}
				/>
			</label>
		</div>
	</section>

	<section class="ip-section">
		<h3 class="ip-section-title">{$t('am.inputs.extras.title')}</h3>
		<div class="ip-row">
			<label class="ip-field">
				<span class="ip-label">{$t('am.inputs.extras.perPeriod')}</span>
				<input
					type="number"
					min="0"
					step="50"
					value={inputs.extras.perPeriod}
					oninput={updateExtraPerPeriod}
				/>
			</label>
		</div>
		<div class="ip-row">
			<label class="ip-field">
				<span class="ip-label">{$t('am.inputs.extras.lumpSum')}</span>
				<input
					type="number"
					min="0"
					step="1000"
					value={inputs.extras.lumpSum}
					oninput={updateLumpSum}
				/>
			</label>
			<label class="ip-field">
				<span class="ip-label">{$t('am.inputs.extras.lumpPeriod')}</span>
				<input
					type="number"
					min="0"
					max={inputs.termPeriods}
					step="1"
					value={inputs.extras.lumpPeriod}
					oninput={updateLumpPeriod}
				/>
			</label>
		</div>
	</section>

	<section class="ip-section">
		<h3 class="ip-section-title">{$t('am.inputs.variable.title')}</h3>
		{#if inputs.variableRates.length === 0}
			<p class="ip-empty">{$t('am.inputs.variable.empty')}</p>
		{:else}
			<ul class="ip-var-list">
				{#each inputs.variableRates as row, i (i)}
					<li class="ip-var-row">
						<label class="ip-field ip-var-field">
							<span class="ip-label">{$t('am.inputs.variable.fromPeriod')}</span>
							<input
								type="number"
								min="1"
								max={inputs.termPeriods}
								step="1"
								value={row.fromPeriod}
								oninput={(e) =>
									updateVariableRate(i, {
										fromPeriod: Math.max(1, Math.round(toNumber((e.target as HTMLInputElement).value)))
									})}
							/>
						</label>
						<label class="ip-field ip-var-field">
							<span class="ip-label">{$t('am.inputs.variable.newRate')} (%)</span>
							<input
								type="number"
								min="0"
								step="0.05"
								value={(row.newRate * 100).toFixed(3)}
								oninput={(e) =>
									updateVariableRate(i, { newRate: toNumber((e.target as HTMLInputElement).value) / 100 })}
							/>
						</label>
						<button
							type="button"
							class="ip-var-remove"
							onclick={() => removeVariableRate(i)}
							aria-label={$t('am.inputs.variable.remove')}
						>×</button>
					</li>
				{/each}
			</ul>
		{/if}
		<button type="button" class="ip-add" onclick={addVariableRate}>
			+ {$t('am.inputs.variable.add')}
		</button>
	</section>
</aside>

<style>
	.ip-panel {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		padding: 1rem;
		background: var(--panel);
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-md);
		overflow-y: auto;
		min-width: 0;
	}

	.ip-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding-bottom: 0.5rem;
		border-bottom: 1px solid var(--border-subtle);
	}

	.ip-title {
		font-family: var(--font-display);
		font-size: 0.9375rem;
		font-weight: 600;
		color: var(--text-primary);
		margin: 0;
		letter-spacing: -0.01em;
	}

	.ip-section {
		display: flex;
		flex-direction: column;
		gap: 0.625rem;
	}

	.ip-section-title {
		font-family: var(--font-mono);
		font-size: 0.65rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.09em;
		color: var(--text-muted);
		margin: 0;
	}

	.ip-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.625rem;
	}

	.ip-field {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		min-width: 0;
	}

	.ip-label {
		font-family: var(--font-mono);
		font-size: 0.6875rem;
		font-weight: 500;
		color: var(--text-secondary);
		letter-spacing: 0.02em;
	}

	.ip-field input,
	.ip-field select {
		font-family: var(--font-mono);
		font-size: 0.8125rem;
		font-weight: 500;
		color: var(--text-primary);
		background: var(--bg);
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		padding: 0.375rem 0.5rem;
		min-width: 0;
		width: 100%;
		box-sizing: border-box;
		transition: border-color var(--transition-fast);
	}

	.ip-field input:focus,
	.ip-field select:focus {
		outline: none;
		border-color: var(--accent);
	}

	.ip-method-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.375rem;
	}

	.ip-method {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 0.125rem;
		padding: 0.5rem 0.625rem;
		background: var(--bg);
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		cursor: pointer;
		text-align: left;
		transition:
			border-color var(--transition-fast),
			background var(--transition-fast);
	}

	.ip-method:hover {
		border-color: var(--accent-muted, var(--accent));
	}

	.ip-method:focus-visible {
		outline: 2px solid var(--accent);
		outline-offset: 2px;
	}

	.ip-method.active {
		border-color: var(--accent);
		background: var(--accent-glow, var(--panel-hover));
	}

	.ip-method-name {
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--text-primary);
		letter-spacing: -0.005em;
	}

	.ip-method-desc {
		font-family: var(--font-mono);
		font-size: 0.625rem;
		color: var(--text-muted);
		line-height: 1.3;
	}

	.ip-empty {
		font-family: var(--font-mono);
		font-size: 0.6875rem;
		color: var(--text-muted);
		margin: 0;
		font-style: italic;
	}

	.ip-var-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
	}

	.ip-var-row {
		display: grid;
		grid-template-columns: 1fr 1fr auto;
		gap: 0.375rem;
		align-items: end;
	}

	.ip-var-field {
		min-width: 0;
	}

	.ip-var-remove {
		width: 28px;
		height: 28px;
		background: transparent;
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		color: var(--text-muted);
		font-size: 1rem;
		cursor: pointer;
		transition:
			color var(--transition-fast),
			border-color var(--transition-fast);
	}

	.ip-var-remove:hover {
		color: var(--red, #ef4444);
		border-color: var(--red, #ef4444);
	}

	.ip-add {
		align-self: flex-start;
		font-family: var(--font-mono);
		font-size: 0.75rem;
		color: var(--accent);
		background: transparent;
		border: 1px dashed var(--border);
		border-radius: var(--radius-sm);
		padding: 0.375rem 0.625rem;
		cursor: pointer;
		transition: border-color var(--transition-fast);
	}

	.ip-add:hover {
		border-color: var(--accent);
	}

	.ip-add:focus-visible,
	.ip-var-remove:focus-visible {
		outline: 2px solid var(--accent);
		outline-offset: 2px;
	}
</style>
