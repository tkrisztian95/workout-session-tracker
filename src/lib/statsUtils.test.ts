import { describe, expect, it } from 'vitest';
import {
  getGroupDistribution,
  getMuscleDistribution,
  getPlanAdherenceProgression,
} from './statsUtils';
import type { Exercise, LoggedSet, PlanExercise, WorkoutPlan, WorkoutSession } from './types';
import type { Muscle } from './muscles';

function session(muscles: (Muscle | undefined)[]): WorkoutSession {
  return {
    id: crypto.randomUUID(),
    startedAt: '2026-01-01T08:00:00Z',
    completedAt: '2026-01-01T09:00:00Z',
    exercises: muscles.map((m, i) => ({
      id: `e${i}`,
      name: `ex ${i}`,
      type: 'sets-reps' as const,
      muscle: m,
    })),
  };
}

describe('getMuscleDistribution', () => {
  it('returns empty array for empty sessions', () => {
    expect(getMuscleDistribution([])).toEqual([]);
  });

  it('counts sessions, not exercises, per axis', () => {
    const dist = getMuscleDistribution([session(['chest', 'chest', 'chest'])]);
    expect(dist).toEqual([{ muscle: 'chest', count: 1 }]);
  });

  it('aggregates the same axis across multiple sessions', () => {
    const dist = getMuscleDistribution([session(['chest']), session(['chest']), session(['back'])]);
    expect(dist.find((p) => p.muscle === 'chest')?.count).toBe(2);
    expect(dist.find((p) => p.muscle === 'back')?.count).toBe(1);
  });

  it('rolls exercises without a muscle into "other"', () => {
    const dist = getMuscleDistribution([session(['chest', undefined, undefined])]);
    expect(dist).toContainEqual({ muscle: 'chest', count: 1 });
    expect(dist).toContainEqual({ muscle: 'other', count: 1 });
  });

  it('skips sessions without a completedAt', () => {
    const s = session(['chest']);
    s.completedAt = '';
    expect(getMuscleDistribution([s])).toEqual([]);
  });

  it('sorts descending by count', () => {
    const dist = getMuscleDistribution([
      session(['chest']),
      session(['back']),
      session(['back']),
      session(['back']),
    ]);
    expect(dist.map((p) => p.muscle)).toEqual(['back', 'chest']);
  });
});

describe('getGroupDistribution', () => {
  it('aggregates muscles into their group', () => {
    const dist = getGroupDistribution([session(['chest', 'back', 'shoulders'])]);
    expect(dist).toEqual([{ group: 'upper', count: 1 }]);
  });

  it('counts a session once per group regardless of how many muscles in that group', () => {
    const dist = getGroupDistribution([session(['chest', 'back', 'shoulders', 'arms'])]);
    expect(dist).toEqual([{ group: 'upper', count: 1 }]);
  });

  it('distributes lower/core/cardio correctly', () => {
    const dist = getGroupDistribution([
      session(['quads', 'glutes']), // upper bucket? no - lower
      session(['abs', 'obliques']),
      session(['cardio']),
    ]);
    const map = new Map(dist.map((p) => [p.group, p.count]));
    expect(map.get('lower')).toBe(1);
    expect(map.get('core')).toBe(1);
    expect(map.get('cardio')).toBe(1);
  });

  it('counts a session that crosses multiple groups once per group', () => {
    const dist = getGroupDistribution([session(['chest', 'quads', 'abs'])]);
    expect(dist).toHaveLength(3);
    expect(new Set(dist.map((p) => p.group))).toEqual(new Set(['upper', 'lower', 'core']));
    for (const p of dist) expect(p.count).toBe(1);
  });

  it('untyped exercises roll into "other", NOT into any group', () => {
    const dist = getGroupDistribution([session([undefined, undefined])]);
    expect(dist).toEqual([{ group: 'other', count: 1 }]);
  });

  it('returns empty array for empty sessions', () => {
    expect(getGroupDistribution([])).toEqual([]);
  });
});

