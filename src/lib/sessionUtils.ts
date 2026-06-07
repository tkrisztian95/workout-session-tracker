import type { Muscle } from './muscles';
import type { Exercise, LoggedSet, WorkoutSession } from './types';

/** Emoji for each 1–5 session rating, in ascending order. Index 0 = rating 1. */
export const RATING_EMOJI = ['😩', '😕', '😐', '💪', '🔥'] as const;

/** Compact label for a logged set — time for stopwatch sets, weight×reps otherwise. */
export function formatLoggedSet(set: LoggedSet): string {
  if (set.seconds != null) {
    const m = Math.floor(set.seconds / 60);
    const s = set.seconds % 60;
    return m > 0 ? `${m}:${String(s).padStart(2, '0')}` : `${s}s`;
  }
  return set.weight > 0 ? `${set.weight} kg × ${set.reps}` : `× ${set.reps}`;
}

/** Rep portion of a target: "10" for uniform, "15/12/8/4" for a per-set scheme. */
export function formatRepsTarget(ex: { reps?: number; repsPerSet?: number[] }): string {
  if (ex.repsPerSet && ex.repsPerSet.length > 0) return ex.repsPerSet.join('/');
  return String(ex.reps ?? 0);
}

/**
 * How a logged set relates to the exercise's target, used to colour-code
 * badges and decide what counts toward the sets goal:
 *
 * - `neutral` — no weight target on the exercise; every set just counts.
 * - `warmup`  — below the target weight; a ramp-up that doesn't count.
 * - `partial` — at/above target weight but short of the rep target; a near
 *               miss that does NOT count toward the goal.
 * - `working` — at/above target weight and meeting the rep target; counts.
 */
export type SetStatus = 'neutral' | 'warmup' | 'partial' | 'working';

/**
 * Classifies each logged set against the exercise's weight + rep targets,
 * returning a status aligned 1:1 with `loggedSets`. Only `working` sets count
 * toward the sets goal. When the exercise has no weight target every set is
 * `neutral` (unchanged legacy behaviour). For a per-set rep scheme
 * (`repsPerSet`), the rep target is matched to the Nth weight-qualifying set in
 * order — warmups are skipped — since the scheme describes the working sets.
 */
export function classifyLoggedSets(ex: {
  weightKg?: number;
  reps?: number;
  repsPerSet?: number[];
  loggedSets?: LoggedSet[];
}): SetStatus[] {
  const sets = ex.loggedSets ?? [];
  if (ex.weightKg == null) return sets.map(() => 'neutral');

  let weightQualifyingIndex = 0;
  return sets.map((s) => {
    if (s.weight < ex.weightKg!) return 'warmup';
    const repTarget =
      ex.repsPerSet && ex.repsPerSet.length > 0
        ? ex.repsPerSet[Math.min(weightQualifyingIndex, ex.repsPerSet.length - 1)]
        : ex.reps;
    weightQualifyingIndex++;
    return repTarget != null && s.reps < repTarget ? 'partial' : 'working';
  });
}

/** Parse a free-text rep scheme ("15, 12, 8, 4" / "15 12 8 4" / "15/12/8/4") into positive integers. */
export function parseRepScheme(text: string): number[] {
  return text
    .split(/[\s,/]+/)
    .map((s) => parseInt(s, 10))
    .filter((n) => Number.isFinite(n) && n > 0);
}

export function formatExerciseDetail(ex: {
  type: 'sets-reps' | 'sets-duration' | 'duration';
  sets?: number;
  reps?: number;
  repsPerSet?: number[];
  duration?: number;
  weightKg?: number;
}): string {
  let base: string;
  if (ex.type === 'sets-reps') {
    base =
      ex.repsPerSet && ex.repsPerSet.length > 0 ? formatRepsTarget(ex) : `${ex.sets}×${ex.reps}`;
  } else if (ex.type === 'sets-duration') base = `${ex.sets}×${ex.duration}s`;
  else {
    const d = ex.duration ?? 0;
    base = d >= 60 ? `${Math.round(d / 60)} min` : `${d}s`;
  }
  return ex.weightKg ? `${base} · ${ex.weightKg} kg` : base;
}

export function formatSessionDate(
  iso: string,
  locale: string,
  format: 'short' | 'long' = 'short',
): string {
  return new Date(iso).toLocaleDateString(locale, {
    weekday: format,
    month: format,
    day: 'numeric',
    year: 'numeric',
  });
}

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

/** Local midnight of the Monday that starts the week containing `d`. */
function startOfWeek(d: Date): Date {
  const r = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const mondayOffset = (r.getDay() + 6) % 7; // Sunday (0) → 6, Monday (1) → 0
  r.setDate(r.getDate() - mondayOffset);
  return r;
}

export type RelativeBucketKey = 'this_week' | 'last_week' | 'two_weeks_ago' | 'earlier_this_month';

export interface SessionBucket {
  /** Stable identifier — groups consecutive day-groups under one heading. */
  id: string;
  /** Set for the fixed relative buckets; `null` for calendar-month buckets. */
  relativeKey: RelativeBucketKey | null;
  /** ISO `YYYY-MM-01` of the bucket's month; `null` for relative buckets. */
  monthDate: string | null;
}

