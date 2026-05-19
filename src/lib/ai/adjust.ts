import type { LlmConfig, WorkoutPlan, PlanDay, PlanExercise } from '../types';
import { callOpenAI } from './client';
import { adjustCurrent, swapCurrent } from './prompts/adjust';
import { summarisePlan, summariseExercise, normalizePlanExerciseMuscle } from './plan';

export type AiAdjustResult = Omit<WorkoutPlan, 'id' | 'status'> & { reasoning?: string };
export type AiSwapResult = { exercise: PlanExercise; reasoning?: string };

function ensureIds(exercises: PlanExercise[]): PlanExercise[] {
  return exercises.map((e) =>
    normalizePlanExerciseMuscle({ ...e, id: e.id || crypto.randomUUID() }),
  );
}

function languageLine(language?: string): string {
  return language
    ? `\n\nWrite the plan name, day names, exercise names, reasoning, and any validation message in ${language}.`
    : '';
}

/**
 * Re-shapes an existing plan according to a free-form adjustment instruction
 * (e.g. "increase intensity", "reduce weights", "add variety").
 */
export async function adjustPlan(
  config: LlmConfig,
  plan: WorkoutPlan,
  instruction: string,
  language?: string,
): Promise<AiAdjustResult> {
  const userMessage = `Here is my current workout plan:\n${summarisePlan(plan)}\n\nAdjustment I want: ${instruction}${languageLine(language)}`;

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
 * replacement keeps the original exercise's role (core/optional).
 */
export async function swapExercise(
  config: LlmConfig,
  plan: WorkoutPlan,
  target: PlanExercise,
  dayName: string | null,
  instruction: string | undefined,
  language?: string,
): Promise<AiSwapResult> {
  const location = dayName ? `training day "${dayName}"` : 'the shared exercises';
  const instructionLine = instruction ? `\n\nReplacement preferences: ${instruction}` : '';
  const userMessage = `Here is my current workout plan:\n${summarisePlan(plan)}\n\nReplace this exercise in ${location}:\n${summariseExercise(target)}${instructionLine}${languageLine(language)}`;

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

  const exercise = normalizePlanExerciseMuscle({
    ...parsed.exercise,
    id: crypto.randomUUID(),
    role: target.role,
  } as PlanExercise);

  return {
    exercise,
    ...(parsed.reasoning ? { reasoning: parsed.reasoning } : {}),
  };
}
