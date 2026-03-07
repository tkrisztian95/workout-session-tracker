import type { Exercise } from './types';

export function formatExerciseDetail(ex: {
  type: 'sets-reps' | 'sets-duration' | 'duration';
  sets?: number;
  reps?: number;
  duration?: number;
}): string {
  if (ex.type === 'sets-reps') return `${ex.sets}×${ex.reps}`;
  if (ex.type === 'sets-duration') return `${ex.sets}×${ex.duration}s`;
  const d = ex.duration ?? 0;
  return d >= 60 ? `${Math.round(d / 60)} min` : `${d}s`;
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
export function calcSessionStats(exercises: Exercise[], startedAt: string): SessionStats {
  const nonDismissed = exercises.filter((e) => !e.dismissed);
  const completed = nonDismissed.filter((e) => e.completed);
  const completedSets = completed.reduce((sum, e) => sum + (e.sets ?? 0), 0);
  const elapsedSeconds = Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000);
  return {
    completedExercises: completed.length,
    completedSets,
    elapsedSeconds,
  };
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}
