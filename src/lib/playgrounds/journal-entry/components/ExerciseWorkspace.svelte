<script lang="ts">
	import { t } from '$lib/i18n';
	import type { ExerciseTemplateFile } from '$lib/content/types';
	import type { ExerciseDifficulty } from '$lib/contracts/playground';

	type ExerciseFeedback = {
		score: number;
		isCorrect: boolean;
		messageKey: string;
		lineFeedback: Array<{ status: 'correct' | 'partial' | 'extra' | 'missing'; explanation: string }>;
	} | null;

	let {
		exercises,
		selectedExerciseId,
		prompt,
		feedback,
		onSelectExercise,
		onRandomize,
		onCheck
	}: {
		exercises: ExerciseTemplateFile[];
		selectedExerciseId: string | null;
		prompt: string;
		feedback: ExerciseFeedback;
		onSelectExercise: (exerciseId: string) => void;
		onRandomize: () => void;
		onCheck: () => void;
	} = $props();

	const difficultyOrder: ExerciseDifficulty[] = ['fondamental', 'intermediaire', 'avance'];
	const difficultyKey: Record<ExerciseDifficulty, string> = {
		fondamental: 'je.exercise.level.fondamental',
		intermediaire: 'je.exercise.level.intermediaire',
		avance: 'je.exercise.level.avance'
	};

	let selectedExercise = $derived(
		exercises.find((exercise) => exercise.id === selectedExerciseId) ?? null
	);
</script>

<section class="exercise-workspace">
	<div class="exercise-header">
		<h3 class="exercise-title">{$t('je.exercise.title')}</h3>
		<p class="exercise-copy">{$t('je.exercise.copy')}</p>
	</div>

	<div class="exercise-list">
		{#each difficultyOrder as difficulty (difficulty)}
			{@const items = exercises.filter((exercise) => exercise.difficulty === difficulty)}
			{#if items.length > 0}
				<div class="exercise-group">
					<p class="exercise-group-title">{$t(difficultyKey[difficulty])}</p>
					<div class="exercise-buttons">
						{#each items as exercise (exercise.id)}
							<button
								class="exercise-button"
								class:selected={exercise.id === selectedExerciseId}
								type="button"
								onclick={() => onSelectExercise(exercise.id)}
							>
								{$t(exercise.template.promptKey)}
							</button>
						{/each}
					</div>
				</div>
			{/if}
		{/each}
	</div>

	{#if selectedExercise}
		<div class="exercise-card">
			<div class="exercise-card-header">
				<div>
					<p class="exercise-card-label">{$t('je.exercise.prompt')}</p>
					<p class="exercise-card-prompt">{prompt}</p>
				</div>
				<div class="exercise-card-actions">
					<button class="secondary-btn" type="button" onclick={onRandomize}>
						{$t('je.exercise.newVariant')}
					</button>
					<button class="primary-btn" type="button" onclick={onCheck}>
						{$t('je.exercise.check')}
					</button>
				</div>
			</div>

			{#if feedback}
				<div class="feedback-block" class:correct={feedback.isCorrect} class:incorrect={!feedback.isCorrect}>
					<div class="feedback-summary">
						<span class="feedback-score">{$t('je.exercise.score')}: {feedback.score}%</span>
						<p class="feedback-message">{$t(feedback.messageKey)}</p>
					</div>

					{#if feedback.lineFeedback.length > 0}
						<ul class="feedback-list">
							{#each feedback.lineFeedback as line, index (index)}
								<li class="feedback-item">
									<span class="feedback-status">{line.status}</span>
									<span>{line.explanation}</span>
								</li>
							{/each}
						</ul>
					{/if}
				</div>
			{/if}
		</div>
	{:else}
		<div class="exercise-empty">{$t('je.exercise.pick')}</div>
	{/if}
</section>

<style>
	.exercise-workspace {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		padding: 1rem;
		background: var(--panel);
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-lg);
	}

	.exercise-header {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.exercise-title {
		margin: 0;
		font-family: var(--font-display);
		font-size: 1rem;
		color: var(--text-primary);
	}

	.exercise-copy,
	.exercise-card-label,
	.exercise-group-title {
		margin: 0;
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: var(--text-muted);
	}

	.exercise-list,
	.exercise-buttons,
	.exercise-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.exercise-button {
		padding: 0.75rem 0.875rem;
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-md);
		background: var(--bg);
		color: var(--text-secondary);
		text-align: left;
		cursor: pointer;
		font: inherit;
		transition:
			border-color var(--transition-fast),
			color var(--transition-fast),
			background var(--transition-fast);
	}

	.exercise-button:hover,
	.exercise-button.selected {
		border-color: var(--accent);
		color: var(--text-primary);
		background: var(--panel-hover);
	}

	.exercise-card {
		display: flex;
		flex-direction: column;
		gap: 0.875rem;
		padding-top: 0.25rem;
		border-top: 1px solid var(--border-subtle);
	}

	.exercise-card-header {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.exercise-card-prompt {
		margin: 0.25rem 0 0;
		color: var(--text-primary);
		line-height: 1.5;
	}

	.exercise-card-actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.primary-btn,
	.secondary-btn {
		border-radius: var(--radius-md);
		padding: 0.625rem 0.875rem;
		cursor: pointer;
		font: inherit;
	}

	.primary-btn {
		border: 1px solid var(--accent);
		background: var(--accent);
		color: white;
	}

	.secondary-btn {
		border: 1px solid var(--border);
		background: var(--bg-subtle);
		color: var(--text-secondary);
	}

	.feedback-block {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		padding: 0.875rem;
		border-radius: var(--radius-md);
		border: 1px solid var(--border-subtle);
	}

	.feedback-block.correct {
		border-color: var(--green);
		background: var(--green-glow);
	}

	.feedback-block.incorrect {
		border-color: var(--error);
		background: color-mix(in srgb, var(--error) 10%, transparent);
	}

	.feedback-summary {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.feedback-score {
		font-family: var(--font-mono);
		font-size: 0.8125rem;
		font-weight: 700;
		color: var(--text-primary);
	}

	.feedback-message {
		margin: 0;
		color: var(--text-primary);
		line-height: 1.5;
	}

	.feedback-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.feedback-item {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: 0.5rem;
		align-items: start;
		color: var(--text-secondary);
	}

	.feedback-status {
		font-family: var(--font-mono);
		font-size: 0.6875rem;
		text-transform: uppercase;
		color: var(--text-muted);
	}

	.exercise-empty {
		padding: 1rem;
		border: 1px dashed var(--border);
		border-radius: var(--radius-md);
		color: var(--text-muted);
		text-align: center;
	}
</style>
