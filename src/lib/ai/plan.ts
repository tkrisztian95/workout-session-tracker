import type { LlmConfig, WorkoutPlan, WorkoutSession, PlanDay, PlanExercise, Sex } from '../types';
import { getSex, getAge, getHeightCm, getWeightKg } from '../storage';
import { callOpenAI } from './client';
import { current as SYSTEM_PROMPT } from './prompts/plan';
import { migrateLegacyCategory } from '../muscles';

/**
 * Defensive: the LLM may still emit a legacy `category` field or a non-canonical
 * muscle string. Coerce either into the typed `muscle` enum and drop `category`.
 */
export function normalizePlanExerciseMuscle(
  ex: PlanExercise & { category?: unknown },
): PlanExercise {
  const candidate = typeof ex.muscle === 'string' ? ex.muscle : ex.category;
  const muscle = migrateLegacyCategory(typeof candidate === 'string' ? candidate : undefined);
  const rest: PlanExercise & { category?: unknown } = { ...ex };
  delete rest.category;
  rest.muscle = muscle;
  return rest;
}

/**
 * Defensive: keep a valid non-empty `repsPerSet` (filtered to positive integers)
 * and enforce the `reps` / `repsPerSet` mutual-exclusion invariant. When a scheme
 * is present, `sets` is set to its length and `reps` is dropped.
 */
export function normalizePlanExerciseReps(ex: PlanExercise): PlanExercise {
  if (ex.type !== 'sets-reps') return ex;
  const raw = Array.isArray(ex.repsPerSet) ? ex.repsPerSet : undefined;
  const cleaned = raw
    ?.map((n) => (typeof n === 'number' ? Math.floor(n) : NaN))
    .filter((n) => Number.isFinite(n) && n > 0);
  if (cleaned && cleaned.length > 0) {
    const out: PlanExercise = { ...ex, repsPerSet: cleaned, sets: cleaned.length };
    delete out.reps;
    return out;
  }
  if (ex.repsPerSet !== undefined) {
    const out: PlanExercise = { ...ex };
    delete out.repsPerSet;
    return out;
  }
  return ex;
}

const WEEKDAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function summariseExercise(e: PlanExercise): string {
  let desc: string;
  if (e.type === 'sets-reps') {
    const weight = e.weightKg ? ` @${e.weightKg}kg` : '';
    const repsPart =
      e.repsPerSet && e.repsPerSet.length > 0 ? e.repsPerSet.join('/') : `${e.sets}×${e.reps}`;
    desc = `${e.name} ${repsPart}${weight}`;
  } else if (e.type === 'sets-duration') {
    const weight = e.weightKg ? ` @${e.weightKg}kg` : '';
    desc = `${e.name} ${e.sets}×${e.duration}s${weight}`;
  } else {
    desc = `${e.name} ${e.duration}s`;
  }
  const tags: string[] = [];
  if (e.muscle) tags.push(e.muscle);
  if (e.role === 'optional') tags.push('optional');
  if (e.scalingNote) tags.push(`note: ${e.scalingNote}`);
  if (tags.length > 0) desc += ` (${tags.join(', ')})`;
  return desc;
}

export function summarisePlan(plan: WorkoutPlan): string {
  const meta: string[] = [`"${plan.name}"`];
  if (plan.status) meta.push(`status: ${plan.status}`);
  if (plan.scheduledWeeks) meta.push(`${plan.scheduledWeeks} weeks`);

  const days = plan.days.map((d) => {
    const weekdays =
      d.weekdays.length > 0 ? d.weekdays.map((w) => WEEKDAY_NAMES[w]).join('/') : 'no fixed days';
    const core = d.coreExercises.map((e) => `    - ${summariseExercise(e)}`).join('\n');
    const optional = d.optionalExercises.map((e) => `    - ${summariseExercise(e)}`).join('\n');
    let dayStr = `  ${d.name || 'Day'} (${weekdays})`;
    if (core) dayStr += `\n  Core:\n${core}`;
    if (optional) dayStr += `\n  Optional:\n${optional}`;
    return dayStr;
  });

  let result = `${meta.join(', ')} — ${plan.days.length} day(s):\n${days.join('\n')}`;

  if (plan.sharedExercises.length > 0) {
    const shared = plan.sharedExercises.map((e) => `  - ${summariseExercise(e)}`).join('\n');
    result += `\n  Shared exercises:\n${shared}`;
  }

  return result;
}

