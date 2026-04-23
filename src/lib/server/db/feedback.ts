import { supabase } from '$lib/server/supabase';
import type { FeedbackEntry } from './types';

const SCREENSHOT_BUCKET = 'feedback-screenshots';

export async function insertEntry(data: FeedbackEntry): Promise<{ id: string }> {
	const { data: row, error } = await supabase
		.from('feedback')
		.insert({
			type: data.type,
			severity: data.severity ?? null,
			title: data.title,
			description: data.description,
			steps: data.steps ?? null,
			email: data.email ?? null,
			screenshot_path: data.screenshotPath ?? null,
			context: data.context,
		})
		.select('id')
		.single();
	if (error) throw error;
	return { id: row.id };
}

export async function uploadScreenshot(
	file: Uint8Array,
	mimeType: string
): Promise<string> {
	const ext = mimeType === 'image/png' ? 'png' : mimeType === 'image/jpeg' ? 'jpg' : 'webp';
	const path = `${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}.${ext}`;
	const { error } = await supabase.storage.from(SCREENSHOT_BUCKET).upload(path, file, {
		contentType: mimeType,
		cacheControl: '3600',
		upsert: false,
	});
	if (error) throw error;
	return path;
}
