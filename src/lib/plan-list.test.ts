import { describe, expect, it } from 'vitest';
import {
  availableDayCounts,
  availableMuscles,
  countActiveFilters,
  DEFAULT_PLAN_FILTERS,
  getPlanExerciseCount,
  getPlanFollowCount,
  getPlanLastFollowedAt,
  getPlanPlannedOccurrences,
  getPlanUniqueExerciseCount,
  organizePlans,
  type PlanFilters,
  type PlanQuery,
} from './plan-list';
import type { PlanDay, PlanExercise, WorkoutPlan, WorkoutSession } from './types';
import type { Muscle } from './muscles';

function ex(muscle?: Muscle): PlanExercise {
  return { id: `e-${muscle ?? 'x'}`, name: 'Ex', type: 'sets-reps', role: 'core', muscle };
}

function day(muscles: Muscle[] = []): PlanDay {
  return {
    id: `d-${muscles.join('-')}`,
    name: 'Day',
    weekdays: [],
    coreExercises: muscles.map(ex),
    optionalExercises: [],
  };
}

function plan(opts: Partial<WorkoutPlan> & { id: string; name: string }): WorkoutPlan {
  return {
    days: [],
    sharedExercises: [],
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    ...opts,
  };
}

function session(opts: Partial<WorkoutSession> & { id: string }): WorkoutSession {
  return {
    startedAt: '2026-01-01T08:00:00Z',
    completedAt: '2026-01-01T09:00:00Z',
    exercises: [],
    ...opts,
  };
}

function query(overrides: Partial<PlanQuery> = {}): PlanQuery {
  return {
    search: '',
    sort: 'created',
    filters: { ...DEFAULT_PLAN_FILTERS, status: 'all' },
    ...overrides,
  };
}

describe('getPlanLastFollowedAt', () => {
  it('returns null when no sessions match the plan', () => {
    const sessions = [session({ id: 's1', planId: 'other' })];
    expect(getPlanLastFollowedAt('p1', sessions)).toBeNull();
  });

  it('ignores in-progress sessions without a completedAt', () => {
    const sessions = [
      { ...session({ id: 's1', planId: 'p1' }), completedAt: undefined as unknown as string },
    ];
    expect(getPlanLastFollowedAt('p1', sessions)).toBeNull();
  });

  it('returns the latest completedAt among matching sessions', () => {
    const sessions = [
      session({ id: 's1', planId: 'p1', completedAt: '2026-02-01T09:00:00Z' }),
      session({ id: 's2', planId: 'p1', completedAt: '2026-03-15T09:00:00Z' }),
      session({ id: 's3', planId: 'p1', completedAt: '2026-01-10T09:00:00Z' }),
    ];
    expect(getPlanLastFollowedAt('p1', sessions)).toBe('2026-03-15T09:00:00Z');
  });
});

describe('getPlanFollowCount', () => {
  it('counts only completed sessions matching the plan', () => {
    const sessions = [
      session({ id: 's1', planId: 'p1' }),
      session({ id: 's2', planId: 'p1' }),
      session({ id: 's3', planId: 'other' }),
      { ...session({ id: 's4', planId: 'p1' }), completedAt: undefined as unknown as string },
    ];
    expect(getPlanFollowCount('p1', sessions)).toBe(2);
    expect(getPlanFollowCount('none', sessions)).toBe(0);
  });
});

describe('getPlanExerciseCount', () => {
  it('counts shared-only plans', () => {
    expect(getPlanExerciseCount(plan({ id: 'p', name: 'P', sharedExercises: [ex(), ex()] }))).toBe(
      2,
    );
  });

  it('counts day core and optional exercises', () => {
    const d: PlanDay = {
      id: 'd1',
      name: 'Day',
      weekdays: [],
      coreExercises: [ex(), ex()],
      optionalExercises: [ex()],
    };
    expect(getPlanExerciseCount(plan({ id: 'p', name: 'P', days: [d] }))).toBe(3);
  });

  it('sums shared and all days', () => {
    const d: PlanDay = {
      id: 'd1',
      name: 'Day',
      weekdays: [],
      coreExercises: [ex()],
      optionalExercises: [ex()],
    };
    expect(
      getPlanExerciseCount(
        plan({ id: 'p', name: 'P', sharedExercises: [ex()], days: [d, day(['chest'])] }),
      ),
    ).toBe(4);
  });

  it('is zero for an empty plan', () => {
    expect(getPlanExerciseCount(plan({ id: 'p', name: 'P' }))).toBe(0);
  });
});

