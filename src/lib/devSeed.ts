import type {
  Exercise,
  LoggedSet,
  PlanDay,
  PlanExercise,
  WorkoutPlan,
  WorkoutSession,
} from './types';

const SEED_FLAG = 'wst_dev_seeded';
const SEED_VERSION = '2';
const PLAN_ID_PPL = 'seed-plan-ppl';
const PLAN_ID_UL = 'seed-plan-ul';
const PLAN_ID_FB = 'seed-plan-fb';

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

function exerciseFromPlan(planEx: PlanExercise, sets: LoggedSet[]): Exercise {
  const completedAt = sets.at(-1)?.loggedAt;
  return {
    id: `${planEx.id}-${sets[0]?.loggedAt ?? 'logged'}`,
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

function adHocExercise(
  id: string,
  name: string,
  type: Exercise['type'],
  muscle: Exercise['muscle'],
  sets: LoggedSet[],
  extra: Partial<Exercise> = {},
): Exercise {
  const completedAt = sets.at(-1)?.loggedAt;
  return {
    id,
    name,
    type,
    muscle,
    completed: true,
    completedAt,
    loggedSets: sets,
    ...extra,
  };
}

// Deterministic PRNG so each fresh seed run produces a consistent timeline.
// Seeded with a fixed value; values drift between runs only if SEED_VERSION
// changes, which is intentional.
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(0xc0ffee);

function jitter(base: number, fraction: number): number {
  const delta = base * fraction * (rand() * 2 - 1);
  return Math.max(0, base + delta);
}

function roundWeight(value: number, step = 2.5): number {
  return Math.round(value / step) * step;
}

function pickWeighted<T>(items: ReadonlyArray<[T, number]>): T {
  const total = items.reduce((s, [, w]) => s + w, 0);
  let r = rand() * total;
  for (const [item, weight] of items) {
    r -= weight;
    if (r <= 0) return item;
  }
  return items[items.length - 1][0];
}

// ─── Plans ────────────────────────────────────────────────────────────────────

function buildPplPlan(now: string): WorkoutPlan {
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
          weightKg: 70,
          muscle: 'chest',
          role: 'core',
        }),
        planExercise('seed-ex-push-2', 'Overhead Press', {
          type: 'sets-reps',
          sets: 3,
          reps: 10,
          weightKg: 40,
          muscle: 'shoulders',
          role: 'core',
        }),
        planExercise('seed-ex-push-3', 'Incline Dumbbell Press', {
          type: 'sets-reps',
          sets: 3,
          reps: 10,
          weightKg: 24,
          muscle: 'chest',
          role: 'core',
        }),
        planExercise('seed-ex-push-4', 'Triceps Pushdown', {
          type: 'sets-reps',
          sets: 3,
          reps: 12,
          weightKg: 30,
          muscle: 'arms',
          role: 'core',
        }),
        planExercise('seed-ex-push-5', 'Lateral Raise', {
          type: 'sets-reps',
          sets: 3,
          reps: 15,
          weightKg: 8,
          muscle: 'shoulders',
          role: 'core',
        }),
      ],
      optionalExercises: [
        planExercise('seed-ex-push-opt-1', 'Plank', {
          type: 'duration',
          duration: 60,
          muscle: 'abs',
          role: 'optional',
        }),
        planExercise('seed-ex-push-opt-2', 'Cable Crossover', {
          type: 'sets-reps',
          sets: 3,
          reps: 12,
          weightKg: 12,
          muscle: 'chest',
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
          weightKg: 110,
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
          weightKg: 60,
          muscle: 'back',
          role: 'core',
        }),
        planExercise('seed-ex-pull-4', 'Face Pull', {
          type: 'sets-reps',
          sets: 3,
          reps: 15,
          weightKg: 18,
          muscle: 'shoulders',
          role: 'core',
        }),
        planExercise('seed-ex-pull-5', 'Bicep Curl', {
          type: 'sets-reps',
          sets: 3,
          reps: 12,
          weightKg: 14,
          muscle: 'arms',
          role: 'core',
        }),
      ],
      optionalExercises: [
        planExercise('seed-ex-pull-opt-1', 'Hammer Curl', {
          type: 'sets-reps',
          sets: 3,
          reps: 12,
          weightKg: 12,
          muscle: 'arms',
          role: 'optional',
        }),
      ],
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
          weightKg: 90,
          muscle: 'quads',
          role: 'core',
        }),
        planExercise('seed-ex-legs-2', 'Romanian Deadlift', {
          type: 'sets-reps',
          sets: 3,
          reps: 10,
          weightKg: 75,
          muscle: 'hamstrings',
          role: 'core',
        }),
        planExercise('seed-ex-legs-3', 'Walking Lunge', {
          type: 'sets-reps',
          sets: 3,
          reps: 12,
          weightKg: 22,
          muscle: 'glutes',
          role: 'core',
        }),
        planExercise('seed-ex-legs-4', 'Leg Press', {
          type: 'sets-reps',
          sets: 3,
          reps: 12,
          weightKg: 140,
          muscle: 'quads',
          role: 'core',
        }),
        planExercise('seed-ex-legs-5', 'Standing Calf Raise', {
          type: 'sets-reps',
          sets: 4,
          reps: 15,
          weightKg: 45,
          muscle: 'calves',
          role: 'core',
        }),
      ],
      optionalExercises: [
        planExercise('seed-ex-legs-opt-1', 'Easy Cardio', {
          type: 'duration',
          duration: 600,
          muscle: 'cardio',
          role: 'optional',
        }),
        planExercise('seed-ex-legs-opt-2', 'Hanging Leg Raise', {
          type: 'sets-reps',
          sets: 3,
          reps: 12,
          muscle: 'abs',
          role: 'optional',
        }),
      ],
    },
  ];

  return {
    id: PLAN_ID_PPL,
    name: 'Push / Pull / Legs',
    days,
    sharedExercises: [],
    createdAt: isoDaysAgo(90, 9, 0),
    updatedAt: now,
    status: 'active',
  };
}

