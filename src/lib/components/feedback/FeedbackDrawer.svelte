<script lang="ts">
	import { t } from '$lib/i18n';
	import FeedbackForm from './FeedbackForm.svelte';

	let {
		open = false,
		onclose,
	}: { open: boolean; onclose: () => void } = $props();

	let dialogEl: HTMLDivElement | undefined = $state();
	let previouslyFocused: HTMLElement | null = null;
	// Only treat a backdrop click as "click outside" when the press AND release
	// both landed on the backdrop itself. Prevents spurious closes from synthetic
	// clicks fired when a browser-level dialog (e.g. getDisplayMedia picker)
	// dismisses, which can land on the backdrop coordinates without a matching
	// mousedown.
	let backdropPressedOnSelf = false;

	$effect(() => {
		if (!open) return;
		previouslyFocused = document.activeElement as HTMLElement | null;
		document.body.style.overflow = 'hidden';
		queueMicrotask(() => {
			const firstFocusable = dialogEl?.querySelector<HTMLElement>(
				'button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])'
			);
			firstFocusable?.focus();
		});
		return () => {
			document.body.style.overflow = '';
			previouslyFocused?.focus?.();
		};
	});

	function onKeyDown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			e.preventDefault();
			onclose();
			return;
		}
		if (e.key !== 'Tab' || !dialogEl) return;
		const focusables = Array.from(
			dialogEl.querySelectorAll<HTMLElement>(
				'button:not([disabled]), [href], input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
			)
		).filter((el) => el.offsetParent !== null || el === document.activeElement);
		if (focusables.length === 0) return;
		const first = focusables[0];
		const last = focusables[focusables.length - 1];
		if (e.shiftKey && document.activeElement === first) {
			e.preventDefault();
			last.focus();
		} else if (!e.shiftKey && document.activeElement === last) {
			e.preventDefault();
			first.focus();
		}
	}

	function onBackdropMouseDown(e: MouseEvent) {
		backdropPressedOnSelf = e.target === e.currentTarget;
	}

	function onBackdropClick(e: MouseEvent) {
		const shouldClose = backdropPressedOnSelf && e.target === e.currentTarget;
		backdropPressedOnSelf = false;
		if (shouldClose) onclose();
	}
</script>

{#if open}
	<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
	<div
		class="backdrop"
		onmousedown={onBackdropMouseDown}
		onclick={onBackdropClick}
		onkeydown={onKeyDown}
		role="presentation"
	>
		<div
			bind:this={dialogEl}
			class="drawer"
			role="dialog"
			aria-modal="true"
			aria-labelledby="feedback-drawer-title"
		>
			<header class="drawer-head">
				<div>
					<h2 id="feedback-drawer-title" class="drawer-title">
						{$t('feedback.drawer.title')}
					</h2>
					<p class="drawer-subtitle">{$t('feedback.drawer.subtitle')}</p>
				</div>
				<button
					type="button"
					class="close-btn"
					onclick={onclose}
					aria-label={$t('feedback.drawer.close')}
				>
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
						<path
							d="M6 6l12 12M6 18L18 6"
							stroke="currentColor"
							stroke-width="1.75"
							stroke-linecap="round"
						/>
					</svg>
				</button>
			</header>

			<div class="drawer-body">
				<FeedbackForm {onclose} />
			</div>
		</div>
	</div>
{/if}

<style>
	.backdrop {
		position: fixed;
		inset: 0;
		z-index: 200;
		background: color-mix(in srgb, var(--bg) 72%, transparent);
		backdrop-filter: blur(4px);
		display: flex;
		justify-content: flex-end;
		animation: fade-in 180ms ease-out;
	}

	.drawer {
		width: 100%;
		max-width: 520px;
		height: 100%;
		background: var(--panel);
		border-left: 1px solid var(--border);
		box-shadow: var(--shadow-lg);
		display: flex;
		flex-direction: column;
		animation: slide-in 260ms cubic-bezier(0.32, 0.72, 0, 1);
	}

	.drawer-head {
		display: flex;
		align-items: flex-start;
		gap: 1rem;
		padding: 1.25rem 1.5rem 1rem;
		border-bottom: 1px solid var(--border-subtle);
	}

	.drawer-title {
		font-family: var(--font-display);
		font-size: 1.375rem;
		font-weight: 600;
		color: var(--text-primary);
		margin: 0 0 0.25rem;
		letter-spacing: -0.01em;
	}

	.drawer-subtitle {
		font-size: 0.875rem;
		line-height: 1.45;
		color: var(--text-secondary);
		margin: 0;
	}

	.close-btn {
		flex-shrink: 0;
		width: 34px;
		height: 34px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		background: transparent;
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		color: var(--text-secondary);
		cursor: pointer;
		transition:
			background var(--transition-fast),
			color var(--transition-fast),
			border-color var(--transition-fast);
	}

	.close-btn:hover {
		background: var(--panel-hover);
		color: var(--text-primary);
		border-color: var(--border-strong);
	}

	.close-btn:focus-visible {
		outline: none;
		border-color: var(--accent);
		box-shadow: 0 0 0 3px var(--accent-glow);
	}

	.drawer-body {
		flex: 1;
		overflow-y: auto;
		padding: 1.25rem 1.5rem 1.5rem;
	}

	@keyframes fade-in {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	@keyframes slide-in {
		from { transform: translateX(24px); opacity: 0.6; }
		to { transform: translateX(0); opacity: 1; }
	}

	@media (max-width: 640px) {
		.drawer {
			max-width: 100%;
			border-left: none;
		}
		.drawer-head {
			padding: 1rem 1.125rem 0.875rem;
		}
		.drawer-body {
			padding: 1rem 1.125rem 1.25rem;
		}
	}
</style>
