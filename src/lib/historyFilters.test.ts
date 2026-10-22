import { describe, expect, it } from 'vitest';
import {
  availableExerciseNames,
  filterSessions,
  hasActiveFilters,
  matchesFilters,
  nonDateFilterCount,
  EMPTY_FILTERS,
  type HistoryFilters,
} from './historyFilters';
import type { Exercise, WorkoutSession } from './types';
import type { Muscle } from './muscles';

function exercise(name: string, muscle?: Muscle): Exercise {
  return { id: name, name, type: 'sets-reps', muscle };
}

function session(opts: Partial<WorkoutSession> & { id: string }): WorkoutSession {
  return {
    startedAt: '2026-01-01T08:00:00Z',
    completedAt: '2026-01-01T09:00:00Z',
    exercises: [],
    ...opts,
  };
}

function filters(overrides: Partial<HistoryFilters> = {}): HistoryFilters {
  return { ...EMPTY_FILTERS, ...overrides };
}

describe('matchesFilters — date range', () => {
  const s = session({ id: 's1', completedAt: '2026-03-10T09:00:00Z' });

  it('keeps sessions inside an inclusive range', () => {
    expect(matchesFilters(s, filters({ dateFrom: '2026-03-01', dateTo: '2026-03-31' }))).toBe(true);
    expect(matchesFilters(s, filters({ dateFrom: '2026-03-10', dateTo: '2026-03-10' }))).toBe(true);
  });

  it('drops sessions outside the range', () => {
    expect(matchesFilters(s, filters({ dateFrom: '2026-04-01', dateTo: '2026-04-30' }))).toBe(
      false,
    );
  });

  it('ignores the range when only one bound is set', () => {
    expect(matchesFilters(s, filters({ dateFrom: '2026-04-01' }))).toBe(true);
  });
});

describe('matchesFilters — session type', () => {
  const plan = session({ id: 'p', planId: 'plan-1' });
  const free = session({ id: 'f' });

  it('plan keeps only plan-based sessions', () => {
    expect(matchesFilters(plan, filters({ sessionType: 'plan' }))).toBe(true);
    expect(matchesFilters(free, filters({ sessionType: 'plan' }))).toBe(false);
  });

  it('free keeps only sessions without a plan', () => {
    expect(matchesFilters(free, filters({ sessionType: 'free' }))).toBe(true);
    expect(matchesFilters(plan, filters({ sessionType: 'free' }))).toBe(false);
  });

  it('all keeps everything', () => {
    expect(matchesFilters(plan, filters({ sessionType: 'all' }))).toBe(true);
    expect(matchesFilters(free, filters({ sessionType: 'all' }))).toBe(true);
  });
});

describe('matchesFilters — muscle groups', () => {
  const upperSession = session({ id: 'u', exercises: [exercise('Bench Press', 'chest')] });
  const lowerSession = session({ id: 'l', exercises: [exercise('Squat', 'quads')] });

  it('matches when any exercise hits a selected group', () => {
    expect(matchesFilters(upperSession, filters({ muscleGroups: ['upper'] }))).toBe(true);
    expect(matchesFilters(lowerSession, filters({ muscleGroups: ['upper'] }))).toBe(false);
  });

  it('uses OR semantics across multiple groups', () => {
    expect(matchesFilters(lowerSession, filters({ muscleGroups: ['upper', 'lower'] }))).toBe(true);
  });
});

describe('matchesFilters — exercises', () => {
  const s = session({ id: 's', exercises: [exercise('Bench Press'), exercise('Squat')] });

  it('matches by name case-insensitively', () => {
    expect(matchesFilters(s, filters({ exercises: ['bench press'] }))).toBe(true);
    expect(matchesFilters(s, filters({ exercises: ['Deadlift'] }))).toBe(false);
  });

  it('uses OR semantics across multiple exercises', () => {
    expect(matchesFilters(s, filters({ exercises: ['Deadlift', 'Squat'] }))).toBe(true);
  });
});

describe('matchesFilters — combined', () => {
  it('requires every active dimension to pass (AND across dimensions)', () => {
    const s = session({
      id: 's',
      planId: 'plan-1',
      completedAt: '2026-03-10T09:00:00Z',
      exercises: [exercise('Bench Press', 'chest')],
    });
    expect(
      matchesFilters(
        s,
        filters({
          dateFrom: '2026-03-01',
          dateTo: '2026-03-31',
          sessionType: 'plan',
          muscleGroups: ['upper'],
          exercises: ['Bench Press'],
        }),
      ),
    ).toBe(true);
    // Wrong session type fails the whole match.
    expect(matchesFilters(s, filters({ sessionType: 'free', muscleGroups: ['upper'] }))).toBe(
      false,
    );
  });
});

describe('filterSessions', () => {
  it('returns only matching sessions', () => {
    const sessions = [
      session({ id: 'a', planId: 'p1' }),
      session({ id: 'b' }),
      session({ id: 'c', planId: 'p2' }),
    ];
    const result = filterSessions(sessions, filters({ sessionType: 'plan' }));
    expect(result.map((s) => s.id)).toEqual(['a', 'c']);
  });
});

describe('hasActiveFilters', () => {
  it('is false for the empty filter set', () => {
    expect(hasActiveFilters(EMPTY_FILTERS)).toBe(false);
  });

  it('is true when any dimension is set', () => {
    expect(hasActiveFilters(filters({ sessionType: 'plan' }))).toBe(true);
    expect(hasActiveFilters(filters({ muscleGroups: ['core'] }))).toBe(true);
    expect(hasActiveFilters(filters({ exercises: ['Squat'] }))).toBe(true);
    expect(hasActiveFilters(filters({ dateFrom: '2026-01-01', dateTo: '2026-01-31' }))).toBe(true);
  });
});

describe('nonDateFilterCount', () => {
  it('counts session type, each muscle group, and each exercise', () => {
    expect(nonDateFilterCount(EMPTY_FILTERS)).toBe(0);
    expect(
      nonDateFilterCount(
        filters({ sessionType: 'free', muscleGroups: ['upper', 'lower'], exercises: ['Squat'] }),
      ),
    ).toBe(4);
  });

  it('ignores the date range', () => {
    expect(nonDateFilterCount(filters({ dateFrom: '2026-01-01', dateTo: '2026-01-31' }))).toBe(0);
  });
});

describe('availableExerciseNames', () => {
  it('returns sorted, case-insensitively de-duplicated names', () => {
    const sessions = [
      session({ id: 'a', exercises: [exercise('Squat'), exercise('Bench Press')] }),
      session({ id: 'b', exercises: [exercise('squat'), exercise('Deadlift')] }),
    ];
    expect(availableExerciseNames(sessions)).toEqual(['Bench Press', 'Deadlift', 'Squat']);
  });
});
