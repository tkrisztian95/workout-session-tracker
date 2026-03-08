import type { LlmConfig, WorkoutPlan, WorkoutSession, PlanDay, PlanExercise } from './types';

const SYSTEM_PROMPT = `You are a personal fitness coach. Based on the user's existing workout plans and session history, suggest a new workout plan tailored to their goals and progress.

Return a JSON object with the following structure (no extra fields):
{
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

Use crypto.randomUUID()-style UUIDs for all id fields. Set createdAt and updatedAt to the current ISO timestamp. weekdays uses 0=Sunday through 6=Saturday.`;

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

export function buildPlanSuggestionPrompt(
  plans: WorkoutPlan[],
  sessions: WorkoutSession[],
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

  return `Here are my existing workout plans:\n${plansSummary}\n\nHere are my recent workout sessions (most recent first):\n${sessionsSummary}\n\nPlease suggest a new workout plan that builds on my history and helps me progress.`;
}

export async function suggestPlan(
  config: LlmConfig,
  plans: WorkoutPlan[],
  sessions: WorkoutSession[],
): Promise<Omit<WorkoutPlan, 'id' | 'status'>> {
  const userMessage = buildPlanSuggestionPrompt(plans, sessions);

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

  let parsed: Omit<WorkoutPlan, 'id' | 'status'>;
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
  };
}
