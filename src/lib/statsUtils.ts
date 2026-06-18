import type { Exercise, PlanDay, PlanExercise, WorkoutPlan, WorkoutSession } from './types';
import type { Muscle, MuscleGroup } from './muscles';
import { MUSCLE_TO_GROUP } from './muscles';
import { classifyPlannedExercise, plannedSetsForPlan } from './sessionUtils';

export type TimeRange = '1day' | 'week' | 'month' | '90days' | 'all';

export function getDateBoundary(range: TimeRange): Date | null {
  if (range === 'all') return null;
  const now = new Date();
  const boundary = new Date(now);
  if (range === '1day') {
    boundary.setHours(0, 0, 0, 0);
  } else if (range === 'week') {
    const dayOfWeek = now.getDay();
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    boundary.setDate(boundary.getDate() - daysToMonday);
    boundary.setHours(0, 0, 0, 0);
  } else if (range === 'month') {
    boundary.setDate(1);
    boundary.setHours(0, 0, 0, 0);
  } else if (range === '90days') {
    boundary.setDate(boundary.getDate() - 90);
    boundary.setHours(0, 0, 0, 0);
  }
  return boundary;
}

export function filterSessionsByRange(
  sessions: WorkoutSession[],
  range: TimeRange,
): WorkoutSession[] {
  const boundary = getDateBoundary(range);
  if (!boundary) return sessions;
  return sessions.filter((s) => s.completedAt && new Date(s.completedAt) >= boundary);
}

export interface StatsResult {
  totalSessions: number;
  totalVolumeKg: number;
  avgDurationMin: number;
  avgWeightKg: number;
  weeklyFrequency: number;
}

export function computeStats(sessions: WorkoutSession[]): StatsResult {
  const completed = sessions.filter((s) => s.completedAt);

  if (completed.length === 0) {
    return {
      totalSessions: 0,
      totalVolumeKg: 0,
      avgDurationMin: 0,
      avgWeightKg: 0,
      weeklyFrequency: 0,
    };
  }

  const totalSessions = completed.length;

  // Total volume: sum of weight × reps across all logged sets
  let totalVolumeKg = 0;
  let totalWeightSum = 0;
  let totalSetCount = 0;

  for (const session of completed) {
    for (const exercise of session.exercises) {
      if (exercise.loggedSets) {
        for (const set of exercise.loggedSets) {
          if (set.weight > 0 && set.reps > 0) {
            totalVolumeKg += set.weight * set.reps;
            totalWeightSum += set.weight;
            totalSetCount++;
          }
        }
      }
    }
  }

  // Avg duration: mean of (completedAt - startedAt) in minutes
  const totalDurationMs = completed.reduce((sum, s) => {
    const pausedMs = 0; // sessions don't store totalPausedMs — use raw duration
    return sum + (new Date(s.completedAt).getTime() - new Date(s.startedAt).getTime() - pausedMs);
  }, 0);
  const avgDurationMin = Math.round(totalDurationMs / completed.length / 60000);

  const avgWeightKg =
    totalSetCount > 0 ? Math.round((totalWeightSum / totalSetCount) * 10) / 10 : 0;

  // Weekly frequency: sessions / weeks elapsed since first session
  const sorted = [...completed].sort((a, b) => a.startedAt.localeCompare(b.startedAt));
  const firstMs = new Date(sorted[0].startedAt).getTime();
  const nowMs = Date.now();
  const weeksElapsed = Math.max(1, (nowMs - firstMs) / (7 * 24 * 60 * 60 * 1000));
  const weeklyFrequency = Math.round((totalSessions / weeksElapsed) * 10) / 10;

  return {
    totalSessions,
    totalVolumeKg: Math.round(totalVolumeKg),
    avgDurationMin,
    avgWeightKg,
    weeklyFrequency,
  };
}

export interface WeeklyVolumePoint {
  weekLabel: string;
  volume: number;
}

