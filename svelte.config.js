import adapter from '@sveltejs/adapter-auto';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	compilerOptions: {
		// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
		runes: ({ filename }) => (filename.split(/[/\\]/).includes('node_modules') ? undefined : true)
	},
	kit: {
		adapter: adapter(),
		// CSRF protection is enabled by default in SvelteKit 2 (csrf.checkOrigin = true).
		// This checks the Origin header on all non-GET requests, preventing cross-site form submissions.
		// Do NOT disable this — the waitlist endpoint depends on it.
	}
};

export default config;
