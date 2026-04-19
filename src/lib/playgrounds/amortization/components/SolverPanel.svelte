<script lang="ts">
	import { t, locale } from '$lib/i18n';
	import { currency$ } from '$lib/stores/preferences';
	import { fmtCurrency, fmtPct } from '$lib/format';
	import { pmt } from '$lib/finance/pmt';
	import type { SolveFor } from '../types';

	let {
		solverInputs,
		onChange,
	}: {
		solverInputs: {
			solveFor: SolveFor;
			knownPrincipal: number;
			knownRate: number;
			knownTerm: number;
			knownPayment: number;
		};
		onChange: (patch: Partial<typeof solverInputs>) => void;
	} = $props();

	let translate = $derived($t);
	let _locale = $derived($locale);
	let currency = $derived($currency$);

	const solveForOptions: SolveFor[] = ['payment', 'principal', 'rate', 'term'];

	let computed = $derived.by(() => {
		const { solveFor, knownPrincipal, knownRate, knownTerm, knownPayment } = solverInputs;
		const r = knownRate / 12;
		try {
			if (solveFor === 'payment') {
				if (knownPrincipal <= 0 || knownTerm <= 0) return null;
				return pmt(knownPrincipal, r, knownTerm);
			}
			if (solveFor === 'principal') {
				if (knownPayment <= 0 || knownTerm <= 0) return null;
				if (r === 0) return knownPayment * knownTerm;
				return (knownPayment * (1 - Math.pow(1 + r, -knownTerm))) / r;
			}
			if (solveFor === 'term') {
				if (knownPrincipal <= 0 || knownPayment <= 0) return null;
				if (r === 0) return Math.ceil(knownPrincipal / knownPayment);
				const n = -Math.log(1 - (knownPrincipal * r) / knownPayment) / Math.log(1 + r);
				return Number.isFinite(n) && n > 0 ? Math.round(n) : null;
			}
			if (solveFor === 'rate') {
				if (knownPrincipal <= 0 || knownPayment <= 0 || knownTerm <= 0) return null;
				let lo = 0.0000001;
				let hi = 1.0;
				const f = (x: number) => (knownPayment * (1 - Math.pow(1 + x, -knownTerm))) / x - knownPrincipal;
				if (f(lo) * f(hi) > 0) return null;
				for (let i = 0; i < 100; i++) {
					const mid = (lo + hi) / 2;
					if (f(mid) * f(lo) < 0) hi = mid;
					else lo = mid;
					if (hi - lo < 1e-10) break;
				}
				return ((lo + hi) / 2) * 12;
			}
			return null;
		} catch {
			return null;
		}
	});

	function formatResult(value: number | null, kind: SolveFor): string {
		if (value === null || !Number.isFinite(value)) return translate('am.solver.noSolution');
		if (kind === 'rate') return fmtPct(value * 100, 3);
		if (kind === 'term') return `${Math.round(value)} ${translate('am.solver.months').toLowerCase()}`;
		return fmtCurrency(value, currency);
	}

	function labelForField(solveFor: SolveFor): string {
		switch (solveFor) {
			case 'payment':
				return translate('am.solver.paymentLabel');
			case 'principal':
				return translate('am.solver.principalLabel');
			case 'rate':
				return translate('am.solver.annualRate');
			case 'term':
				return translate('am.solver.months');
		}
	}
</script>

