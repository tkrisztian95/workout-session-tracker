import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getActiveSession,
  getHiddenExercises,
  getLlmConfig,
  getPlans,
  getSessions,
  resolvePlanDaySnapshot,
  saveSession,
  updateSession,
} from './storage';
import type { LoggedSet, WorkoutPlan, WorkoutSession } from './types';

const KEYS = {
  plans: 'wst_plans',
  sessions: 'wst_sessions',
  activeSession: 'wst_active_session',
  hiddenExercises: 'wst_hidden_exercises',
  llmConfig: 'wst_llm_config',
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
    const session = {
      ...legacySession([{ id: 'e1', name: 'Bench', type: 'sets-reps', muscle: 'chest' }]),
      // Already carries a current evaluation, so the backfill pass skips it and
      // this test isolates the category-migration idempotency check.
      evaluation: {
        overall: 'no-plan',
        counts: { overdone: 0, matched: 0, underperformed: 0, missed: 0, extra: 1 },
        v: 1,
      },
    };
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

describe('getActiveSession repsPerSet backfill', () => {
  function activeFromPlan(exercises: unknown[]) {
    return {
      id: 'a1',
      startedAt: '2026-01-01T08:00:00Z',
      exercises,
      planId: 'p1',
      planDayId: 'd1',
      totalPausedMs: 0,
    };
  }

  it('re-derives repsPerSet from the plan day, matching by name', () => {
    const plan = legacyPlan({
      core: [
        {
          id: 'c1',
          name: 'Pull-up',
          type: 'sets-reps',
          role: 'core',
          sets: 4,
          repsPerSet: [10, 9, 8, 7],
        },
      ],
      shared: [
        {
          id: 's1',
          name: 'Push-up',
          type: 'sets-reps',
          role: 'core',
          sets: 3,
          repsPerSet: [15, 12, 10],
        },
      ],
    });
    localStorage.setItem(KEYS.plans, JSON.stringify([plan]));
    localStorage.setItem(
      KEYS.activeSession,
      JSON.stringify(
        activeFromPlan([
          { id: 'e1', name: 'Pull-up', type: 'sets-reps', sets: 4 },
          { id: 'e2', name: 'Push-up', type: 'sets-reps', sets: 3 },
        ]),
      ),
    );

    const loaded = getActiveSession();
    expect(loaded?.exercises[0].repsPerSet).toEqual([10, 9, 8, 7]);
    expect(loaded?.exercises[1].repsPerSet).toEqual([15, 12, 10]);

    const persisted = JSON.parse(localStorage.getItem(KEYS.activeSession)!);
    expect(persisted.exercises[0].repsPerSet).toEqual([10, 9, 8, 7]);
  });

  it('does not touch exercises that already carry a scheme', () => {
    const plan = legacyPlan({
      core: [
        {
          id: 'c1',
          name: 'Pull-up',
          type: 'sets-reps',
          role: 'core',
          sets: 4,
          repsPerSet: [10, 9, 8, 7],
        },
      ],
    });
    localStorage.setItem(KEYS.plans, JSON.stringify([plan]));
    localStorage.setItem(
      KEYS.activeSession,
      JSON.stringify(
        activeFromPlan([
          { id: 'e1', name: 'Pull-up', type: 'sets-reps', sets: 4, repsPerSet: [5, 5, 5, 5] },
        ]),
      ),
    );
    const before = localStorage.getItem(KEYS.activeSession);
    const loaded = getActiveSession();
    expect(loaded?.exercises[0].repsPerSet).toEqual([5, 5, 5, 5]);
    expect(localStorage.getItem(KEYS.activeSession)).toBe(before);
  });

  it('is a no-op for free sessions (no planId/planDayId)', () => {
    const active = {
      id: 'a1',
      startedAt: '2026-01-01T08:00:00Z',
      exercises: [{ id: 'e1', name: 'Pull-up', type: 'sets-reps', sets: 4 }],
      totalPausedMs: 0,
    };
    localStorage.setItem(KEYS.activeSession, JSON.stringify(active));
    const before = localStorage.getItem(KEYS.activeSession);
    const loaded = getActiveSession();
    expect(loaded?.exercises[0].repsPerSet).toBeUndefined();
    expect(localStorage.getItem(KEYS.activeSession)).toBe(before);
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

describe('getLlmConfig env-var fallback', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('returns null when nothing is saved and no env var is set', () => {
    expect(getLlmConfig()).toBeNull();
  });

  it('returns a config synthesized from the env var in local dev', () => {
    vi.stubEnv('NEXT_PUBLIC_OPENAI_API_KEY', 'sk-env-key');
    vi.stubEnv('NODE_ENV', 'development');
    expect(getLlmConfig()).toEqual({
      provider: 'openai',
      apiKey: 'sk-env-key',
      model: 'gpt-4o-mini',
    });
  });

  it('honors the env var in a Vercel preview deployment', () => {
    vi.stubEnv('NEXT_PUBLIC_OPENAI_API_KEY', 'sk-env-key');
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('NEXT_PUBLIC_VERCEL_ENV', 'preview');
    expect(getLlmConfig()?.apiKey).toBe('sk-env-key');
  });

  it('uses NEXT_PUBLIC_OPENAI_MODEL when provided', () => {
    vi.stubEnv('NEXT_PUBLIC_OPENAI_API_KEY', 'sk-env-key');
    vi.stubEnv('NEXT_PUBLIC_OPENAI_MODEL', 'gpt-4o');
    vi.stubEnv('NODE_ENV', 'development');
    expect(getLlmConfig()?.model).toBe('gpt-4o');
  });

  it('ignores the env var in a production deployment (gate fails closed)', () => {
    vi.stubEnv('NEXT_PUBLIC_OPENAI_API_KEY', 'sk-env-key');
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('NEXT_PUBLIC_VERCEL_ENV', 'production');
    expect(getLlmConfig()).toBeNull();
  });

  it('ignores the env var when the environment cannot be confirmed non-production', () => {
    vi.stubEnv('NEXT_PUBLIC_OPENAI_API_KEY', 'sk-env-key');
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('NEXT_PUBLIC_VERCEL_ENV', '');
    expect(getLlmConfig()).toBeNull();
  });

  it('lets a saved localStorage config take precedence over the env var', () => {
    vi.stubEnv('NEXT_PUBLIC_OPENAI_API_KEY', 'sk-env-key');
    vi.stubEnv('NODE_ENV', 'development');
    localStorage.setItem(
      KEYS.llmConfig,
      JSON.stringify({ provider: 'openai', apiKey: 'sk-saved-key', model: 'gpt-4o' }),
    );
    expect(getLlmConfig()?.apiKey).toBe('sk-saved-key');
  });

  it('synthesizes a Gemini config from the Gemini env var', () => {
    vi.stubEnv('NEXT_PUBLIC_GEMINI_API_KEY', 'AIza-env-key');
    vi.stubEnv('NODE_ENV', 'development');
    expect(getLlmConfig()).toEqual({
      provider: 'gemini',
      apiKey: 'AIza-env-key',
      model: 'gemini-2.5-flash',
    });
  });

  it('uses NEXT_PUBLIC_GEMINI_MODEL when provided', () => {
    vi.stubEnv('NEXT_PUBLIC_GEMINI_API_KEY', 'AIza-env-key');
    vi.stubEnv('NEXT_PUBLIC_GEMINI_MODEL', 'gemini-2.5-pro');
    vi.stubEnv('NODE_ENV', 'development');
    expect(getLlmConfig()?.model).toBe('gemini-2.5-pro');
  });

  it('prefers OpenAI over Gemini when both env keys are set', () => {
    vi.stubEnv('NEXT_PUBLIC_OPENAI_API_KEY', 'sk-env-key');
    vi.stubEnv('NEXT_PUBLIC_GEMINI_API_KEY', 'AIza-env-key');
    vi.stubEnv('NODE_ENV', 'development');
    expect(getLlmConfig()?.provider).toBe('openai');
  });

  it('ignores the Gemini env var in production (gate fails closed)', () => {
    vi.stubEnv('NEXT_PUBLIC_GEMINI_API_KEY', 'AIza-env-key');
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('NEXT_PUBLIC_VERCEL_ENV', 'production');
    expect(getLlmConfig()).toBeNull();
  });
});

// ─── Session evaluation + plan-day snapshot ───────────────────────────────────

const loggedSet = (weight: number, reps: number): LoggedSet => ({
  weight,
  reps,
  loggedAt: '2026-06-07T10:00:00.000Z',
});

function pushDayPlan(): WorkoutPlan {
  return {
    id: 'plan-1',
    name: 'PPL',
    days: [
      {
        id: 'day-1',
        name: 'Push',
        weekdays: [1],
        coreExercises: [
          { id: 'pe1', name: 'Bench', type: 'sets-reps', sets: 3, reps: 8, role: 'core' },
        ],
        optionalExercises: [],
      },
    ],
    sharedExercises: [],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };
}

function planSession(over: Partial<WorkoutSession> = {}): WorkoutSession {
  return {
    id: 'sess-1',
    startedAt: '2026-06-07T09:00:00.000Z',
    completedAt: '2026-06-07T10:00:00.000Z',
    planId: 'plan-1',
    planDayId: 'day-1',
    exercises: [
      {
        id: 'e1',
        name: 'Bench',
        type: 'sets-reps',
        loggedSets: [loggedSet(60, 8), loggedSet(60, 8), loggedSet(60, 8)],
      },
    ],
    ...over,
  };
}

describe('resolvePlanDaySnapshot', () => {
  it('deep-copies the origin plan day and carries the plan name', () => {
    localStorage.setItem(KEYS.plans, JSON.stringify([pushDayPlan()]));
    const snapshot = resolvePlanDaySnapshot({ planId: 'plan-1', planDayId: 'day-1' });
    expect(snapshot?.planName).toBe('PPL');
    expect(snapshot?.day).toEqual(pushDayPlan().days[0]);
    expect(typeof snapshot?.capturedAt).toBe('string');
  });

  it('is undefined for a free session', () => {
    expect(resolvePlanDaySnapshot({})).toBeUndefined();
  });

  it('is undefined when the origin plan no longer exists', () => {
    localStorage.setItem(KEYS.plans, JSON.stringify([pushDayPlan()]));
    expect(resolvePlanDaySnapshot({ planId: 'gone', planDayId: 'day-1' })).toBeUndefined();
  });
});

describe('saveSession evaluation', () => {
  it('captures the plan-day snapshot and a v1 evaluation for a plan session', () => {
    localStorage.setItem(KEYS.plans, JSON.stringify([pushDayPlan()]));
    saveSession(planSession());
    const [stored] = JSON.parse(localStorage.getItem(KEYS.sessions)!) as WorkoutSession[];
    expect(stored.evaluation?.v).toBe(1);
    expect(stored.evaluation?.overall).toBe('on-target');
    expect(stored.planDaySnapshot?.day).toEqual(pushDayPlan().days[0]);
  });

  it('records a no-plan evaluation and no snapshot for a free session', () => {
    saveSession(planSession({ id: 'free-1', planId: undefined, planDayId: undefined, rating: 4 }));
    const [stored] = JSON.parse(localStorage.getItem(KEYS.sessions)!) as WorkoutSession[];
    expect(stored.evaluation?.overall).toBe('no-plan');
    expect(stored.planDaySnapshot).toBeUndefined();
    expect(stored.evaluation?.rating).toBe(4);
  });
});

describe('updateSession evaluation', () => {
  it('recomputes against the existing snapshot without re-capturing it', () => {
    localStorage.setItem(KEYS.plans, JSON.stringify([pushDayPlan()]));
    saveSession(planSession());
    const stored = getSessions()[0];
    expect(stored.evaluation?.overall).toBe('on-target');
    const snapshotBefore = JSON.stringify(stored.planDaySnapshot);

    // Add a 4th qualifying set → 4 vs 3 planned → overdone.
    stored.exercises[0].loggedSets!.push(loggedSet(60, 8));
    updateSession(stored);

    const after = getSessions()[0];
    expect(after.evaluation?.overall).toBe('overdone');
    expect(after.evaluation?.counts.overdone).toBe(1);
    expect(JSON.stringify(after.planDaySnapshot)).toBe(snapshotBefore);
  });
});

describe('getSessions evaluation backfill', () => {
  it('gives a legacy session a snapshot + evaluation and persists them', () => {
    localStorage.setItem(KEYS.plans, JSON.stringify([pushDayPlan()]));
    localStorage.setItem(KEYS.sessions, JSON.stringify([planSession()]));

    const [loaded] = getSessions();
    expect(loaded.evaluation?.v).toBe(1);
    expect(loaded.planDaySnapshot?.day).toEqual(pushDayPlan().days[0]);

    const [persisted] = JSON.parse(localStorage.getItem(KEYS.sessions)!) as WorkoutSession[];
    expect(persisted.evaluation?.v).toBe(1);
    expect(persisted.planDaySnapshot).toBeTruthy();
  });

  it('does not rewrite storage on a second read', () => {
    localStorage.setItem(KEYS.plans, JSON.stringify([pushDayPlan()]));
    localStorage.setItem(KEYS.sessions, JSON.stringify([planSession()]));
    getSessions();
    const afterFirst = localStorage.getItem(KEYS.sessions);
    getSessions();
    expect(localStorage.getItem(KEYS.sessions)).toBe(afterFirst);
  });

  it('backfills a dangling-plan session as no-plan with volume totals, no snapshot', () => {
    localStorage.setItem(KEYS.sessions, JSON.stringify([planSession({ planId: 'deleted-plan' })]));
    const [loaded] = getSessions();
    expect(loaded.evaluation?.overall).toBe('no-plan');
    expect(loaded.planDaySnapshot).toBeUndefined();
    expect(loaded.evaluation?.totalVolumeKg).toBe(60 * 8 * 3);
  });
});