function summariseSession(session: WorkoutSession): string {
  const date = session.completedAt.slice(0, 10);
  const exercises = session.exercises
    .map((e) => {
      let desc: string;
      if (e.type === 'sets-reps') {
        const weight = e.weightKg ? ` @${e.weightKg}kg` : '';
        if (e.loggedSets && e.loggedSets.length > 0) {
          const sets = e.loggedSets.map((s) => `${s.reps}r@${s.weight}kg`).join('+');
          desc = `${e.name} [${sets}]`;
        } else {
          const repsPart =
            e.repsPerSet && e.repsPerSet.length > 0
              ? e.repsPerSet.join('/')
              : `${e.sets}×${e.reps}`;
          desc = `${e.name} ${repsPart}${weight}`;
        }
      } else if (e.type === 'sets-duration') {
        const weight = e.weightKg ? ` @${e.weightKg}kg` : '';
        desc = `${e.name} ${e.sets}×${e.duration}s${weight}`;
      } else {
        desc = `${e.name} ${e.duration}s`;
      }
      if (e.muscle) desc += ` [${e.muscle}]`;
      return desc;
    })
    .join(', ');
  const rating = session.rating ? ` (rating: ${session.rating}/5)` : '';
  return `${date}: ${exercises}${rating}`;
}

export type AiPlanPreferences = {
  focus?: string;
  daysPerWeek?: string;
  goal?: string;
};

export function buildPlanSuggestionPrompt(
  plans: WorkoutPlan[],
  sessions: WorkoutSession[],
  preferences?: AiPlanPreferences,
  language?: string,
  sex?: Sex | null,
  age?: number | null,
  heightCm?: number | null,
  weightKg?: number | null,
): string {
  const recentSessions = [...sessions]
    .sort((a, b) => b.completedAt.localeCompare(a.completedAt))
    .slice(0, 20);

  const plansSummary =
    plans.length > 0 ? plans.map(summarisePlan).join('\n') : 'No existing plans.';

  const sessionsSummary =
    recentSessions.length > 0
      ? recentSessions.map(summariseSession).join('\n')
      : 'No completed sessions yet.';

  const goalParts: string[] = [];
  if (preferences?.focus) goalParts.push(`Focus: ${preferences.focus}`);
  if (preferences?.daysPerWeek)
    goalParts.push(`Training days per week: ${preferences.daysPerWeek}`);
  if (preferences?.goal) goalParts.push(`Goal: ${preferences.goal}`);

  const goalSection =
    goalParts.length > 0 ? `My goals for this plan:\n${goalParts.join('\n')}\n\n` : '';

  const languageInstruction = language
    ? `\n\nPlease write the plan name, day names, exercise names, and reasoning in ${language}.`
    : '';

  const metricLines = [
    sex ? `Biological sex: ${sex}` : '',
    age ? `Age: ${age} years` : '',
    heightCm ? `Height: ${heightCm} cm` : '',
    weightKg ? `Weight: ${weightKg} kg` : '',
  ]
    .filter(Boolean)
    .join(', ');

  const metricsPreamble = metricLines ? `About me: ${metricLines}.\n\n` : '';

  return `${goalSection}${metricsPreamble}Here are my existing workout plans:\n${plansSummary}\n\nHere are my recent workout sessions (most recent first):\n${sessionsSummary}\n\nPlease suggest a new workout plan that builds on my history and helps me progress.${languageInstruction}`;
}

export type AiPlanResult = Omit<WorkoutPlan, 'id' | 'status'> & { reasoning?: string };

export async function suggestPlan(
  config: LlmConfig,
  plans: WorkoutPlan[],
  sessions: WorkoutSession[],
  preferences?: AiPlanPreferences,
  language?: string,
): Promise<AiPlanResult> {
  const sex = getSex();
  const age = getAge();
  const heightCm = getHeightCm();
  const weightKg = getWeightKg();
  const userMessage = buildPlanSuggestionPrompt(
    plans,
    sessions,
    preferences,
    language,
    sex,
    age,
    heightCm,
    weightKg,
  );

  const content = await callOpenAI(config, SYSTEM_PROMPT, userMessage);

  let parsed: AiPlanResult & { reasoning?: string; valid?: boolean; validationError?: string };
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

  // Ensure all PlanExercise ids exist (LLM may omit them) + normalize muscle + reps scheme
  const ensureIds = (exercises: PlanExercise[]): PlanExercise[] =>
    exercises.map((e) =>
      normalizePlanExerciseReps(
        normalizePlanExerciseMuscle({ ...e, id: e.id || crypto.randomUUID() }),
      ),
    );

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
    updatedAt: parsed.updatedAt ?? now,
    ...(parsed.scheduledWeeks ? { scheduledWeeks: parsed.scheduledWeeks } : {}),
    ...(parsed.reasoning ? { reasoning: parsed.reasoning } : {}),
  };
}
