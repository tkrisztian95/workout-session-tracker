import { beforeEach, describe, expect, it } from 'vitest';
import {
  buildAiContext,
  summariseSessionToSummary,
  RECENT_SESSIONS_LIMIT,
  type SessionSummary,
} from './context';
import type { LoggedSet, WorkoutPlan, WorkoutSession } from '../types';

const KEYS = {
  plans: 'wst_plans',
  sessions: 'wst_sessions',
  userName: 'wst_user_name',
  userSex: 'wst_user_sex',
  userAge: 'wst_user_age',
  userHeightCm: 'wst_user_height_cm',
  userWeightKg: 'wst_user_weight_kg',
  locale: 'wst_locale',
} as const;

beforeEach(() => {
  localStorage.clear();
});

function makePlan(overrides: Partial<WorkoutPlan> = {}): WorkoutPlan {
  return {
    id: overrides.id ?? 'plan-1',
    name: overrides.name ?? 'PPL',
    days: overrides.days ?? [
      { id: 'day-push', name: 'Push', weekdays: [1], coreExercises: [], optionalExercises: [] },
    ],
    sharedExercises: overrides.sharedExercises ?? [],
    createdAt: overrides.createdAt ?? '2026-01-01T00:00:00.000Z',
    updatedAt: overrides.updatedAt ?? '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

function makeLoggedSet(weight: number, reps: number): LoggedSet {
  return { weight, reps, loggedAt: '2026-05-01T08:00:00.000Z' };
}

function makeSession(overrides: Partial<WorkoutSession> = {}): WorkoutSession {
  return {
    id: overrides.id ?? 'session-1',
    startedAt: overrides.startedAt ?? '2026-05-01T08:00:00.000Z',
    completedAt: overrides.completedAt ?? '2026-05-01T09:00:00.000Z',
    exercises: overrides.exercises ?? [],
    ...overrides,
  };
}

describe('buildAiContext — empty state', () => {
  it('returns a coherent envelope when localStorage is empty', () => {
    const ctx = buildAiContext('plan-suggest');

    expect(ctx.language).toBeNull();
    expect(ctx.profile).toEqual({});
    expect(ctx.activePlans).toEqual([]);
    expect(ctx.recentSessions).toEqual([]);
    expect(ctx.progression).toEqual([]);
    expect(ctx.exerciseHistoryNames).toEqual([]);
  });

  it('leaves deferred fields undefined in Phase 1', () => {
    const ctx = buildAiContext('plan-suggest');

    expect(ctx.preferences).toBeUndefined();
    expect(ctx.evaluation).toBeUndefined();
    expect(ctx.likes).toBeUndefined();
  });
});

describe('buildAiContext — populated', () => {
  it('reads body metrics, locale, plans, and sessions through storage', () => {
    localStorage.setItem(KEYS.userName, 'Test User');
    localStorage.setItem(KEYS.userSex, 'female');
    localStorage.setItem(KEYS.userAge, '28');
    localStorage.setItem(KEYS.userHeightCm, '170');
    localStorage.setItem(KEYS.userWeightKg, '65');
    localStorage.setItem(KEYS.locale, 'hu');
    localStorage.setItem(KEYS.plans, JSON.stringify([makePlan({ status: 'active' })]));
    localStorage.setItem(
      KEYS.sessions,
      JSON.stringify([
        makeSession({
          id: 's1',
          completedAt: '2026-05-10T09:00:00.000Z',
          exercises: [
            {
              id: 'e1',
              name: 'Bench Press',
              type: 'sets-reps',
              loggedSets: [makeLoggedSet(70, 8)],
            },
          ],
        }),
      ]),
    );

    const ctx = buildAiContext('plan-suggest');

    expect(ctx.language).toBe('hu');
    expect(ctx.profile).toEqual({
      name: 'Test User',
      sex: 'female',
      age: 28,
      heightCm: 170,
      weightKg: 65,
    });
    expect(ctx.activePlans).toHaveLength(1);
    expect(ctx.recentSessions).toHaveLength(1);
    expect(ctx.recentSessions[0].id).toBe('s1');
    expect(ctx.recentSessions[0].topExercises[0]).toMatchObject({
      name: 'Bench Press',
      bestWeightKg: 70,
      sets: 1,
    });
  });

  it('filters completed plans out of activePlans', () => {
    localStorage.setItem(
      KEYS.plans,
      JSON.stringify([
        makePlan({ id: 'p1', status: 'active' }),
        makePlan({ id: 'p2', status: 'completed' }),
      ]),
    );

    const ctx = buildAiContext('plan-suggest');

    expect(ctx.activePlans.map((p) => p.id)).toEqual(['p1']);
  });
});

describe('buildAiContext — recentSessions invariants', () => {
  it('sorts newest-first and caps at RECENT_SESSIONS_LIMIT (20)', () => {
    const sessions: WorkoutSession[] = [];
    // 100 sessions across 100 distinct days, oldest first in storage.
    const base = Date.parse('2026-01-01T00:00:00.000Z');
    for (let i = 0; i < 100; i++) {
      const day = new Date(base + i * 86_400_000).toISOString().slice(0, 10);
      sessions.push(
        makeSession({
          id: `s-${i}`,
          startedAt: `${day}T08:00:00.000Z`,
          completedAt: `${day}T09:00:00.000Z`,
        }),
      );
    }
    localStorage.setItem(KEYS.sessions, JSON.stringify(sessions));

    const ctx = buildAiContext('plan-suggest');

    expect(RECENT_SESSIONS_LIMIT).toBe(20);
    expect(ctx.recentSessions).toHaveLength(20);

    // Newest first
    const dates = ctx.recentSessions.map((s) => s.completedAt);
    const sorted = [...dates].sort().reverse();
    expect(dates).toEqual(sorted);
    expect(ctx.recentSessions[0].id).toBe('s-99');
  });

  it('excludes sessions with missing completedAt', () => {
    localStorage.setItem(
      KEYS.sessions,
      JSON.stringify([
        makeSession({ id: 'good', completedAt: '2026-05-10T09:00:00.000Z' }),
        // Falsy completedAt must be dropped:
        makeSession({ id: 'bad', completedAt: '' }),
      ]),
    );

    const ctx = buildAiContext('plan-suggest');

    expect(ctx.recentSessions.map((s) => s.id)).toEqual(['good']);
  });
});

describe('summariseSessionToSummary', () => {
  it('does not embed raw loggedSets arrays', () => {
    const session = makeSession({
      exercises: [
        {
          id: 'e1',
          name: 'Bench',
          type: 'sets-reps',
          loggedSets: Array.from({ length: 20 }, (_, i) => makeLoggedSet(50 + i, 5)),
        },
      ],
    });

    const summary = summariseSessionToSummary(session);
    // Round-trip through JSON to mimic what would land in a prompt body.
    const serialized = JSON.stringify(summary);

    expect(serialized).not.toContain('loggedSets');
    expect(serialized).not.toContain('loggedAt');
    // Best weight is captured, but only that single number.
    expect(summary.topExercises[0].bestWeightKg).toBe(69);
    expect(summary.topExercises[0].sets).toBe(20);
  });

  it('resolves planDayName via the supplied plans array', () => {
    const plan = makePlan({
      id: 'plan-x',
      days: [
        { id: 'day-leg', name: 'Legs', weekdays: [], coreExercises: [], optionalExercises: [] },
      ],
    });
    const session = makeSession({ planId: 'plan-x', planDayId: 'day-leg' });

    const summary = summariseSessionToSummary(session, [plan]);

    expect(summary.planId).toBe('plan-x');
    expect(summary.planDayId).toBe('day-leg');
    expect(summary.planDayName).toBe('Legs');
  });

  it('computes durationMin from startedAt / completedAt and totalVolumeKg from sets', () => {
    const session = makeSession({
      startedAt: '2026-05-01T08:00:00.000Z',
      completedAt: '2026-05-01T08:45:30.000Z',
      exercises: [
        {
          id: 'e1',
          name: 'Squat',
          type: 'sets-reps',
          loggedSets: [makeLoggedSet(100, 5), makeLoggedSet(100, 5), makeLoggedSet(100, 5)],
        },
      ],
    });

    const summary: SessionSummary = summariseSessionToSummary(session);

    expect(summary.durationMin).toBe(46);
    expect(summary.totalVolumeKg).toBe(1500);
  });
});