function buildUpperLowerPlan(): WorkoutPlan {
  const completedAt = isoDaysAgo(95, 20, 0);
  const days: PlanDay[] = [
    {
      id: 'seed-day-upper',
      name: 'Upper',
      weekdays: [1, 4],
      coreExercises: [
        planExercise('seed-ex-up-1', 'Incline Bench Press', {
          type: 'sets-reps',
          sets: 4,
          reps: 8,
          weightKg: 55,
          muscle: 'chest',
          role: 'core',
        }),
        planExercise('seed-ex-up-2', 'Lat Pulldown', {
          type: 'sets-reps',
          sets: 4,
          reps: 10,
          weightKg: 55,
          muscle: 'back',
          role: 'core',
        }),
        planExercise('seed-ex-up-3', 'Seated Dumbbell Press', {
          type: 'sets-reps',
          sets: 3,
          reps: 10,
          weightKg: 18,
          muscle: 'shoulders',
          role: 'core',
        }),
        planExercise('seed-ex-up-4', 'Cable Row', {
          type: 'sets-reps',
          sets: 3,
          reps: 12,
          weightKg: 50,
          muscle: 'back',
          role: 'core',
        }),
        planExercise('seed-ex-up-5', 'Skullcrusher', {
          type: 'sets-reps',
          sets: 3,
          reps: 12,
          weightKg: 22,
          muscle: 'arms',
          role: 'core',
        }),
      ],
      optionalExercises: [
        planExercise('seed-ex-up-opt-1', 'Reverse Pec Deck', {
          type: 'sets-reps',
          sets: 3,
          reps: 15,
          weightKg: 25,
          muscle: 'shoulders',
          role: 'optional',
        }),
      ],
    },
    {
      id: 'seed-day-lower',
      name: 'Lower',
      weekdays: [2, 5],
      coreExercises: [
        planExercise('seed-ex-lo-1', 'Front Squat', {
          type: 'sets-reps',
          sets: 4,
          reps: 6,
          weightKg: 70,
          muscle: 'quads',
          role: 'core',
        }),
        planExercise('seed-ex-lo-2', 'Hip Thrust', {
          type: 'sets-reps',
          sets: 4,
          reps: 10,
          weightKg: 90,
          muscle: 'glutes',
          role: 'core',
        }),
        planExercise('seed-ex-lo-3', 'Leg Curl', {
          type: 'sets-reps',
          sets: 3,
          reps: 12,
          weightKg: 35,
          muscle: 'hamstrings',
          role: 'core',
        }),
        planExercise('seed-ex-lo-4', 'Bulgarian Split Squat', {
          type: 'sets-reps',
          sets: 3,
          reps: 10,
          weightKg: 18,
          muscle: 'quads',
          role: 'core',
        }),
        planExercise('seed-ex-lo-5', 'Seated Calf Raise', {
          type: 'sets-reps',
          sets: 4,
          reps: 15,
          weightKg: 35,
          muscle: 'calves',
          role: 'core',
        }),
      ],
      optionalExercises: [],
    },
  ];

  return {
    id: PLAN_ID_UL,
    name: 'Upper / Lower Split',
    days,
    sharedExercises: [],
    createdAt: isoDaysAgo(180, 9, 0),
    updatedAt: completedAt,
    status: 'completed',
    completedAt,
  };
}

