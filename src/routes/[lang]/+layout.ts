import { error } from '@sveltejs/kit';
import type { LayoutLoad } from './$types';
import type { Locale } from '$lib/i18n/types';

const SUPPORTED: Locale[] = ['en', 'fr'];

export const load: LayoutLoad = ({ params }) => {
	const lang = params.lang as string;
	if (!SUPPORTED.includes(lang as Locale)) {
		throw error(404, 'Not found');
	}
	return { lang: lang as Locale };
};
