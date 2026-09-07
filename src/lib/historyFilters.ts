import type { WorkoutSession } from './types';
import { MUSCLE_TO_GROUP, type MuscleGroup } from './muscles';

/** Whether a session originated from a plan, a free session, or either. */
export type SessionTypeFilter = 'all' | 'plan' | 'free';

/**
 * The full set of filters applied to the history list. Date range is kept
 * here alongside the newer dimensions so a single object describes the
 * complete filter state.
 */
export interface HistoryFilters {
  /** Inclusive lower bound, `YYYY-MM-DD`, or `null` when unset. */
  dateFrom: string | null;
  /** Inclusive upper bound, `YYYY-MM-DD`, or `null` when unset. */
  dateTo: string | null;
  /** Restrict to plan-based or free sessions. */
  sessionType: SessionTypeFilter;
  /** Match sessions touching any of these muscle groups (OR). */
  muscleGroups: MuscleGroup[];
  /** Match sessions including any of these exercises by name (OR). */
  exercises: string[];
}

export const EMPTY_FILTERS: HistoryFilters = {
  dateFrom: null,
  dateTo: null,
  sessionType: 'all',
  muscleGroups: [],
  exercises: [],
};

/** Case/whitespace-insensitive key for comparing exercise names. */
export function normalizeExerciseName(name: string): string {
  return name.trim().toLowerCase();
}

/** The distinct muscle groups exercised in a session. */
function sessionMuscleGroups(session: WorkoutSession): Set<MuscleGroup> {
  const groups = new Set<MuscleGroup>();
  for (const ex of session.exercises) {
    if (ex.muscle) groups.add(MUSCLE_TO_GROUP[ex.muscle]);
  }
  return groups;
}

export function matchesFilters(session: WorkoutSession, filters: HistoryFilters): boolean {
  // Date range — applied only when both bounds are set.
  if (filters.dateFrom && filters.dateTo) {
    const date = session.completedAt.slice(0, 10);
    if (date < filters.dateFrom || date > filters.dateTo) return false;
  }

  // Session type — plan-based vs. free.
  if (filters.sessionType === 'plan' && !session.planId) return false;
  if (filters.sessionType === 'free' && session.planId) return false;

  // Muscle groups — keep sessions touching any selected group.
  if (filters.muscleGroups.length > 0) {
    const groups = sessionMuscleGroups(session);
    if (!filters.muscleGroups.some((g) => groups.has(g))) return false;
  }

  // Exercises — keep sessions including any selected exercise.
  if (filters.exercises.length > 0) {
    const names = new Set(session.exercises.map((e) => normalizeExerciseName(e.name)));
    const wanted = filters.exercises.map(normalizeExerciseName);
    if (!wanted.some((n) => names.has(n))) return false;
  }

  return true;
}

export function filterSessions(
  sessions: WorkoutSession[],
  filters: HistoryFilters,
): WorkoutSession[] {
  return sessions.filter((s) => matchesFilters(s, filters));
}

/** Whether any filter narrows the result set. */
export function hasActiveFilters(filters: HistoryFilters): boolean {
  return (
    Boolean(filters.dateFrom && filters.dateTo) ||
    filters.sessionType !== 'all' ||
    filters.muscleGroups.length > 0 ||
    filters.exercises.length > 0
  );
}

/** Count of non-date filters, used for the filter button badge. */
export function nonDateFilterCount(filters: HistoryFilters): number {
  let n = 0;
  if (filters.sessionType !== 'all') n += 1;
  n += filters.muscleGroups.length;
  n += filters.exercises.length;
  return n;
}

/**
 * Distinct exercise names across the given sessions, de-duplicated
 * case-insensitively (first-seen casing wins) and sorted alphabetically.
 */
export function availableExerciseNames(sessions: WorkoutSession[]): string[] {
  const byKey = new Map<string, string>();
  for (const session of sessions) {
    for (const ex of session.exercises) {
      const key = normalizeExerciseName(ex.name);
      if (key && !byKey.has(key)) byKey.set(key, ex.name.trim());
    }
  }
  return [...byKey.values()].sort((a, b) => a.localeCompare(b));
}
