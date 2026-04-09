import { json } from '@sveltejs/kit';
import { supabase } from '$lib/server/supabase';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, getClientAddress }) => {
	// Basic rate limiting note: Supabase's unique email constraint prevents duplicates.
	// For production, add IP-based rate limiting (e.g., Vercel WAF or upstash/ratelimit).
	const body = await request.json().catch(() => null);

	if (!body || !body.name || !body.email || !body.role) {
		return json({ error: 'Missing required fields: name, email, role' }, { status: 400 });
	}

	const email = body.email.trim().toLowerCase();
	if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
		return json({ error: 'Invalid email address' }, { status: 400 });
	}

	const { error } = await supabase.from('waitlist').insert({
		name: body.name.trim(),
		email,
		institution: body.institution?.trim() || null,
		role: body.role,
	});

	if (error) {
		if (error.code === '23505') {
			return json({ error: 'This email is already on the waitlist' }, { status: 409 });
		}
		console.error('Waitlist insert error:', error);
		return json({ error: 'Failed to save' }, { status: 500 });
	}

	return json({ success: true }, { status: 201 });
};
