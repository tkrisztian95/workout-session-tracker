import type { LlmConfig, Exercise } from '../types';
import { callOpenAI } from './client';

const SYSTEM_PROMPT = `You are a fitness assistant that parses free-form workout notes into structured JSON.

The notes may describe one or multiple workout sessions. Return a JSON object with this exact structure:
{
  "sessions": [
    {
      "date": string,        // ISO date "YYYY-MM-DD" inferred from the notes, or today's date if not mentioned
      "durationMins": number, // total workout duration in minutes; infer from notes or use 60 as default
      "exercises": Array<{
        "name": string,      // exercise name in the requested language
        "type": "sets-reps" | "sets-duration" | "duration",
        "sets": number | undefined,
        "reps": number | undefined,
        "duration": number | undefined,  // seconds
        "weightKg": number | undefined,
        "category": string | undefined   // e.g. "Chest", "Back", "Legs", "Shoulders", "Arms", "Core", "Cardio"
      }>
    }
  ]
}

Rules:
- Multiple sessions: if the notes describe multiple sessions (different dates, "Day 1 / Day 2", etc.), produce one element per session, ordered oldest to newest. Otherwise produce exactly one element.
- Exercise names: translate ALL exercise names to the requested language. Use consistent, standard names. If the same exercise appears under different names or spellings within a session, merge into one entry. Prefer exact names from the "existing history names" list when there is a clear match.
- Type selection: default to "sets-reps" when ambiguous. Use "sets-duration" for timed sets (e.g. "3×30s planks"). Use "duration" for continuous cardio (e.g. "20 min run", "5km in 28min" → duration 1680).
- Reps ranges (e.g. "8-12 reps"): use the lower bound.
- Weight units: always output weightKg in kilograms. Convert lbs to kg (divide by 2.205, round to 1 decimal place).
- Supersets / circuits: treat each exercise individually. Assign the same set count to each exercise in the superset.
- Missing information: omit any field you cannot determine from the notes (e.g. if weight is not mentioned, omit weightKg). Do not guess or default numeric fields.
- Ignore rest periods, warmup notes, and non-exercise annotations (e.g. "2 min rest", "foam rolling", "stretched").
- Do not invent exercises not present in the notes.
- Return valid JSON only — no markdown, no explanation.`;

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

  const content = await callOpenAI(config, SYSTEM_PROMPT, userMessage);

  let parsed: { sessions: AiImportResult[] };
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error('Failed to parse JSON response from OpenAI API');
  }

  if (!Array.isArray(parsed.sessions) || parsed.sessions.length === 0) {
    throw new Error('Response is missing required fields (sessions array)');
  }

  return parsed.sessions.map((s) => ({
    date: s.date,
    durationMins: typeof s.durationMins === 'number' ? s.durationMins : 60,
    exercises: s.exercises,
  }));
}