describe('getPlanUniqueExerciseCount', () => {
  function named(name: string): PlanExercise {
    return { id: `e-${name}-${Math.random()}`, name, type: 'sets-reps', role: 'core' };
  }
  function dayWith(core: PlanExercise[], optional: PlanExercise[] = []): PlanDay {
    return {
      id: `d-${Math.random()}`,
      name: 'Day',
      weekdays: [],
      coreExercises: core,
      optionalExercises: optional,
    };
  }

  it('is zero for an empty plan', () => {
    expect(getPlanUniqueExerciseCount(plan({ id: 'p', name: 'P' }))).toBe(0);
  });

  it('counts distinct names across shared and all days', () => {
    const p = plan({
      id: 'p',
      name: 'P',
      sharedExercises: [named('Plank')],
      days: [dayWith([named('Bench Press'), named('Squat')], [named('Curl')])],
    });
    expect(getPlanUniqueExerciseCount(p)).toBe(4);
  });

  it('deduplicates the same movement repeated across days (case-insensitive)', () => {
    const p = plan({
      id: 'p',
      name: 'P',
      days: [dayWith([named('Bench Press')]), dayWith([named('bench press '), named('Squat')])],
    });
    expect(getPlanUniqueExerciseCount(p)).toBe(2);
  });
});

describe('getPlanPlannedOccurrences', () => {
  function dayOn(weekdays: number[]): PlanDay {
    return {
      id: `d-${weekdays.join('')}`,
      name: 'Day',
      weekdays,
      coreExercises: [],
      optionalExercises: [],
    };
  }

  it('returns null for open-ended plans without scheduledWeeks', () => {
    expect(getPlanPlannedOccurrences(plan({ id: 'p', name: 'P', days: [dayOn([1])] }))).toBeNull();
  });

  it('returns null when scheduledWeeks is set but the plan has no days', () => {
    expect(getPlanPlannedOccurrences(plan({ id: 'p', name: 'P', scheduledWeeks: 8 }))).toBeNull();
  });

  it('multiplies weeks by total scheduled weekday slots', () => {
    // 8 weeks × (Mon + Thu = 2 weekly slots) = 16
    const p = plan({ id: 'p', name: 'P', scheduledWeeks: 8, days: [dayOn([1]), dayOn([4])] });
    expect(getPlanPlannedOccurrences(p)).toBe(16);
  });

  it('counts multiple weekdays on a single day', () => {
    // 4 weeks × (one day scheduled Mon + Thu = 2 slots) = 8
    const p = plan({ id: 'p', name: 'P', scheduledWeeks: 4, days: [dayOn([1, 4])] });
    expect(getPlanPlannedOccurrences(p)).toBe(8);
  });

  it('falls back to the day count when no weekdays are assigned', () => {
    // 6 weeks × 3 days (no weekdays scheduled) = 18
    const p = plan({
      id: 'p',
      name: 'P',
      scheduledWeeks: 6,
      days: [dayOn([]), dayOn([]), dayOn([])],
    });
    expect(getPlanPlannedOccurrences(p)).toBe(18);
  });
});

describe('organizePlans sorting', () => {
  const a = plan({
    id: 'a',
    name: 'beta',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-05-01T00:00:00Z',
  });
  const b = plan({
    id: 'b',
    name: 'Alpha',
    createdAt: '2026-03-01T00:00:00Z',
    updatedAt: '2026-02-01T00:00:00Z',
  });
  const plans = [a, b];

  it('sorts by recently created, newest first', () => {
    const result = organizePlans(plans, [], query({ sort: 'created' }));
    expect(result.map((p) => p.id)).toEqual(['b', 'a']);
  });

  it('sorts by last updated, most recent first', () => {
    const result = organizePlans(plans, [], query({ sort: 'updated' }));
    expect(result.map((p) => p.id)).toEqual(['a', 'b']);
  });

  it('sorts by name case-insensitively', () => {
    const result = organizePlans(plans, [], query({ sort: 'name' }));
    expect(result.map((p) => p.id)).toEqual(['b', 'a']);
  });

  it('sorts followed plans before never-followed, latest first', () => {
    const sessions = [session({ id: 's1', planId: 'a', completedAt: '2026-04-01T09:00:00Z' })];
    const c = plan({ id: 'c', name: 'gamma', createdAt: '2026-06-01T00:00:00Z' });
    const result = organizePlans([a, b, c], sessions, query({ sort: 'followed' }));
    // a is followed; b and c never followed, tiebroken by createdAt desc (c newer than b)
    expect(result.map((p) => p.id)).toEqual(['a', 'c', 'b']);
  });

  it('sorts by follow count, most followed first', () => {
    const c = plan({ id: 'c', name: 'gamma', createdAt: '2026-06-01T00:00:00Z' });
    const sessions = [
      session({ id: 's1', planId: 'b', completedAt: '2026-02-01T09:00:00Z' }),
      session({ id: 's2', planId: 'b', completedAt: '2026-03-01T09:00:00Z' }),
      session({ id: 's3', planId: 'b', completedAt: '2026-04-01T09:00:00Z' }),
      session({ id: 's4', planId: 'a', completedAt: '2026-02-01T09:00:00Z' }),
      // c has no completed sessions; a has 1, b has 3
    ];
    const result = organizePlans([a, b, c], sessions, query({ sort: 'mostFollowed' }));
    expect(result.map((p) => p.id)).toEqual(['b', 'a', 'c']);
  });

  it('tiebreaks equal follow counts by createdAt desc', () => {
    const c = plan({ id: 'c', name: 'gamma', createdAt: '2026-06-01T00:00:00Z' });
    const result = organizePlans([a, b, c], [], query({ sort: 'mostFollowed' }));
    expect(result.map((p) => p.id)).toEqual(['c', 'b', 'a']);
  });
});

