<script lang="ts">
	import { parseLocaleNumber } from '$lib/format';

	let {
		label,
		hint = '',
		value,
		onChange,
		suffix = '',
		min = 0,
		max = 1e12,
		step = 'any',
	}: {
		label: string;
		hint?: string;
		value: number;
		onChange: (v: number) => void;
		suffix?: string;
		min?: number;
		max?: number;
		step?: number | 'any';
	} = $props();

	let focused = $state(false);
	let displayValue = $derived(focused ? String(value) : formatDisplay(value));

	function formatDisplay(v: number): string {
		if (!isFinite(v)) return '—';
		if (Math.abs(v) >= 1000) {
			return v.toLocaleString('en-US', { maximumFractionDigits: 2 });
		}
		return String(v);
	}

	function handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		const raw = target.value;
		const parsed = parseLocaleNumber(raw);
		const bounded = Math.min(Math.max(parsed, min), max);
		onChange(bounded);
	}
</script>

<label class="field">
	<span class="field-label">
		<span class="field-name">{label}</span>
		{#if hint}
			<span class="field-hint">{hint}</span>
		{/if}
	</span>
	<div class="field-input-wrap">
		<input
			type="text"
			inputmode="decimal"
			value={displayValue}
			oninput={handleInput}
			onfocus={() => (focused = true)}
			onblur={() => (focused = false)}
			{step}
			class="field-input"
		/>
		{#if suffix}
			<span class="field-suffix">{suffix}</span>
		{/if}
	</div>
</label>

<style>
	.field {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
	}

	.field-label {
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
	}

	.field-name {
		font-family: var(--font-body);
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--text-secondary);
		letter-spacing: 0.02em;
	}

	.field-hint {
		font-family: var(--font-body);
		font-size: 0.6875rem;
		color: var(--text-muted);
		line-height: 1.4;
	}

	.field-input-wrap {
		position: relative;
		display: flex;
		align-items: center;
		background: var(--bg-input, var(--panel));
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		transition:
			border-color var(--transition-fast),
			background var(--transition-fast);
	}

	.field-input-wrap:focus-within {
		border-color: var(--accent);
		background: var(--panel-hover, var(--panel));
	}

	.field-input {
		flex: 1;
		min-width: 0;
		background: transparent;
		border: none;
		outline: none;
		padding: 0.5rem 0.75rem;
		font-family: var(--font-mono);
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--text-primary);
		font-variant-numeric: tabular-nums;
	}

	.field-suffix {
		padding-right: 0.75rem;
		font-family: var(--font-mono);
		font-size: 0.6875rem;
		font-weight: 500;
		color: var(--text-muted);
		letter-spacing: 0.03em;
	}
</style>
