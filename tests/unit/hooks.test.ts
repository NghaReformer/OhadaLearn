import { describe, it, expect } from 'vitest';

function detectLanguage(acceptLanguage: string | null): 'en' | 'fr' {
	if (!acceptLanguage) return 'en';
	const parts = acceptLanguage.split(',').map((p) => p.trim().split(';')[0].toLowerCase());
	for (const part of parts) {
		if (part === 'fr' || part.startsWith('fr-')) return 'fr';
		if (part === 'en' || part.startsWith('en-')) return 'en';
	}
	return 'en';
}

function getLegacyRedirect(pathname: string): string | null {
	if (pathname === '/playgrounds' || pathname.startsWith('/playgrounds/')) {
		return `/en${pathname}`;
	}
	if (pathname === '/privacy') {
		return `/en${pathname}`;
	}
	return null;
}

describe('detectLanguage', () => {
	it('returns fr for French Accept-Language', () => {
		expect(detectLanguage('fr-FR,fr;q=0.9,en;q=0.8')).toBe('fr');
	});
	it('returns en for English Accept-Language', () => {
		expect(detectLanguage('en-US,en;q=0.9')).toBe('en');
	});
	it('returns en for null header', () => {
		expect(detectLanguage(null)).toBe('en');
	});
	it('returns fr when fr is first', () => {
		expect(detectLanguage('fr,en;q=0.8')).toBe('fr');
	});
	it('returns en for unknown languages', () => {
		expect(detectLanguage('de,ja;q=0.8')).toBe('en');
	});
});

describe('getLegacyRedirect', () => {
	it('redirects /playgrounds to /en/playgrounds', () => {
		expect(getLegacyRedirect('/playgrounds')).toBe('/en/playgrounds');
	});
	it('redirects /playgrounds/tvm to /en/playgrounds/tvm', () => {
		expect(getLegacyRedirect('/playgrounds/tvm')).toBe('/en/playgrounds/tvm');
	});
	it('redirects /privacy to /en/privacy', () => {
		expect(getLegacyRedirect('/privacy')).toBe('/en/privacy');
	});
	it('returns null for /en/playgrounds (already prefixed)', () => {
		expect(getLegacyRedirect('/en/playgrounds')).toBe(null);
	});
	it('returns null for /api/waitlist', () => {
		expect(getLegacyRedirect('/api/waitlist')).toBe(null);
	});
});
