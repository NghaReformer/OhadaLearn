import type { DayCount } from '$lib/playgrounds/amortization/types';

/**
 * Year fraction between two ISO dates under a day-count convention.
 * Supports 30/360, actual/365, actual/360, actual/actual.
 */
export function yearFraction(startIso: string, endIso: string, convention: DayCount): number {
	const start = parseIso(startIso);
	const end = parseIso(endIso);
	if (!start || !end) return 0;

	switch (convention) {
		case '30/360':
			return days30360(start, end) / 360;
		case 'actual/365':
			return daysActual(start, end) / 365;
		case 'actual/360':
			return daysActual(start, end) / 360;
		case 'actual/actual':
			return actualActual(start, end);
	}
}

function parseIso(iso: string): Date | null {
	if (!iso) return null;
	const d = new Date(iso + 'T00:00:00Z');
	return Number.isNaN(d.getTime()) ? null : d;
}

function days30360(s: Date, e: Date): number {
	const y1 = s.getUTCFullYear();
	const m1 = s.getUTCMonth() + 1;
	let d1 = s.getUTCDate();
	const y2 = e.getUTCFullYear();
	const m2 = e.getUTCMonth() + 1;
	let d2 = e.getUTCDate();
	if (d1 === 31) d1 = 30;
	if (d2 === 31 && d1 === 30) d2 = 30;
	return (y2 - y1) * 360 + (m2 - m1) * 30 + (d2 - d1);
}

function daysActual(s: Date, e: Date): number {
	return Math.round((e.getTime() - s.getTime()) / 86400000);
}

function actualActual(s: Date, e: Date): number {
	if (s.getTime() === e.getTime()) return 0;
	const years = e.getUTCFullYear() - s.getUTCFullYear();
	if (years === 0) return daysActual(s, e) / daysInYear(s.getUTCFullYear());

	const endOfStart = Date.UTC(s.getUTCFullYear() + 1, 0, 1);
	const startOfEnd = Date.UTC(e.getUTCFullYear(), 0, 1);
	const frontDays = Math.round((endOfStart - s.getTime()) / 86400000);
	const backDays = Math.round((e.getTime() - startOfEnd) / 86400000);
	return (
		frontDays / daysInYear(s.getUTCFullYear()) +
		(years - 1) +
		backDays / daysInYear(e.getUTCFullYear())
	);
}

function daysInYear(year: number): number {
	const isLeap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
	return isLeap ? 366 : 365;
}
