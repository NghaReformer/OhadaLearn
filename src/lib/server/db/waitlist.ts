import { supabase } from '$lib/server/supabase';
import type { WaitlistEntry } from './types';

export async function insertEntry(data: WaitlistEntry): Promise<void> {
	const { error } = await supabase.from('waitlist').insert({
		name: data.name,
		email: data.email,
		institution: data.institution || null,
		role: data.role
	});
	if (error) throw error;
}
