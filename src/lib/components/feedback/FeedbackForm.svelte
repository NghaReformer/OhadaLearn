<script lang="ts">
	import { env } from '$env/dynamic/public';
	import { t } from '$lib/i18n';
	import { preferences } from '$lib/stores/preferences';
	import { collectContext, type ClientContext } from './contextCollector';
	import ScreenshotCapture from './ScreenshotCapture.svelte';
	import type { FeedbackType, FeedbackSeverity } from '$lib/server/db/types';

	let { onclose }: { onclose: () => void } = $props();

	type FormState = 'idle' | 'submitting' | 'success' | 'error';

	let formState: FormState = $state('idle');
	let errorMessage: string = $state('');

	let type: FeedbackType = $state('bug');
	let severity: FeedbackSeverity = $state('medium');
	let title = $state('');
	let description = $state('');
	let steps = $state('');
	let email = $state('');
	let website = $state(''); // honeypot
	let includeContext = $state(true);
	let screenshot: File | null = $state(null);

	let context: ClientContext = $derived(
		collectContext($preferences, env.PUBLIC_BUILD_SHA ?? null)
	);

	function reset() {
		type = 'bug';
		severity = 'medium';
		title = '';
		description = '';
		steps = '';
		email = '';
		screenshot = null;
		includeContext = true;
		errorMessage = '';
		formState = 'idle';
	}

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		if (formState === 'submitting') return;

		if (!title.trim() || !description.trim()) {
			errorMessage = $t('feedback.error.validation');
			formState = 'error';
			return;
		}

		formState = 'submitting';
		errorMessage = '';

		const form = new FormData();
		form.set('type', type);
		if (type === 'bug') form.set('severity', severity);
		form.set('title', title.trim());
		form.set('description', description.trim());
		if (steps.trim()) form.set('steps', steps.trim());
		if (email.trim()) form.set('email', email.trim());
		form.set('website', website);
		form.set('context', JSON.stringify(includeContext ? context : {}));
		if (screenshot) form.set('screenshot', screenshot);

		try {
			const res = await fetch('/api/feedback', { method: 'POST', body: form });
			if (!res.ok) {
				const data = await res.json().catch(() => null);
				errorMessage = data?.error ?? $t('feedback.error.generic');
				formState = 'error';
				return;
			}
			formState = 'success';
		} catch {
			errorMessage = $t('feedback.error.generic');
			formState = 'error';
		}
	}
</script>

