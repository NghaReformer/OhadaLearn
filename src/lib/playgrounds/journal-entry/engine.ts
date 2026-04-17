/**
 * Journal Entry computation engine.
 * Pure computation — no DOM, no Svelte.
 */

import { getAccount } from '$lib/shared/chart-of-accounts';
import type { AccountingFramework } from '$lib/shared/chart-of-accounts/types';
import type {
	DraftEntry,
	JournalEntry,
	ValidationError,
	ValidationResult,
	LedgerAccount,
	TAccountData,
	TrialBalanceRow,
	TrialBalanceCheck,
	IncomeStatementData,
	BalanceSheetData,
	CashFlowStatement,
	StatementLineItem,
	EntryImpact
} from './types';

const EPSILON = 0.01;
const DEFAULT_FRAMEWORK: AccountingFramework = 'ohada';

function sortByCode(
	a: { account: { frameworkCode: string } },
	b: { account: { frameworkCode: string } }
): number {
	return a.account.frameworkCode.localeCompare(b.account.frameworkCode, undefined, {
		numeric: true
	});
}

export class JournalEntryEngine {
	/**
	 * Validate a draft entry before posting.
	 * Checks: all accounts valid, debits === credits, at least 2 lines, non-negative amounts.
	 */
	validate(draft: DraftEntry, framework: AccountingFramework): ValidationResult {
		const errors: ValidationError[] = [];
		let totalDebit = 0;
		let totalCredit = 0;

		// Filter out empty lines
		const filledLines = draft.lines.filter(
			(l) => l.accountKey || l.debit !== '' || l.credit !== ''
		);

		if (filledLines.length < 2) {
			errors.push({ key: 'je.validation.minLines' });
		}

		if (!draft.description.trim()) {
			errors.push({ key: 'je.validation.descRequired' });
		}

		let seenAccountRequired = false;
		let seenNegative = false;
		const seenUnknown = new Set<string>();
		const seenNoAmount = new Set<string>();
		const seenBothSides = new Set<string>();

		for (const line of filledLines) {
			if (!line.accountKey) {
				if (!seenAccountRequired) {
					errors.push({ key: 'je.validation.accountRequired' });
					seenAccountRequired = true;
				}
				continue;
			}

			const account = getAccount(line.accountKey, framework);
			if (!account) {
				if (!seenUnknown.has(line.accountKey)) {
					errors.push({ key: 'je.validation.unknownAccount', params: { account: line.accountKey } });
					seenUnknown.add(line.accountKey);
				}
				continue;
			}

			const debit = typeof line.debit === 'number' ? line.debit : 0;
			const credit = typeof line.credit === 'number' ? line.credit : 0;

			if ((debit < 0 || credit < 0) && !seenNegative) {
				errors.push({ key: 'je.validation.negative' });
				seenNegative = true;
			}

			if (debit === 0 && credit === 0 && !seenNoAmount.has(line.accountKey)) {
				errors.push({ key: 'je.validation.noAmount', params: { account: account.frameworkCode } });
				seenNoAmount.add(line.accountKey);
			}

			if (debit > 0 && credit > 0 && !seenBothSides.has(line.accountKey)) {
				errors.push({ key: 'je.validation.bothSides', params: { account: account.frameworkCode } });
				seenBothSides.add(line.accountKey);
			}

			totalDebit += debit;
			totalCredit += credit;
		}

		if (filledLines.length >= 2 && Math.abs(totalDebit - totalCredit) > EPSILON) {
			errors.push({
				key: 'je.validation.unbalanced',
				params: { debit: totalDebit, credit: totalCredit, diff: Math.abs(totalDebit - totalCredit) }
			});
		}

		return {
			valid: errors.length === 0,
			errors,
			totalDebit,
			totalCredit
		};
	}

	/**
	 * Convert a valid draft to a posted journal entry.
	 */
	postDraft(draft: DraftEntry): JournalEntry {
		return {
			id: crypto.randomUUID(),
			date: draft.date,
			description: draft.description.trim(),
			lines: draft.lines
				.filter((l) => l.accountKey && (l.debit !== '' || l.credit !== ''))
				.map((l) => ({
					accountKey: l.accountKey,
					debit: typeof l.debit === 'number' ? l.debit : 0,
					credit: typeof l.credit === 'number' ? l.credit : 0
				}))
		};
	}

