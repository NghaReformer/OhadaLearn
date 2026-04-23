/**
 * Keep-alive ping for the Supabase project.
 *
 * Supabase free-tier projects are auto-paused after ~7 days of database
 * inactivity. This script issues a lightweight SELECT against the `feedback`
 * table via PostgREST, which counts as real DB activity and resets the
 * inactivity timer.
 *
 * Usage (CI):
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npx tsx scripts/keep-supabase-alive.ts
 *
 * Usage (local):
 *   npx tsx scripts/keep-supabase-alive.ts
 *
 * Runs on Node 18+ (uses the global fetch). No external dependencies.
 */

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
	console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
	process.exit(1);
}

const endpoint = `${url.replace(/\/$/, '')}/rest/v1/feedback?select=id&limit=1`;
const startedAt = Date.now();

async function main(): Promise<void> {
	const res = await fetch(endpoint, {
		method: 'GET',
		headers: {
			apikey: key as string,
			Authorization: `Bearer ${key}`,
			'Accept-Profile': 'public',
			Prefer: 'count=exact',
		},
	});

	const elapsed = Date.now() - startedAt;
	const body = await res.text();

	if (!res.ok) {
		console.error(`[keep-alive] FAIL — HTTP ${res.status} in ${elapsed}ms`);
		console.error(body.slice(0, 500));
		process.exit(1);
	}

	// PostgREST returns an object-count header when Prefer: count=exact is set.
	const contentRange = res.headers.get('content-range');
	const totalRows = contentRange ? contentRange.split('/')[1] : 'unknown';

	console.log(
		`[keep-alive] OK — HTTP ${res.status} in ${elapsed}ms — feedback rows: ${totalRows} — ${new Date().toISOString()}`
	);
}

main().catch((err) => {
	console.error('[keep-alive] CRASH —', err);
	process.exit(1);
});
