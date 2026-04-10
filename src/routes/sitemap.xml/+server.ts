import { playgrounds } from '$lib/data/playgrounds';
import type { RequestHandler } from './$types';

const BASE = 'https://ohadalearn.com';
const LANGS = ['en', 'fr'] as const;

export const GET: RequestHandler = () => {
	const paths = [
		'/',
		'/playgrounds',
		...playgrounds.map((pg) => `/playgrounds/${pg.slug}`),
		'/privacy',
	];

	const urls = paths.flatMap((path) =>
		LANGS.map((lang) => {
			const loc = `${BASE}/${lang}${path}`;
			const alternates = LANGS.map(
				(l) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${BASE}/${l}${path}" />`
			).join('\n');
			return `  <url>
    <loc>${loc}</loc>
    <changefreq>${path === '/' ? 'weekly' : 'monthly'}</changefreq>
    <priority>${path === '/' ? '1.0' : path === '/playgrounds' ? '0.9' : '0.8'}</priority>
${alternates}
  </url>`;
		})
	);

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join('\n')}
</urlset>`;

	return new Response(xml, {
		headers: { 'Content-Type': 'application/xml' },
	});
};