describe('getPlanAdherenceProgression', () => {
  const set = (weight: number, reps: number): LoggedSet => ({
    weight,
    reps,
    loggedAt: '2026-01-01T08:30:00.000Z',
  });

  const core = (name: string, over: Partial<PlanExercise> = {}): PlanExercise => ({
    id: `p-${name}`,
    name,
    type: 'sets-reps',
    sets: 2,
    reps: 8,
    role: 'core',
    ...over,
  });

  const optional = (name: string, over: Partial<PlanExercise> = {}): PlanExercise => ({
    ...core(name, over),
    id: `o-${name}`,
    role: 'optional',
  });

  function plan(
    coreExercises: PlanExercise[],
    optionalExercises: PlanExercise[] = [],
  ): WorkoutPlan {
    return {
      id: 'plan1',
      name: 'Plan',
      days: [
        {
          id: 'day1',
          name: 'Day 1',
          weekdays: [],
          coreExercises,
          optionalExercises,
        },
      ],
      sharedExercises: [],
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };
  }

  /** Performed exercise matching a planned one by name, with `n` qualifying sets. */
  const did = (name: string, n: number): Exercise => ({
    id: `a-${name}`,
    name,
    type: 'sets-reps',
    loggedSets: Array.from({ length: n }, () => set(60, 8)),
  });

  function planSession(exercises: Exercise[], over: Partial<WorkoutSession> = {}): WorkoutSession {
    return {
      id: crypto.randomUUID(),
      startedAt: '2026-01-01T08:00:00.000Z',
      completedAt: '2026-01-01T09:00:00.000Z',
      planId: 'plan1',
      planDayId: 'day1',
      exercises,
      ...over,
    };
  }

  it('returns empty progression with null average when there are no sessions', () => {
    expect(getPlanAdherenceProgression([], [], 'all')).toEqual({ points: [], average: null });
  });

  it('scores 100% when every core exercise met its target', () => {
    const p = plan([core('Bench'), core('Squat')]);
    const s = planSession([did('Bench', 2), did('Squat', 2)]);
    const { points, average } = getPlanAdherenceProgression([s], [p], 'all');
    expect(points).toHaveLength(1);
    expect(points[0].score).toBe(100);
    expect(average).toBe(100);
  });

  it('scores the share of core exercises that met target', () => {
    // 4 core; 3 hit their 2-set target, 1 was not performed → 75%.
    const p = plan([core('A'), core('B'), core('C'), core('D')]);
    const s = planSession([did('A', 2), did('B', 2), did('C', 2)]);
    expect(getPlanAdherenceProgression([s], [p], 'all').points[0].score).toBe(75);
  });

  it('counts only core exercises — optional and ad-hoc extras are ignored', () => {
    // 1 core (met) + 1 optional (skipped) + 1 ad-hoc extra performed.
    const p = plan([core('Bench')], [optional('Curls')]);
    const s = planSession([did('Bench', 2), did('Extra Cardio', 3)]);
    expect(getPlanAdherenceProgression([s], [p], 'all').points[0].score).toBe(100);
  });

  it('counts a completed pure-duration core exercise as met', () => {
    const p = plan([
      core('Plank', { type: 'duration', sets: undefined, reps: undefined, duration: 60 }),
    ]);
    const s = planSession([{ id: 'a-Plank', name: 'Plank', type: 'duration', completed: true }]);
    expect(getPlanAdherenceProgression([s], [p], 'all').points[0].score).toBe(100);
  });

  it('excludes sessions whose plan day has no core exercises', () => {
    const p = plan([], [optional('Curls')]);
    const s = planSession([did('Curls', 2)]);
    expect(getPlanAdherenceProgression([s], [p], 'all')).toEqual({ points: [], average: null });
  });

  it('excludes sessions that are not linked to a plan', () => {
    const p = plan([core('Bench')]);
    const adhoc = planSession([did('Bench', 2)], { planId: undefined, planDayId: undefined });
    expect(getPlanAdherenceProgression([adhoc], [p], 'all')).toEqual({
      points: [],
      average: null,
    });
  });

  it('excludes sessions whose plan can no longer be resolved', () => {
    const s = planSession([did('Bench', 2)]);
    expect(getPlanAdherenceProgression([s], [], 'all')).toEqual({ points: [], average: null });
  });

  it('orders points chronologically and averages their scores', () => {
    const p = plan([core('A'), core('B')]);
    const older = planSession([did('A', 2)], { completedAt: '2026-01-01T09:00:00.000Z' }); // 50%
    const newer = planSession([did('A', 2), did('B', 2)], {
      completedAt: '2026-01-05T09:00:00.000Z',
    }); // 100%
    const { points, average } = getPlanAdherenceProgression([newer, older], [p], 'all');
    expect(points.map((pt) => pt.score)).toEqual([50, 100]);
    expect(average).toBe(75);
  });

  it('respects the time range filter', () => {
    const p = plan([core('Bench')]);
    const old = planSession([did('Bench', 2)], { completedAt: '2026-01-01T09:00:00.000Z' });
    const recent = planSession([did('Bench', 2)], { completedAt: new Date().toISOString() });
    const { points } = getPlanAdherenceProgression([old, recent], [p], '90days');
    expect(points).toHaveLength(1);
    expect(points[0].score).toBe(100);
  });
});
