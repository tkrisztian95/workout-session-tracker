import type { LlmConfig, Exercise, PlanExercise } from '../types';
import type { Muscle } from '../muscles';
import { callLlm } from './client';
import { suggestCurrent } from './prompts/suggest';
import { normalizePlanExerciseMuscle, normalizePlanExerciseReps } from './plan';
import {
  type AiContext,
  formatProfilePreamble,
  formatRecentSessions,
  formatLanguageInstruction,
} from './context';

/** A lightweight view of the exercises already in the current session. */
export interface SessionExerciseRef {
  name: string;
  muscle?: Muscle;
}

export type AiSuggestResult = { exercise: Omit<Exercise, 'id'>; reasoning?: string };

/**
 * Renders the exercises already in the active session so the model can avoid
 * duplicates and pick a complementary movement. Returns a fallback line when
 * the session is empty.
 */
function formatSessionExercises(exercises: SessionExerciseRef[]): string {
  if (exercises.length === 0) return 'No exercises added to the session yet.';
  return exercises.map((e) => (e.muscle ? `- ${e.name} (${e.muscle})` : `- ${e.name}`)).join('\n');
}

/**
 * Builds a profile + recent-training preamble shared with the other AI
 * features. Returns an empty string when neither is available so prompts stay
 * tight for new users.
 */
function buildContextBlock(ctx: AiContext): string {
  const profile = formatProfilePreamble(ctx.profile);
  const sessions = ctx.recentSessions.length > 0 ? formatRecentSessions(ctx.recentSessions) : null;
  const parts: string[] = [];
  if (profile) parts.push(profile);
  if (sessions) parts.push(`Recent training (most recent first):\n${sessions}`);
  if (parts.length === 0) return '';
  return parts.join('\n\n') + '\n\n';
}

/**
 * Suggests a single exercise to add to the user's in-progress session. Uses the
 * current session's exercises (to avoid duplicates and balance the workout) plus
 * the envelope's recent training context. Returns a session-shaped `Exercise`
 * (without an id) ready to be appended to the active session.
 */
export async function suggestExercise(
  config: LlmConfig,
  ctx: AiContext,
  current: SessionExerciseRef[],
  instruction?: string,
): Promise<AiSuggestResult> {
  const instructionLine = instruction ? `\n\nPreferences: ${instruction}` : '';

  const userMessage =
    `${buildContextBlock(ctx)}Exercises already in my current session:\n${formatSessionExercises(current)}\n\n` +
    `Suggest one more exercise to add to this session.${instructionLine}${formatLanguageInstruction(ctx.language)}`;

  const content = await callLlm(config, suggestCurrent, userMessage);

  let parsed: {
    exercise?: Omit<PlanExercise, 'id' | 'role'>;
    reasoning?: string;
    valid?: boolean;
    validationError?: string;
  };
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error('Failed to parse JSON response from OpenAI API');
  }

  if (parsed.valid === false) {
    const { AiValidationError } = await import('./index');
    throw new AiValidationError(parsed.validationError || 'ai.validation.notFitnessGoal');
  }

  if (!parsed.exercise || !parsed.exercise.name) {
    throw new Error('Response is missing the suggested exercise');
  }

  // Reuse the plan normalizers (muscle coercion + reps/repsPerSet invariant) by
  // borrowing the PlanExercise shape, then strip the plan-only `id`/`role`.
  const normalized = normalizePlanExerciseReps(
    normalizePlanExerciseMuscle({
      ...parsed.exercise,
      id: crypto.randomUUID(),
      role: 'core',
    } as PlanExercise),
  );
  const { id: _id, role: _role, ...exercise } = normalized;
  void _id;
  void _role;

  return {
    exercise,
    ...(parsed.reasoning ? { reasoning: parsed.reasoning } : {}),
  };
}
