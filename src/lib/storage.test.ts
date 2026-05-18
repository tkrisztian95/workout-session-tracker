import { beforeEach, describe, expect, it } from 'vitest';
import { getActiveSession, getHiddenExercises, getPlans, getSessions } from './storage';

const KEYS = {
  plans: 'wst_plans',
  sessions: 'wst_sessions',
  activeSession: 'wst_active_session',
  hiddenExercises: 'wst_hidden_exercises',
} as const;

function legacySession(exercises: unknown[]) {
  return {
    id: 's1',
    startedAt: '2026-01-01T08:00:00Z',
    completedAt: '2026-01-01T09:00:00Z',
    exercises,
  };
}

function legacyPlan(
  opts: {
    core?: unknown[];
    optional?: unknown[];
    shared?: unknown[];
  } = {},
) {
  return {
    id: 'p1',
    name: 'Plan',
    days: [
      {
        id: 'd1',
        name: 'Day 1',
        weekdays: [1],
        coreExercises: opts.core ?? [],
        optionalExercises: opts.optional ?? [],
      },
    ],
    sharedExercises: opts.shared ?? [],
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  };
}

beforeEach(() => {
  localStorage.clear();
});

describe('getSessions migration', () => {
  it('rewrites legacy category to muscle and persists', () => {
    const session = legacySession([
      { id: 'e1', name: 'Bench', type: 'sets-reps', category: 'Chest' },
      { id: 'e2', name: 'Squat', type: 'sets-reps', category: 'Legs' },
      { id: 'e3', name: 'Curl', type: 'sets-reps', category: 'Core' },
    ]);
    localStorage.setItem(KEYS.sessions, JSON.stringify([session]));

    const loaded = getSessions();
    expect(loaded[0].exercises.map((e) => e.muscle)).toEqual(['chest', 'quads', 'abs']);
    for (const ex of loaded[0].exercises) {
      expect((ex as { category?: string }).category).toBeUndefined();
    }

    const persisted = JSON.parse(localStorage.getItem(KEYS.sessions)!);
    expect(persisted[0].exercises[0].muscle).toBe('chest');
    expect(persisted[0].exercises[0].category).toBeUndefined();
  });

  it('drops unknown legacy category values without muscle', () => {
    const session = legacySession([
      { id: 'e1', name: 'Whatever', type: 'sets-reps', category: 'Forearms' },
    ]);
    localStorage.setItem(KEYS.sessions, JSON.stringify([session]));
    const loaded = getSessions();
    expect(loaded[0].exercises[0].muscle).toBeUndefined();
    expect((loaded[0].exercises[0] as { category?: string }).category).toBeUndefined();
  });

  it('does NOT rewrite when no legacy category present (idempotent)', () => {
    const session = legacySession([
      { id: 'e1', name: 'Bench', type: 'sets-reps', muscle: 'chest' },
    ]);
    localStorage.setItem(KEYS.sessions, JSON.stringify([session]));
    const before = localStorage.getItem(KEYS.sessions);
    getSessions();
    expect(localStorage.getItem(KEYS.sessions)).toBe(before);
  });

  it('handles mixed legacy + migrated records in the same session', () => {
    const session = legacySession([
      { id: 'e1', name: 'Bench', type: 'sets-reps', muscle: 'chest' }, // already migrated
      { id: 'e2', name: 'Squat', type: 'sets-reps', category: 'Legs' }, // legacy
    ]);
    localStorage.setItem(KEYS.sessions, JSON.stringify([session]));
    const loaded = getSessions();
    expect(loaded[0].exercises[0].muscle).toBe('chest');
    expect(loaded[0].exercises[1].muscle).toBe('quads');
  });
});

describe('getPlans migration', () => {
  it('rewrites legacy category in core, optional, and shared exercises', () => {
    const plan = legacyPlan({
      core: [{ id: 'c1', name: 'Bench', type: 'sets-reps', role: 'core', category: 'Chest' }],
      optional: [{ id: 'o1', name: 'Curl', type: 'sets-reps', role: 'optional', category: 'Arms' }],
      shared: [{ id: 's1', name: 'Plank', type: 'duration', role: 'core', category: 'Abs' }],
    });
    localStorage.setItem(KEYS.plans, JSON.stringify([plan]));

    const loaded = getPlans();
    expect(loaded[0].days[0].coreExercises[0].muscle).toBe('chest');
    expect(loaded[0].days[0].optionalExercises[0].muscle).toBe('arms');
    expect(loaded[0].sharedExercises[0].muscle).toBe('abs');
  });

  it('is idempotent when all exercises already use muscle', () => {
    const plan = legacyPlan({
      core: [{ id: 'c1', name: 'Bench', type: 'sets-reps', role: 'core', muscle: 'chest' }],
    });
    localStorage.setItem(KEYS.plans, JSON.stringify([plan]));
    const before = localStorage.getItem(KEYS.plans);
    getPlans();
    expect(localStorage.getItem(KEYS.plans)).toBe(before);
  });
});

describe('getActiveSession migration', () => {
  it('rewrites legacy category on active session exercises', () => {
    const active = {
      id: 'a1',
      startedAt: '2026-01-01T08:00:00Z',
      exercises: [{ id: 'e1', name: 'Bench', type: 'sets-reps', category: 'Chest' }],
      totalPausedMs: 0,
    };
    localStorage.setItem(KEYS.activeSession, JSON.stringify(active));
    const loaded = getActiveSession();
    expect(loaded?.exercises[0].muscle).toBe('chest');
  });
});

describe('getHiddenExercises migration', () => {
  it('rewrites legacy category to muscle on hidden entries', () => {
    localStorage.setItem(
      KEYS.hiddenExercises,
      JSON.stringify([{ nameKey: 'squat', category: 'Legs' }]),
    );
    const loaded = getHiddenExercises();
    expect(loaded).toEqual([{ nameKey: 'squat', muscle: 'quads' }]);
  });
});
