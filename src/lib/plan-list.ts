import type { WorkoutPlan, WorkoutSession } from './types';
import { ALL_MUSCLES, type Muscle } from './muscles';

export type PlanSort = 'created' | 'followed' | 'updated' | 'name';
export type StatusFilter = 'active' | 'completed' | 'all';
export type AiFilter = 'any' | 'ai' | 'manual';

export interface PlanFilters {
  status: StatusFilter;
  aiGenerated: AiFilter;
  muscle: Muscle | null;
  trainingDays: number | null;
}

export interface PlanQuery {
  search: string;
  sort: PlanSort;
  filters: PlanFilters;
}

export const DEFAULT_PLAN_FILTERS: PlanFilters = {
  status: 'active',
  aiGenerated: 'any',
  muscle: null,
  trainingDays: null,
};

/** The most recent completed-session timestamp for a plan, or null if never followed. */
export function getPlanLastFollowedAt(planId: string, sessions: WorkoutSession[]): string | null {
  let latest: string | null = null;
  for (const s of sessions) {
    if (s.planId !== planId || !s.completedAt) continue;
    if (latest === null || s.completedAt > latest) latest = s.completedAt;
  }
  return latest;
}

/** Distinct muscles trained across a plan's shared and per-day exercises. */
export function getPlanMuscles(plan: WorkoutPlan): Muscle[] {
  const all = [
    ...plan.sharedExercises,
    ...plan.days.flatMap((d) => [...d.coreExercises, ...d.optionalExercises]),
  ];
  return [...new Set(all.map((e) => e.muscle).filter((m): m is Muscle => Boolean(m)))];
}

/** Muscles present in at least one plan, ordered by the canonical muscle order. */
export function availableMuscles(plans: WorkoutPlan[]): Muscle[] {
  const present = new Set<Muscle>();
  for (const plan of plans) {
    for (const m of getPlanMuscles(plan)) present.add(m);
  }
  return ALL_MUSCLES.filter((m) => present.has(m));
}

/** Distinct training-day counts present across the plans, ascending. */
export function availableDayCounts(plans: WorkoutPlan[]): number[] {
  const counts = new Set<number>();
  for (const plan of plans) counts.add(plan.days.length);
  return [...counts].sort((a, b) => a - b);
}

/** Number of filters set away from their default value. */
export function countActiveFilters(filters: PlanFilters): number {
  let count = 0;
  if (filters.status !== DEFAULT_PLAN_FILTERS.status) count++;
  if (filters.aiGenerated !== DEFAULT_PLAN_FILTERS.aiGenerated) count++;
  if (filters.muscle !== DEFAULT_PLAN_FILTERS.muscle) count++;
  if (filters.trainingDays !== DEFAULT_PLAN_FILTERS.trainingDays) count++;
  return count;
}

function matchesFilters(plan: WorkoutPlan, filters: PlanFilters): boolean {
  const status = plan.status ?? 'active';
  if (filters.status === 'active' && status !== 'active') return false;
  if (filters.status === 'completed' && status !== 'completed') return false;

  if (filters.aiGenerated === 'ai' && plan.aiGenerated !== true) return false;
  if (filters.aiGenerated === 'manual' && plan.aiGenerated === true) return false;

  if (filters.muscle !== null && !getPlanMuscles(plan).includes(filters.muscle)) {
    return false;
  }

  if (filters.trainingDays !== null && plan.days.length !== filters.trainingDays) {
    return false;
  }

  return true;
}

function compare(
  a: WorkoutPlan,
  b: WorkoutPlan,
  sort: PlanSort,
  sessions: WorkoutSession[],
): number {
  switch (sort) {
    case 'created':
      return b.createdAt.localeCompare(a.createdAt);
    case 'updated':
      return b.updatedAt.localeCompare(a.updatedAt);
    case 'name':
      return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
    case 'followed': {
      const fa = getPlanLastFollowedAt(a.id, sessions);
      const fb = getPlanLastFollowedAt(b.id, sessions);
      if (fa && fb) return fb.localeCompare(fa);
      if (fa) return -1;
      if (fb) return 1;
      return b.createdAt.localeCompare(a.createdAt);
    }
  }
}

/** Apply search, filters, and sort to produce the displayed plan list. */
export function organizePlans(
  plans: WorkoutPlan[],
  sessions: WorkoutSession[],
  query: PlanQuery,
): WorkoutPlan[] {
  const term = query.search.trim().toLowerCase();
  return plans
    .filter((p) => term === '' || p.name.toLowerCase().includes(term))
    .filter((p) => matchesFilters(p, query.filters))
    .sort((a, b) => compare(a, b, query.sort, sessions));
}
