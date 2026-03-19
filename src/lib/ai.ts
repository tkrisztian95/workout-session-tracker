import type { LlmConfig, WorkoutPlan, WorkoutSession, PlanDay, PlanExercise, Sex } from './types';
import { getSex, getAge, getHeightCm, getWeightKg } from './storage';

const SYSTEM_PROMPT = `You are a personal fitness coach. Based on the user's existing workout plans and session history, suggest a new workout plan tailored to their goals and progress.

Return a JSON object with the following structure:
{
  "reasoning": string,
  "name": string,
  "days": Array<{
    "id": string,
    "name": string,
    "weekdays": number[],
    "coreExercises": Array<{
      "id": string,
      "name": string,
      "type": "sets-reps" | "sets-duration" | "duration",
      "sets": number | undefined,
      "reps": number | undefined,
      "duration": number | undefined,
      "role": "core",
      "scalingNote": string | undefined,
      "category": string | undefined
    }>,
    "optionalExercises": Array<{
      "id": string,
      "name": string,
      "type": "sets-reps" | "sets-duration" | "duration",
      "sets": number | undefined,
      "reps": number | undefined,
      "duration": number | undefined,
      "role": "optional",
      "scalingNote": string | undefined,
      "category": string | undefined
    }>
  }>,
  "sharedExercises": Array<{
    "id": string,
    "name": string,
    "type": "sets-reps" | "sets-duration" | "duration",
    "sets": number | undefined,
    "reps": number | undefined,
    "duration": number | undefined,
    "role": "core" | "optional",
    "scalingNote": string | undefined,
    "category": string | undefined
  }>,
  "createdAt": string,
  "updatedAt": string
}

The "reasoning" field must always be included: 1–3 sentences explaining why this plan suits the user based on their history. Use crypto.randomUUID()-style UUIDs for all id fields. Set createdAt and updatedAt to the current ISO timestamp. weekdays uses 0=Sunday through 6=Saturday.`;

function summariseSession(session: WorkoutSession): string {
  const date = session.completedAt.slice(0, 10);
  const exercises = session.exercises
    .map((e) => {
      if (e.type === 'sets-reps') return `${e.name} ${e.sets}×${e.reps}`;
      if (e.type === 'sets-duration') return `${e.name} ${e.sets}×${e.duration}s`;
      return `${e.name} ${e.duration}s`;
    })
    .join(', ');
  const rating = session.rating ? ` (rating: ${session.rating}/5)` : '';
  return `${date}: ${exercises}${rating}`;
}

function summarisePlan(plan: WorkoutPlan): string {
  const days = plan.days
    .map((d) => {
      const exerciseCount = d.coreExercises.length + d.optionalExercises.length;
      return `${d.name || 'Day'} (${exerciseCount} exercises)`;
    })
    .join(', ');
  return `"${plan.name}" — ${plan.days.length} day(s): ${days}`;
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

  let preferenceText = '';
  if (preferences) {
    const parts: string[] = [];
    if (preferences.focus) parts.push(`focused on ${preferences.focus}`);
    if (preferences.daysPerWeek) parts.push(`${preferences.daysPerWeek} days per week`);
    if (preferences.goal) parts.push(`with the goal to ${preferences.goal.toLowerCase()}`);
    if (parts.length > 0) {
      preferenceText = ` Please create a plan ${parts.join(', ')}.`;
    }
  }

  const languageInstruction = language
    ? `\n\nPlease write the plan name, day names, exercise names, and reasoning in ${language}.`
    : '';

  const metricLines = [
    sex ? `My biological sex: ${sex}.` : '',
    age ? `My age: ${age} years.` : '',
    heightCm ? `My height: ${heightCm} cm.` : '',
    weightKg ? `My weight: ${weightKg} kg.` : '',
  ]
    .filter(Boolean)
    .join('\n');

  const metricsPreamble = metricLines ? `${metricLines}\n\n` : '';

  return `${metricsPreamble}Here are my existing workout plans:\n${plansSummary}\n\nHere are my recent workout sessions (most recent first):\n${sessionsSummary}\n\nPlease suggest a new workout plan that builds on my history and helps me progress.${preferenceText}${languageInstruction}`;
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
    ...(parsed.reasoning ? { reasoning: parsed.reasoning } : {}),
  };
}
