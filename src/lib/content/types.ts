import type { ExerciseDifficulty } from '$lib/contracts/playground';

export interface LearnSection {
	slug: string;
	title: string;
	html: string;
	order: number;
}

export interface Scenario {
	slug: string;
	titleKey: string;
	descKey: string;
	presetValues: Record<string, unknown>;
	/** Optional teacher-led walkthrough: ordered list of transactions
	 *  that start outside the bank/ledger panels and can be added one
	 *  at a time so students see live impact on the reconciliation. */
	missingTransactions?: ScenarioMissingTransaction[];
}

export interface ScenarioMissingTransaction {
	id: string;
	side: 'bank' | 'books';
	date: string;
	description: string;
	amount: number;
	reference?: string;
	/** i18n key for an explanatory hint shown on the card. */
	hintKey?: string;
	/** Optional expected reconciling-item category for downstream tooling. */
	expectedCategory?: string;
}

export interface ExerciseTemplateFile {
	id: string;
	playgroundSlug: string;
	difficulty: ExerciseDifficulty;
	template: {
		promptKey: string;
		parameters: ExerciseParameter[];
	};
	solutionLogic: {
		solverFunction: string;
		answerType: 'numeric' | 'journal-entry' | 'account-classification' | 'multi-select';
		tolerance?: number;
		toleranceType?: 'absolute' | 'relative';
		partialCredit?: boolean;
	};
	feedbackTemplates: {
		correct: string;
		incorrect: string;
	};
}

export type ExerciseParameter =
	| {
			name: string;
			type: 'integer' | 'decimal' | 'currency' | 'rate' | 'periods';
			min: number;
			max: number;
			step?: number;
	  }
	| {
			name: string;
			type: 'account-set';
			accountClasses: number[];
			count?: number;
	  }
	| {
			name: string;
			type: 'journal-lines';
			minLines: number;
			maxLines: number;
	  };
