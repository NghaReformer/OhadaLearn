export type Locale = 'en' | 'fr';

export type TranslationMap = Record<string, string>;

export interface TranslationNamespace {
	en: TranslationMap;
	fr: TranslationMap;
}
