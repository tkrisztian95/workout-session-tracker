import type { Translations } from './i18n';
import type { Exercise, SkipReason, WorkoutSession } from './types';

/** Display order of the reason chips in the skip sheet. */
export const SKIP_REASONS: readonly SkipReason[] = [
  'pain',
  'equipment-broken',
  'equipment-busy',
  'fatigue',
  'time',
  'other',
];

/** Maximum length of a skip note, in characters. */
export const SKIP_NOTE_MAX = 200;

/** Consecutive pain skips of the same exercise needed to show the swap hint. */
export const PAIN_STREAK_LENGTH = 2;

const LABEL_KEYS: Record<SkipReason, keyof Translations> = {
  pain: 'skip_reason_pain',
  'equipment-broken': 'skip_reason_equipment_broken',
  'equipment-busy': 'skip_reason_equipment_busy',
  fatigue: 'skip_reason_fatigue',
  time: 'skip_reason_time',
  other: 'skip_reason_other',
};

/** Localized label for a skip reason. */
export function skipReasonLabel(reason: SkipReason, t: Translations): string {
  return t[LABEL_KEYS[reason]] as string;
}

/** Trims and caps a note; returns `undefined` when nothing is left. */
export function normalizeSkipNote(raw: string | undefined): string | undefined {
  const trimmed = (raw ?? '').trim().slice(0, SKIP_NOTE_MAX).trim();
  return trimmed === '' ? undefined : trimmed;
}

export interface SkipDetails {
  reason?: SkipReason;
  note?: string;
}

/** Drops the skip fields entirely so they never linger as `undefined` keys. */
export function withoutSkipDetails(exercise: Exercise): Exercise {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { skipReason, skipNote, ...rest } = exercise;
  return rest;
}

/** Marks an exercise skipped, storing only the details that are present. */
export function applySkip(exercise: Exercise, details: SkipDetails = {}): Exercise {
  const next: Exercise = { ...withoutSkipDetails(exercise), dismissed: true };
  if (details.reason) next.skipReason = details.reason;
  const note = normalizeSkipNote(details.note);
  if (note) next.skipNote = note;
  return next;
}

/** Undoes a skip and clears its reason and note. */
export function clearSkip(exercise: Exercise): Exercise {
  return { ...withoutSkipDetails(exercise), dismissed: false };
}

function normalizeName(name: string): string {
  return name.trim().toLowerCase();
}

/**
 * True when the most recent `streak` saved appearances of an exercise (matched
 * by name, case-insensitive) were all skipped for pain. A session that lists
 * the exercise more than once counts as one appearance, using its first match.
 */
export function hasPainStreak(
  sessions: readonly WorkoutSession[],
  exerciseName: string,
  streak: number = PAIN_STREAK_LENGTH,
): boolean {
  const target = normalizeName(exerciseName);
  if (!target || streak < 1) return false;

  const newestFirst = [...sessions].sort((a, b) => b.completedAt.localeCompare(a.completedAt));
  const appearances: Exercise[] = [];
  for (const session of newestFirst) {
    const match = session.exercises.find((e) => normalizeName(e.name) === target);
    if (match) appearances.push(match);
    if (appearances.length === streak) break;
  }

  return (
    appearances.length === streak &&
    appearances.every((e) => e.dismissed === true && e.skipReason === 'pain')
  );
}
