<script lang="ts">
	import { t } from '$lib/i18n';
	import type { ExerciseTemplateFile } from '$lib/content/types';
	import type { ExerciseDifficulty } from '$lib/contracts/playground';

	let { exercises = [] }: { exercises?: ExerciseTemplateFile[] } = $props();

	const difficultyOrder: ExerciseDifficulty[] = ['fondamental', 'intermediaire', 'avance'];

	const difficultyMeta: Record<ExerciseDifficulty, { label: string; color: string; glow: string }> = {
		fondamental: { label: 'Fondamental', color: 'var(--green)', glow: 'var(--green-glow)' },
		intermediaire: { label: 'Intermédiaire', color: 'var(--amber)', glow: 'var(--amber-glow)' },
		avance: { label: 'Avancé', color: 'var(--error)', glow: 'var(--amber-glow)' },
	};

	let grouped = $derived.by(() => {
		const groups = new Map<ExerciseDifficulty, ExerciseTemplateFile[]>();
		for (const d of difficultyOrder) {
			const items = exercises.filter((ex) => ex.difficulty === d);
			if (items.length > 0) groups.set(d, items);
		}
		return groups;
	});

	let isEmpty = $derived(exercises.length === 0);
</script>

{#if isEmpty}
	<div class="empty-state">
		<span class="coming-badge">{$t('shell.exercises.coming')}</span>
		<p class="coming-desc">{$t('shell.exercises.coming_desc')}</p>
	</div>
{:else}
	<div class="exercise-groups">
		{#each difficultyOrder as difficulty (difficulty)}
			{@const items = grouped.get(difficulty)}
			{#if items && items.length > 0}
				<section class="difficulty-group">
					<h3 class="difficulty-heading">
						<span
							class="difficulty-dot"
							style:background={difficultyMeta[difficulty].color}
						></span>
						{difficultyMeta[difficulty].label}
						<span class="exercise-count">{items.length}</span>
					</h3>
					<div class="exercise-list">
						{#each items as exercise (exercise.id)}
							<div class="exercise-item">
								<span class="exercise-id">{exercise.id}</span>
								<span class="exercise-prompt">{$t(exercise.template.promptKey)}</span>
							</div>
						{/each}
					</div>
				</section>
			{/if}
		{/each}
	</div>
{/if}

<style>
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;
		padding: 3rem 1.5rem;
		background: var(--panel);
		border: 1px dashed var(--border);
		border-radius: var(--radius-lg);
		text-align: center;
	}

	.coming-badge {
		font-family: var(--font-mono);
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--amber);
		background: var(--amber-glow);
		padding: 0.25rem 0.75rem;
		border-radius: var(--radius-sm);
	}

	.coming-desc {
		font-size: 0.875rem;
		color: var(--text-muted);
		line-height: 1.5;
		margin: 0;
		max-width: 320px;
	}

	.exercise-groups {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.difficulty-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.difficulty-heading {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-family: var(--font-display);
		font-size: 0.9375rem;
		font-weight: 600;
		color: var(--text-primary);
		margin: 0;
	}

	.difficulty-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		flex-shrink: 0;
	}

	.exercise-count {
		font-family: var(--font-mono);
		font-size: 0.6875rem;
		color: var(--text-muted);
		background: var(--bg-subtle);
		padding: 0.125rem 0.375rem;
		border-radius: var(--radius-sm);
	}

	.exercise-list {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
	}

	.exercise-item {
		display: flex;
		align-items: baseline;
		gap: 0.75rem;
		padding: 0.625rem 0.875rem;
		background: var(--panel);
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-md);
		transition: border-color var(--transition-fast);
	}

	.exercise-item:hover {
		border-color: var(--border);
	}

	.exercise-id {
		font-family: var(--font-mono);
		font-size: 0.6875rem;
		font-weight: 600;
		color: var(--text-muted);
		text-transform: uppercase;
		letter-spacing: 0.04em;
		flex-shrink: 0;
	}

	.exercise-prompt {
		font-size: 0.875rem;
		color: var(--text-secondary);
		line-height: 1.45;
	}
</style>
