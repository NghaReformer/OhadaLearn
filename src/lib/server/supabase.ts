import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } from '$env/static/private';

// Startup validation — fail fast if env vars are missing or empty
if (!SUPABASE_URL) throw new Error('Missing SUPABASE_URL environment variable');
if (!SUPABASE_SERVICE_ROLE_KEY) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');

/**
 * Server-side Supabase client using the service_role key.
 * This bypasses RLS — the server endpoint is the sole gatekeeper for access control.
 * Never expose this client or its key to client-side code.
 */
export const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