<section class="sv-panel">
	<header class="sv-header">
		<h2 class="sv-title">{translate('am.solver.title')}</h2>
		<span class="sv-desc">{translate('am.solver.description')}</span>
	</header>

	<div class="sv-body">
		<div class="sv-field">
			<label class="sv-label" for="sv-solve-for">{translate('am.solver.solveFor')}</label>
			<div class="sv-seg" role="tablist" id="sv-solve-for">
				{#each solveForOptions as opt (opt)}
					<button
						type="button"
						role="tab"
						aria-selected={solverInputs.solveFor === opt}
						class="sv-seg-btn"
						class:active={solverInputs.solveFor === opt}
						onclick={() => onChange({ solveFor: opt })}
					>
						{translate(`am.solver.${opt}`)}
					</button>
				{/each}
			</div>
		</div>

		<div class="sv-grid">
			{#if solverInputs.solveFor !== 'principal'}
				<label class="sv-field">
					<span class="sv-label">{translate('am.solver.principalLabel')}</span>
					<input
						type="number"
						class="sv-input"
						min="0"
						step="100000"
						value={solverInputs.knownPrincipal}
						oninput={(e) => onChange({ knownPrincipal: Number(e.currentTarget.value) })}
					/>
				</label>
			{/if}

			{#if solverInputs.solveFor !== 'rate'}
				<label class="sv-field">
					<span class="sv-label">{translate('am.solver.annualRate')} (%)</span>
					<input
						type="number"
						class="sv-input"
						min="0"
						step="0.001"
						value={(solverInputs.knownRate * 100).toFixed(3)}
						oninput={(e) => onChange({ knownRate: Number(e.currentTarget.value) / 100 })}
					/>
				</label>
			{/if}

			{#if solverInputs.solveFor !== 'term'}
				<label class="sv-field">
					<span class="sv-label">{translate('am.solver.months')}</span>
					<input
						type="number"
						class="sv-input"
						min="1"
						step="1"
						value={solverInputs.knownTerm}
						oninput={(e) => onChange({ knownTerm: Number(e.currentTarget.value) })}
					/>
				</label>
			{/if}

			{#if solverInputs.solveFor !== 'payment'}
				<label class="sv-field">
					<span class="sv-label">{translate('am.solver.paymentLabel')}</span>
					<input
						type="number"
						class="sv-input"
						min="0"
						step="1000"
						value={solverInputs.knownPayment}
						oninput={(e) => onChange({ knownPayment: Number(e.currentTarget.value) })}
					/>
				</label>
			{/if}
		</div>

		<div class="sv-result">
			<span class="sv-result-label">
				{translate('am.solver.computed')} — {labelForField(solverInputs.solveFor)}
			</span>
			<span class="sv-result-value">{formatResult(computed, solverInputs.solveFor)}</span>
		</div>
	</div>
</section>

<style>
	.sv-panel {
		display: flex;
		flex-direction: column;
		background: var(--panel);
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-md);
		overflow: hidden;
	}

	.sv-header {
		padding: 0.875rem 1rem;
		border-bottom: 1px solid var(--border-subtle);
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.sv-title {
		font-family: var(--font-display);
		font-size: 0.9375rem;
		font-weight: 600;
		color: var(--text-primary);
		margin: 0;
		letter-spacing: -0.01em;
	}

	.sv-desc {
		font-family: var(--font-mono);
		font-size: 0.6875rem;
		color: var(--text-muted);
	}

	.sv-body {
		padding: 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.875rem;
	}

	.sv-field {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.sv-label {
		font-family: var(--font-mono);
		font-size: 0.6875rem;
		font-weight: 500;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--text-muted);
	}

	.sv-seg {
		display: inline-flex;
		background: var(--bg);
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-sm);
		padding: 2px;
		gap: 1px;
	}

	.sv-seg-btn {
		border: none;
		background: transparent;
		color: var(--text-muted);
		font-family: var(--font-display);
		font-size: 0.75rem;
		font-weight: 500;
		padding: 4px 10px;
		border-radius: 3px;
		cursor: pointer;
		transition: background 0.12s ease, color 0.12s ease;
	}

	.sv-seg-btn:hover {
		color: var(--text-secondary);
	}

	.sv-seg-btn:focus-visible {
		outline: 2px solid var(--accent);
		outline-offset: 2px;
	}

	.sv-seg-btn.active {
		background: var(--panel);
		color: var(--accent);
		box-shadow: 0 0 0 1px var(--accent) inset;
	}

	.sv-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
		gap: 0.75rem;
	}

	.sv-input {
		background: var(--bg);
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-sm);
		padding: 0.5rem 0.75rem;
		color: var(--text-primary);
		font-family: var(--font-mono);
		font-size: 0.8125rem;
		font-variant-numeric: tabular-nums;
		transition: border-color 0.12s ease;
	}

	.sv-input:focus {
		outline: none;
		border-color: var(--accent);
	}

	.sv-result {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.75rem 1rem;
		background: var(--accent-glow, rgba(255, 255, 255, 0.03));
		border: 1px solid var(--accent);
		border-radius: var(--radius-sm);
	}

	.sv-result-label {
		font-family: var(--font-mono);
		font-size: 0.6875rem;
		font-weight: 600;
		color: var(--text-muted);
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	.sv-result-value {
		font-family: var(--font-display);
		font-size: 1.1875rem;
		font-weight: 700;
		color: var(--accent);
		font-variant-numeric: tabular-nums;
	}
</style>