function buildFullBodyPlan(now: string): WorkoutPlan {
  const days: PlanDay[] = [
    {
      id: 'seed-day-fb-a',
      name: 'Full Body A',
      weekdays: [1],
      coreExercises: [
        planExercise('seed-ex-fb-a-1', 'Goblet Squat', {
          type: 'sets-reps',
          sets: 3,
          reps: 10,
          weightKg: 20,
          muscle: 'quads',
          role: 'core',
        }),
        planExercise('seed-ex-fb-a-2', 'Push-Up', {
          type: 'sets-reps',
          sets: 3,
          reps: 12,
          muscle: 'chest',
          role: 'core',
        }),
        planExercise('seed-ex-fb-a-3', 'Dumbbell Row', {
          type: 'sets-reps',
          sets: 3,
          reps: 10,
          weightKg: 16,
          muscle: 'back',
          role: 'core',
        }),
        planExercise('seed-ex-fb-a-4', 'Plank', {
          type: 'duration',
          duration: 45,
          muscle: 'abs',
          role: 'core',
        }),
      ],
      optionalExercises: [
        planExercise('seed-ex-fb-a-opt-1', 'Glute Bridge', {
          type: 'sets-reps',
          sets: 3,
          reps: 15,
          muscle: 'glutes',
          role: 'optional',
        }),
      ],
    },
    {
      id: 'seed-day-fb-b',
      name: 'Full Body B',
      weekdays: [4],
      coreExercises: [
        planExercise('seed-ex-fb-b-1', 'Kettlebell Swing', {
          type: 'sets-reps',
          sets: 4,
          reps: 15,
          weightKg: 16,
          muscle: 'glutes',
          role: 'core',
        }),
        planExercise('seed-ex-fb-b-2', 'Incline Push-Up', {
          type: 'sets-reps',
          sets: 3,
          reps: 12,
          muscle: 'chest',
          role: 'core',
        }),
        planExercise('seed-ex-fb-b-3', 'Inverted Row', {
          type: 'sets-reps',
          sets: 3,
          reps: 10,
          muscle: 'back',
          role: 'core',
        }),
        planExercise('seed-ex-fb-b-4', 'Side Plank', {
          type: 'duration',
          duration: 30,
          muscle: 'obliques',
          role: 'core',
        }),
      ],
      optionalExercises: [
        planExercise('seed-ex-fb-b-opt-1', 'Easy Walk', {
          type: 'duration',
          duration: 900,
          muscle: 'cardio',
          role: 'optional',
        }),
      ],
    },
  ];

  return {
    id: PLAN_ID_FB,
    name: 'Full Body Beginner',
    days,
    sharedExercises: [],
    createdAt: isoDaysAgo(150, 9, 0),
    updatedAt: now,
    status: 'active',
  };
}

// ─── Session generation ──────────────────────────────────────────────────────

