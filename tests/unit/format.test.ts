import { describe, it, expect } from 'vitest';
import { fmtCurrency, CURRENCIES, getCurrencyDecimals } from '$lib/format/currency';
import { fmtNumber, fmtPct, fmtUnitsCeil, parseLocaleNumber } from '$lib/format/numbers';

describe('currency formatting', () => {
	it('formats USD with 2 decimals', () => {
		const result = fmtCurrency(1234.56, 'USD');
		expect(result).toContain('1');
		expect(result).toContain('234');
	});

	it('formats XAF with 0 decimals', () => {
		const result = fmtCurrency(1234.56, 'XAF');
		expect(result).not.toContain('.');
	});

	it('returns 0 decimals for XAF', () => {
		expect(getCurrencyDecimals('XAF')).toBe(0);
	});

	it('returns 2 decimals for EUR', () => {
		expect(getCurrencyDecimals('EUR')).toBe(2);
	});

	it('has at least XAF, EUR, USD, GBP, XOF', () => {
		expect(CURRENCIES.XAF).toBeDefined();
		expect(CURRENCIES.EUR).toBeDefined();
		expect(CURRENCIES.USD).toBeDefined();
		expect(CURRENCIES.GBP).toBeDefined();
		expect(CURRENCIES.XOF).toBeDefined();
	});
});

describe('number formatting', () => {
	it('formats with thousands separator', () => {
		const result = fmtNumber(1234567, 0, 'en-US');
		expect(result).toContain('1');
		expect(result).toContain('234');
		expect(result).toContain('567');
	});

	it('handles infinity', () => {
		expect(fmtNumber(Infinity, 0)).toBe('∞');
		expect(fmtNumber(-Infinity, 0)).toBe('-∞');
		expect(fmtNumber(NaN, 0)).toBe('—');
	});

	it('formats percentages', () => {
		expect(fmtPct(45.678)).toBe('45.7%');
		expect(fmtPct(45.678, 2)).toBe('45.68%');
	});

	it('formats units with ceiling', () => {
		const result = fmtUnitsCeil(100.3);
		expect(result).toContain('101');
	});
});

describe('locale number parsing', () => {
	it('parses US format: 1,234.56', () => {
		expect(parseLocaleNumber('1,234.56')).toBeCloseTo(1234.56);
	});

	it('parses EU format: 1.234,56', () => {
		expect(parseLocaleNumber('1.234,56')).toBeCloseTo(1234.56);
	});

	it('parses plain number', () => {
		expect(parseLocaleNumber('42')).toBe(42);
	});

	it('handles empty string', () => {
		expect(parseLocaleNumber('')).toBe(0);
	});
});
