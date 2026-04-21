export interface PlaygroundMeta {
	slug: string;
	titleKey: string;
	descKey: string;
	/** Path to the legacy iframe HTML. Omit for playgrounds migrated to a native Svelte module. */
	staticFile?: string;
	icon: string;
	category: 'financial-accounting' | 'managerial-accounting' | 'business-math';
	/** LOC of the legacy HTML. 0 once migrated. */
	lineCount: number;
}

export const playgrounds: PlaygroundMeta[] = [
	{
		slug: 'tvm',
		titleKey: 'pg.tvm.title',
		descKey: 'pg.tvm.desc',
		icon: '📐',
		category: 'business-math',
		lineCount: 0,
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
		icon: '🏦',
		category: 'business-math',
		lineCount: 0,
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
	{
		slug: 'bank-reconciliation',
		titleKey: 'pg.bank-reconciliation.title',
		descKey: 'pg.bank-reconciliation.desc',
		icon: '🏧',
		category: 'financial-accounting',
		lineCount: 0,
	},
	{
		slug: 'interest',
		titleKey: 'pg.interest.title',
		descKey: 'pg.interest.desc',
		icon: '📈',
		category: 'business-math',
		lineCount: 0,
	},
];
