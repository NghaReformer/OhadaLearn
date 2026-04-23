import type {
	FeedbackEntry,
	FeedbackSeverity,
	FeedbackType,
} from '$lib/server/db/types';

export const MAX_TITLE = 120;
export const MAX_DESCRIPTION = 4000;
export const MAX_STEPS = 2000;
export const MAX_EMAIL = 254;
export const MAX_CONTEXT_BYTES = 8_000;
export const MAX_SCREENSHOT_BYTES = 5 * 1024 * 1024;
export const ALLOWED_SCREENSHOT_MIME = ['image/png', 'image/jpeg', 'image/webp'];

const TYPES: readonly FeedbackType[] = ['bug', 'feature', 'other'];
const SEVERITIES: readonly FeedbackSeverity[] = ['low', 'medium', 'high', 'blocker'];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type RawFeedbackInput = {
	type: FormDataEntryValue | null;
	severity: FormDataEntryValue | null;
	title: FormDataEntryValue | null;
	description: FormDataEntryValue | null;
	steps: FormDataEntryValue | null;
	email: FormDataEntryValue | null;
	context: Record<string, unknown> | null;
};

export type ValidationResult =
	| { ok: true; value: Omit<FeedbackEntry, 'screenshotPath'> }
	| { ok: false; error: string };

function str(value: FormDataEntryValue | null): string | null {
	if (typeof value !== 'string') return null;
	const trimmed = value.trim();
	return trimmed ? trimmed : null;
}

export function validateFeedback(raw: RawFeedbackInput): ValidationResult {
	const type = str(raw.type);
	if (!type || !TYPES.includes(type as FeedbackType)) {
		return { ok: false, error: 'Invalid feedback type' };
	}

	const title = str(raw.title);
	if (!title) return { ok: false, error: 'Title is required' };
	if (title.length > MAX_TITLE) return { ok: false, error: 'Title too long' };

	const description = str(raw.description);
	if (!description) return { ok: false, error: 'Description is required' };
	if (description.length > MAX_DESCRIPTION) return { ok: false, error: 'Description too long' };

	let severity: FeedbackSeverity | null = null;
	if (type === 'bug') {
		const s = str(raw.severity);
		if (s && !SEVERITIES.includes(s as FeedbackSeverity)) {
			return { ok: false, error: 'Invalid severity' };
		}
		severity = (s as FeedbackSeverity | null) ?? null;
	}

	const steps = str(raw.steps);
	if (steps && steps.length > MAX_STEPS) {
		return { ok: false, error: 'Steps too long' };
	}

	const email = str(raw.email);
	if (email) {
		if (email.length > MAX_EMAIL || !EMAIL_RE.test(email)) {
			return { ok: false, error: 'Invalid email address' };
		}
	}

	const context = raw.context ?? {};
	const contextSize = JSON.stringify(context).length;
	if (contextSize > MAX_CONTEXT_BYTES) {
		return { ok: false, error: 'Context payload too large' };
	}

	return {
		ok: true,
		value: {
			type: type as FeedbackType,
			severity,
			title: title.slice(0, MAX_TITLE),
			description: description.slice(0, MAX_DESCRIPTION),
			steps: steps ? steps.slice(0, MAX_STEPS) : null,
			email: email ? email.toLowerCase() : null,
			context,
		},
	};
}
