<script lang="ts">
	import { onMount } from 'svelte';
	import { t } from '$lib/i18n';

	const MAX_BYTES = 5 * 1024 * 1024;
	const ALLOWED = ['image/png', 'image/jpeg', 'image/webp'];

	let {
		file = $bindable(null),
	}: { file: File | null } = $props();

	let previewUrl: string | null = $state(null);
	let error: string | null = $state(null);
	let captureSupported = $state(false);

	onMount(() => {
		captureSupported =
			typeof navigator !== 'undefined' &&
			typeof navigator.mediaDevices?.getDisplayMedia === 'function' &&
			window.isSecureContext;
	});

	$effect(() => {
		if (previewUrl) {
			const url = previewUrl;
			return () => URL.revokeObjectURL(url);
		}
	});

	function setFile(next: File | null) {
		error = null;
		if (previewUrl) {
			URL.revokeObjectURL(previewUrl);
			previewUrl = null;
		}
		file = next;
		if (next) previewUrl = URL.createObjectURL(next);
	}

	function validate(candidate: File): string | null {
		if (!ALLOWED.includes(candidate.type)) {
			return $t('feedback.screenshot.invalid_type');
		}
		if (candidate.size > MAX_BYTES) {
			return $t('feedback.screenshot.too_large');
		}
		return null;
	}

	function onFileChange(e: Event) {
		const input = e.currentTarget as HTMLInputElement;
		const picked = input.files?.[0] ?? null;
		input.value = '';
		if (!picked) return;
		const err = validate(picked);
		if (err) {
			error = err;
			return;
		}
		setFile(picked);
	}

	async function captureTab() {
		error = null;
		if (!captureSupported) {
			error = $t('feedback.screenshot.capture_unsupported');
			return;
		}
		try {
			const stream = await navigator.mediaDevices.getDisplayMedia({
				video: { displaySurface: 'browser' } as MediaTrackConstraints,
				audio: false,
				// @ts-expect-error — chromium-only hint
				preferCurrentTab: true,
				selfBrowserSurface: 'include',
				surfaceSwitching: 'exclude',
			});
			const track = stream.getVideoTracks()[0];
			if (!track) {
				stream.getTracks().forEach((t) => t.stop());
				return;
			}
			const bitmap = await grabFrame(track);
			stream.getTracks().forEach((t) => t.stop());
			if (!bitmap) return;
			const blob = await drawToBlob(bitmap);
			if (!blob) return;
			const captured = new File([blob], `capture-${Date.now()}.png`, { type: 'image/png' });
			const err = validate(captured);
			if (err) {
				error = err;
				return;
			}
			setFile(captured);
		} catch (err) {
			if (err instanceof DOMException && err.name === 'NotAllowedError') return;
			console.error('Tab capture failed:', err);
		}
	}

	async function grabFrame(track: MediaStreamTrack): Promise<ImageBitmap | null> {
		// ImageCapture lives behind a vendor API; fall back to a video element otherwise.
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const ImageCaptureCtor = (globalThis as any).ImageCapture;
		if (ImageCaptureCtor) {
			try {
				const capture = new ImageCaptureCtor(track);
				return await capture.grabFrame();
			} catch {
				/* fall through */
			}
		}
		return grabFrameViaVideo(track);
	}

	async function grabFrameViaVideo(track: MediaStreamTrack): Promise<ImageBitmap | null> {
		const video = document.createElement('video');
		video.muted = true;
		video.playsInline = true;
		const stream = new MediaStream([track]);
		video.srcObject = stream;
		await video.play();
		await new Promise((r) => setTimeout(r, 50));
		const bitmap = await createImageBitmap(video);
		video.pause();
		video.srcObject = null;
		return bitmap;
	}

	async function drawToBlob(bitmap: ImageBitmap): Promise<Blob | null> {
		const canvas = document.createElement('canvas');
		canvas.width = bitmap.width;
		canvas.height = bitmap.height;
		const ctx = canvas.getContext('2d');
		if (!ctx) return null;
		ctx.drawImage(bitmap, 0, 0);
		return await new Promise((resolve) => canvas.toBlob((b) => resolve(b), 'image/png'));
	}

	function remove() {
		setFile(null);
	}
</script>

<div class="screenshot">
	{#if file && previewUrl}
		<div class="preview">
			<img src={previewUrl} alt={$t('feedback.screenshot.preview_alt')} />
			<button type="button" class="remove-btn" onclick={remove}>
				{$t('feedback.screenshot.remove')}
			</button>
		</div>
	{:else}
		<div class="actions">
			<label class="action-btn">
				<input type="file" accept="image/png,image/jpeg,image/webp" onchange={onFileChange} />
				<span>{$t('feedback.screenshot.upload')}</span>
			</label>
			{#if captureSupported}
				<button type="button" class="action-btn" onclick={captureTab}>
					{$t('feedback.screenshot.capture')}
				</button>
			{/if}
		</div>
	{/if}

	{#if error}
		<p class="error" role="alert">{error}</p>
	{/if}
</div>

<style>
	.screenshot {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.action-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.4rem;
		font-family: var(--font-body);
		font-size: 0.8125rem;
		font-weight: 500;
		color: var(--text-secondary);
		background: var(--bg-subtle);
		border: 1px dashed var(--border);
		border-radius: var(--radius-md);
		padding: 0.55rem 0.9rem;
		cursor: pointer;
		transition:
			color var(--transition-fast),
			border-color var(--transition-fast),
			background var(--transition-fast);
	}

	.action-btn:hover {
		color: var(--text-primary);
		border-color: var(--accent);
		background: var(--panel-hover);
	}

	.action-btn input[type='file'] {
		position: absolute;
		width: 1px;
		height: 1px;
		opacity: 0;
		overflow: hidden;
	}

	.preview {
		position: relative;
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		overflow: hidden;
		background: var(--bg-subtle);
	}

	.preview img {
		display: block;
		width: 100%;
		height: auto;
		max-height: 240px;
		object-fit: contain;
	}

	.remove-btn {
		position: absolute;
		top: 0.5rem;
		right: 0.5rem;
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--text-primary);
		background: color-mix(in srgb, var(--bg) 80%, transparent);
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		padding: 0.3rem 0.6rem;
		cursor: pointer;
		transition: background var(--transition-fast), border-color var(--transition-fast);
	}

	.remove-btn:hover {
		background: var(--bg);
		border-color: var(--error);
		color: var(--error);
	}

	.error {
		margin: 0;
		font-size: 0.8125rem;
		color: var(--error);
	}
</style>