// Realistic rating distribution: mostly 3-4, occasional 5, rare 1-2.
const RATING_WEIGHTS: ReadonlyArray<[1 | 2 | 3 | 4 | 5, number]> = [
  [1, 4],
  [2, 12],
  [3, 30],
  [4, 36],
  [5, 18],
];

function pickRating(): 1 | 2 | 3 | 4 | 5 {
  return pickWeighted(RATING_WEIGHTS);
}

interface ProgressionContext {
  /** 0..1 — how far through the timeline the session falls (0 = oldest). */
  progress: number;
  daysAgo: number;
  hour: number;
}

function progressedWeight(baseKg: number, ctx: ProgressionContext): number {
  // ~12% linear gain over the full timeline, with ±4% jitter.
  const gain = 1 + 0.12 * ctx.progress;
  return roundWeight(jitter(baseKg * gain, 0.04));
}

function progressedReps(baseReps: number, ctx: ProgressionContext): number {
  // Slight rep increase late in the timeline plus noise. Some sessions
  // intentionally fall short on the last set.
  const drift = baseReps + (ctx.progress > 0.6 ? 1 : 0);
  const noise = Math.round((rand() * 2 - 1) * 1.4);
  return Math.max(1, drift + noise);
}

function setsForExercise(planEx: PlanExercise, ctx: ProgressionContext): LoggedSet[] {
  if (planEx.type === 'duration') {
    // Duration-only exercises are recorded as a single completion stamp.
    return [
      {
        weight: 0,
        reps: 0,
        seconds: planEx.duration,
        loggedAt: isoDaysAgo(ctx.daysAgo, ctx.hour, 30 + Math.floor(rand() * 10)),
      },
    ];
  }

  const sets = planEx.sets ?? 3;
  const baseWeight = planEx.weightKg ?? 0;
  const weight = progressedWeight(baseWeight, ctx);
  const repsPerSet = planEx.repsPerSet ?? Array(sets).fill(planEx.reps ?? 10);

  return repsPerSet.map((targetReps, i) => {
    // Last set tends to drop reps when fatigue stacks.
    const fatigueLoss = i >= sets - 1 ? 1 : 0;
    const reps = Math.max(1, progressedReps(targetReps, ctx) - fatigueLoss);
    return loggedSet(
      weight,
      reps,
      isoDaysAgo(ctx.daysAgo, ctx.hour, i * 4 + Math.floor(rand() * 3)),
    );
  });
}

function sessionFromPlanDay(
  plan: WorkoutPlan,
  day: PlanDay,
  daysAgo: number,
  index: number,
): WorkoutSession {
  const hour = rand() < 0.55 ? 18 : 7;
  const ctx: ProgressionContext = {
    progress: 1 - daysAgo / 180,
    daysAgo,
    hour,
  };
  // Always include all core; pull in 0-1 optional ~30% of the time.
  const exercises: Exercise[] = day.coreExercises.map((ex) =>
    exerciseFromPlan(ex, setsForExercise(ex, ctx)),
  );
  if (day.optionalExercises.length && rand() < 0.3) {
    const opt = day.optionalExercises[Math.floor(rand() * day.optionalExercises.length)];
    exercises.push(exerciseFromPlan(opt, setsForExercise(opt, ctx)));
  }
  const startMinute = Math.floor(rand() * 30);
  const endMinute = startMinute + 45 + Math.floor(rand() * 30);
  return {
    id: `seed-session-${plan.id}-${index}`,
    startedAt: isoDaysAgo(daysAgo, hour, startMinute),
    completedAt: isoDaysAgo(daysAgo, hour, endMinute),
    planId: plan.id,
    planDayId: day.id,
    rating: pickRating(),
    exercises,
  };
}

// Pool of free-session exercise templates — drawn on demand.
interface FreeTemplate {
  name: string;
  type: Exercise['type'];
  muscle: Exercise['muscle'];
  baseWeight?: number;
  baseReps?: number;
  sets?: number;
  duration?: number;
}

