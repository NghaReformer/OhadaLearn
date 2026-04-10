/**
 * Journal Entry computation engine.
 * Pure computation — no DOM, no Svelte.
 */

import { getAccount } from '$lib/shared/chart-of-accounts';
import type { AccountingFramework } from '$lib/shared/chart-of-accounts/types';
import type {
	DraftEntry,
	JournalEntry,
	JournalLine,
	ValidationResult,
	LedgerAccount,
	TAccountData
} from './types';

export class JournalEntryEngine {
	/**
	 * Validate a draft entry before posting.
	 * Checks: all accounts valid, debits === credits, at least 2 lines, non-negative amounts.
	 */
	validate(draft: DraftEntry, framework: AccountingFramework): ValidationResult {
		const errors: string[] = [];
		let totalDebit = 0;
		let totalCredit = 0;

		// Filter out empty lines
		const filledLines = draft.lines.filter(
			(l) => l.accountKey || l.debit !== '' || l.credit !== ''
		);

		if (filledLines.length < 2) {
			errors.push('At least 2 lines required');
		}

		if (!draft.description.trim()) {
			errors.push('Description is required');
		}

		for (const line of filledLines) {
			if (!line.accountKey) {
				errors.push('Each line must have an account');
				continue;
			}

			const account = getAccount(line.accountKey, framework);
			if (!account) {
				errors.push(`Unknown account: ${line.accountKey}`);
				continue;
			}

			const debit = typeof line.debit === 'number' ? line.debit : 0;
			const credit = typeof line.credit === 'number' ? line.credit : 0;

			if (debit < 0 || credit < 0) {
				errors.push('Amounts must be non-negative');
			}

			if (debit === 0 && credit === 0) {
				errors.push(`Line for ${line.accountKey} has no amount`);
			}

			if (debit > 0 && credit > 0) {
				errors.push(`Line for ${line.accountKey} has both debit and credit`);
			}

			totalDebit += debit;
			totalCredit += credit;
		}

		if (filledLines.length >= 2 && Math.abs(totalDebit - totalCredit) > 0.01) {
			errors.push(`Entry is unbalanced: debits ${totalDebit} ≠ credits ${totalCredit}`);
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
	buildLedger(entries: JournalEntry[]): Map<string, LedgerAccount> {
		const ledger = new Map<string, LedgerAccount>();

		for (const entry of entries) {
			for (const line of entry.lines) {
				let account = ledger.get(line.accountKey);
				if (!account) {
					account = {
						accountKey: line.accountKey,
						debits: [],
						credits: [],
						debitTotal: 0,
						creditTotal: 0,
						balance: 0
					};
					ledger.set(line.accountKey, account);
				}

				if (line.debit > 0) {
					account.debits.push({
						entryId: entry.id,
						amount: line.debit,
						description: entry.description
					});
					account.debitTotal += line.debit;
				}
				if (line.credit > 0) {
					account.credits.push({
						entryId: entry.id,
						amount: line.credit,
						description: entry.description
					});
					account.creditTotal += line.credit;
				}

				account.balance = account.debitTotal - account.creditTotal;
			}
		}

		return ledger;
	}

	/**
	 * Get T-Account data for a specific account.
	 */
	getTAccount(ledger: Map<string, LedgerAccount>, accountKey: string): TAccountData | null {
		const account = ledger.get(accountKey);
		if (!account) return null;
		return { ...account };
	}
}
