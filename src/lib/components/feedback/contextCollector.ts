import type { UserPreferences } from '$lib/stores/preferences';

export interface ClientContext {
	url: string;
	pathname: string;
	referrer: string | null;
	viewport: { width: number; height: number; dpr: number };
	screen: { width: number; height: number };
	userAgent: string;
	browser: { name: string; os: string; device: 'mobile' | 'tablet' | 'desktop' };
	language: string;
	locale: string;
	timezone: string;
	timestamp: string;
	prefs: Pick<UserPreferences, 'locale' | 'currency' | 'accountingStandard'>;
	build: string | null;
}

function detectBrowser(ua: string): { name: string; os: string; device: 'mobile' | 'tablet' | 'desktop' } {
	const lower = ua.toLowerCase();
	let name = 'Unknown';
	if (lower.includes('edg/')) name = 'Edge';
	else if (lower.includes('chrome/') && !lower.includes('chromium')) name = 'Chrome';
	else if (lower.includes('firefox/')) name = 'Firefox';
	else if (lower.includes('safari/') && !lower.includes('chrome')) name = 'Safari';
	else if (lower.includes('opr/') || lower.includes('opera')) name = 'Opera';

	let os = 'Unknown';
	if (lower.includes('windows')) os = 'Windows';
	else if (lower.includes('iphone') || lower.includes('ipad') || lower.includes('ipod')) os = 'iOS';
	else if (lower.includes('android')) os = 'Android';
	else if (lower.includes('mac os x') || lower.includes('macintosh')) os = 'macOS';
	else if (lower.includes('linux')) os = 'Linux';

	let device: 'mobile' | 'tablet' | 'desktop' = 'desktop';
	if (lower.includes('ipad') || (lower.includes('android') && !lower.includes('mobile'))) {
		device = 'tablet';
	} else if (lower.includes('mobile') || lower.includes('iphone') || lower.includes('android')) {
		device = 'mobile';
	}
	return { name, os, device };
}

export function collectContext(prefs: UserPreferences, buildSha: string | null): ClientContext {
	const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
	return {
		url: typeof window !== 'undefined' ? window.location.href : '',
		pathname: typeof window !== 'undefined' ? window.location.pathname : '',
		referrer: typeof document !== 'undefined' && document.referrer ? document.referrer : null,
		viewport: {
			width: typeof window !== 'undefined' ? window.innerWidth : 0,
			height: typeof window !== 'undefined' ? window.innerHeight : 0,
			dpr: typeof window !== 'undefined' ? window.devicePixelRatio : 1,
		},
		screen: {
			width: typeof screen !== 'undefined' ? screen.width : 0,
			height: typeof screen !== 'undefined' ? screen.height : 0,
		},
		userAgent: ua,
		browser: detectBrowser(ua),
		language: typeof navigator !== 'undefined' ? navigator.language : '',
		locale: prefs.locale,
		timezone:
			typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : '',
		timestamp: new Date().toISOString(),
		prefs: {
			locale: prefs.locale,
			currency: prefs.currency,
			accountingStandard: prefs.accountingStandard,
		},
		build: buildSha,
	};
}

export { detectBrowser };
