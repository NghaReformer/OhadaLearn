export type KpiVariant = 'default' | 'accent' | 'warn';

export interface KpiItem {
	label: string;
	value: string;
	variant?: KpiVariant;
}
