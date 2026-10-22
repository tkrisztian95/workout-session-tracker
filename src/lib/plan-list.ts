import type { PlanDay, WorkoutPlan, WorkoutSession } from './types';
import { ALL_MUSCLES, type Muscle } from './muscles';

export type PlanSort = 'created' | 'followed' | 'mostFollowed' | 'updated' | 'name';
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
  status: 'all',
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

/** Number of completed sessions logged against a plan. */
export function getPlanFollowCount(planId: string, sessions: WorkoutSession[]): number {
  let count = 0;
  for (const s of sessions) {
    if (s.planId === planId && s.completedAt) count++;
  }
  return count;
}

/**
 * Total number of sessions a plan schedules across its defined duration, or
 * `null` when the plan is open-ended (no `scheduledWeeks`) and therefore has no
 * planned total to progress toward. Weekly sessions are the number of scheduled
 * weekday slots across all days (e.g. 8 weeks × 2 weekly slots = 16), falling
 * back to the plain training-day count when no weekdays are assigned.
 */
export function getPlanPlannedOccurrences(plan: WorkoutPlan): number | null {
  if (!plan.scheduledWeeks || plan.scheduledWeeks <= 0) return null;
  const weekdaySlots = plan.days.reduce((sum, d) => sum + d.weekdays.length, 0);
  const weeklySessions = weekdaySlots > 0 ? weekdaySlots : plan.days.length;
  if (weeklySessions <= 0) return null;
  return plan.scheduledWeeks * weeklySessions;
}

/** A plan day scheduled on a given weekday, paired with its owning plan. */
export interface ScheduledPlanDay {
  plan: WorkoutPlan;
  day: PlanDay;
}

/**
 * Plan days scheduled on a given weekday (0 = Sunday … 6 = Saturday), across all
 * active plans. Completed plans are excluded since they're no longer part of the
 * routine. Used by the history week strip to surface what's planned for a day.
 */
export function getScheduledPlanDays(plans: WorkoutPlan[], weekday: number): ScheduledPlanDay[] {
  const result: ScheduledPlanDay[] = [];
  for (const plan of plans) {
    if ((plan.status ?? 'active') === 'completed') continue;
    for (const day of plan.days) {
      if (day.weekdays.includes(weekday)) result.push({ plan, day });
    }
  }
  return result;
}

/** Total number of exercises in a plan: shared plus every day's core and optional. */
export function getPlanExerciseCount(plan: WorkoutPlan): number {
  let count = plan.sharedExercises.length;
  for (const d of plan.days) {
    count += d.coreExercises.length + d.optionalExercises.length;
  }
  return count;
}

/**
 * Number of distinct exercises a plan contains, deduplicated by name
 * (case-insensitive). The same movement appearing on several days counts once.
 */
export function getPlanUniqueExerciseCount(plan: WorkoutPlan): number {
  const names = new Set<string>();
  const all = [
    ...plan.sharedExercises,
    ...plan.days.flatMap((d) => [...d.coreExercises, ...d.optionalExercises]),
  ];
  for (const e of all) {
    const key = e.name.trim().toLowerCase();
    if (key) names.add(key);
  }
  return names.size;
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
    case 'mostFollowed': {
      const ca = getPlanFollowCount(a.id, sessions);
      const cb = getPlanFollowCount(b.id, sessions);
      if (ca !== cb) return cb - ca;
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
