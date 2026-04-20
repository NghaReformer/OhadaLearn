import type { AccountingFramework } from '$lib/shared/chart-of-accounts/types';
import type {
	AmortizationInputs,
	AmortizationResult,
	AmortizationScheduleRow,
	JournalEntryLine,
	LifecycleJournalEntries,
	LifecycleJournalEntry,
	LifecycleStage,
} from './types';

function firstRegularRow(result: AmortizationResult): AmortizationScheduleRow | null {
	return (
		result.rows.find((row) => !row.flags.includes('grace-total') && row.principal > 0) ??
		result.rows[0] ??
		null
	);
}

function firstGraceRow(result: AmortizationResult): AmortizationScheduleRow | null {
	return (
		result.rows.find((row) => row.flags.includes('grace-total') || row.flags.includes('grace-partial')) ?? null
	);
}

function firstInsuranceRow(result: AmortizationResult): AmortizationScheduleRow | null {
	return result.rows.find((row) => row.insurance > 0) ?? null;
}

function firstExtraRow(result: AmortizationResult): AmortizationScheduleRow | null {
	return result.rows.find((row) => row.flags.includes('lump') || row.extra > 0) ?? null;
}

function lastRow(result: AmortizationResult): AmortizationScheduleRow | null {
	return result.rows.length > 0 ? result.rows[result.rows.length - 1] : null;
}

function round(value: number): number {
	return Math.round(value * 100) / 100;
}

function entry(
	stage: LifecycleStage,
	lines: JournalEntryLine[],
	sampleAmount: number,
): LifecycleJournalEntry {
	return {
		stage,
		labelKey: `am.lifecycle.stage.${stage}`,
		descKey: `am.lifecycle.desc.${stage}`,
		narrationKey: `am.lifecycle.narration.${stage}`,
		lines,
		sampleAmount,
	};
}

/**
 * Builds the canonical accounting lifecycle for a loan schedule:
 * disbursement, periodic payment, grace capitalization (if applicable),
 * insurance premium (if applicable), prepayment (if applicable), and
 * final settlement. Account keys resolve to framework-specific codes
 * downstream via getAccount(key, framework).
 */
export function buildLifecycleEntries(
	input: AmortizationInputs,
	result: AmortizationResult,
	_framework: AccountingFramework,
): LifecycleJournalEntries {
	const entries: LifecycleJournalEntry[] = [];

	// ── 1. Disbursement ──────────────────────────────────────────────
	// Framework divergence: SYSCOHADA and French PCG expense origination fees
	// immediately (local-GAAP practice). IFRS 9 and US GAAP (ASC 310-20) defer
	// the fee by netting it against the loan carrying amount and amortising via
	// the effective interest method — so the fee is NOT expensed at disbursement.
	const originationFee = input.fees.origination ?? 0;
	const netCash = round(input.principal - originationFee);
	const deferFee = _framework === 'ifrs' || _framework === 'usgaap';
	const disbursementLines: JournalEntryLine[] = [
		{ accountKey: 'bank', debit: netCash, credit: 0 },
	];
	if (originationFee > 0 && !deferFee) {
		// SYSCOHADA / PCG: expense the fee immediately.
		disbursementLines.push({
			accountKey: 'externalServices',
			debit: round(originationFee),
			credit: 0,
		});
	}
	// IFRS / US GAAP: credit the loan at its NET carrying amount (principal − fee).
	// SYSCOHADA / PCG: credit the loan at its FACE value (principal).
	const loanRecognized = deferFee ? netCash : round(input.principal);
	disbursementLines.push({
		accountKey: 'bankLoan',
		debit: 0,
		credit: loanRecognized,
	});
	entries.push(entry('disbursement', disbursementLines, loanRecognized));

	// ── 2. Periodic payment ──────────────────────────────────────────
	const regularRow = firstRegularRow(result);
	if (regularRow) {
		const interest = round(regularRow.interest);
		const principal = round(regularRow.principal);
		const total = round(interest + principal);
		const periodicLines: JournalEntryLine[] = [];
		if (interest > 0) {
			periodicLines.push({ accountKey: 'interestExpense', debit: interest, credit: 0 });
		}
		if (principal > 0) {
			periodicLines.push({ accountKey: 'bankLoan', debit: principal, credit: 0 });
		}
		periodicLines.push({ accountKey: 'bank', debit: 0, credit: total });
		entries.push(entry('periodic-payment', periodicLines, total));
	}

	// ── 3. Grace capitalization (only if grace-total exists) ─────────
	const graceRow = firstGraceRow(result);
	if (graceRow && graceRow.flags.includes('grace-total')) {
		const interest = round(graceRow.interest);
		entries.push(
			entry(
				'grace-capitalization',
				[
					{ accountKey: 'interestExpense', debit: interest, credit: 0 },
					{ accountKey: 'bankLoan', debit: 0, credit: interest },
				],
				interest,
			),
		);
	}

	// ── 4. Insurance premium (only if insurance is applied) ──────────
	const insuranceRow = firstInsuranceRow(result);
	if (insuranceRow) {
		const premium = round(insuranceRow.insurance);
		entries.push(
			entry(
				'insurance-premium',
				[
					{ accountKey: 'insuranceExpense', debit: premium, credit: 0 },
					{ accountKey: 'bank', debit: 0, credit: premium },
				],
				premium,
			),
		);
	}

	// ── 5. Prepayment (only if extras are configured) ────────────────
	const extraRow = firstExtraRow(result);
	const penaltyRate = input.fees.prepaymentPenaltyPct ?? 0;
	if (extraRow && extraRow.extra > 0) {
		const extraPrincipal = round(extraRow.extra);
		// penaltyRate is already stored as a decimal fraction (0.02 for 2%).
		const penalty = round(extraPrincipal * penaltyRate);
		const cashOut = round(extraPrincipal + penalty);
		const prepaymentLines: JournalEntryLine[] = [
			{ accountKey: 'bankLoan', debit: extraPrincipal, credit: 0 },
		];
		if (penalty > 0) {
			prepaymentLines.push({
				accountKey: 'exceptionalExpense',
				debit: penalty,
				credit: 0,
			});
		}
		prepaymentLines.push({ accountKey: 'bank', debit: 0, credit: cashOut });
		entries.push(entry('prepayment', prepaymentLines, cashOut));
	}

	// ── 6. Final settlement ──────────────────────────────────────────
	const finalRow = lastRow(result);
	if (finalRow) {
		const interest = round(finalRow.interest);
		const principal = round(finalRow.principal);
		const total = round(interest + principal);
		const finalLines: JournalEntryLine[] = [];
		if (interest > 0) {
			finalLines.push({ accountKey: 'interestExpense', debit: interest, credit: 0 });
		}
		if (principal > 0) {
			finalLines.push({ accountKey: 'bankLoan', debit: principal, credit: 0 });
		}
		finalLines.push({ accountKey: 'bank', debit: 0, credit: total });
		entries.push(entry('final-payment', finalLines, total));
	}

	return { entries };
}