function sessionVolume(session: WorkoutSession): number {
  let v = 0;
  for (const exercise of session.exercises) {
    if (exercise.loggedSets) {
      for (const set of exercise.loggedSets) {
        if (set.weight > 0 && set.reps > 0) v += set.weight * set.reps;
      }
    }
  }
  return v;
}

function volumeInRange(sessions: WorkoutSession[], from: Date, to: Date): number {
  return Math.round(
    sessions
      .filter((s) => {
        const d = new Date(s.completedAt);
        return d >= from && d < to;
      })
      .reduce((sum, s) => sum + sessionVolume(s), 0),
  );
}

export function getVolumeChartData(
  sessions: WorkoutSession[],
  range: TimeRange,
): WeeklyVolumePoint[] {
  const completed = sessions.filter((s) => s.completedAt);
  const now = new Date();

  // ── Hourly (1day) ────────────────────────────────────────────────────────
  if (range === '1day') {
    const dayStart = new Date(now);
    dayStart.setHours(0, 0, 0, 0);
    return Array.from({ length: 24 }, (_, h) => {
      const from = new Date(dayStart);
      from.setHours(h);
      const to = new Date(dayStart);
      to.setHours(h + 1);
      return { weekLabel: `${h}h`, volume: volumeInRange(completed, from, to) };
    });
  }

  // ── Daily (week) ──────────────────────────────────────────────────────────
  if (range === 'week') {
    const dayOfWeek = now.getDay();
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const weekStart = new Date(now);
    weekStart.setHours(0, 0, 0, 0);
    weekStart.setDate(weekStart.getDate() - daysToMonday);
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map((label, i) => {
      const from = new Date(weekStart);
      from.setDate(weekStart.getDate() + i);
      const to = new Date(from);
      to.setDate(from.getDate() + 1);
      return { weekLabel: label, volume: volumeInRange(completed, from, to) };
    });
  }

  // ── Monthly (all) ─────────────────────────────────────────────────────────
  if (range === 'all') {
    if (completed.length === 0) return [];
    const earliest = new Date(
      [...completed].sort((a, b) => a.completedAt.localeCompare(b.completedAt))[0].completedAt,
    );
    earliest.setDate(1);
    earliest.setHours(0, 0, 0, 0);
    const points: WeeklyVolumePoint[] = [];
    const cursor = new Date(earliest);
    while (cursor <= now) {
      const from = new Date(cursor);
      const to = new Date(cursor);
      to.setMonth(to.getMonth() + 1);
      points.push({
        weekLabel: from.toLocaleDateString('en', { month: 'short', year: '2-digit' }),
        volume: volumeInRange(completed, from, to),
      });
      cursor.setMonth(cursor.getMonth() + 1);
    }
    return points;
  }

  // ── Weekly (month = 5 weeks, 90days = 13 weeks) ───────────────────────────
  const weeks = range === 'month' ? 5 : 13;
  const dayOfWeek = now.getDay();
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const currentWeekStart = new Date(now);
  currentWeekStart.setHours(0, 0, 0, 0);
  currentWeekStart.setDate(currentWeekStart.getDate() - daysToMonday);

  return Array.from({ length: weeks }, (_, i) => {
    const from = new Date(currentWeekStart);
    from.setDate(from.getDate() - (weeks - 1 - i) * 7);
    const to = new Date(from);
    to.setDate(to.getDate() + 7);
    return {
      weekLabel: from.toLocaleDateString('en', { month: 'short', day: 'numeric' }),
      volume: volumeInRange(completed, from, to),
    };
  });
}

export type Trend = 'up' | 'down' | 'flat';

export interface ExerciseProgression {
  exerciseName: string;
  sessionWeights: number[];
  sessionDates: string[];
  trend: Trend;
  sessionCount: number;
  isNew: boolean;
}

