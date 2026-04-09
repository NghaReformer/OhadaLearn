import { writable } from 'svelte/store';
import { defaultTheme, type ThemeTokens } from './tokens';
import { buildGoogleFontsUrl, buildPreconnectLinks } from './fonts';
import { generateCssVars } from './css-generator';

export { defaultTheme, type ThemeTokens } from './tokens';
export type { FontDef } from './tokens';
export { buildGoogleFontsUrl, buildPreconnectLinks } from './fonts';
export { generateCssVars } from './css-generator';

export const theme = writable<ThemeTokens>(defaultTheme);

export function getTheme(): ThemeTokens {
	return defaultTheme;
}