	/**
	 * Build a ledger from all posted entries.
	 */
	buildLedger(
		entries: JournalEntry[],
		framework: AccountingFramework = DEFAULT_FRAMEWORK
	): Map<string, LedgerAccount> {
		const ledger = new Map<string, LedgerAccount>();

		for (const entry of entries) {
			for (const line of entry.lines) {
				const accountMeta = getAccount(line.accountKey, framework);
				if (!accountMeta) continue;

				let account = ledger.get(line.accountKey);
				if (!account) {
					account = {
						accountKey: line.accountKey,
						account: accountMeta,
						entries: [],
						debitTotal: 0,
						creditTotal: 0,
						balance: 0
					};
					ledger.set(line.accountKey, account);
				}

				account.entries.push({
					entryId: entry.id,
					date: entry.date,
					description: entry.description,
					debit: line.debit,
					credit: line.credit
				});
				account.debitTotal += line.debit;
				account.creditTotal += line.credit;
				account.balance = this.getNormalBalanceAmount(
					account.account.normalBalance,
					account.debitTotal,
					account.creditTotal
				);
			}
		}

		return ledger;
	}

	buildTrialBalance(ledger: Map<string, LedgerAccount>): TrialBalanceRow[] {
		const rows = [...ledger.values()]
			.filter((account) => account.debitTotal > 0 || account.creditTotal > 0)
			.map((account) => ({
				accountKey: account.accountKey,
				account: account.account,
				debitTotal: account.debitTotal,
				creditTotal: account.creditTotal,
				balance: account.balance
			}))
			.sort(sortByCode);

		return rows;
	}

	verifyTrialBalance(rows: TrialBalanceRow[]): TrialBalanceCheck {
		const totalDebit = rows.reduce((sum, row) => sum + row.debitTotal, 0);
		const totalCredit = rows.reduce((sum, row) => sum + row.creditTotal, 0);
		const diff = totalDebit - totalCredit;

		return {
			balanced: Math.abs(diff) < EPSILON,
			totalDebit,
			totalCredit,
			diff
		};
	}

	buildIncomeStatement(
		rows: TrialBalanceRow[],
		_framework: AccountingFramework = DEFAULT_FRAMEWORK
	): IncomeStatementData {
		const revenues = rows
			.filter((row) => row.account.type === 'revenue')
			.map((row) => this.toStatementLineItem(row))
			.filter((row) => Math.abs(row.amount) >= EPSILON)
			.sort(sortByCode);

		const expenses = rows
			.filter((row) => row.account.type === 'expense')
			.map((row) => this.toStatementLineItem(row))
			.filter((row) => Math.abs(row.amount) >= EPSILON)
			.sort(sortByCode);

		const totalRevenue = revenues.reduce((sum, row) => sum + row.amount, 0);
		const totalExpense = expenses.reduce((sum, row) => sum + row.amount, 0);

		return {
			revenues,
			expenses,
			totalRevenue,
			totalExpense,
			netIncome: totalRevenue - totalExpense
		};
	}

	buildBalanceSheet(rows: TrialBalanceRow[], netIncome: number): BalanceSheetData {
		const nonCurrentAssets: StatementLineItem[] = [];
		const currentAssets: StatementLineItem[] = [];
		const nonCurrentLiabilities: StatementLineItem[] = [];
		const currentLiabilities: StatementLineItem[] = [];
		const equity: StatementLineItem[] = [];

		for (const row of rows) {
			if (row.account.type === 'revenue' || row.account.type === 'expense') continue;

			const item = this.toStatementLineItem(row);
			if (Math.abs(item.amount) < EPSILON) continue;

			if (row.account.type === 'asset') {
				if (row.account.subType === 'noncurrent') {
					nonCurrentAssets.push(item);
				} else {
					currentAssets.push(item);
				}
				continue;
			}

			if (row.account.type === 'liability') {
				if (row.account.subType === 'noncurrent') {
					nonCurrentLiabilities.push(item);
				} else {
					currentLiabilities.push(item);
				}
				continue;
			}

			equity.push(item);
		}

		nonCurrentAssets.sort(sortByCode);
		currentAssets.sort(sortByCode);
		nonCurrentLiabilities.sort(sortByCode);
		currentLiabilities.sort(sortByCode);
		equity.sort(sortByCode);

		const hasExplicitCurrentYearResult = equity.some(
			(item) => item.accountKey === 'currentYearResult'
		);
		const derivedNetIncome = hasExplicitCurrentYearResult ? 0 : netIncome;
		const totalAssets =
			nonCurrentAssets.reduce((sum, item) => sum + item.amount, 0) +
			currentAssets.reduce((sum, item) => sum + item.amount, 0);
		const totalLiabilities =
			nonCurrentLiabilities.reduce((sum, item) => sum + item.amount, 0) +
			currentLiabilities.reduce((sum, item) => sum + item.amount, 0);
		const totalEquity =
			equity.reduce((sum, item) => sum + item.amount, 0) + derivedNetIncome;
		const totalLiabilitiesAndEquity = totalLiabilities + totalEquity;

		return {
			nonCurrentAssets,
			currentAssets,
			nonCurrentLiabilities,
			currentLiabilities,
			equity,
			derivedNetIncome,
			totalAssets,
			totalLiabilities,
			totalEquity,
			totalLiabilitiesAndEquity,
			balanced: Math.abs(totalAssets - totalLiabilitiesAndEquity) < EPSILON
		};
	}

