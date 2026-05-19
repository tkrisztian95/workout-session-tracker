import type { LlmConfig, Exercise } from '../types';
import { callOpenAI } from './client';
import { current as SYSTEM_PROMPT } from './prompts/import';
import { migrateLegacyCategory } from '../muscles';

export type AiImportResult = {
  date: string;
  durationMins: number;
  exercises: Omit<Exercise, 'id' | 'completed' | 'dismissed' | 'completedAt' | 'loggedSets'>[];
};

export async function importSessions(
  notes: string,
  language: string,
  existingExerciseNames: string[],
  config: LlmConfig,
  systemPrompt = SYSTEM_PROMPT,
): Promise<AiImportResult[]> {
  const today = new Date().toISOString().slice(0, 10);
  const existingNamesText =
    existingExerciseNames.length > 0
      ? `\n\nExisting exercise names from this user's history (prefer these when matching):\n${existingExerciseNames.join(', ')}`
      : '';

  const userMessage = `Today's date: ${today}
Output language for exercise names: ${language}${existingNamesText}

Workout notes to parse:
${notes}`;

  const content = await callOpenAI(config, systemPrompt, userMessage);

  let parsed: { sessions: AiImportResult[]; valid?: boolean; validationError?: string };
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error('Failed to parse JSON response from OpenAI API');
  }

  // Guardrail: check for validation
  if (parsed.valid === false) {
    // Use model-provided reason or fallback locale string
    throw new (await import('./index')).AiValidationError(
      parsed.validationError || 'ai.validation.notWorkout',
    );
  }

  if (!Array.isArray(parsed.sessions) || parsed.sessions.length === 0) {
    throw new Error('Response is missing required fields (sessions array)');
  }

  return parsed.sessions.map((s) => ({
    date: s.date,
    durationMins: typeof s.durationMins === 'number' ? s.durationMins : 60,
    exercises: s.exercises.map((ex) => normalizeAiExerciseReps(normalizeAiExerciseMuscle(ex))),
  }));
}

type AiExercise = AiImportResult['exercises'][number];

/**
 * Defensive: the LLM may still emit a legacy `category` field or a non-canonical
 * muscle string. Coerce either into the typed `muscle` enum and drop `category`.
 */
function normalizeAiExerciseMuscle(ex: AiExercise & { category?: unknown }): AiExercise {
  const candidate = typeof ex.muscle === 'string' ? ex.muscle : ex.category;
  const muscle = migrateLegacyCategory(typeof candidate === 'string' ? candidate : undefined);
  const rest: AiExercise & { category?: unknown } = { ...ex };
  delete rest.category;
  rest.muscle = muscle;
  return rest;
}

/**
 * Defensive: keep a valid non-empty `repsPerSet` (positive integers only),
 * set `sets` to its length, and drop `reps` to preserve the
 * `reps` / `repsPerSet` mutual-exclusion invariant.
 */
function normalizeAiExerciseReps(ex: AiExercise): AiExercise {
  if (ex.type !== 'sets-reps') return ex;
  const raw = Array.isArray(ex.repsPerSet) ? ex.repsPerSet : undefined;
  const cleaned = raw
    ?.map((n) => (typeof n === 'number' ? Math.floor(n) : NaN))
    .filter((n) => Number.isFinite(n) && n > 0);
  if (cleaned && cleaned.length > 0) {
    const out: AiExercise = { ...ex, repsPerSet: cleaned, sets: cleaned.length };
    delete out.reps;
    return out;
  }
  if (ex.repsPerSet !== undefined) {
    const out: AiExercise = { ...ex };
    delete out.repsPerSet;
    return out;
  }
  return ex;
}
