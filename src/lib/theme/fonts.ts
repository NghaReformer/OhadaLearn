import type { ThemeTokens } from './tokens';

export function buildGoogleFontsUrl(theme: ThemeTokens): string {
	const families = [theme.fonts.display, theme.fonts.body, theme.fonts.mono]
		.map((f) => `family=${f.googleId}`)
		.join('&');
	return `https://fonts.googleapis.com/css2?${families}&display=swap`;
}

export function buildPreconnectLinks(): string[] {
	return ['https://fonts.googleapis.com', 'https://fonts.gstatic.com'];
}
