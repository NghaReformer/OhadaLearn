/**
 * Playground Plugin Contracts — defines how playground modules integrate with the platform.
 * In Phase 2, each playground (TVM, CVP, JE, etc.) will implement PlaygroundModule.
 * DO NOT import implementation code in this file — only types.
 *
 * ⚠ DEPENDENCY DIRECTION: preferences → i18n/types → this file (one-way only).
 *   Do NOT import from $lib/stores or $lib/i18n/index here — it creates circular imports.
 */

import type { Component } from 'svelte';
import type { TranslationNamespace } from '$lib/i18n/types';

export interface PlaygroundManifest {
	slug: string;
	titleKey: string;
	descKey: string;
	icon: string;
	category: PlaygroundCategory;
	standards: AccountingStandard[];
	sharedResources: SharedResourceType[];
}

export type PlaygroundCategory = 'financial-accounting' | 'managerial-accounting' | 'business-math';

export type AccountingStandard = 'syscohada' | 'ifrs' | 'french-pcg' | 'us-gaap';

export type SharedResourceType = 'chart-of-accounts' | 'currency' | 'tax-tables' | 'exchange-rates';

export type ExerciseDifficulty = 'fondamental' | 'intermediaire' | 'avance';

export interface ExerciseInputSchema {
	type: 'number' | 'account-select' | 'journal-entry' | 'multiple-choice' | 'free-text';
	fields: ExerciseField[];
}

export interface ExerciseField {
	key: string;
	labelKey: string;
	type: 'number' | 'text' | 'select';
	options?: string[];
}

export interface ExerciseTypeDef {
	slug: string;
	titleKey: string;
	descKey: string;
	difficulty: ExerciseDifficulty;
	inputSchema: ExerciseInputSchema;
	solve: (params: Record<string, number | string>) => Record<string, number | string>;
	feedback: (
		studentAnswer: Record<string, number | string>,
		correctAnswer: Record<string, number | string>,
		params: Record<string, number | string>,
	) => ExerciseFeedback;
	randomize: () => Record<string, number | string>;
}

export interface ExerciseFeedback {
	isCorrect: boolean;
	score: number;
	messageKey: string;
	details?: Record<string, string>;
}

export interface PlaygroundModule {
	manifest: PlaygroundManifest;
	translations: TranslationNamespace;
	exerciseTypes: ExerciseTypeDef[];
	loadPlaygroundComponent: () => Promise<{ default: Component }>;
	loadLearnComponent: () => Promise<{ default: Component }>;
}