export function getExerciseWeightProgression(
  sessions: WorkoutSession[],
  allSessions: WorkoutSession[],
): ExerciseProgression[] {
  const completed = sessions
    .filter((s) => s.completedAt)
    .sort((a, b) => a.completedAt.localeCompare(b.completedAt));

  // Build a map of exercise name → earliest date across ALL sessions (not just filtered)
  const globalFirstDate = new Map<string, string>();
  for (const session of allSessions) {
    if (!session.completedAt) continue;
    for (const exercise of session.exercises) {
      if (!exercise.loggedSets?.some((s) => s.weight > 0)) continue;
      const prev = globalFirstDate.get(exercise.name);
      if (!prev || session.completedAt < prev) {
        globalFirstDate.set(exercise.name, session.completedAt);
      }
    }
  }

  // Map: exerciseName → array of { sessionDate, maxWeight }
  const map = new Map<string, { date: string; maxWeight: number }[]>();

  for (const session of completed) {
    // Group sets per exercise name within this session
    const exerciseWeights = new Map<string, number[]>();
    for (const exercise of session.exercises) {
      if (!exercise.loggedSets?.length) continue;
      const weights = exercise.loggedSets.filter((s) => s.weight > 0).map((s) => s.weight);
      if (weights.length === 0) continue;
      const name = exercise.name;
      if (!exerciseWeights.has(name)) exerciseWeights.set(name, []);
      exerciseWeights.get(name)!.push(...weights);
    }

    for (const [name, weights] of exerciseWeights) {
      const maxWeight = Math.max(...weights);
      if (!map.has(name)) map.set(name, []);
      map.get(name)!.push({ date: session.completedAt, maxWeight });
    }
  }

  const results: ExerciseProgression[] = [];

  for (const [exerciseName, entries] of map) {
    // Take last 5 appearances
    const last5 = entries.slice(-5);
    const sessionWeights = last5.map((e) => Math.round(e.maxWeight * 10) / 10);
    const sessionDates = last5.map((e) =>
      new Date(e.date).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
    );

    let trend: Trend = 'flat';
    if (last5.length >= 2) {
      const prev = last5[last5.length - 2].maxWeight;
      const curr = last5[last5.length - 1].maxWeight;
      if (curr > prev) trend = 'up';
      else if (curr < prev) trend = 'down';
    }

    const globalFirst = globalFirstDate.get(exerciseName);
    const localFirst = entries[0]?.date;
    const isNew = !!(globalFirst && localFirst && globalFirst === localFirst);

    results.push({
      exerciseName,
      sessionWeights,
      sessionDates,
      trend,
      sessionCount: entries.length,
      isNew,
    });
  }

  results.sort((a, b) => b.sessionCount - a.sessionCount);

  return results;
}

export interface MuscleDistributionPoint {
  muscle: Muscle | 'other';
  count: number;
}

export interface GroupDistributionPoint {
  group: MuscleGroup | 'other';
  count: number;
}

/**
 * Counts, per muscle axis, how many completed sessions contain at least one
 * exercise tagged with that muscle. Exercises with no `muscle` field roll up
 * into a single `'other'` axis.
 */
