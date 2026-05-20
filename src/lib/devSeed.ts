import type {
  Exercise,
  LoggedSet,
  PlanDay,
  PlanExercise,
  WorkoutPlan,
  WorkoutSession,
} from './types';

const SEED_FLAG = 'wst_dev_seeded';
const SEED_VERSION = '1';
const PLAN_ID = 'seed-plan-ppl';

function isoDaysAgo(days: number, hour = 18, minute = 0): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

function loggedSet(weight: number, reps: number, loggedAt: string): LoggedSet {
  return { weight, reps, loggedAt };
}

function planExercise(
  id: string,
  name: string,
  partial: Omit<PlanExercise, 'id' | 'name' | 'role'> & { role?: PlanExercise['role'] },
): PlanExercise {
  return { id, name, role: partial.role ?? 'core', ...partial };
}

function buildPlan(now: string): WorkoutPlan {
  const days: PlanDay[] = [
    {
      id: 'seed-day-push',
      name: 'Push',
      weekdays: [1],
      coreExercises: [
        planExercise('seed-ex-push-1', 'Bench Press', {
          type: 'sets-reps',
          sets: 4,
          reps: 8,
          weightKg: 60,
          muscle: 'chest',
          role: 'core',
        }),
        planExercise('seed-ex-push-2', 'Overhead Press', {
          type: 'sets-reps',
          sets: 3,
          reps: 10,
          weightKg: 35,
          muscle: 'shoulders',
          role: 'core',
        }),
        planExercise('seed-ex-push-3', 'Triceps Pushdown', {
          type: 'sets-reps',
          sets: 3,
          reps: 12,
          weightKg: 25,
          muscle: 'arms',
          role: 'core',
        }),
      ],
      optionalExercises: [
        planExercise('seed-ex-push-4', 'Plank', {
          type: 'duration',
          duration: 60,
          muscle: 'abs',
          role: 'optional',
        }),
      ],
    },
    {
      id: 'seed-day-pull',
      name: 'Pull',
      weekdays: [3],
      coreExercises: [
        planExercise('seed-ex-pull-1', 'Deadlift', {
          type: 'sets-reps',
          sets: 4,
          repsPerSet: [8, 6, 4, 4],
          weightKg: 100,
          muscle: 'back',
          role: 'core',
        }),
        planExercise('seed-ex-pull-2', 'Pull-Up', {
          type: 'sets-reps',
          sets: 4,
          reps: 8,
          muscle: 'back',
          role: 'core',
        }),
        planExercise('seed-ex-pull-3', 'Barbell Row', {
          type: 'sets-reps',
          sets: 3,
          reps: 10,
          weightKg: 55,
          muscle: 'back',
          role: 'core',
        }),
        planExercise('seed-ex-pull-4', 'Bicep Curl', {
          type: 'sets-reps',
          sets: 3,
          reps: 12,
          weightKg: 12,
          muscle: 'arms',
          role: 'core',
        }),
      ],
      optionalExercises: [],
    },
    {
      id: 'seed-day-legs',
      name: 'Legs',
      weekdays: [5],
      coreExercises: [
        planExercise('seed-ex-legs-1', 'Back Squat', {
          type: 'sets-reps',
          sets: 4,
          reps: 8,
          weightKg: 80,
          muscle: 'quads',
          role: 'core',
        }),
        planExercise('seed-ex-legs-2', 'Romanian Deadlift', {
          type: 'sets-reps',
          sets: 3,
          reps: 10,
          weightKg: 70,
          muscle: 'hamstrings',
          role: 'core',
        }),
        planExercise('seed-ex-legs-3', 'Walking Lunge', {
          type: 'sets-reps',
          sets: 3,
          reps: 12,
          weightKg: 20,
          muscle: 'glutes',
          role: 'core',
        }),
        planExercise('seed-ex-legs-4', 'Standing Calf Raise', {
          type: 'sets-reps',
          sets: 4,
          reps: 15,
          weightKg: 40,
          muscle: 'calves',
          role: 'core',
        }),
      ],
      optionalExercises: [
        planExercise('seed-ex-legs-5', 'Easy Cardio', {
          type: 'duration',
          duration: 600,
          muscle: 'cardio',
          role: 'optional',
        }),
      ],
    },
  ];

  return {
    id: PLAN_ID,
    name: 'Push / Pull / Legs',
    days,
    sharedExercises: [],
    createdAt: now,
    updatedAt: now,
    status: 'active',
  };
}

