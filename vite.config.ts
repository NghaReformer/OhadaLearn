import { sveltekit } from '@sveltejs/kit/vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
	plugins: [
		sveltekit(),
		SvelteKitPWA({
			registerType: 'autoUpdate',
			manifest: false,
			workbox: {
				globPatterns: [
					'**/*.{js,css,html,woff2,png,svg,ico}',
				],
				runtimeCaching: [
					{
						urlPattern: /\/playgrounds\/.*\.html$/,
						handler: 'CacheFirst',
						options: {
							cacheName: 'playground-cache',
							expiration: { maxAgeSeconds: 60 * 60 * 24 * 30 },
						},
					},
				],
			},
		}),
	],
	resolve: {
		alias: {
			$lib: path.resolve('./src/lib'),
		},
	},
	test: {
		include: ['tests/unit/**/*.test.ts'],
		environment: 'jsdom',
		globals: true,
		pool: 'threads',
		testTimeout: 60000,
	}
});
