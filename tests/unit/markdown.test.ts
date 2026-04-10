import { describe, it, expect } from 'vitest';
import { renderMarkdown } from '$lib/content/markdown';

describe('renderMarkdown', () => {
	it('renders basic markdown to HTML', async () => {
		const html = await renderMarkdown('# Hello\n\nWorld');
		expect(html).toContain('<h1>Hello</h1>');
		expect(html).toContain('<p>World</p>');
	});

	it('renders inline math with KaTeX', async () => {
		const html = await renderMarkdown('The formula is $PV = FV / (1+r)^n$');
		expect(html).toContain('katex');
		expect(html).toContain('PV');
	});

	it('renders block math with KaTeX', async () => {
		const html = await renderMarkdown('$$\nPV = \\frac{FV}{(1+r)^n}\n$$');
		expect(html).toContain('katex');
	});

	it('sanitizes script tags', async () => {
		const html = await renderMarkdown('<script>alert("xss")</script>\n\nHello');
		expect(html).not.toContain('<script>');
		expect(html).toContain('Hello');
	});

	it('returns empty string for empty input', async () => {
		const html = await renderMarkdown('');
		expect(html).toBe('');
	});

	it('renders bold and italic', async () => {
		const html = await renderMarkdown('**bold** and *italic*');
		expect(html).toContain('<strong>bold</strong>');
		expect(html).toContain('<em>italic</em>');
	});

	it('renders code blocks', async () => {
		const html = await renderMarkdown('```\nconst x = 1;\n```');
		expect(html).toContain('<code>');
		expect(html).toContain('const x = 1;');
	});
});
