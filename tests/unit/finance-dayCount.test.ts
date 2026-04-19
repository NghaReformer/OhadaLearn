import { describe, it, expect } from 'vitest';
import { yearFraction } from '$lib/finance/dayCount';

describe('yearFraction 30/360', () => {
	it('gives 1 year for exactly 12 whole months', () => {
		expect(yearFraction('2024-01-01', '2025-01-01', '30/360')).toBeCloseTo(1, 6);
	});

	it('gives 0.5 for 6 whole months', () => {
		expect(yearFraction('2024-01-01', '2024-07-01', '30/360')).toBeCloseTo(0.5, 6);
	});

	it('normalizes day 31 to day 30', () => {
		// 30/360 should treat Jan 31 -> Mar 31 as 60 days -> 60/360 = 0.1667
		expect(yearFraction('2024-01-31', '2024-03-31', '30/360')).toBeCloseTo(60 / 360, 6);
	});
});

describe('yearFraction actual/365', () => {
	it('gives 1 for 365 days', () => {
		expect(yearFraction('2023-01-01', '2024-01-01', 'actual/365')).toBeCloseTo(1, 6);
	});

	it('counts leap-year day correctly', () => {
		// 2024 is a leap year: Jan 1 -> Jan 1 next year = 366 days
		expect(yearFraction('2024-01-01', '2025-01-01', 'actual/365')).toBeCloseTo(366 / 365, 6);
	});
});

describe('yearFraction actual/360', () => {
	it('gives 365/360 for a non-leap year', () => {
		expect(yearFraction('2023-01-01', '2024-01-01', 'actual/360')).toBeCloseTo(365 / 360, 6);
	});
});

describe('yearFraction actual/actual', () => {
	it('gives exactly 1 year for a whole non-leap year', () => {
		expect(yearFraction('2023-01-01', '2024-01-01', 'actual/actual')).toBeCloseTo(1, 6);
	});

	it('gives exactly 1 year for a whole leap year', () => {
		expect(yearFraction('2024-01-01', '2025-01-01', 'actual/actual')).toBeCloseTo(1, 6);
	});

	it('splits fractions across year boundaries', () => {
		// Jul 2023 -> Jul 2024 crosses Feb 29 2024 (leap year). ISDA act/act:
		// 184/365 + 182/366 ≈ 1.00138 — slightly over 1.0 because the leap
		// day inflates the 2024 denominator only marginally.
		const frac = yearFraction('2023-07-01', '2024-07-01', 'actual/actual');
		expect(frac).toBeCloseTo(184 / 365 + 182 / 366, 6);
	});

	it('returns 0 for identical dates', () => {
		expect(yearFraction('2024-06-15', '2024-06-15', 'actual/actual')).toBe(0);
	});
});
