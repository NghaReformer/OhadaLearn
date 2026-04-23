import { describe, it, expect } from 'vitest';
import { detectBrowser, collectContext } from '../../src/lib/components/feedback/contextCollector';

describe('detectBrowser', () => {
	it('identifies Chrome on Windows desktop', () => {
		const r = detectBrowser(
			'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0 Safari/537.36'
		);
		expect(r.name).toBe('Chrome');
		expect(r.os).toBe('Windows');
		expect(r.device).toBe('desktop');
	});

	it('identifies Safari on iPhone', () => {
		const r = detectBrowser(
			'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Mobile/15E148 Safari/604.1'
		);
		expect(r.name).toBe('Safari');
		expect(r.os).toBe('iOS');
		expect(r.device).toBe('mobile');
	});

	it('identifies Firefox on macOS', () => {
		const r = detectBrowser(
			'Mozilla/5.0 (Macintosh; Intel Mac OS X 14.0; rv:123.0) Gecko/20100101 Firefox/123.0'
		);
		expect(r.name).toBe('Firefox');
		expect(r.os).toBe('macOS');
	});

	it('marks iPad as tablet', () => {
		const r = detectBrowser(
			'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Safari/604.1'
		);
		expect(r.device).toBe('tablet');
	});

	it('falls back to Unknown for empty UA', () => {
		const r = detectBrowser('');
		expect(r.name).toBe('Unknown');
		expect(r.os).toBe('Unknown');
	});
});

describe('collectContext', () => {
	it('returns user preferences and build tag verbatim', () => {
		const ctx = collectContext(
			{ locale: 'fr', currency: 'XOF', accountingStandard: 'syscohada' },
			'abc1234'
		);
		expect(ctx.prefs).toEqual({ locale: 'fr', currency: 'XOF', accountingStandard: 'syscohada' });
		expect(ctx.build).toBe('abc1234');
		expect(ctx.timestamp).toMatch(/\d{4}-\d{2}-\d{2}T/);
	});

	it('handles null build SHA', () => {
		const ctx = collectContext(
			{ locale: 'en', currency: 'XAF', accountingStandard: 'syscohada' },
			null
		);
		expect(ctx.build).toBeNull();
	});
});
