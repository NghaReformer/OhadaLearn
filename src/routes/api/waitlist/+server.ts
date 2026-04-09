import { json } from '@sveltejs/kit';
import { supabase } from '$lib/server/supabase';
import type { RequestHandler } from './$types';

// Simple in-memory rate limiter (per IP, resets on redeploy — sufficient for Phase 1)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX = 5; // max 5 submissions per minute per IP

function isRateLimited(ip: string): boolean {
	const now = Date.now();
	const entry = rateLimitMap.get(ip);
	if (!entry || now > entry.resetAt) {
		rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
		return false;
	}
	entry.count++;
	return entry.count > RATE_LIMIT_MAX;
}

export const POST: RequestHandler = async ({ request, getClientAddress }) => {
	// Rate limiting by IP
	const ip = getClientAddress();
	if (isRateLimited(ip)) {
		return json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
	}

	const body = await request.json().catch(() => null);

	if (!body || !body.name || !body.email || !body.role) {
		return json({ error: 'Missing required fields: name, email, role' }, { status: 400 });
	}

	// Honeypot: if the hidden "website" field is filled, it's a bot
	if (body.website) {
		// Silently accept to not reveal the trap, but don't insert
		return json({ success: true }, { status: 201 });
	}

	const email = body.email.trim().toLowerCase();
	if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
		return json({ error: 'Invalid email address' }, { status: 400 });
	}

	const { error } = await supabase.from('waitlist').insert({
		name: body.name.trim().slice(0, 200),
		email,
		institution: body.institution?.trim().slice(0, 300) || null,
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