	buildCashFlow(
		entries: JournalEntry[],
		framework: AccountingFramework = DEFAULT_FRAMEWORK
	): CashFlowStatement {
		const operating = [];
		const investing = [];
		const financing = [];
		let totalOperating = 0;
		let totalInvesting = 0;
		let totalFinancing = 0;

		for (const entry of entries) {
			const hasCashLine = entry.lines.some((line) => this.isCashAccount(line.accountKey, framework));
			if (!hasCashLine) continue;

			for (const line of entry.lines) {
				if (this.isCashAccount(line.accountKey, framework)) continue;

				const account = getAccount(line.accountKey, framework);
				if (!account) continue;

				const amount = line.credit - line.debit;
				const item = {
					entryId: entry.id,
					date: entry.date,
					description: entry.description,
					accountKey: line.accountKey,
					account,
					amount
				};

				if (account.cfClass === 'investing') {
					investing.push(item);
					totalInvesting += amount;
					continue;
				}

				if (account.cfClass === 'financing') {
					financing.push(item);
					totalFinancing += amount;
					continue;
				}

				operating.push(item);
				totalOperating += amount;
			}
		}

		return {
			operating,
			investing,
			financing,
			totalOperating,
			totalInvesting,
			totalFinancing,
			netChangeInCash: totalOperating + totalInvesting + totalFinancing
		};
	}

	analyzeEntryImpact(
		entry: JournalEntry | undefined,
		framework: AccountingFramework = DEFAULT_FRAMEWORK
	): EntryImpact {
		if (!entry) {
			return {
				affectsIncomeStatement: false,
				affectsBalanceSheet: false,
				affectsCashFlow: false
			};
		}

		let affectsIncomeStatement = false;
		let affectsCashFlow = false;

		for (const line of entry.lines) {
			const account = getAccount(line.accountKey, framework);
			if (!account) continue;

			if (account.type === 'revenue' || account.type === 'expense') {
				affectsIncomeStatement = true;
			}

			if (this.isCashAccount(line.accountKey, framework)) {
				affectsCashFlow = true;
			}
		}

		return {
			affectsIncomeStatement,
			affectsBalanceSheet: entry.lines.length > 0,
			affectsCashFlow
		};
	}

	/**
	 * Get T-Account data for a specific account.
	 */
	getTAccount(ledger: Map<string, LedgerAccount>, accountKey: string): TAccountData | null {
		const account = ledger.get(accountKey);
		if (!account) return null;

		return {
			accountKey: account.accountKey,
			account: account.account,
			debits: account.entries.filter((entry) => entry.debit > 0),
			credits: account.entries.filter((entry) => entry.credit > 0),
			debitTotal: account.debitTotal,
			creditTotal: account.creditTotal,
			balance: account.balance,
			normalBalance: account.account.normalBalance
		};
	}

	private getNormalBalanceAmount(
		normalBalance: 'debit' | 'credit',
		debitTotal: number,
		creditTotal: number
	): number {
		return normalBalance === 'debit'
			? debitTotal - creditTotal
			: creditTotal - debitTotal;
	}

	private toStatementLineItem(row: TrialBalanceRow): StatementLineItem {
		return {
			accountKey: row.accountKey,
			account: row.account,
			amount: this.toStatementAmount(row.account.type, row.account.normalBalance, row.balance)
		};
	}

	private toStatementAmount(
		accountType: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense',
		normalBalance: 'debit' | 'credit',
		balance: number
	): number {
		if (accountType === 'asset' || accountType === 'expense') {
			return normalBalance === 'debit' ? balance : -balance;
		}

		return normalBalance === 'credit' ? balance : -balance;
	}

	private isCashAccount(
		accountKey: string,
		framework: AccountingFramework = DEFAULT_FRAMEWORK
	): boolean {
		const account = getAccount(accountKey, framework);
		return account?.fsLine === 'cashEquiv';
	}
}
