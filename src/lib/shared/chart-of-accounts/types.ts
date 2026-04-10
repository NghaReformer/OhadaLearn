export type AccountType = 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
export type NormalBalance = 'debit' | 'credit';
export type AccountingFramework = 'ohada' | 'pcg' | 'ifrs' | 'usgaap';
export type SubType = 'current' | 'noncurrent' | 'operating' | 'nonoperating';
export type CashFlowClass = 'operating' | 'investing' | 'financing' | null;

export interface AccountBase {
	key: string;
	code: string;
	nameFr: string;
	nameEn: string;
	type: AccountType;
	normalBalance: NormalBalance;
	subType: SubType;
	fsLine: string;
	cfClass: CashFlowClass;
	parentCode: string;
}

export interface FrameworkOverride {
	code: string;
	nameFr: string;
	nameEn: string;
}

export interface ResolvedAccount extends AccountBase {
	frameworkCode: string;
	frameworkNameFr: string;
	frameworkNameEn: string;
}
