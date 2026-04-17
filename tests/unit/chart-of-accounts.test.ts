import { describe, it, expect } from 'vitest';
import {
	getAccount,
	getAllAccounts,
	searchAccounts,
	getAccountsByClass,
	formatAccountLabel
} from '$lib/shared/chart-of-accounts';

describe('Chart of Accounts', () => {
	describe('getAccount', () => {
		it('returns OHADA bank account with code 521', () => {
			const account = getAccount('bank', 'ohada');
			expect(account).not.toBeNull();
			expect(account!.code).toBe('521');
			expect(account!.frameworkCode).toBe('521');
			expect(account!.type).toBe('asset');
			expect(account!.normalBalance).toBe('debit');
		});

		it('returns PCG bank account with override code 512', () => {
			const account = getAccount('bank', 'pcg');
			expect(account).not.toBeNull();
			expect(account!.code).toBe('521'); // base OHADA code
			expect(account!.frameworkCode).toBe('512'); // PCG override
		});

		it('returns IFRS bank account with descriptive name', () => {
			const account = getAccount('bank', 'ifrs');
			expect(account).not.toBeNull();
			expect(account!.frameworkCode).toBe('-');
			expect(account!.frameworkNameEn).toBe('Cash & Cash Equivalents');
		});

		it('returns US GAAP bank account', () => {
			const account = getAccount('bank', 'usgaap');
			expect(account).not.toBeNull();
			expect(account!.frameworkNameEn).toBe('Cash');
		});

		it('returns null for unknown key', () => {
			const account = getAccount('nonExistentAccount', 'ohada');
			expect(account).toBeNull();
		});

		it('preserves base account properties with overrides', () => {
			const account = getAccount('accountsReceivable', 'pcg');
			expect(account).not.toBeNull();
			expect(account!.key).toBe('accountsReceivable');
			expect(account!.type).toBe('asset');
			expect(account!.normalBalance).toBe('debit');
			expect(account!.frameworkCode).toBe('411');
		});

		it('returns accounts with correct subType and fsLine', () => {
			const account = getAccount('shareCapital', 'ohada');
			expect(account).not.toBeNull();
			expect(account!.subType).toBe('noncurrent');
			expect(account!.fsLine).toBe('equity');
		});
	});

	describe('getAllAccounts', () => {
		it('returns 80+ accounts for OHADA framework', () => {
			const accounts = getAllAccounts('ohada');
			expect(accounts.length).toBeGreaterThanOrEqual(80);
		});

		it('returns same count for all frameworks', () => {
			const ohada = getAllAccounts('ohada');
			const pcg = getAllAccounts('pcg');
			const ifrs = getAllAccounts('ifrs');
			const usgaap = getAllAccounts('usgaap');
			expect(pcg.length).toBe(ohada.length);
			expect(ifrs.length).toBe(ohada.length);
			expect(usgaap.length).toBe(ohada.length);
		});

		it('every account has required fields', () => {
			const accounts = getAllAccounts('ohada');
			for (const acct of accounts) {
				expect(acct.key).toBeTruthy();
				expect(acct.code).toBeTruthy();
				expect(acct.nameFr).toBeTruthy();
				expect(acct.nameEn).toBeTruthy();
				expect(['asset', 'liability', 'equity', 'revenue', 'expense']).toContain(acct.type);
				expect(['debit', 'credit']).toContain(acct.normalBalance);
				expect(acct.frameworkCode).toBeTruthy();
				expect(acct.frameworkNameFr).toBeTruthy();
				expect(acct.frameworkNameEn).toBeTruthy();
			}
		});
	});

	describe('searchAccounts', () => {
		it('finds bank accounts when searching "bank" in English', () => {
			const results = searchAccounts('bank', 'ohada', 'en');
			expect(results.length).toBeGreaterThan(0);
			const keys = results.map((r) => r.key);
			expect(keys).toContain('bank');
		});

		it('finds accounts receivable when searching by code "411"', () => {
			const results = searchAccounts('411', 'ohada', 'en');
			expect(results.length).toBeGreaterThan(0);
			const keys = results.map((r) => r.key);
			expect(keys).toContain('accountsReceivable');
		});

		it('finds accounts when searching in French', () => {
			const results = searchAccounts('banque', 'ohada', 'fr');
			expect(results.length).toBeGreaterThan(0);
			const keys = results.map((r) => r.key);
			expect(keys).toContain('bank');
		});

		it('returns empty array for empty query', () => {
			const results = searchAccounts('', 'ohada', 'en');
			expect(results).toEqual([]);
		});

		it('returns at most 20 results', () => {
			// Search for something very broad
			const results = searchAccounts('a', 'ohada', 'en');
			expect(results.length).toBeLessThanOrEqual(20);
		});

		it('ranks code prefix matches higher than name matches', () => {
			const results = searchAccounts('521', 'ohada', 'en');
			expect(results.length).toBeGreaterThan(0);
			expect(results[0].key).toBe('bank');
		});

		it('returns Bank (521) as the top "cash" synonym hit', () => {
			const results = searchAccounts('cash', 'ohada', 'en');
			expect(results.length).toBeGreaterThan(0);
			expect(results[0].key).toBe('bank');
			expect(results.map((r) => r.key)).toContain('pettyCash');
		});

		it('returns Merchandise (37) first for "inventory"', () => {
			const results = searchAccounts('inventory', 'ohada', 'en');
			expect(results.length).toBeGreaterThan(0);
			expect(results[0].key).toBe('merchandise');
		});

		it('surfaces Accumulated Depreciation accounts for "accumulated"', () => {
			const results = searchAccounts('accumulated', 'ohada', 'en');
			expect(results.length).toBeGreaterThan(0);
			const keys = results.map((r) => r.key);
			expect(keys).toContain('accDeprEquipment');
		});

		it('surfaces Allowance for Doubtful Accounts for "allowance"', () => {
			const results = searchAccounts('allowance', 'ohada', 'en');
			expect(results.length).toBeGreaterThan(0);
			expect(results[0].key).toBe('allowanceDoubtful');
		});

		it('surfaces Owner\'s Drawings for "drawings"', () => {
			const results = searchAccounts('drawings', 'ohada', 'en');
			expect(results.length).toBeGreaterThan(0);
			expect(results[0].key).toBe('ownerDrawings');
		});
	});

	describe('formatAccountLabel', () => {
		it('uses "code — name" when a real code exists (OHADA)', () => {
			const account = getAccount('bank', 'ohada')!;
			expect(formatAccountLabel(account, 'en')).toBe('521 \u2014 Bank');
			expect(formatAccountLabel(account, 'fr')).toBe('521 \u2014 Banque');
		});

		it('falls back to just the name when code is the "-" placeholder (IFRS)', () => {
			const account = getAccount('bank', 'ifrs')!;
			expect(account.frameworkCode).toBe('-');
			expect(formatAccountLabel(account, 'en')).toBe('Cash & Cash Equivalents');
			expect(formatAccountLabel(account, 'en')).not.toContain('-');
		});

		it('falls back to just the name under US-GAAP', () => {
			const account = getAccount('shareCapital', 'usgaap')!;
			expect(account.frameworkCode).toBe('-');
			expect(formatAccountLabel(account, 'en')).toBe('Common Stock');
		});
	});

	describe('equity cash-flow classification', () => {
		it('tags equity accounts as financing activities', () => {
			const equityKeys = [
				'shareCapital',
				'legalReserve',
				'statutoryReserve',
				'revaluationSurplus',
				'retainedEarnings',
				'currentYearResult',
				'incomeSummary',
				'ownerDrawings'
			];
			for (const key of equityKeys) {
				const account = getAccount(key, 'ohada');
				expect(account, `missing account ${key}`).not.toBeNull();
				expect(account!.cfClass, `${key} should be classified as financing`).toBe('financing');
			}
		});
	});

	describe('getAccountsByClass', () => {
		it('returns cash accounts for class 5', () => {
			const accounts = getAccountsByClass(5, 'ohada');
			expect(accounts.length).toBeGreaterThan(0);
			for (const acct of accounts) {
				expect(acct.code.startsWith('5')).toBe(true);
			}
			const keys = accounts.map((a) => a.key);
			expect(keys).toContain('bank');
			expect(keys).toContain('pettyCash');
		});

		it('returns equity accounts for class 1', () => {
			const accounts = getAccountsByClass(1, 'ohada');
			expect(accounts.length).toBeGreaterThan(0);
			for (const acct of accounts) {
				expect(acct.code.startsWith('1')).toBe(true);
			}
		});

		it('returns expense accounts for class 6', () => {
			const accounts = getAccountsByClass(6, 'ohada');
			expect(accounts.length).toBeGreaterThan(0);
			for (const acct of accounts) {
				expect(acct.code.startsWith('6')).toBe(true);
			}
		});

		it('returns revenue accounts for class 7', () => {
			const accounts = getAccountsByClass(7, 'ohada');
			expect(accounts.length).toBeGreaterThan(0);
			for (const acct of accounts) {
				expect(acct.code.startsWith('7')).toBe(true);
			}
		});

		it('returns empty for class with no accounts', () => {
			const accounts = getAccountsByClass(9, 'ohada');
			// Class 9 has no accounts in our data (only 891 starts with 8)
			expect(accounts.length).toBe(0);
		});

		it('applies framework overrides to class results', () => {
			const accounts = getAccountsByClass(5, 'pcg');
			const bank = accounts.find((a) => a.key === 'bank');
			expect(bank).toBeDefined();
			expect(bank!.frameworkCode).toBe('512');
		});
	});
});