const FREE_POOL: FreeTemplate[] = [
  { name: 'Treadmill Run', type: 'duration', muscle: 'cardio', duration: 1800 },
  { name: 'Cycling', type: 'duration', muscle: 'cardio', duration: 2400 },
  { name: 'Jump Rope', type: 'duration', muscle: 'cardio', duration: 600 },
  { name: 'Bench Press', type: 'sets-reps', muscle: 'chest', baseWeight: 60, baseReps: 8, sets: 3 },
  { name: 'Push-Up', type: 'sets-reps', muscle: 'chest', baseReps: 15, sets: 3 },
  {
    name: 'Dumbbell Curl',
    type: 'sets-reps',
    muscle: 'arms',
    baseWeight: 14,
    baseReps: 12,
    sets: 3,
  },
  {
    name: 'Lateral Raise',
    type: 'sets-reps',
    muscle: 'shoulders',
    baseWeight: 8,
    baseReps: 15,
    sets: 3,
  },
  { name: 'Plank', type: 'duration', muscle: 'abs', duration: 60 },
  {
    name: 'Goblet Squat',
    type: 'sets-reps',
    muscle: 'quads',
    baseWeight: 20,
    baseReps: 12,
    sets: 3,
  },
  {
    name: 'Kettlebell Swing',
    type: 'sets-reps',
    muscle: 'glutes',
    baseWeight: 16,
    baseReps: 20,
    sets: 4,
  },
  {
    name: 'Pull-Up',
    type: 'sets-reps',
    muscle: 'back',
    baseReps: 6,
    sets: 3,
  },
  { name: 'Stretching', type: 'duration', muscle: 'cardio', duration: 600 },
];

function freeSession(daysAgo: number, index: number): WorkoutSession {
  const hour = rand() < 0.5 ? 18 : 8;
  const ctx: ProgressionContext = {
    progress: 1 - daysAgo / 180,
    daysAgo,
    hour,
  };
  const count = 2 + Math.floor(rand() * 3); // 2-4 exercises
  const picks: FreeTemplate[] = [];
  const pool = [...FREE_POOL];
  for (let i = 0; i < count && pool.length; i++) {
    const idx = Math.floor(rand() * pool.length);
    picks.push(pool.splice(idx, 1)[0]);
  }
  const exercises: Exercise[] = picks.map((tpl, i) => {
    const exId = `seed-free-${daysAgo}-${i}`;
    if (tpl.type === 'duration') {
      return adHocExercise(
        exId,
        tpl.name,
        tpl.type,
        tpl.muscle,
        [
          {
            weight: 0,
            reps: 0,
            seconds: tpl.duration,
            loggedAt: isoDaysAgo(daysAgo, hour, 20 + i * 8),
          },
        ],
        { duration: tpl.duration },
      );
    }
    const sets = tpl.sets ?? 3;
    const weight = tpl.baseWeight ? progressedWeight(tpl.baseWeight, ctx) : 0;
    const repsTarget = tpl.baseReps ?? 10;
    const loggedSets = Array.from({ length: sets }, (_, k) => {
      const reps = Math.max(1, progressedReps(repsTarget, ctx) - (k === sets - 1 ? 1 : 0));
      return loggedSet(weight, reps, isoDaysAgo(daysAgo, hour, 20 + i * 8 + k * 3));
    });
    return adHocExercise(exId, tpl.name, tpl.type, tpl.muscle, loggedSets, {
      sets,
      reps: repsTarget,
      weightKg: tpl.baseWeight,
    });
  });

  const startMinute = Math.floor(rand() * 30);
  const endMinute = startMinute + 35 + Math.floor(rand() * 30);
  return {
    id: `seed-free-session-${index}`,
    startedAt: isoDaysAgo(daysAgo, hour, startMinute),
    completedAt: isoDaysAgo(daysAgo, hour, endMinute),
    rating: pickRating(),
    exercises,
  };
}

/**
 * Walks roughly 180 days backward, allocating workouts across the three
 * timeline phases:
 *   - Days 180–120: Full Body Beginner + a few free sessions
 *   - Days 119–60:  Upper / Lower split
 *   - Days  59–0:   Push / Pull / Legs (current)
 * Each week has a ~85% chance to contain workouts; missed weeks model
 * vacations / illness. Free sessions sprinkle throughout (~15% of all
 * workouts).
 */
