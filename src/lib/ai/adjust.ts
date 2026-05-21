import type { LlmConfig, WorkoutPlan, PlanDay, PlanExercise } from '../types';
import { callOpenAI } from './client';
import { adjustCurrent, swapCurrent } from './prompts/adjust';
import {
  summarisePlan,
  summariseExercise,
  normalizePlanExerciseMuscle,
  normalizePlanExerciseReps,
} from './plan';
import {
  type AiContext,
  formatProfilePreamble,
  formatRecentSessions,
  formatLanguageInstruction,
} from './context';

export type AiAdjustResult = Omit<WorkoutPlan, 'id' | 'status'> & { reasoning?: string };
export type AiSwapResult = { exercise: PlanExercise; reasoning?: string };

function ensureIds(exercises: PlanExercise[]): PlanExercise[] {
  return exercises.map((e) =>
    normalizePlanExerciseReps(
      normalizePlanExerciseMuscle({ ...e, id: e.id || crypto.randomUUID() }),
    ),
  );
}

/**
 * Builds a `Recent training` block from the envelope's recentSessions for
 * features that previously had no training context (swap, adjust). Returns
 * an empty string when the envelope has no recent sessions, so prompts stay
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
 * Re-shapes an existing plan according to a free-form adjustment instruction
 * (e.g. "increase intensity", "reduce weights", "add variety").
 */
export async function adjustPlan(
  config: LlmConfig,
  ctx: AiContext,
  plan: WorkoutPlan,
  instruction: string,
): Promise<AiAdjustResult> {
  const userMessage =
    `${buildContextBlock(ctx)}Here is my current workout plan:\n${summarisePlan(plan)}\n\n` +
    `Adjustment I want: ${instruction}${formatLanguageInstruction(ctx.language)}`;

  const content = await callOpenAI(config, adjustCurrent, userMessage);

  let parsed: AiAdjustResult & { valid?: boolean; validationError?: string };
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error('Failed to parse JSON response from OpenAI API');
  }

  if (parsed.valid === false) {
    const { AiValidationError } = await import('./index');
    throw new AiValidationError(parsed.validationError || 'ai.validation.notFitnessGoal');
  }

  if (!parsed.name || !Array.isArray(parsed.days)) {
    throw new Error('Response is missing required plan fields (name, days)');
  }

  const days: PlanDay[] = (parsed.days ?? []).map((d) => ({
    ...d,
    id: d.id || crypto.randomUUID(),
    coreExercises: ensureIds(d.coreExercises ?? []),
    optionalExercises: ensureIds(d.optionalExercises ?? []),
  }));

  const now = new Date().toISOString();
  return {
    name: parsed.name,
    days,
    sharedExercises: ensureIds(parsed.sharedExercises ?? []),
    createdAt: parsed.createdAt ?? now,
    updatedAt: now,
    ...(parsed.scheduledWeeks ? { scheduledWeeks: parsed.scheduledWeeks } : {}),
    ...(parsed.reasoning ? { reasoning: parsed.reasoning } : {}),
  };
}

/**
 * Suggests a single replacement exercise for one exercise in a plan. The
 * replacement keeps the original exercise's role (core/optional). Uses the
 * envelope's `progression` to highlight the user's recent performance on the
 * target exercise when available.
 */
export async function swapExercise(
  config: LlmConfig,
  ctx: AiContext,
  plan: WorkoutPlan,
  target: PlanExercise,
  dayName: string | null,
  instruction?: string,
): Promise<AiSwapResult> {
  const location = dayName ? `training day "${dayName}"` : 'the shared exercises';
  const instructionLine = instruction ? `\n\nReplacement preferences: ${instruction}` : '';

  // Pull the matching progression entry — gives the LLM a concrete sense of
  // where the user is on the exercise it's replacing.
  const targetProgression = ctx.progression.find(
    (p) => p.exerciseName.toLowerCase() === target.name.toLowerCase(),
  );
  const progressionLine = targetProgression
    ? `\n\nUser's recent weights on "${target.name}": ${targetProgression.sessionWeights.join(' → ')} kg (trend: ${targetProgression.trend}).`
    : '';

  const userMessage =
    `${buildContextBlock(ctx)}Here is my current workout plan:\n${summarisePlan(plan)}\n\n` +
    `Replace this exercise in ${location}:\n${summariseExercise(target)}${progressionLine}${instructionLine}${formatLanguageInstruction(ctx.language)}`;

  const content = await callOpenAI(config, swapCurrent, userMessage);

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
    throw new Error('Response is missing the replacement exercise');
  }

  const exercise = normalizePlanExerciseReps(
    normalizePlanExerciseMuscle({
      ...parsed.exercise,
      id: crypto.randomUUID(),
      role: target.role,
    } as PlanExercise),
  );

  return {
    exercise,
    ...(parsed.reasoning ? { reasoning: parsed.reasoning } : {}),
  };
}
