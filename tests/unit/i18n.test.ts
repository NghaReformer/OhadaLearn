import { describe, it, expect, beforeEach } from 'vitest';
import { get } from 'svelte/store';
import { locale, t, setLocale, registerNamespace, initLocale } from '$lib/i18n';
import type { TranslationMap } from '$lib/i18n/types';
import fs from 'fs';
import path from 'path';

describe('i18n store', () => {
	beforeEach(() => {
		// Reset to default English locale before each test
		setLocale('en');
	});

	it('defaults to English', () => {
		expect(get(locale)).toBe('en');
	});

	it('switches to French', () => {
		setLocale('fr');
		expect(get(locale)).toBe('fr');
	});

	it('translates key in English', () => {
		const translate = get(t);
		expect(translate('nav.home')).toBe('Home');
	});

	it('translates key in French', () => {
		setLocale('fr');
		const translate = get(t);
		expect(translate('nav.home')).toBe('Accueil');
	});

	it('returns key itself for missing translations', () => {
		const translate = get(t);
		expect(translate('totally.nonexistent.key')).toBe('totally.nonexistent.key');
	});

	it('supports dynamically registered namespaces', () => {
		const customEn: TranslationMap = { 'custom.greeting': 'Hello World' };
		const customFr: TranslationMap = { 'custom.greeting': 'Bonjour le Monde' };

		registerNamespace('custom', { en: customEn, fr: customFr });

		const translateEn = get(t);
		expect(translateEn('custom.greeting')).toBe('Hello World');

		setLocale('fr');
		const translateFr = get(t);
		expect(translateFr('custom.greeting')).toBe('Bonjour le Monde');
	});

	it('generated types file exists', () => {
		const generatedPath = path.resolve(__dirname, '../../src/lib/i18n/generated.ts');
		expect(fs.existsSync(generatedPath)).toBe(true);
	});
});