{#if formState === 'success'}
	<div class="success" role="status" aria-live="polite">
		<div class="success-icon" aria-hidden="true">
			<svg width="22" height="22" viewBox="0 0 24 24" fill="none">
				<circle cx="12" cy="12" r="10" stroke="var(--green)" stroke-width="1.5" />
				<path
					d="M8 12l3 3 5-6"
					stroke="var(--green)"
					stroke-width="1.75"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
			</svg>
		</div>
		<h3 class="success-title">{$t('feedback.success.title')}</h3>
		<p class="success-body">{$t('feedback.success.body')}</p>
		<div class="success-actions">
			<button type="button" class="ghost-btn" onclick={reset}>
				{$t('feedback.success.another')}
			</button>
			<button type="button" class="primary-btn" onclick={onclose}>
				{$t('feedback.drawer.close')}
			</button>
		</div>
	</div>
{:else}
	<form class="form" onsubmit={handleSubmit} novalidate>
		<div class="hp" aria-hidden="true">
			<input type="text" name="website" tabindex="-1" autocomplete="off" bind:value={website} />
		</div>

		<fieldset class="type-group">
			<legend class="label">{$t('feedback.type.label')}</legend>
			<div class="type-grid">
				{#each ['bug', 'feature', 'other'] as const as option}
					<label class="type-card" class:selected={type === option}>
						<input
							type="radio"
							name="type"
							value={option}
							checked={type === option}
							onchange={() => (type = option)}
						/>
						<span class="type-card-title">{$t(`feedback.type.${option}`)}</span>
						<span class="type-card-desc">{$t(`feedback.type.${option}.desc`)}</span>
					</label>
				{/each}
			</div>
		</fieldset>

		{#if type === 'bug'}
			<div class="field">
				<label for="fb-severity" class="label">{$t('feedback.severity.label')}</label>
				<select id="fb-severity" class="input select" bind:value={severity}>
					<option value="low">{$t('feedback.severity.low')}</option>
					<option value="medium">{$t('feedback.severity.medium')}</option>
					<option value="high">{$t('feedback.severity.high')}</option>
					<option value="blocker">{$t('feedback.severity.blocker')}</option>
				</select>
			</div>
		{/if}

		<div class="field">
			<label for="fb-title" class="label">{$t('feedback.title.label')}</label>
			<input
				id="fb-title"
				type="text"
				class="input"
				maxlength="120"
				placeholder={$t('feedback.title.placeholder')}
				bind:value={title}
				required
			/>
		</div>

		<div class="field">
			<label for="fb-description" class="label">{$t('feedback.description.label')}</label>
			<textarea
				id="fb-description"
				class="input textarea"
				rows="5"
				maxlength="4000"
				placeholder={$t('feedback.description.placeholder')}
				bind:value={description}
				required
			></textarea>
		</div>

		{#if type === 'bug'}
			<div class="field">
				<label for="fb-steps" class="label">{$t('feedback.steps.label')}</label>
				<textarea
					id="fb-steps"
					class="input textarea"
					rows="4"
					maxlength="2000"
					placeholder={$t('feedback.steps.placeholder')}
					bind:value={steps}
				></textarea>
			</div>
		{/if}

		<div class="field">
			<span class="label">{$t('feedback.screenshot.label')}</span>
			<ScreenshotCapture bind:file={screenshot} />
		</div>

		<div class="field">
			<label for="fb-email" class="label">{$t('feedback.email.label')}</label>
			<input
				id="fb-email"
				type="email"
				class="input"
				maxlength="254"
				autocomplete="email"
				bind:value={email}
			/>
			<p class="hint">{$t('feedback.email.hint')}</p>
		</div>

		<details class="context">
			<summary class="context-summary">
				<span>{$t('feedback.context.title')}</span>
				<span class="context-hint">{$t('feedback.context.hint')}</span>
			</summary>
			<label class="context-toggle">
				<input type="checkbox" bind:checked={includeContext} />
				<span>{$t('feedback.context.include')}</span>
			</label>
			<dl class="context-grid" class:dimmed={!includeContext}>
				<dt>{$t('feedback.context.url')}</dt>
				<dd>{context.url}</dd>
				{#if context.referrer}
					<dt>{$t('feedback.context.referrer')}</dt>
					<dd>{context.referrer}</dd>
				{/if}
				<dt>{$t('feedback.context.viewport')}</dt>
				<dd>{context.viewport.width} × {context.viewport.height} @ {context.viewport.dpr}x</dd>
				<dt>{$t('feedback.context.screen')}</dt>
				<dd>{context.screen.width} × {context.screen.height}</dd>
				<dt>{$t('feedback.context.userAgent')}</dt>
				<dd>{context.browser.name} · {context.browser.os} · {context.browser.device}</dd>
				<dt>{$t('feedback.context.locale')}</dt>
				<dd>{context.language}</dd>
				<dt>{$t('feedback.context.timezone')}</dt>
				<dd>{context.timezone}</dd>
				<dt>{$t('feedback.context.prefs')}</dt>
				<dd>
					{context.prefs.locale} · {context.prefs.currency} · {context.prefs.accountingStandard}
				</dd>
				{#if context.build}
					<dt>{$t('feedback.context.build')}</dt>
					<dd>{context.build}</dd>
				{/if}
			</dl>
		</details>

		{#if formState === 'error'}
			<div class="error-msg" role="alert">
				<p>{errorMessage || $t('feedback.error.generic')}</p>
			</div>
		{/if}

		<button type="submit" class="primary-btn submit" disabled={formState === 'submitting'}>
			{#if formState === 'submitting'}
				<span class="spinner" aria-hidden="true"></span>
				{$t('feedback.submitting')}
			{:else}
				{$t('feedback.submit')}
			{/if}
		</button>
	</form>
{/if}

<style>
	.form {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.hp {
		position: absolute;
		left: -9999px;
		opacity: 0;
		height: 0;
		overflow: hidden;
	}

	.label {
		font-size: 0.8125rem;
		font-weight: 500;
		color: var(--text-secondary);
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
	}

	.hint {
		font-size: 0.75rem;
		color: var(--text-muted);
		margin: 0.25rem 0 0;
	}

	.input {
		font-family: var(--font-body);
		font-size: 0.9375rem;
		color: var(--text-primary);
		background: var(--bg-subtle);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		padding: 0.65rem 0.85rem;
		outline: none;
		transition:
			border-color var(--transition-fast),
			box-shadow var(--transition-fast);
	}

	.input::placeholder {
		color: var(--text-muted);
	}

	.input:focus {
		border-color: var(--accent);
		box-shadow: 0 0 0 3px var(--accent-glow);
	}

	.textarea {
		resize: vertical;
		min-height: 96px;
		font-family: var(--font-body);
		line-height: 1.5;
	}

	.select {
		appearance: none;
		background-image: url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%23555c74' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
		background-repeat: no-repeat;
		background-position: right 0.875rem center;
		padding-right: 2.5rem;
		cursor: pointer;
	}

	.select option {
		background: var(--panel);
		color: var(--text-primary);
	}

	.type-group {
		border: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.type-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 0.5rem;
	}

	.type-card {
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
		padding: 0.65rem 0.75rem;
		background: var(--bg-subtle);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		cursor: pointer;
		transition:
			border-color var(--transition-fast),
			background var(--transition-fast),
			box-shadow var(--transition-fast);
	}

	.type-card:hover {
		border-color: var(--border-strong);
		background: var(--panel-hover);
	}

	.type-card.selected {
		border-color: var(--accent);
		background: color-mix(in srgb, var(--accent) 8%, var(--bg-subtle));
		box-shadow: 0 0 0 3px var(--accent-glow);
	}

	.type-card input {
		position: absolute;
		opacity: 0;
		pointer-events: none;
	}

	.type-card-title {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--text-primary);
	}

	.type-card-desc {
		font-size: 0.75rem;
		line-height: 1.35;
		color: var(--text-secondary);
	}

	.context {
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-md);
		background: var(--bg-subtle);
		overflow: hidden;
	}

	.context-summary {
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
		padding: 0.65rem 0.85rem;
		cursor: pointer;
		list-style: none;
		font-size: 0.8125rem;
		font-weight: 500;
		color: var(--text-secondary);
		position: relative;
	}

	.context-summary::-webkit-details-marker {
		display: none;
	}

	.context-summary::after {
		content: '';
		position: absolute;
		top: 50%;
		right: 0.9rem;
		width: 8px;
		height: 8px;
		border-right: 1.5px solid var(--text-muted);
		border-bottom: 1.5px solid var(--text-muted);
		transform: translateY(-70%) rotate(45deg);
		transition: transform var(--transition-fast);
	}

	.context[open] .context-summary::after {
		transform: translateY(-30%) rotate(-135deg);
	}

	.context-hint {
		font-size: 0.7rem;
		color: var(--text-muted);
	}

	.context-toggle {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.35rem 0.85rem 0.5rem;
		font-size: 0.8125rem;
		color: var(--text-secondary);
		cursor: pointer;
	}

	.context-grid {
		display: grid;
		grid-template-columns: max-content 1fr;
		gap: 0.3rem 0.85rem;
		margin: 0;
		padding: 0 0.85rem 0.85rem;
		font-size: 0.75rem;
		font-family: var(--font-mono);
	}

	.context-grid.dimmed {
		opacity: 0.4;
	}

	.context-grid dt {
		color: var(--text-muted);
		font-family: var(--font-body);
	}

	.context-grid dd {
		color: var(--text-secondary);
		margin: 0;
		word-break: break-word;
	}

	.error-msg {
		padding: 0.65rem 0.85rem;
		background: color-mix(in srgb, var(--error) 10%, transparent);
		border: 1px solid color-mix(in srgb, var(--error) 30%, transparent);
		border-radius: var(--radius-md);
		color: var(--error);
		font-size: 0.8125rem;
	}

	.error-msg p {
		margin: 0;
	}

	.primary-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		font-family: var(--font-body);
		font-size: 0.9375rem;
		font-weight: 600;
		color: var(--bg);
		background: var(--accent);
		border: none;
		border-radius: var(--radius-md);
		padding: 0.75rem 1.25rem;
		cursor: pointer;
		transition:
			background var(--transition-fast),
			box-shadow var(--transition-fast),
			transform var(--transition-fast);
	}

	.primary-btn:hover:not(:disabled) {
		background: var(--accent-dim);
		box-shadow: var(--shadow-glow);
		transform: translateY(-1px);
	}

	.primary-btn:disabled {
		opacity: 0.65;
		cursor: not-allowed;
	}

	.submit {
		margin-top: 0.25rem;
	}

	.ghost-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		font-family: var(--font-body);
		font-size: 0.9375rem;
		font-weight: 500;
		color: var(--text-secondary);
		background: transparent;
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		padding: 0.65rem 1.1rem;
		cursor: pointer;
		transition:
			color var(--transition-fast),
			border-color var(--transition-fast),
			background var(--transition-fast);
	}

	.ghost-btn:hover {
		color: var(--text-primary);
		border-color: var(--border-strong);
		background: var(--panel-hover);
	}

	.spinner {
		width: 14px;
		height: 14px;
		border: 2px solid transparent;
		border-top-color: var(--bg);
		border-right-color: var(--bg);
		border-radius: 50%;
		animation: spin 0.6s linear infinite;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	.success {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		padding: 1.5rem 1rem 1rem;
		gap: 0.65rem;
	}

	.success-icon {
		width: 48px;
		height: 48px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		background: var(--green-glow);
		border-radius: 999px;
	}

	.success-title {
		font-family: var(--font-display);
		font-size: 1.25rem;
		font-weight: 600;
		color: var(--text-primary);
		margin: 0;
	}

	.success-body {
		margin: 0;
		font-size: 0.875rem;
		color: var(--text-secondary);
		max-width: 36ch;
	}

	.success-actions {
		display: flex;
		gap: 0.5rem;
		margin-top: 0.75rem;
	}

	@media (max-width: 520px) {
		.type-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
