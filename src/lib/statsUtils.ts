import type { WorkoutSession } from './types';

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

  // Map: exerciseName → array of { sessionDate, meanWeight }
  const map = new Map<string, { date: string; meanWeight: number }[]>();

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
      const meanWeight = weights.reduce((a, b) => a + b, 0) / weights.length;
      if (!map.has(name)) map.set(name, []);
      map.get(name)!.push({ date: session.completedAt, meanWeight });
    }
  }

  const results: ExerciseProgression[] = [];

  for (const [exerciseName, entries] of map) {
    // Take last 5 appearances
    const last5 = entries.slice(-5);
    const sessionWeights = last5.map((e) => Math.round(e.meanWeight * 10) / 10);
    const sessionDates = last5.map((e) =>
      new Date(e.date).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
    );

    let trend: Trend = 'flat';
    if (last5.length >= 2) {
      const prev = last5[last5.length - 2].meanWeight;
      const curr = last5[last5.length - 1].meanWeight;
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

export interface CategoryDistributionPoint {
  category: string;
  count: number;
}

export function getCategoryDistribution(sessions: WorkoutSession[]): CategoryDistributionPoint[] {
  const completed = sessions.filter((s) => s.completedAt);
  const map = new Map<string, number>();

  for (const session of completed) {
    const seen = new Set<string>();
    for (const exercise of session.exercises) {
      const cat = exercise.category?.trim() || 'Other';
      if (!seen.has(cat)) {
        seen.add(cat);
        map.set(cat, (map.get(cat) ?? 0) + 1);
      }
    }
  }

  return Array.from(map.entries())
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);
}