function exerciseFromPlan(planEx: PlanExercise, sets: LoggedSet[]): Exercise {
  const completedAt = sets.at(-1)?.loggedAt;
  return {
    id: `${planEx.id}-logged`,
    name: planEx.name,
    type: planEx.type,
    sets: planEx.sets,
    reps: planEx.reps,
    repsPerSet: planEx.repsPerSet,
    duration: planEx.duration,
    weightKg: planEx.weightKg,
    muscle: planEx.muscle,
    completed: true,
    completedAt,
    loggedSets: sets,
  };
}

function buildSessions(plan: WorkoutPlan): WorkoutSession[] {
  const push = plan.days[0];
  const pull = plan.days[1];
  const legs = plan.days[2];

  return [
    {
      id: 'seed-session-1',
      startedAt: isoDaysAgo(12, 18, 0),
      completedAt: isoDaysAgo(12, 19, 5),
      planId: plan.id,
      planDayId: legs.id,
      rating: 4,
      exercises: [
        exerciseFromPlan(legs.coreExercises[0], [
          loggedSet(75, 8, isoDaysAgo(12, 18, 5)),
          loggedSet(75, 8, isoDaysAgo(12, 18, 8)),
          loggedSet(75, 7, isoDaysAgo(12, 18, 12)),
          loggedSet(75, 6, isoDaysAgo(12, 18, 16)),
        ]),
        exerciseFromPlan(legs.coreExercises[1], [
          loggedSet(65, 10, isoDaysAgo(12, 18, 22)),
          loggedSet(65, 10, isoDaysAgo(12, 18, 26)),
          loggedSet(65, 9, isoDaysAgo(12, 18, 30)),
        ]),
        exerciseFromPlan(legs.coreExercises[3], [
          loggedSet(40, 15, isoDaysAgo(12, 18, 50)),
          loggedSet(40, 15, isoDaysAgo(12, 18, 53)),
          loggedSet(40, 14, isoDaysAgo(12, 18, 56)),
          loggedSet(40, 12, isoDaysAgo(12, 18, 59)),
        ]),
      ],
    },
    {
      id: 'seed-session-2',
      startedAt: isoDaysAgo(10, 7, 30),
      completedAt: isoDaysAgo(10, 8, 25),
      planId: plan.id,
      planDayId: push.id,
      rating: 5,
      exercises: [
        exerciseFromPlan(push.coreExercises[0], [
          loggedSet(57.5, 8, isoDaysAgo(10, 7, 35)),
          loggedSet(57.5, 8, isoDaysAgo(10, 7, 39)),
          loggedSet(57.5, 7, isoDaysAgo(10, 7, 43)),
          loggedSet(57.5, 7, isoDaysAgo(10, 7, 47)),
        ]),
        exerciseFromPlan(push.coreExercises[1], [
          loggedSet(32.5, 10, isoDaysAgo(10, 7, 55)),
          loggedSet(32.5, 10, isoDaysAgo(10, 7, 59)),
          loggedSet(32.5, 9, isoDaysAgo(10, 8, 3)),
        ]),
        exerciseFromPlan(push.coreExercises[2], [
          loggedSet(22.5, 12, isoDaysAgo(10, 8, 10)),
          loggedSet(22.5, 12, isoDaysAgo(10, 8, 13)),
          loggedSet(22.5, 11, isoDaysAgo(10, 8, 16)),
        ]),
      ],
    },
    {
      id: 'seed-session-3',
      startedAt: isoDaysAgo(8, 18, 0),
      completedAt: isoDaysAgo(8, 19, 10),
      planId: plan.id,
      planDayId: pull.id,
      rating: 4,
      exercises: [
        exerciseFromPlan(pull.coreExercises[0], [
          loggedSet(95, 8, isoDaysAgo(8, 18, 8)),
          loggedSet(95, 6, isoDaysAgo(8, 18, 14)),
          loggedSet(95, 4, isoDaysAgo(8, 18, 20)),
          loggedSet(95, 4, isoDaysAgo(8, 18, 26)),
        ]),
        exerciseFromPlan(pull.coreExercises[1], [
          loggedSet(0, 8, isoDaysAgo(8, 18, 35)),
          loggedSet(0, 7, isoDaysAgo(8, 18, 39)),
          loggedSet(0, 6, isoDaysAgo(8, 18, 43)),
          loggedSet(0, 5, isoDaysAgo(8, 18, 47)),
        ]),
        exerciseFromPlan(pull.coreExercises[3], [
          loggedSet(12, 12, isoDaysAgo(8, 19, 0)),
          loggedSet(12, 11, isoDaysAgo(8, 19, 3)),
          loggedSet(12, 10, isoDaysAgo(8, 19, 6)),
        ]),
      ],
    },
    {
      id: 'seed-session-4',
      startedAt: isoDaysAgo(5, 7, 30),
      completedAt: isoDaysAgo(5, 8, 30),
      planId: plan.id,
      planDayId: push.id,
      rating: 5,
      exercises: [
        exerciseFromPlan(push.coreExercises[0], [
          loggedSet(60, 8, isoDaysAgo(5, 7, 35)),
          loggedSet(60, 8, isoDaysAgo(5, 7, 39)),
          loggedSet(60, 8, isoDaysAgo(5, 7, 43)),
          loggedSet(60, 7, isoDaysAgo(5, 7, 47)),
        ]),
        exerciseFromPlan(push.coreExercises[1], [
          loggedSet(35, 10, isoDaysAgo(5, 7, 55)),
          loggedSet(35, 10, isoDaysAgo(5, 7, 59)),
          loggedSet(35, 9, isoDaysAgo(5, 8, 3)),
        ]),
        exerciseFromPlan(push.coreExercises[2], [
          loggedSet(25, 12, isoDaysAgo(5, 8, 12)),
          loggedSet(25, 12, isoDaysAgo(5, 8, 15)),
          loggedSet(25, 12, isoDaysAgo(5, 8, 18)),
        ]),
      ],
    },
    {
      id: 'seed-session-5',
      startedAt: isoDaysAgo(2, 18, 0),
      completedAt: isoDaysAgo(2, 19, 0),
      planId: plan.id,
      planDayId: legs.id,
      rating: 3,
      exercises: [
        exerciseFromPlan(legs.coreExercises[0], [
          loggedSet(80, 8, isoDaysAgo(2, 18, 6)),
          loggedSet(80, 8, isoDaysAgo(2, 18, 10)),
          loggedSet(80, 7, isoDaysAgo(2, 18, 14)),
          loggedSet(80, 6, isoDaysAgo(2, 18, 18)),
        ]),
        exerciseFromPlan(legs.coreExercises[1], [
          loggedSet(70, 10, isoDaysAgo(2, 18, 26)),
          loggedSet(70, 10, isoDaysAgo(2, 18, 30)),
          loggedSet(70, 8, isoDaysAgo(2, 18, 34)),
        ]),
      ],
    },
  ];
}

