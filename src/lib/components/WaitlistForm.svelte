<script lang="ts">
	import { t } from '$lib/i18n';

	type FormState = 'idle' | 'submitting' | 'success' | 'error';

	let formState: FormState = $state('idle');
	let errorMessage: string = $state('');

	let name = $state('');
	let email = $state('');
	let institution = $state('');
	let role = $state('');
	let website = $state(''); // honeypot — hidden field to trap bots

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		if (formState === 'submitting') return;

		formState = 'submitting';
		errorMessage = '';

		try {
			const res = await fetch('/api/waitlist', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name, email, institution: institution || undefined, role, website: website || undefined }),
			});

			if (!res.ok) {
				const data = await res.json().catch(() => null);
				errorMessage = data?.error ?? '';
				formState = 'error';
				return;
			}

			formState = 'success';
		} catch (err) {
			errorMessage = err instanceof Error ? err.message : '';
			formState = 'error';
		}
	}
</script>

<form class="form" onsubmit={handleSubmit}>
	{#if formState === 'success'}
		<div class="success-msg" role="status">
			<svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
				<circle cx="12" cy="12" r="10" stroke="var(--green)" stroke-width="1.5"/>
				<path d="M8 12l3 3 5-6" stroke="var(--green)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
			</svg>
			<p>{$t('waitlist.success')}</p>
		</div>
	{:else}
		<!-- Honeypot field — hidden from humans, filled by bots -->
		<div style="position:absolute;left:-9999px;opacity:0;height:0;overflow:hidden;" aria-hidden="true">
			<input type="text" name="website" tabindex="-1" autocomplete="off" bind:value={website} />
		</div>

		<div class="field">
			<label for="waitlist-name" class="label">{$t('waitlist.name.placeholder')}</label>
			<input
				id="waitlist-name"
				type="text"
				class="input"
				placeholder={$t('waitlist.name.placeholder')}
				bind:value={name}
				required
				autocomplete="name"
			/>
		</div>

		<div class="field">
			<label for="waitlist-email" class="label">{$t('waitlist.email.placeholder')}</label>
			<input
				id="waitlist-email"
				type="email"
				class="input"
				placeholder={$t('waitlist.email.placeholder')}
				bind:value={email}
				required
				autocomplete="email"
			/>
		</div>

		<div class="field">
			<label for="waitlist-institution" class="label">{$t('waitlist.institution.placeholder')}</label>
			<input
				id="waitlist-institution"
				type="text"
				class="input"
				placeholder={$t('waitlist.institution.placeholder')}
				bind:value={institution}
				autocomplete="organization"
			/>
		</div>

		<div class="field">
			<label for="waitlist-role" class="label">{$t('waitlist.role.label')}</label>
			<select
				id="waitlist-role"
				class="input select"
				bind:value={role}
				required
			>
				<option value="" disabled selected>{$t('waitlist.role')}</option>
				<option value="student">{$t('waitlist.role.student')}</option>
				<option value="instructor">{$t('waitlist.role.instructor')}</option>
				<option value="admin">{$t('waitlist.role.admin')}</option>
				<option value="professional">{$t('waitlist.role.professional')}</option>
				<option value="other">{$t('waitlist.role.other')}</option>
			</select>
		</div>

		{#if formState === 'error'}
			<div class="error-msg" role="alert">
				<p>{errorMessage || $t('waitlist.error')}</p>
			</div>
		{/if}

		<button
			type="submit"
			class="submit-btn"
			disabled={formState === 'submitting'}
		>
			{#if formState === 'submitting'}
				<span class="spinner" aria-hidden="true"></span>
			{/if}
			{$t('waitlist.submit')}
		</button>
	{/if}
</form>

<style>
	.form {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		width: 100%;
		max-width: 440px;
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
	}

	.label {
		font-size: 0.8125rem;
		font-weight: 500;
		color: var(--text-secondary);
	}

	.input {
		font-family: var(--font-body);
		font-size: 0.9375rem;
		color: var(--text-primary);
		background: var(--bg-subtle);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		padding: 0.7rem 0.875rem;
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

	.submit-btn {
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
		padding: 0.75rem 1.5rem;
		cursor: pointer;
		margin-top: 0.25rem;
		transition:
			background var(--transition-fast),
			box-shadow var(--transition-fast),
			transform var(--transition-fast);
	}

	.submit-btn:hover:not(:disabled) {
		background: var(--accent-dim);
		box-shadow: var(--shadow-glow);
		transform: translateY(-1px);
	}

	.submit-btn:disabled {
		opacity: 0.65;
		cursor: not-allowed;
	}

	.spinner {
		width: 16px;
		height: 16px;
		border: 2px solid transparent;
		border-top-color: var(--bg);
		border-right-color: var(--bg);
		border-radius: 50%;
		animation: spin 0.6s linear infinite;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	.success-msg {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 1rem 1.25rem;
		background: var(--green-glow);
		border: 1px solid color-mix(in srgb, var(--green) 30%, transparent);
		border-radius: var(--radius-md);
		color: var(--green);
		font-size: 0.9375rem;
		font-weight: 500;
	}

	.error-msg {
		padding: 0.75rem 1rem;
		background: color-mix(in srgb, var(--error) 10%, transparent);
		border: 1px solid color-mix(in srgb, var(--error) 30%, transparent);
		border-radius: var(--radius-md);
		color: var(--error);
		font-size: 0.875rem;
	}
</style>
