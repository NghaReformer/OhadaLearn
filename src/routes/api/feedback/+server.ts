import { json } from '@sveltejs/kit';
import { insertEntry, uploadScreenshot } from '$lib/server/db/feedback';
import { validateFeedback, MAX_SCREENSHOT_BYTES, ALLOWED_SCREENSHOT_MIME } from './validation';
import type { FeedbackEntry } from '$lib/server/db/types';
import type { RequestHandler } from './$types';

// In-memory per-IP rate limiter (mirrors the waitlist endpoint).
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 3;

function isRateLimited(ip: string): boolean {
	const now = Date.now();
	if (rateLimitMap.size > 10_000) {
		for (const [key, val] of rateLimitMap) {
			if (now > val.resetAt) rateLimitMap.delete(key);
		}
	}
	const entry = rateLimitMap.get(ip);
	if (!entry || now > entry.resetAt) {
		rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
		return false;
	}
	entry.count++;
	return entry.count > RATE_LIMIT_MAX;
}

function parseJsonField<T>(value: FormDataEntryValue | null): T | null {
	if (typeof value !== 'string' || !value) return null;
	try {
		return JSON.parse(value) as T;
	} catch {
		return null;
	}
}

export const POST: RequestHandler = async ({ request, getClientAddress }) => {
	const ip = getClientAddress();
	if (isRateLimited(ip)) {
		return json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
	}

	let form: FormData;
	try {
		form = await request.formData();
	} catch {
		return json({ error: 'Expected multipart/form-data' }, { status: 400 });
	}

	// Honeypot — bots fill hidden fields.
	if (form.get('website')) {
		return json({ success: true }, { status: 201 });
	}

	const raw = {
		type: form.get('type'),
		severity: form.get('severity'),
		title: form.get('title'),
		description: form.get('description'),
		steps: form.get('steps'),
		email: form.get('email'),
		context: parseJsonField<Record<string, unknown>>(form.get('context')),
	};

	const validation = validateFeedback(raw);
	if (!validation.ok) {
		return json({ error: validation.error }, { status: 400 });
	}

	const screenshot = form.get('screenshot');
	let screenshotPath: string | null = null;

	if (screenshot instanceof File && screenshot.size > 0) {
		if (screenshot.size > MAX_SCREENSHOT_BYTES) {
			return json({ error: 'Screenshot exceeds 5 MB limit' }, { status: 400 });
		}
		if (!ALLOWED_SCREENSHOT_MIME.includes(screenshot.type)) {
			return json({ error: 'Screenshot must be PNG, JPEG, or WebP' }, { status: 400 });
		}
		try {
			const bytes = new Uint8Array(await screenshot.arrayBuffer());
			screenshotPath = await uploadScreenshot(bytes, screenshot.type);
		} catch (err) {
			console.error('Screenshot upload failed:', err);
			return json({ error: 'Failed to upload screenshot' }, { status: 500 });
		}
	}

	const entry: FeedbackEntry = {
		...validation.value,
		screenshotPath,
	};

	try {
		const { id } = await insertEntry(entry);
		return json({ success: true, id }, { status: 201 });
	} catch (err) {
		console.error('Feedback insert failed:', err);
		return json({ error: 'Failed to save feedback' }, { status: 500 });
	}
};
