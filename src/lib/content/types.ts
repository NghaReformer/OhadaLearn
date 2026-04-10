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
	presetValues: Record<string, number | string | boolean>;
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
