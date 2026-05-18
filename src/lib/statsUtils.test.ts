import { describe, expect, it } from 'vitest';
import { getGroupDistribution, getMuscleDistribution } from './statsUtils';
import type { WorkoutSession } from './types';
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
