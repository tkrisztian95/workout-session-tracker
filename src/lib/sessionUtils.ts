import type { Exercise, LoggedSet } from './types';

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
