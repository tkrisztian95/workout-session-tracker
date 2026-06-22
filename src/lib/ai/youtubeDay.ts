import type { LlmConfig, PlanDay, PlanExercise } from '../types';
import { callLlm } from './client';
import { current as SYSTEM_PROMPT } from './prompts/youtube-day';
import { normalizePlanExerciseMuscle, normalizePlanExerciseReps } from './plan';
import { type AiContext, formatLanguageInstruction } from './context';

/** Cap on description chars sent to the LLM, to bound token cost. */
const DESCRIPTION_CHAR_LIMIT = 6000;

/** Title + full description resolved from the YouTube page. */
export type YoutubeVideoInput = {
  title: string;
  description: string;
};

export type AiYoutubeDayResult = Omit<PlanDay, 'id'> & { reasoning?: string };

/** Generate ids and normalize muscle + reps scheme for a parsed exercise list. */
function ensureIds(exercises: PlanExercise[]): PlanExercise[] {
  return exercises.map((e) =>
    normalizePlanExerciseReps(
      normalizePlanExerciseMuscle({ ...e, id: e.id || crypto.randomUUID() }),
    ),
  );
}

export function buildYoutubeDayPrompt(ctx: AiContext, video: YoutubeVideoInput): string {
  const description = video.description.slice(0, DESCRIPTION_CHAR_LIMIT);
  const languageInstruction = formatLanguageInstruction(ctx.language);
  return `Video title: ${video.title}

Video description:
${description}

Extract the workout from this video into a single training day.${languageInstruction}`;
}

/**
 * Parse a YouTube workout video's description into one `PlanDay`. Reuses the
 * shared LLM client and the plan-exercise normalizers, and applies the
 * non-workout validation guardrail.
 */
export async function parseYoutubeDay(
  config: LlmConfig,
  ctx: AiContext,
  video: YoutubeVideoInput,
): Promise<AiYoutubeDayResult> {
  const userMessage = buildYoutubeDayPrompt(ctx, video);

  const content = await callLlm(config, SYSTEM_PROMPT, userMessage);

  let parsed: Partial<AiYoutubeDayResult> & {
    coreExercises?: PlanExercise[];
    optionalExercises?: PlanExercise[];
    valid?: boolean;
    validationError?: string;
  };
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error('Failed to parse JSON response from the AI provider');
  }

  if (parsed.valid === false) {
    const { AiValidationError } = await import('./index');
    throw new AiValidationError(parsed.validationError || 'ai.validation.notWorkout');
  }

  if (!Array.isArray(parsed.coreExercises) && !Array.isArray(parsed.optionalExercises)) {
    throw new Error('Response is missing required fields (exercises)');
  }

  return {
    name: parsed.name?.trim() || video.title || 'Workout',
    weekdays: Array.isArray(parsed.weekdays)
      ? parsed.weekdays.filter((w) => Number.isInteger(w) && w >= 0 && w <= 6)
      : [],
    coreExercises: ensureIds(parsed.coreExercises ?? []),
    optionalExercises: ensureIds(parsed.optionalExercises ?? []),
    ...(parsed.reasoning ? { reasoning: parsed.reasoning } : {}),
  };
}
