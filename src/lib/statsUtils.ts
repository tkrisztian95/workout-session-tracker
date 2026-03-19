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

export function getWeeklyVolumeChartData(
  sessions: WorkoutSession[],
  weeks = 12,
): WeeklyVolumePoint[] {
  const completed = sessions.filter((s) => s.completedAt);

  // Build week start timestamps (Monday-aligned) going back `weeks` weeks
  const now = new Date();
  // Get start of current week (Monday)
  const dayOfWeek = now.getDay(); // 0 = Sun
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const currentWeekStart = new Date(now);
  currentWeekStart.setHours(0, 0, 0, 0);
  currentWeekStart.setDate(currentWeekStart.getDate() - daysToMonday);

  const points: WeeklyVolumePoint[] = [];

  for (let i = weeks - 1; i >= 0; i--) {
    const weekStart = new Date(currentWeekStart);
    weekStart.setDate(weekStart.getDate() - i * 7);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const label = weekStart.toLocaleDateString('en', { month: 'short', day: 'numeric' });

    const volume = completed
      .filter((s) => {
        const d = new Date(s.completedAt);
        return d >= weekStart && d < weekEnd;
      })
      .reduce((sum, s) => {
        for (const exercise of s.exercises) {
          if (exercise.loggedSets) {
            for (const set of exercise.loggedSets) {
              if (set.weight > 0 && set.reps > 0) {
                sum += set.weight * set.reps;
              }
            }
          }
        }
        return sum;
      }, 0);

    points.push({ weekLabel: label, volume: Math.round(volume) });
  }

  return points;
}

export type Trend = 'up' | 'down' | 'flat';

export interface ExerciseProgression {
  exerciseName: string;
  sessionWeights: number[];
  sessionDates: string[];
  trend: Trend;
}

export function getExerciseWeightProgression(sessions: WorkoutSession[]): ExerciseProgression[] {
  const completed = sessions
    .filter((s) => s.completedAt)
    .sort((a, b) => a.completedAt.localeCompare(b.completedAt));

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

    results.push({ exerciseName, sessionWeights, sessionDates, trend });
  }

  results.sort((a, b) => a.exerciseName.localeCompare(b.exerciseName));

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