/**
 * Assigns a session date to a history bucket. The three most recent weeks get
 * relative labels (this week / last week / two weeks ago); anything older but
 * still in the current calendar month collapses into "earlier this month"; the
 * rest are grouped by calendar month. Bucket boundaries are monotonic with the
 * date, so day-groups sorted newest-first never revisit a bucket.
 */
export function getSessionBucket(iso: string, now: Date = new Date()): SessionBucket {
  const date = new Date(iso);
  const weeksAgo = Math.round((startOfWeek(now).getTime() - startOfWeek(date).getTime()) / WEEK_MS);

  if (weeksAgo <= 0) return { id: 'this_week', relativeKey: 'this_week', monthDate: null };
  if (weeksAgo === 1) return { id: 'last_week', relativeKey: 'last_week', monthDate: null };
  if (weeksAgo === 2) return { id: 'two_weeks_ago', relativeKey: 'two_weeks_ago', monthDate: null };

  const sameMonth = date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
  if (sameMonth) {
    return { id: 'earlier_this_month', relativeKey: 'earlier_this_month', monthDate: null };
  }

  const monthDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`;
  return { id: `month-${monthDate}`, relativeKey: null, monthDate };
}

/** Localized label for a calendar-month bucket — month name, plus year when it differs from `now`. */
export function formatMonthBucket(
  monthDate: string,
  locale: string,
  now: Date = new Date(),
): string {
  const d = new Date(`${monthDate}T12:00:00`);
  const includeYear = d.getFullYear() !== now.getFullYear();
  return d.toLocaleDateString(locale, {
    month: 'long',
    ...(includeYear ? { year: 'numeric' } : {}),
  });
}

export interface SessionStats {
  completedExercises: number;
  completedSets: number;
  elapsedSeconds: number;
}

/**
 * Calculates session stats from an exercise list.
 * Dismissed exercises are excluded from all counts.
 * `startedAt` is used to compute elapsed time.
 */
export function calcSessionStats(
  exercises: Exercise[],
  startedAt: string,
  totalPausedMs = 0,
): SessionStats {
  const nonDismissed = exercises.filter((e) => !e.dismissed);
  const completed = nonDismissed.filter((e) => e.completed);
  const completedSets = completed.reduce((sum, e) => sum + (e.sets ?? 0), 0);
  const elapsedSeconds = Math.floor(
    (Date.now() - new Date(startedAt).getTime() - totalPausedMs) / 1000,
  );
  return {
    completedExercises: completed.length,
    completedSets,
    elapsedSeconds,
  };
}

export interface DurationUnits {
  h: string;
  m: string;
  s: string;
}

const defaultUnits: DurationUnits = { h: 'h', m: 'm', s: 's' };

export function formatDuration(seconds: number, units: DurationUnits = defaultUnits): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}${units.h} ${m}${units.m}`;
  if (m > 0) return `${m}${units.m} ${s}${units.s}`;
  return `${s}${units.s}`;
}

export interface SessionTimelineEntry {
  exerciseId: string;
  name: string;
  muscle?: Muscle;
  startedAt: string; // ISO timestamp (derived)
  endedAt: string; // ISO timestamp (derived)
  durationSec: number;
}

/**
 * Derives a per-exercise timeline from a completed session using the timestamps
 * already captured during the workout: each exercise's `completedAt` and the
 * `loggedAt` on individual sets. Dismissed exercises and exercises without any
 * timing signal are omitted. Entries are returned in chronological order and
 * guaranteed not to overlap — if logged-set times are stale or out of order, the
 * start is clamped to the previous entry's end so the visualization stays
 * monotonic.
 */
export function buildSessionTimeline(session: WorkoutSession): SessionTimelineEntry[] {
  const sessionStart = new Date(session.startedAt).getTime();

  type Raw = {
    exercise: Exercise;
    firstSetTime: number | null;
    lastSetTime: number | null;
    completedTime: number | null;
    sortKey: number;
    originalIndex: number;
  };

  const raw: Raw[] = [];
  session.exercises.forEach((ex, originalIndex) => {
    if (ex.dismissed) return;

    const setTimes = (ex.loggedSets ?? [])
      .map((s) => new Date(s.loggedAt).getTime())
      .filter((t) => Number.isFinite(t));

    const completedTime = ex.completedAt ? new Date(ex.completedAt).getTime() : null;
    if (completedTime == null && setTimes.length === 0) return;

    const firstSetTime = setTimes.length > 0 ? Math.min(...setTimes) : null;
    const lastSetTime = setTimes.length > 0 ? Math.max(...setTimes) : null;
    const sortKey = completedTime ?? lastSetTime ?? 0;

    raw.push({ exercise: ex, firstSetTime, lastSetTime, completedTime, sortKey, originalIndex });
  });

  raw.sort((a, b) => a.sortKey - b.sortKey || a.originalIndex - b.originalIndex);

  let prevEnd = sessionStart;
  const entries: SessionTimelineEntry[] = [];
  for (const r of raw) {
    let start = r.firstSetTime ?? prevEnd;
    if (start < prevEnd) start = prevEnd;

    let end = r.completedTime ?? r.lastSetTime ?? start;
    if (end < start) end = start;

    entries.push({
      exerciseId: r.exercise.id,
      name: r.exercise.name,
      muscle: r.exercise.muscle,
      startedAt: new Date(start).toISOString(),
      endedAt: new Date(end).toISOString(),
      durationSec: Math.max(0, Math.round((end - start) / 1000)),
    });
    prevEnd = end;
  }

  return entries;
}
