export function fmtNumber(value: number, decimals: number = 0, locale: string = 'en-US'): string {
	if (!isFinite(value)) {
		if (value > 0) return '∞';
		if (value < 0) return '-∞';
		return '—';
	}
	try {
		return new Intl.NumberFormat(locale, {
			minimumFractionDigits: decimals,
			maximumFractionDigits: decimals,
		}).format(value);
	} catch {
		return Number(value).toFixed(decimals);
	}
}

export function fmtPct(value: number, decimals: number = 1): string {
	if (!isFinite(value)) return '—';
	return Number(value).toFixed(decimals) + '%';
}

export function fmtUnitsCeil(value: number, unitLabel: string = 'units'): string {
	if (!isFinite(value)) return '∞ ' + unitLabel;
	const ceil = Math.ceil(value - 0.0001);
	const safeCeil = ceil < 0 ? 0 : ceil;
	if (value % 1 === 0) {
		return fmtNumber(value, 0) + ' ' + unitLabel;
	}
	return fmtNumber(value, 2) + ' → ' + fmtNumber(safeCeil, 0) + ' ' + unitLabel;
}

export function parseLocaleNumber(str: string | number): number {
	if (typeof str !== 'string') return parseFloat(String(str)) || 0;
	let s = str.replace(/\s/g, '').trim();
	if (s === '') return 0;

	const hasComma = s.includes(',');
	const hasDot = s.includes('.');

	if (hasComma && hasDot) {
		if (s.lastIndexOf(',') > s.lastIndexOf('.')) {
			s = s.replace(/\./g, '').replace(',', '.');
		} else {
			s = s.replace(/,/g, '');
		}
	} else if (hasComma) {
		const parts = s.split(',');
		if (parts.length === 2 && parts[1].length <= 2) {
			s = s.replace(',', '.');
		} else {
			s = s.replace(/,/g, '');
		}
	}

	s = s.replace(/[^\d.\-]/g, '');
	const num = parseFloat(s);
	return isNaN(num) ? 0 : num;
}
