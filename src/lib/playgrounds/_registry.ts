import type { PlaygroundModule } from '$lib/contracts/playground';

/**
 * Playground Registry — maps slugs to lazy-loaded playground modules.
 *
 * Each playground registers itself via registerPlayground() in its index.ts.
 * The registry uses dynamic imports so playground code is only loaded when
 * the user navigates to it.
 */
const registry = new Map<string, () => Promise<PlaygroundModule>>();

export function registerPlayground(slug: string, loader: () => Promise<PlaygroundModule>): void {
	if (registry.has(slug)) {
		console.warn(`Playground "${slug}" is already registered. Overwriting.`);
	}
	registry.set(slug, loader);
}

export async function getPlayground(slug: string): Promise<PlaygroundModule | null> {
	const loader = registry.get(slug);
	if (!loader) return null;
	return loader();
}

export function getRegisteredSlugs(): string[] {
	return [...registry.keys()];
}

export function isRegistered(slug: string): boolean {
	return registry.has(slug);
}