export function getMuscleDistribution(sessions: WorkoutSession[]): MuscleDistributionPoint[] {
  const completed = sessions.filter((s) => s.completedAt);
  const map = new Map<Muscle | 'other', number>();

  for (const session of completed) {
    const seen = new Set<Muscle | 'other'>();
    for (const exercise of session.exercises) {
      const key: Muscle | 'other' = exercise.muscle ?? 'other';
      if (!seen.has(key)) {
        seen.add(key);
        map.set(key, (map.get(key) ?? 0) + 1);
      }
    }
  }

  return Array.from(map.entries())
    .map(([muscle, count]) => ({ muscle, count }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Counts, per muscle-group axis, how many completed sessions contain at least
 * one exercise whose muscle resolves to that group. Exercises with no `muscle`
 * field roll up into a single `'other'` axis — they are NOT distributed into
 * Upper / Lower / Core / Cardio.
 */
export function getGroupDistribution(sessions: WorkoutSession[]): GroupDistributionPoint[] {
  const completed = sessions.filter((s) => s.completedAt);
  const map = new Map<MuscleGroup | 'other', number>();

  for (const session of completed) {
    const seen = new Set<MuscleGroup | 'other'>();
    for (const exercise of session.exercises) {
      const key: MuscleGroup | 'other' = exercise.muscle
        ? MUSCLE_TO_GROUP[exercise.muscle]
        : 'other';
      if (!seen.has(key)) {
        seen.add(key);
        map.set(key, (map.get(key) ?? 0) + 1);
      }
    }
  }

  return Array.from(map.entries())
    .map(([group, count]) => ({ group, count }))
    .sort((a, b) => b.count - a.count);
}

// ─── Plan target adherence ─────────────────────────────────────────────────────

export interface AdherencePoint {
  /** ISO `completedAt` of the scored session. */
  date: string;
  /** Percentage of the plan day's core exercises that met target, 0–100. */
  score: number;
}

export interface PlanAdherenceProgression {
  /** One point per scored plan-linked session, in chronological order. */
  points: AdherencePoint[];
  /** Rounded mean of the points' scores, or `null` when there are no points. */
  average: number | null;
}

function normName(s: string): string {
  return s.toLowerCase().trim();
}

/**
 * Whether a planned core exercise met its target in the performed session. Uses
 * the shared {@link classifyPlannedExercise} (on-target / overdone = met), with
 * one stats-layer refinement: a pure-duration core exercise carries no
 * prescribed sets and so cannot be classified on qualifying sets — it counts as
 * met once the performed exercise was marked completed.
 */
function coreExerciseMet(planned: PlanExercise, actual: Exercise | undefined): boolean {
  const status = classifyPlannedExercise(planned, actual);
  if (status === 'matched' || status === 'overdone') return true;
  if (plannedSetsForPlan(planned) === 0 && actual?.completed) return true;
  return false;
}

/**
 * Adherence score for one session against its plan day: the percentage of the
 * day's **core** exercises that met target. Optional and ad-hoc (extra)
 * exercises are ignored. Returns `null` when the day has no core exercises, so
 * the session cannot be scored.
 */
function scoreSession(session: WorkoutSession, planDay: PlanDay): number | null {
  const core = planDay.coreExercises;
  if (core.length === 0) return null;

  const actualByName = new Map<string, Exercise>();
  for (const ex of session.exercises) actualByName.set(normName(ex.name), ex);

  let met = 0;
  for (const p of core) {
    if (coreExerciseMet(p, actualByName.get(normName(p.name)))) met++;
  }
  return Math.round((met / core.length) * 100);
}

/**
 * Builds the plan-adherence trend over a time range: one point per completed,
 * in-range session that is linked to a resolvable plan day with at least one
 * core exercise, scored by {@link scoreSession}, plus the rounded average. Plan
 * days are resolved the same way the history detail page does
 * (`plan.days.find(d => d.id === session.planDayId)`). Sessions whose plan no
 * longer exists, that have no plan link, or whose day has no core exercises are
 * excluded.
 */
export function getPlanAdherenceProgression(
  sessions: WorkoutSession[],
  plans: WorkoutPlan[],
  range: TimeRange,
): PlanAdherenceProgression {
  const inRange = filterSessionsByRange(sessions, range).filter((s) => s.completedAt);
  const planById = new Map(plans.map((p) => [p.id, p]));

  const points: AdherencePoint[] = [];
  for (const session of inRange) {
    if (!session.planId || !session.planDayId) continue;
    const planDay = planById.get(session.planId)?.days.find((d) => d.id === session.planDayId);
    if (!planDay) continue;
    const score = scoreSession(session, planDay);
    if (score == null) continue;
    points.push({ date: session.completedAt, score });
  }

  points.sort((a, b) => a.date.localeCompare(b.date));

  const average =
    points.length > 0
      ? Math.round(points.reduce((sum, p) => sum + p.score, 0) / points.length)
      : null;

  return { points, average };
}
