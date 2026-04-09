export interface FontDef {
	family: string;
	fallback: string;
	googleId: string;
}

export interface ThemeTokens {
	name: string;
	colors: {
		bg: string;
		bgSubtle: string;
		panel: string;
		panelHover: string;
		border: string;
		borderSubtle: string;
		accent: string;
		accentDim: string;
		accentGlow: string;
		green: string;
		greenGlow: string;
		amber: string;
		amberGlow: string;
		error: string;
		textPrimary: string;
		textSecondary: string;
		textMuted: string;
	};
	fonts: {
		display: FontDef;
		body: FontDef;
		mono: FontDef;
	};
	radii: { sm: string; md: string; lg: string; xl: string };
	shadows: { sm: string; md: string; lg: string; glow: string };
	transitions: { fast: string; smooth: string; spring: string };
}

export const defaultTheme: ThemeTokens = {
	name: 'midnight',
	colors: {
		bg: '#0a0c14',
		bgSubtle: '#0f1219',
		panel: '#151823',
		panelHover: '#1a1e2e',
		border: '#232840',
		borderSubtle: '#1c2035',
		accent: '#7c7fff',
		accentDim: '#6366f1',
		accentGlow: '#7c7fff30',
		green: '#34d399',
		greenGlow: '#34d39920',
		amber: '#f5a623',
		amberGlow: '#f5a62320',
		error: '#f06070',
		textPrimary: '#eef0f6',
		textSecondary: '#8b92a8',
		textMuted: '#555c74',
	},
	fonts: {
		display: { family: 'Fraunces', fallback: 'Georgia, serif', googleId: 'Fraunces:ital,opsz,wght@0,9..144,300..900;1,9..144,300..900' },
		body: { family: 'DM Sans', fallback: 'system-ui, sans-serif', googleId: 'DM+Sans:ital,opsz,wght@0,9..40,300..800;1,9..40,300..800' },
		mono: { family: 'JetBrains Mono', fallback: 'monospace', googleId: 'JetBrains+Mono:wght@400;600;700' },
	},
	radii: { sm: '6px', md: '10px', lg: '16px', xl: '20px' },
	shadows: {
		sm: '0 2px 8px rgba(0,0,0,.25)',
		md: '0 4px 20px rgba(0,0,0,.35)',
		lg: '0 8px 40px rgba(0,0,0,.45)',
		glow: '0 0 20px var(--accent-glow)',
	},
	transitions: {
		fast: '150ms cubic-bezier(.4,0,.2,1)',
		smooth: '250ms cubic-bezier(.4,0,.2,1)',
		spring: '350ms cubic-bezier(.34,1.56,.64,1)',
	},
};
