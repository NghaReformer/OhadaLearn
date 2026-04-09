export interface CurrencyDef {
	symbol: string;
	locale: string;
	decimals: number;
}

export const CURRENCIES: Record<string, CurrencyDef> = {
	USD: { symbol: '$', locale: 'en-US', decimals: 2 },
	EUR: { symbol: '€', locale: 'fr-FR', decimals: 2 },
	GBP: { symbol: '£', locale: 'en-GB', decimals: 2 },
	XOF: { symbol: 'CFA', locale: 'fr-FR', decimals: 0 },
	XAF: { symbol: 'FCFA', locale: 'fr-FR', decimals: 0 },
	JPY: { symbol: '¥', locale: 'ja-JP', decimals: 0 },
	CHF: { symbol: 'Fr', locale: 'de-CH', decimals: 2 },
	CAD: { symbol: '$', locale: 'en-CA', decimals: 2 },
	AUD: { symbol: '$', locale: 'en-AU', decimals: 2 },
	CNY: { symbol: '¥', locale: 'zh-CN', decimals: 2 },
	INR: { symbol: '₹', locale: 'en-IN', decimals: 2 },
	BRL: { symbol: 'R$', locale: 'pt-BR', decimals: 2 },
	ZAR: { symbol: 'R', locale: 'en-ZA', decimals: 2 },
	NGN: { symbol: '₦', locale: 'en-NG', decimals: 2 },
	KES: { symbol: 'KSh', locale: 'en-KE', decimals: 2 },
	MAD: { symbol: 'MAD', locale: 'fr-MA', decimals: 2 },
};

export function getCurrencyDecimals(code: string): number {
	return (CURRENCIES[code] ?? CURRENCIES.USD).decimals;
}

export function getCurrencyLocale(code: string): string {
	return (CURRENCIES[code] ?? CURRENCIES.USD).locale;
}

export function fmtCurrency(value: number, currencyCode: string): string {
	const def = CURRENCIES[currencyCode] ?? CURRENCIES.USD;
	try {
		return new Intl.NumberFormat(def.locale, {
			style: 'currency',
			currency: currencyCode,
			minimumFractionDigits: def.decimals,
			maximumFractionDigits: def.decimals,
		}).format(value);
	} catch {
		return def.symbol + ' ' + Number(value).toFixed(def.decimals);
	}
}