export type SeedResult =
  | { seeded: true }
  | { seeded: false; reason: 'ssr' | 'already-seeded' | 'user-data-present' };

export function seedDevDataIfEmpty(): SeedResult {
  if (typeof window === 'undefined') return { seeded: false, reason: 'ssr' };

  if (localStorage.getItem(SEED_FLAG) === SEED_VERSION) {
    return { seeded: false, reason: 'already-seeded' };
  }

  const existingPlans = localStorage.getItem('wst_plans');
  const existingSessions = localStorage.getItem('wst_sessions');
  const hasUserData =
    (existingPlans && (JSON.parse(existingPlans) as unknown[]).length > 0) ||
    (existingSessions && (JSON.parse(existingSessions) as unknown[]).length > 0);
  if (hasUserData) {
    localStorage.setItem(SEED_FLAG, SEED_VERSION);
    return { seeded: false, reason: 'user-data-present' };
  }

  const now = new Date().toISOString();
  const plan = buildPlan(now);
  const sessions = buildSessions(plan);

  localStorage.setItem('wst_plans', JSON.stringify([plan]));
  localStorage.setItem('wst_sessions', JSON.stringify(sessions));
  localStorage.setItem('wst_user_name', 'Dev User');
  localStorage.setItem('wst_user_sex', 'male');
  localStorage.setItem('wst_user_age', '30');
  localStorage.setItem('wst_user_height_cm', '180');
  localStorage.setItem('wst_user_weight_kg', '80');
  localStorage.setItem('wst_profile_created_at', isoDaysAgo(30, 12, 0));
  localStorage.setItem('wst_consent_accepted', 'true');
  localStorage.setItem(SEED_FLAG, SEED_VERSION);

  return { seeded: true };
}

export function clearDevSeed(): void {
  if (typeof window === 'undefined') return;
  [
    'wst_plans',
    'wst_sessions',
    'wst_active_session',
    'wst_user_name',
    'wst_user_sex',
    'wst_user_age',
    'wst_user_height_cm',
    'wst_user_weight_kg',
    'wst_profile_created_at',
    'wst_consent_accepted',
    'wst_achievements',
    SEED_FLAG,
  ].forEach((k) => localStorage.removeItem(k));
}
