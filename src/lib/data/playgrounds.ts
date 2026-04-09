export interface PlaygroundMeta {
	slug: string;
	titleKey: string;
	descKey: string;
	staticFile: string;
	icon: string;
	category: 'financial-accounting' | 'managerial-accounting' | 'business-math';
	lineCount: number;
}

export const playgrounds: PlaygroundMeta[] = [
	{
		slug: 'tvm',
		titleKey: 'pg.tvm.title',
		descKey: 'pg.tvm.desc',
		staticFile: '/playgrounds/tvm-playground.html',
		icon: '📐',
		category: 'business-math',
		lineCount: 11900,
	},
	{
		slug: 'cvp',
		titleKey: 'pg.cvp.title',
		descKey: 'pg.cvp.desc',
		staticFile: '/playgrounds/cvp-playground.html',
		icon: '📊',
		category: 'managerial-accounting',
		lineCount: 5650,
	},
	{
		slug: 'journal-entry',
		titleKey: 'pg.je.title',
		descKey: 'pg.je.desc',
		staticFile: '/playgrounds/journal-entry-playground.html',
		icon: '📒',
		category: 'financial-accounting',
		lineCount: 6443,
	},
	{
		slug: 'amortization',
		titleKey: 'pg.amort.title',
		descKey: 'pg.amort.desc',
		staticFile: '/playgrounds/amortization-playground.html',
		icon: '🏦',
		category: 'business-math',
		lineCount: 3887,
	},
	{
		slug: 'depreciation',
		titleKey: 'pg.deprec.title',
		descKey: 'pg.deprec.desc',
		staticFile: '/playgrounds/depreciation-playground.html',
		icon: '📉',
		category: 'financial-accounting',
		lineCount: 3085,
	},
];
