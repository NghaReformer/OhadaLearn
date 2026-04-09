import { describe, it, expect } from 'vitest';
import { defaultTheme, type ThemeTokens } from '$lib/theme/tokens';
import { buildGoogleFontsUrl, buildFontFaceCss } from '$lib/theme/fonts';
import { generateCssVars } from '$lib/theme/css-generator';

describe('theme tokens', () => {
	it('default theme has all required color tokens', () => {
		const required = [
			'bg', 'bgSubtle', 'panel', 'panelHover',
			'border', 'borderSubtle',
			'accent', 'accentDim', 'accentGlow',
			'green', 'greenGlow', 'amber', 'amberGlow', 'error',
			'textPrimary', 'textSecondary', 'textMuted',
		];
		for (const key of required) {
			expect(defaultTheme.colors[key as keyof typeof defaultTheme.colors]).toBeTruthy();
		}
	});

	it('default theme has all three font families', () => {
		expect(defaultTheme.fonts.display.family).toBe('Fraunces');
		expect(defaultTheme.fonts.body.family).toBe('DM Sans');
		expect(defaultTheme.fonts.mono.family).toBe('JetBrains Mono');
	});

	it('default theme has radii tokens', () => {
		expect(defaultTheme.radii.sm).toBeTruthy();
		expect(defaultTheme.radii.md).toBeTruthy();
		expect(defaultTheme.radii.lg).toBeTruthy();
	});
});

describe('self-hosted font face CSS', () => {
	it('generates @font-face declarations for all three families', () => {
		const css = buildFontFaceCss(defaultTheme);
		expect(css).toContain('@font-face');
		expect(css).toContain('Fraunces');
		expect(css).toContain('DM Sans');
		expect(css).toContain('JetBrains Mono');
		expect(css).toContain('/fonts/');
		expect(css).toContain('woff2');
	});

	it('includes unicode-range for latin and latin-ext', () => {
		const css = buildFontFaceCss(defaultTheme);
		expect(css).toContain('unicode-range');
		// Should have 6 @font-face blocks (2 per family: latin + latin-ext)
		const fontFaceCount = (css.match(/@font-face/g) || []).length;
		expect(fontFaceCount).toBe(6);
	});
});

describe('font URL builder (deprecated)', () => {
	it('generates valid Google Fonts URL from theme', () => {
		const url = buildGoogleFontsUrl(defaultTheme);
		expect(url).toContain('fonts.googleapis.com');
		expect(url).toContain('Fraunces');
		expect(url).toContain('DM+Sans');
		expect(url).toContain('JetBrains+Mono');
	});
});

describe('CSS generator', () => {
	it('generates CSS custom properties string', () => {
		const css = generateCssVars(defaultTheme);
		expect(css).toContain('--bg:');
		expect(css).toContain('--accent:');
		expect(css).toContain('--font-display:');
		expect(css).toContain('--radius-sm:');
		expect(css).toContain('--transition:');
	});

	it('generated CSS contains actual token values', () => {
		const css = generateCssVars(defaultTheme);
		expect(css).toContain(defaultTheme.colors.accent);
		expect(css).toContain(defaultTheme.fonts.display.family);
	});

	it('different theme produces different CSS', () => {
		const modified: ThemeTokens = {
			...defaultTheme,
			name: 'custom',
			colors: { ...defaultTheme.colors, accent: '#ff0000', accentGlow: '#ff000030' },
		};
		const css = generateCssVars(modified);
		expect(css).toContain('#ff0000');
		expect(css).not.toContain(defaultTheme.colors.accent);
	});
});
