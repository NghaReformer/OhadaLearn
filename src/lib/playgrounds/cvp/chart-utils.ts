export const CHART_WIDTH = 560;
export const CHART_HEIGHT = 300;
export const CHART_PAD = { left: 60, right: 30, top: 20, bottom: 40 };

export function scaleLinear(
	domain: [number, number],
	range: [number, number],
): (val: number) => number {
	const [d0, d1] = domain;
	const [r0, r1] = range;
	const span = d1 - d0 || 1;
	return (val: number) => r0 + ((val - d0) / span) * (r1 - r0);
}

export function niceStep(range: number, targetTicks: number): number {
	const rough = range / targetTicks;
	const mag = Math.pow(10, Math.floor(Math.log10(rough)));
	const norm = rough / mag;
	let nice: number;
	if (norm <= 1.5) nice = 1;
	else if (norm <= 3) nice = 2;
	else if (norm <= 7) nice = 5;
	else nice = 10;
	return nice * mag;
}

export function compactNum(val: number): string {
	const abs = Math.abs(val);
	if (abs >= 1e6) return (val / 1e6).toFixed(1).replace(/\.0$/, '') + 'M';
	if (abs >= 1e3) return (val / 1e3).toFixed(1).replace(/\.0$/, '') + 'K';
	return val.toFixed(0);
}

export interface TickDefinition {
	value: number;
	position: number;
}

export function generateYTicks(
	yDomain: [number, number],
	yScale: (v: number) => number,
): TickDefinition[] {
	const range = yDomain[1] - yDomain[0];
	const step = niceStep(range, 4);
	const start = Math.ceil(yDomain[0] / step) * step;
	const ticks: TickDefinition[] = [];
	for (let v = start; v <= yDomain[1]; v += step) {
		const pos = yScale(v);
		if (pos < CHART_PAD.top - 2 || pos > CHART_HEIGHT - CHART_PAD.bottom + 2) continue;
		ticks.push({ value: v, position: pos });
	}
	return ticks;
}

export function generateXTicks(
	xDomain: [number, number],
	xScale: (v: number) => number,
): TickDefinition[] {
	const range = xDomain[1] - xDomain[0];
	const step = niceStep(range, 4);
	const start = Math.ceil(xDomain[0] / step) * step;
	const ticks: TickDefinition[] = [];
	for (let v = start; v <= xDomain[1]; v += step) {
		const pos = xScale(v);
		if (pos < CHART_PAD.left - 2 || pos > CHART_WIDTH - CHART_PAD.right + 2) continue;
		ticks.push({ value: v, position: pos });
	}
	return ticks;
}
