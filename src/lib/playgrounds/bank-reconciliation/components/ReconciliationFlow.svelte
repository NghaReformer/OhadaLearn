<script lang="ts">
	import { tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
	import { currency$ } from '$lib/stores/preferences';
	import { fmtCurrency } from '$lib/format';
	import type { BankReconciliationStatement } from '../types';

	let {
		statement,
		titleLabel,
		bankSideLabel,
		booksSideLabel,
		startLabel,
		endLabel,
		matchLabel,
	}: {
		statement: BankReconciliationStatement;
		titleLabel: string;
		bankSideLabel: string;
		booksSideLabel: string;
		startLabel: string;
		endLabel: string;
		matchLabel: string;
	} = $props();

	let currency = $derived($currency$);

	type Step = { label: string; delta: number; sign: '+' | '−' | '='; cumulative: number };

	let bankSteps = $derived.by((): Step[] => {
		const s = statement.bankSide;
		const out: Step[] = [{ label: startLabel, delta: s.statementBalance, sign: '=', cumulative: s.statementBalance }];
		let cum = s.statementBalance;
		if (s.addDepositsInTransit !== 0) {
			cum += s.addDepositsInTransit;
			out.push({ label: 'DIT', delta: s.addDepositsInTransit, sign: '+', cumulative: cum });
		}
		if (s.lessOutstandingChecks !== 0) {
			cum -= s.lessOutstandingChecks;
			out.push({ label: 'OS', delta: s.lessOutstandingChecks, sign: '−', cumulative: cum });
		}
		if (s.addLessBankErrors !== 0) {
			cum += s.addLessBankErrors;
			out.push({ label: 'Err', delta: s.addLessBankErrors, sign: s.addLessBankErrors > 0 ? '+' : '−', cumulative: cum });
		}
		out.push({ label: endLabel, delta: s.adjustedBalance, sign: '=', cumulative: s.adjustedBalance });
		return out;
	});

	let booksSteps = $derived.by((): Step[] => {
		const s = statement.booksSide;
		const out: Step[] = [{ label: startLabel, delta: s.bookBalance, sign: '=', cumulative: s.bookBalance }];
		let cum = s.bookBalance;
		if (s.addInterest !== 0) {
			cum += s.addInterest;
			out.push({ label: 'Int', delta: s.addInterest, sign: '+', cumulative: cum });
		}
		if (s.addStandingOrders !== 0) {
			cum += s.addStandingOrders;
			out.push({ label: 'SO', delta: s.addStandingOrders, sign: '+', cumulative: cum });
		}
		if (s.lessBankCharges !== 0) {
			cum -= s.lessBankCharges;
			out.push({ label: 'Frais', delta: s.lessBankCharges, sign: '−', cumulative: cum });
		}
		if (s.lessNsfChecks !== 0) {
			cum -= s.lessNsfChecks;
			out.push({ label: 'NSF', delta: s.lessNsfChecks, sign: '−', cumulative: cum });
		}
		if (s.lessDirectDebits !== 0) {
			cum -= s.lessDirectDebits;
			out.push({ label: 'DD', delta: s.lessDirectDebits, sign: '−', cumulative: cum });
		}
		if (s.addLessCompanyErrors !== 0) {
			cum += s.addLessCompanyErrors;
			out.push({ label: 'Err', delta: s.addLessCompanyErrors, sign: s.addLessCompanyErrors > 0 ? '+' : '−', cumulative: cum });
		}
		out.push({ label: endLabel, delta: s.adjustedBalance, sign: '=', cumulative: s.adjustedBalance });
		return out;
	});

	let scale = $derived.by(() => {
		const all = [...bankSteps, ...booksSteps].map((s) => Math.abs(s.cumulative));
		return Math.max(...all, 1);
	});

	function barHeight(value: number): number {
		const pct = Math.min(Math.abs(value) / scale, 1);
		return Math.max(pct * 80, 4);
	}

	function fmt(value: number): string {
		return fmtCurrency(Math.round(value), currency);
	}

	const meetTween = tweened(0, { duration: 700, easing: cubicOut });
	$effect(() => {
		const meet = statement.isReconciled ? 1 : 0;
		meetTween.set(meet);
	});
</script>

<div class="flow-card" data-meets={statement.isReconciled}>
	<div class="flow-header">
		<span class="flow-title">{titleLabel}</span>
		<span class="flow-match" class:on={statement.isReconciled}>
			{statement.isReconciled ? matchLabel : `Δ ${fmt(Math.abs(statement.variance))}`}
		</span>
	</div>

	<div class="flow-body">
		<div class="flow-side bank-side">
			<div class="side-label">{bankSideLabel}</div>
			<div class="bars">
				{#each bankSteps as step, i (i + step.label)}
					<div
						class="bar-col"
						class:positive={step.sign === '+'}
						class:negative={step.sign === '−'}
						class:total={step.sign === '='}
					>
						<div class="bar" style="height: {barHeight(step.cumulative)}%" title={fmt(step.cumulative)}></div>
						<div class="bar-label">{step.label}</div>
						{#if step.sign !== '='}
							<div class="bar-delta">{step.sign}{fmt(Math.abs(step.delta))}</div>
						{/if}
					</div>
				{/each}
			</div>
			<div class="side-final">{fmt(statement.bankSide.adjustedBalance)}</div>
		</div>

		<div class="flow-meet" style="opacity: {0.4 + $meetTween * 0.6}">
			<svg viewBox="0 0 40 100" preserveAspectRatio="none" aria-hidden="true">
				<path
					d="M 0 50 C 12 50, 28 50, 40 50"
					stroke="var(--accent, #6ea8fe)"
					stroke-width="2"
					fill="none"
					stroke-dasharray="4 3"
					opacity={statement.isReconciled ? 1 : 0.4}
				/>
				{#if statement.isReconciled}
					<circle cx="20" cy="50" r="6" fill="var(--green, #22c55e)" class="meet-ring" />
					<path d="M 17 50 l 2 2 l 5 -5" stroke="white" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round" />
				{/if}
			</svg>
		</div>

		<div class="flow-side books-side">
			<div class="side-label">{booksSideLabel}</div>
			<div class="bars">
				{#each booksSteps as step, i (i + step.label)}
					<div
						class="bar-col"
						class:positive={step.sign === '+'}
						class:negative={step.sign === '−'}
						class:total={step.sign === '='}
					>
						<div class="bar" style="height: {barHeight(step.cumulative)}%" title={fmt(step.cumulative)}></div>
						<div class="bar-label">{step.label}</div>
						{#if step.sign !== '='}
							<div class="bar-delta">{step.sign}{fmt(Math.abs(step.delta))}</div>
						{/if}
					</div>
				{/each}
			</div>
			<div class="side-final">{fmt(statement.booksSide.adjustedBalance)}</div>
		</div>
	</div>
</div>

<style>
	.flow-card {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		padding: 0.75rem 1rem;
		background: var(--panel);
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-sm);
	}
	.flow-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	.flow-title {
		font-family: var(--font-mono, monospace);
		font-size: 0.6875rem;
		font-weight: 600;
		color: var(--text-muted);
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}
	.flow-match {
		font-family: var(--font-mono, monospace);
		font-size: 0.75rem;
		padding: 0.2rem 0.55rem;
		border-radius: 999px;
		background: var(--bg-subtle);
		color: var(--text-secondary);
		transition: background 0.4s ease, color 0.4s ease;
	}
	.flow-match.on {
		background: color-mix(in srgb, var(--green, #22c55e) 18%, transparent);
		color: var(--green, #22c55e);
	}

	.flow-body {
		display: grid;
		grid-template-columns: 1fr 40px 1fr;
		gap: 0.5rem;
		align-items: stretch;
		min-height: 180px;
	}

	.flow-side {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
		padding: 0.5rem;
		background: var(--bg-subtle);
		border-radius: var(--radius-sm);
	}
	.side-label {
		font-family: var(--font-mono, monospace);
		font-size: 0.6875rem;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--text-muted);
		text-align: center;
	}
	.side-final {
		text-align: center;
		font-family: var(--font-display, system-ui);
		font-weight: 700;
		font-size: 0.95rem;
		color: var(--text-primary);
		padding-top: 0.25rem;
		border-top: 1px solid var(--border-subtle);
	}

	.bars {
		display: flex;
		align-items: flex-end;
		justify-content: space-around;
		gap: 0.25rem;
		flex: 1;
		min-height: 90px;
		padding-bottom: 0.25rem;
	}
	.bar-col {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.15rem;
		min-width: 0;
		flex: 1;
		max-width: 56px;
		justify-content: flex-end;
		height: 100%;
		position: relative;
	}
	.bar {
		width: 70%;
		min-width: 14px;
		max-width: 26px;
		background: var(--accent, #6ea8fe);
		border-radius: 3px 3px 0 0;
		transition: height 0.6s cubic-bezier(0.22, 1, 0.36, 1);
	}
	.bar-col.positive .bar {
		background: var(--green, #22c55e);
	}
	.bar-col.negative .bar {
		background: var(--orange, #f59e0b);
	}
	.bar-col.total .bar {
		background: var(--accent, #6ea8fe);
		opacity: 0.95;
	}
	.bar-label {
		font-family: var(--font-mono, monospace);
		font-size: 0.625rem;
		color: var(--text-muted);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		text-align: center;
	}
	.bar-delta {
		font-family: var(--font-mono, monospace);
		font-size: 0.5625rem;
		color: var(--text-secondary);
		white-space: nowrap;
	}

	.flow-meet {
		display: flex;
		align-items: center;
		justify-content: center;
		transition: opacity 0.5s ease;
	}
	.flow-meet svg {
		width: 100%;
		height: 100%;
	}
	.meet-ring {
		animation: meet-pulse 1.6s ease-in-out infinite;
	}
	@keyframes meet-pulse {
		0%, 100% { r: 6; opacity: 1; }
		50% { r: 8; opacity: 0.6; }
	}

	@media (max-width: 720px) {
		.flow-body {
			grid-template-columns: 1fr;
		}
		.flow-meet {
			min-height: 30px;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.bar, .flow-match, .flow-meet { transition: none; }
		.meet-ring { animation: none; }
	}
</style>
