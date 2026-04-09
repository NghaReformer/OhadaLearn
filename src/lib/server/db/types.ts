export interface WaitlistEntry {
	name: string;
	email: string;
	institution?: string | null;
	role: string;
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
