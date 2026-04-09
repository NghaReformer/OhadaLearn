import { redirect, type Handle } from '@sveltejs/kit';

export function detectLanguage(acceptLanguage: string | null): 'en' | 'fr' {
	if (!acceptLanguage) return 'en';
	const parts = acceptLanguage.split(',').map((p) => p.trim().split(';')[0].toLowerCase());
	for (const part of parts) {
		if (part === 'fr' || part.startsWith('fr-')) return 'fr';
		if (part === 'en' || part.startsWith('en-')) return 'en';
	}
	return 'en';
}

export function getLegacyRedirect(pathname: string): string | null {
	if (pathname === '/playgrounds' || pathname.startsWith('/playgrounds/')) {
		return `/en${pathname}`;
	}
	if (pathname === '/privacy') {
		return `/en${pathname}`;
	}
	return null;
}

export const handle: Handle = async ({ event, resolve }) => {
	const { pathname } = event.url;

	// Skip API routes, sitemap, static assets
	if (pathname.startsWith('/api/') || pathname.startsWith('/sitemap') || pathname.startsWith('/.')) {
		return resolve(event);
	}

	// Root redirect: / → /en/ or /fr/ based on Accept-Language
	if (pathname === '/') {
		const lang = detectLanguage(event.request.headers.get('accept-language'));
		throw redirect(302, `/${lang}/`);
	}

	// Legacy URL redirects (Phase 1 URLs without lang prefix)
	const legacyTarget = getLegacyRedirect(pathname);
	if (legacyTarget) {
		throw redirect(301, legacyTarget);
	}

	return resolve(event);
};
