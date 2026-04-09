import { playgrounds } from '$lib/data/playgrounds';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = () => {
	const base = 'https://ohadalearn.com';
	const urls = [
		{ loc: '/', changefreq: 'weekly', priority: '1.0' },
		{ loc: '/playgrounds', changefreq: 'weekly', priority: '0.9' },
		...playgrounds.map((pg) => ({
			loc: `/playgrounds/${pg.slug}`,
			changefreq: 'monthly' as const,
			priority: '0.8',
		})),
	];

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url>
    <loc>${base}${u.loc}</loc>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

	return new Response(xml, {
		headers: { 'Content-Type': 'application/xml' },
	});
};
