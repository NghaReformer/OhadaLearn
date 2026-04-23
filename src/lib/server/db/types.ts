export interface WaitlistEntry {
	name: string;
	email: string;
	institution?: string | null;
	role: string;
}

export type FeedbackType = 'bug' | 'feature' | 'other';
export type FeedbackSeverity = 'low' | 'medium' | 'high' | 'blocker';

export interface FeedbackEntry {
	type: FeedbackType;
	severity?: FeedbackSeverity | null;
	title: string;
	description: string;
	steps?: string | null;
	email?: string | null;
	screenshotPath?: string | null;
	context: Record<string, unknown>;
}

export interface ExerciseTemplate {
	id: string;
	playground_slug: string;
	difficulty: 'fondamental' | 'intermediaire' | 'avance';
	locale: 'en' | 'fr';
	template: Record<string, unknown>;
	solution_logic: Record<string, unknown>;
	feedback_templates: Record<string, unknown>;
}

export interface ExerciseAttempt {
	id?: string;
	user_id: string;
	template_id: string;
	started_at: string;
	completed_at?: string;
	parameters: Record<string, unknown>;
	student_answer: Record<string, unknown>;
	score: number;
	is_correct: boolean;
	feedback_given?: Record<string, unknown>;
}
