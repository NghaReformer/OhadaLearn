import type { ThemeTokens } from './tokens';

export function generateCssVars(theme: ThemeTokens): string {
	const c = theme.colors;
	const f = theme.fonts;
	const r = theme.radii;
	const s = theme.shadows;
	const t = theme.transitions;

	return `
		--bg: ${c.bg};
		--bg-subtle: ${c.bgSubtle};
		--panel: ${c.panel};
		--panel-hover: ${c.panelHover};
		--border: ${c.border};
		--border-subtle: ${c.borderSubtle};
		--border-strong: ${c.borderStrong};
		--accent: ${c.accent};
		--accent-dim: ${c.accentDim};
		--accent-soft: ${c.accentSoft};
		--accent-glow: ${c.accentGlow};
		--green: ${c.green};
		--green-deep: ${c.greenDeep};
		--green-glow: ${c.greenGlow};
		--amber: ${c.amber};
		--amber-glow: ${c.amberGlow};
		--error: ${c.error};
		--error-deep: ${c.errorDeep};
		--text-primary: ${c.textPrimary};
		--text-secondary: ${c.textSecondary};
		--text-dim: ${c.textDim};
		--text-muted: ${c.textMuted};
		--font-display: '${f.display.family}', ${f.display.fallback};
		--font-body: '${f.body.family}', ${f.body.fallback};
		--font-mono: '${f.mono.family}', ${f.mono.fallback};
		--radius-sm: ${r.sm};
		--radius-md: ${r.md};
		--radius-lg: ${r.lg};
		--radius-xl: ${r.xl};
		--shadow-sm: ${s.sm};
		--shadow-md: ${s.md};
		--shadow-lg: ${s.lg};
		--shadow-glow: ${s.glow};
		--transition-fast: ${t.fast};
		--transition-smooth: ${t.smooth};
		--transition-spring: ${t.spring};
		--transition: ${t.fast};
	`.trim();
}
