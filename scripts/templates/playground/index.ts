import { registerPlayground } from '../_registry';
import { manifest } from './manifest';
import { exerciseTypes } from './exercises';

registerPlayground('__SLUG__', async () => ({
	manifest,
	translations: { en: {}, fr: {} },
	exerciseTypes,
	loadPlaygroundComponent: () => import('./Playground.svelte'),
	loadLearnComponent: () => import('./Learn.svelte'),
}));

export { manifest };
