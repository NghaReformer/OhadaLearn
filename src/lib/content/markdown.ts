import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkMath from 'remark-math';
import remarkRehype from 'remark-rehype';
import rehypeKatex from 'rehype-katex';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import rehypeStringify from 'rehype-stringify';

// Extend sanitization schema to allow KaTeX output elements
const katexSchema = {
	...defaultSchema,
	tagNames: [
		...(defaultSchema.tagNames || []),
		'math',
		'semantics',
		'mrow',
		'mi',
		'mo',
		'mn',
		'msup',
		'mfrac',
		'mtext',
		'annotation',
	],
	attributes: {
		...defaultSchema.attributes,
		'*': [...(defaultSchema.attributes?.['*'] || []), 'className'],
		span: [...(defaultSchema.attributes?.['span'] || []), 'aria-hidden', 'style'],
		math: ['xmlns'],
		annotation: ['encoding'],
	},
};

const processor = unified()
	.use(remarkParse)
	.use(remarkMath)
	.use(remarkRehype, { allowDangerousHtml: false })
	.use(rehypeKatex)
	.use(rehypeSanitize, katexSchema)
	.use(rehypeStringify);

export async function renderMarkdown(source: string): Promise<string> {
	if (!source.trim()) return '';
	const file = await processor.process(source);
	return String(file);
}
