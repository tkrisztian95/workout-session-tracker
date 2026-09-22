import type { LlmConfig, SessionEvaluation, SkipReason, WorkoutSession } from '../types';
import { callLlm } from './client';
import { SESSION_DEBRIEF_SYSTEM_PROMPT } from './prompts/session-debrief';
import {
  type AiContext,
  formatLanguageInstruction,
  formatProfilePreamble,
  formatRecentSessions,
} from './context';

export interface SessionDebriefResult {
  text: string;
  model: string;
}

/** Splits prose into sentences on `.!?` boundaries and keeps the first `n`. */
function firstNSentences(text: string, n: number): string {
  const sentences = text
    .trim()
    .split(/(?<=[.!?])\s+/)
    .filter((s) => s.trim().length > 0);
  return sentences.slice(0, n).join(' ').trim();
}

/** Model-facing reason text; stable English so the prompt doesn't depend on UI language. */
const SKIP_REASON_TEXT: Record<SkipReason, string> = {
  pain: 'pain/injury',
  'equipment-broken': 'equipment broken',
  'equipment-busy': 'equipment busy',
  fatigue: 'fatigue/low energy',
  time: 'out of time',
  other: 'other',
};

/** `- skipped: …` line listing each skipped exercise with its reason and note, or null. */
function formatSkipped(finished: WorkoutSession): string | null {
  const skipped = finished.exercises.filter((e) => e.dismissed);
  if (skipped.length === 0) return null;
  const items = skipped.map((e) => {
    const parts: string[] = [];
    if (e.skipReason) parts.push(SKIP_REASON_TEXT[e.skipReason]);
    if (e.skipNote) parts.push(JSON.stringify(e.skipNote));
    return `${e.name} (${parts.length > 0 ? parts.join(' — ') : 'no reason'})`;
  });
  return `- skipped: ${items.join(', ')}`;
}

/** Renders the just-finished session's evaluation as prompt-friendly lines. */
function formatFinishedSession(finished: WorkoutSession): string {
  const date = finished.completedAt.slice(0, 10);
  const dayName = finished.planDaySnapshot?.day.name;
  const planName = finished.planDaySnapshot?.planName;
  const head = dayName
    ? `This session (${date}, ${planName ? `${planName} · ` : ''}${dayName}):`
    : `This session (${date}, no plan):`;

  const lines: string[] = [head];

  const ev: SessionEvaluation | undefined = finished.evaluation;
  if (ev) {
    const c = ev.counts;
    lines.push(
      `- overall: ${ev.overall}`,
      `- exercises: ${c.overdone} overdone, ${c.matched} on target, ${c.underperformed} underperformed, ${c.missed} missed, ${c.extra} extra`,
    );
    if (typeof ev.totalVolumeKg === 'number') lines.push(`- total volume: ${ev.totalVolumeKg} kg`);
    if (typeof ev.avgWeightKg === 'number') lines.push(`- average load: ${ev.avgWeightKg} kg`);
    if (typeof ev.setCount === 'number') lines.push(`- sets logged: ${ev.setCount}`);
    if (ev.rating) lines.push(`- session rating: ${ev.rating}/5`);
    if (ev.highlights && ev.highlights.length > 0) {
      const notable = ev.highlights
        .map((h) => `${h.exerciseName} (${h.status}${h.delta ? ` ${h.delta}` : ''})`)
        .join(', ');
      lines.push(`- notable: ${notable}`);
    }
  } else {
    lines.push(`- ${finished.exercises.length} exercises logged`);
    if (finished.rating) lines.push(`- session rating: ${finished.rating}/5`);
  }

  const skipped = formatSkipped(finished);
  if (skipped) lines.push(skipped);

  return lines.join('\n');
}

/**
 * Generates the one-paragraph post-workout debrief (#64) for a just-finished
 * session. One `callLlm` JSON request built from the envelope plus the finished
 * session's evaluation. Defensively trims the response to three sentences.
 * Throws when the model response is unusable — the caller degrades silently.
 */
export async function generateSessionDebrief(
  config: LlmConfig,
  ctx: AiContext,
  finished: WorkoutSession,
): Promise<SessionDebriefResult> {
  const profile = formatProfilePreamble(ctx.profile);
  const recent = ctx.recentSessions.length > 0 ? formatRecentSessions(ctx.recentSessions) : null;

  const userMessage =
    (profile ? `${profile}\n\n` : '') +
    (recent ? `Recent training (most recent first):\n${recent}\n\n` : '') +
    `${formatFinishedSession(finished)}\n\n` +
    `Write the debrief for the session above.${formatLanguageInstruction(ctx.language)}`;

  const content = await callLlm(config, SESSION_DEBRIEF_SYSTEM_PROMPT, userMessage);

  let parsed: { debrief?: unknown };
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error('Failed to parse JSON response from the AI provider');
  }

  if (typeof parsed.debrief !== 'string' || parsed.debrief.trim().length === 0) {
    throw new Error('AI response is missing the debrief text');
  }

  return {
    text: firstNSentences(parsed.debrief, 3),
    model: config.model,
  };
}