function buildSessions(
  ppl: WorkoutPlan,
  upperLower: WorkoutPlan,
  fullBody: WorkoutPlan,
): WorkoutSession[] {
  const sessions: WorkoutSession[] = [];
  let sessionIndex = 0;
  let freeIndex = 0;

  for (let daysAgo = 180; daysAgo >= 1; daysAgo--) {
    // Pick the plan for this point in the timeline.
    let plan: WorkoutPlan;
    if (daysAgo > 120) plan = fullBody;
    else if (daysAgo > 60) plan = upperLower;
    else plan = ppl;

    // ~85% of weekdays count; full week off is rare. We use a per-day
    // probability that scales by the day-of-week to roughly target 3-4
    // sessions per week.
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    const weekday = date.getDay(); // 0 Sun .. 6 Sat
    // Skip Sunday and Wednesday more often (rest days).
    const restBias = weekday === 0 ? 0.85 : weekday === 3 ? 0.55 : 0.4;
    if (rand() < restBias) continue;

    // ~12% chance of a free session instead of plan day.
    if (rand() < 0.12) {
      sessions.push(freeSession(daysAgo, freeIndex++));
      continue;
    }

    const day = plan.days[Math.floor(rand() * plan.days.length)];
    sessions.push(sessionFromPlanDay(plan, day, daysAgo, sessionIndex++));
  }

  return sessions.sort((a, b) => a.startedAt.localeCompare(b.startedAt));
}

// ─── Public API ──────────────────────────────────────────────────────────────

export type SeedResult =
  | { seeded: true }
  | { seeded: false; reason: 'ssr' | 'already-seeded' | 'user-data-present' };

function looksLikeOurSeed(plans: WorkoutPlan[], sessions: WorkoutSession[]): boolean {
  const seedPrefixes = ['seed-plan-', 'seed-session-', 'seed-free-session-'];
  const planHit = plans.some((p) => p.id.startsWith('seed-plan-'));
  const sessionHit = sessions.some((s) => seedPrefixes.some((pfx) => s.id.startsWith(pfx)));
  return planHit || sessionHit;
}

export function seedDevDataIfEmpty(): SeedResult {
  if (typeof window === 'undefined') return { seeded: false, reason: 'ssr' };

  const flag = localStorage.getItem(SEED_FLAG);
  if (flag === SEED_VERSION) {
    return { seeded: false, reason: 'already-seeded' };
  }

  const existingPlans = localStorage.getItem('wst_plans');
  const existingSessions = localStorage.getItem('wst_sessions');
  const parsedPlans: WorkoutPlan[] = existingPlans ? JSON.parse(existingPlans) : [];
  const parsedSessions: WorkoutSession[] = existingSessions ? JSON.parse(existingSessions) : [];
  const hasAnyData = parsedPlans.length > 0 || parsedSessions.length > 0;

  // If the user has real data we did not seed, leave it alone but record the
  // current seed version so we don't keep checking on every load.
  if (hasAnyData && !looksLikeOurSeed(parsedPlans, parsedSessions)) {
    localStorage.setItem(SEED_FLAG, SEED_VERSION);
    return { seeded: false, reason: 'user-data-present' };
  }

  const now = new Date().toISOString();
  const ppl = buildPplPlan(now);
  const upperLower = buildUpperLowerPlan();
  const fullBody = buildFullBodyPlan(now);
  const sessions = buildSessions(ppl, upperLower, fullBody);

  localStorage.setItem('wst_plans', JSON.stringify([ppl, upperLower, fullBody]));
  localStorage.setItem('wst_sessions', JSON.stringify(sessions));
  localStorage.setItem('wst_user_name', 'Dev User');
  localStorage.setItem('wst_user_sex', 'male');
  localStorage.setItem('wst_user_age', '30');
  localStorage.setItem('wst_user_height_cm', '180');
  localStorage.setItem('wst_user_weight_kg', '80');
  localStorage.setItem('wst_profile_created_at', isoDaysAgo(200, 12, 0));
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