describe('organizePlans search', () => {
  const plans = [plan({ id: 'a', name: 'Upper Body Split' }), plan({ id: 'b', name: 'Leg Day' })];

  it('matches by case-insensitive substring', () => {
    expect(organizePlans(plans, [], query({ search: 'body' })).map((p) => p.id)).toEqual(['a']);
  });

  it('returns all plans for an empty search', () => {
    expect(organizePlans(plans, [], query({ search: '  ' }))).toHaveLength(2);
  });

  it('returns nothing when no name matches', () => {
    expect(organizePlans(plans, [], query({ search: 'cardio' }))).toHaveLength(0);
  });
});

describe('organizePlans filters', () => {
  const active = plan({ id: 'act', name: 'Active', status: 'active' });
  const done = plan({ id: 'done', name: 'Done', status: 'completed' });
  const ai = plan({ id: 'ai', name: 'AI Plan', aiGenerated: true });
  const manual = plan({ id: 'man', name: 'Manual' });
  const chest = plan({ id: 'chest', name: 'Chest', days: [day(['chest'])] });
  const back = plan({ id: 'back', name: 'Back', days: [day(['back']), day(['back'])] });

  function filters(overrides: Partial<PlanFilters>): PlanFilters {
    return { ...DEFAULT_PLAN_FILTERS, status: 'all', ...overrides };
  }

  it('filters by status', () => {
    const plans = [active, done];
    expect(
      organizePlans(plans, [], query({ filters: filters({ status: 'active' }) })).map((p) => p.id),
    ).toEqual(['act']);
    expect(
      organizePlans(plans, [], query({ filters: filters({ status: 'completed' }) })).map(
        (p) => p.id,
      ),
    ).toEqual(['done']);
  });

  it('filters by AI-generated origin', () => {
    const plans = [ai, manual];
    expect(
      organizePlans(plans, [], query({ filters: filters({ aiGenerated: 'ai' }) })).map((p) => p.id),
    ).toEqual(['ai']);
    expect(
      organizePlans(plans, [], query({ filters: filters({ aiGenerated: 'manual' }) })).map(
        (p) => p.id,
      ),
    ).toEqual(['man']);
  });

  it('filters by muscle trained', () => {
    expect(
      organizePlans([chest, back], [], query({ filters: filters({ muscle: 'chest' }) })).map(
        (p) => p.id,
      ),
    ).toEqual(['chest']);
  });

  it('filters by training-day count', () => {
    expect(
      organizePlans([chest, back], [], query({ filters: filters({ trainingDays: 2 }) })).map(
        (p) => p.id,
      ),
    ).toEqual(['back']);
  });
});

describe('availableMuscles / availableDayCounts', () => {
  it('returns distinct muscles in canonical order', () => {
    const plans = [
      plan({ id: 'a', name: 'A', days: [day(['back', 'chest'])] }),
      plan({ id: 'b', name: 'B', sharedExercises: [ex('chest')] }),
    ];
    expect(availableMuscles(plans)).toEqual(['chest', 'back']);
  });

  it('returns distinct day counts ascending', () => {
    const plans = [
      plan({ id: 'a', name: 'A', days: [day(), day(), day()] }),
      plan({ id: 'b', name: 'B', days: [day()] }),
      plan({ id: 'c', name: 'C', days: [day(), day(), day()] }),
    ];
    expect(availableDayCounts(plans)).toEqual([1, 3]);
  });
});

describe('countActiveFilters', () => {
  it('is zero for default filters', () => {
    expect(countActiveFilters(DEFAULT_PLAN_FILTERS)).toBe(0);
  });

  it('counts each non-default filter', () => {
    expect(
      countActiveFilters({
        status: 'completed',
        aiGenerated: 'ai',
        muscle: 'chest',
        trainingDays: null,
      }),
    ).toBe(3);
  });
});
