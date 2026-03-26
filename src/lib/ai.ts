import type {
  LlmConfig,
  WorkoutPlan,
  WorkoutSession,
  PlanDay,
  PlanExercise,
  Exercise,
  Sex,
} from './types';
import { getSex, getAge, getHeightCm, getWeightKg } from './storage';

const SYSTEM_PROMPT = `You are a personal fitness coach. Based on the user's existing workout plans and session history, suggest a new workout plan tailored to their goals and progress.

Return a JSON object with the following structure:
{
  "reasoning": string,
  "name": string,
  "scheduledWeeks": number | undefined,
  "days": Array<{
    "name": string,
    "weekdays": number[],
    "coreExercises": Array<{
      "name": string,
      "type": "sets-reps" | "sets-duration" | "duration",
      "sets": number | undefined,
      "reps": number | undefined,
      "duration": number | undefined,
      "weightKg": number | undefined,
      "role": "core",
      "scalingNote": string | undefined,
      "category": string | undefined
    }>,
    "optionalExercises": Array<{
      "name": string,
      "type": "sets-reps" | "sets-duration" | "duration",
      "sets": number | undefined,
      "reps": number | undefined,
      "duration": number | undefined,
      "weightKg": number | undefined,
      "role": "optional",
      "scalingNote": string | undefined,
      "category": string | undefined
    }>
  }>,
  "sharedExercises": Array<{
    "name": string,
    "type": "sets-reps" | "sets-duration" | "duration",
    "sets": number | undefined,
    "reps": number | undefined,
    "duration": number | undefined,
    "weightKg": number | undefined,
    "role": "core" | "optional",
    "scalingNote": string | undefined,
    "category": string | undefined
  }>
}

Guidelines:
- "reasoning": 1–3 sentences explaining why this plan suits the user based on their history and stated goals. Be specific — reference exercises, weights, or patterns you noticed.
- weekdays: 0=Sunday through 6=Saturday. Schedule rest days between sessions that train the same muscle groups.
- Apply progressive overload: if the user's history shows weights or volume, suggest a modest increase (5–10%) rather than repeating the same numbers.
- Balance muscle groups across the week — avoid training the same primary muscles on consecutive days.
- weightKg: include whenever you can infer a reasonable starting weight from the user's history or their body metrics.
- scalingNote: use for beginner modifications, equipment alternatives, or form cues when helpful.
- category: one of "Chest", "Back", "Legs", "Shoulders", "Arms", "Core", "Cardio", or another standard muscle group.
- scheduledWeeks: set for periodized programs with a clear end date (e.g. 8–12 week blocks); omit for open-ended plans.
- sharedExercises: use only for exercises that appear identically on every training day (e.g. a daily mobility warmup or cooldown stretch). Leave the array empty when exercises differ by day.
- Limit coreExercises to 4–6 per day. Move lower-priority work to optionalExercises or sharedExercises.
- Omit any optional JSON field rather than setting it to null or undefined.
- Omit id fields — they will be generated automatically.

Avoid:
- Training the same primary muscle group on consecutive days.
- Suggesting weights more than 20% above the highest weight the user has logged for that exercise.
- Including more than 6 core exercises in a single day.
- Inventing exercises the user has never done when their history shows a clear preference for specific movements.`;

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
          desc = `${e.name} ${e.sets}×${e.reps}${weight}`;
        }
      } else if (e.type === 'sets-duration') {
        const weight = e.weightKg ? ` @${e.weightKg}kg` : '';
        desc = `${e.name} ${e.sets}×${e.duration}s${weight}`;
      } else {
        desc = `${e.name} ${e.duration}s`;
      }
      if (e.category) desc += ` [${e.category}]`;
      return desc;
    })
    .join(', ');
  const rating = session.rating ? ` (rating: ${session.rating}/5)` : '';
  return `${date}: ${exercises}${rating}`;
}

const WEEKDAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function summariseExercise(e: PlanExercise): string {
  let desc: string;
  if (e.type === 'sets-reps') {
    const weight = e.weightKg ? ` @${e.weightKg}kg` : '';
    desc = `${e.name} ${e.sets}×${e.reps}${weight}`;
  } else if (e.type === 'sets-duration') {
    const weight = e.weightKg ? ` @${e.weightKg}kg` : '';
    desc = `${e.name} ${e.sets}×${e.duration}s${weight}`;
  } else {
    desc = `${e.name} ${e.duration}s`;
  }
  const tags: string[] = [];
  if (e.category) tags.push(e.category);
  if (e.role === 'optional') tags.push('optional');
  if (e.scalingNote) tags.push(`note: ${e.scalingNote}`);
  if (tags.length > 0) desc += ` (${tags.join(', ')})`;
  return desc;
}

function summarisePlan(plan: WorkoutPlan): string {
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

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
    }),
  });

  if (!response.ok) {
    let code = '';
    let detail = '';
    try {
      const err = await response.json();
      code = err?.error?.code ?? '';
      detail = err?.error?.message ?? '';
    } catch {
      // ignore
    }
    if (code === 'insufficient_quota') {
      throw new Error(
        'Your OpenAI account has no credits. https://platform.openai.com/settings/organization/billing/overview',
      );
    }
    if (response.status === 401) {
      throw new Error('Invalid API key. Check your key at https://platform.openai.com/api-keys.');
    }
    throw new Error(`OpenAI API error ${response.status}${detail ? `: ${detail}` : ''}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== 'string') {
    throw new Error('Unexpected response format from OpenAI API');
  }

  let parsed: AiPlanResult & { reasoning?: string };
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error('Failed to parse JSON response from OpenAI API');
  }

  if (!parsed.name || !Array.isArray(parsed.days)) {
    throw new Error('Response is missing required plan fields (name, days)');
  }

  // Ensure all PlanExercise ids exist (LLM may omit them)
  const ensureIds = (exercises: PlanExercise[]): PlanExercise[] =>
    exercises.map((e) => ({ ...e, id: e.id || crypto.randomUUID() }));

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

// ─── Session import from notes ────────────────────────────────────────────────

const IMPORT_SYSTEM_PROMPT = `You are a fitness assistant that parses free-form workout notes into structured JSON.

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

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: IMPORT_SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
    }),
  });

  if (!response.ok) {
    let code = '';
    let detail = '';
    try {
      const err = await response.json();
      code = err?.error?.code ?? '';
      detail = err?.error?.message ?? '';
    } catch {
      // ignore
    }
    if (code === 'insufficient_quota') {
      throw new Error(
        'Your OpenAI account has no credits. https://platform.openai.com/settings/organization/billing/overview',
      );
    }
    if (response.status === 401) {
      throw new Error('Invalid API key. Check your key at https://platform.openai.com/api-keys.');
    }
    throw new Error(`OpenAI API error ${response.status}${detail ? `: ${detail}` : ''}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== 'string') {
    throw new Error('Unexpected response format from OpenAI API');
  }

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
