import { defaultTheme, type ThemeTokens } from './tokens';
import { buildFontFaceCss, buildGoogleFontsUrl, buildPreconnectLinks } from './fonts';
import { generateCssVars } from './css-generator';

export { defaultTheme, type ThemeTokens } from './tokens';
export type { FontDef } from './tokens';
export { buildFontFaceCss, buildGoogleFontsUrl, buildPreconnectLinks } from './fonts';
export { generateCssVars } from './css-generator';

/**
 * Active theme — currently a static const export.
 * There is one theme. If Phase 2+ needs dynamic theming,
 * promote to a writable store at that time.
 */
export const theme: ThemeTokens = defaultTheme;
