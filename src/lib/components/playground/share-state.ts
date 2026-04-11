export function serializeShareValue(value: unknown): string {
	return JSON.stringify(value);
}

export function deserializeShareValue(raw: string): unknown {
	try {
		return JSON.parse(raw);
	} catch {
		const num = Number(raw);
		if (!Number.isNaN(num) && raw.trim() !== '') return num;
		if (raw === 'true') return true;
		if (raw === 'false') return false;
		return raw;
	}
}
