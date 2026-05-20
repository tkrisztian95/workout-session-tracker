/**
 * One-shot generator for the dev-seed JSON corpus.
 *
 * Produces:
 *   src/lib/dev-seed-data/plans/ppl.json
 *   src/lib/dev-seed-data/plans/upper-lower.json
 *   src/lib/dev-seed-data/plans/full-body.json
 *   src/lib/dev-seed-data/sessions.json
 *   src/lib/dev-seed-data/profile.json
 *
 * All timestamps are emitted as relative offsets (`{ daysAgo, hour, minute }`)
 * so the files stay evergreen regardless of when they were generated. The
 * runtime loader expands them to ISO timestamps anchored to "now".
 *
 * Run with:
 *   npx tsx scripts/generate-dev-seed.ts
 *
 * Output is deterministic — driven by a fixed PRNG seed — so regenerating
 * without code changes yields identical files. Bump the seed or tweak the
 * algorithm to refresh the corpus.
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(SCRIPT_DIR, '..');
const DATA_DIR = join(REPO_ROOT, 'src/lib/dev-seed-data');
const PLANS_DIR = join(DATA_DIR, 'plans');

// ─── JSON shapes ──────────────────────────────────────────────────────────────

interface TimeOffset {
  daysAgo: number;
  hour: number;
  minute: number;
}

type Muscle =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'arms'
  | 'quads'
  | 'hamstrings'
  | 'glutes'
  | 'calves'
  | 'abs'
  | 'obliques'
  | 'lower_back'
  | 'cardio';

type ExerciseType = 'sets-reps' | 'sets-duration' | 'duration';

interface JsonPlanExercise {
  id: string;
  name: string;
  type: ExerciseType;
  role: 'core' | 'optional';
  sets?: number;
  reps?: number;
  repsPerSet?: number[];
  duration?: number;
  weightKg?: number;
  scalingNote?: string;
  muscle?: Muscle;
}

interface JsonPlanDay {
  id: string;
  name: string;
  weekdays: number[];
  coreExercises: JsonPlanExercise[];
  optionalExercises: JsonPlanExercise[];
}

interface JsonPlan {
  id: string;
  name: string;
  status?: 'active' | 'completed';
  createdAtDaysAgo: number;
  updatedAtDaysAgo: number;
  completedAtDaysAgo?: number;
  sharedExercises: JsonPlanExercise[];
  days: JsonPlanDay[];
}

interface JsonLoggedSet {
  weight: number;
  reps: number;
  seconds?: number;
  loggedAt: TimeOffset;
}

interface JsonExercise {
  id: string;
  name: string;
  type: ExerciseType;
  sets?: number;
  reps?: number;
  repsPerSet?: number[];
  duration?: number;
  weightKg?: number;
  scalingNote?: string;
  muscle?: Muscle;
  completed?: boolean;
  completedAt?: TimeOffset;
  loggedSets: JsonLoggedSet[];
}

interface JsonSession {
  id: string;
  startedAt: TimeOffset;
  completedAt: TimeOffset;
  planId?: string;
  planDayId?: string;
  rating?: 1 | 2 | 3 | 4 | 5;
  exercises: JsonExercise[];
}

interface JsonProfile {
  userName: string;
  sex: 'male' | 'female';
  age: number;
  heightCm: number;
  weightKg: number;
  profileCreatedAtDaysAgo: number;
  consentAccepted: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PLAN_ID_PPL = 'seed-plan-ppl';
const PLAN_ID_UL = 'seed-plan-ul';
const PLAN_ID_FB = 'seed-plan-fb';

/**
 * Build a TimeOffset, normalizing minute/hour overflow into the next hour/day.
 * The session generator computes minute counts that can exceed 59 (e.g.
 * `start + 45 + jitter`); calendars accept that via `Date.setHours`, but the
 * JSON schema constrains minute ∈ [0,59], so we roll over here.
 */
function offset(daysAgo: number, hour: number, minute: number): TimeOffset {
  const extraHours = Math.floor(minute / 60);
  const normalizedMinute = ((minute % 60) + 60) % 60;
  const totalHours = hour + extraHours;
  const extraDays = Math.floor(totalHours / 24);
  const normalizedHour = ((totalHours % 24) + 24) % 24;
  const normalizedDaysAgo = Math.max(0, daysAgo - extraDays);
  return { daysAgo: normalizedDaysAgo, hour: normalizedHour, minute: normalizedMinute };
}

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

function planExercise(
  id: string,
  name: string,
  partial: Omit<JsonPlanExercise, 'id' | 'name' | 'role'> & { role?: JsonPlanExercise['role'] },
): JsonPlanExercise {
  return { id, name, role: partial.role ?? 'core', ...partial };
}

// ─── Plans ────────────────────────────────────────────────────────────────────

function buildPplPlan(): JsonPlan {
  const days: JsonPlanDay[] = [
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
        }),
        planExercise('seed-ex-push-2', 'Overhead Press', {
          type: 'sets-reps',
          sets: 3,
          reps: 10,
          weightKg: 40,
          muscle: 'shoulders',
        }),
        planExercise('seed-ex-push-3', 'Incline Dumbbell Press', {
          type: 'sets-reps',
          sets: 3,
          reps: 10,
          weightKg: 24,
          muscle: 'chest',
        }),
        planExercise('seed-ex-push-4', 'Triceps Pushdown', {
          type: 'sets-reps',
          sets: 3,
          reps: 12,
          weightKg: 30,
          muscle: 'arms',
        }),
        planExercise('seed-ex-push-5', 'Lateral Raise', {
          type: 'sets-reps',
          sets: 3,
          reps: 15,
          weightKg: 8,
          muscle: 'shoulders',
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
        }),
        planExercise('seed-ex-pull-2', 'Pull-Up', {
          type: 'sets-reps',
          sets: 4,
          reps: 8,
          muscle: 'back',
        }),
        planExercise('seed-ex-pull-3', 'Barbell Row', {
          type: 'sets-reps',
          sets: 3,
          reps: 10,
          weightKg: 60,
          muscle: 'back',
        }),
        planExercise('seed-ex-pull-4', 'Face Pull', {
          type: 'sets-reps',
          sets: 3,
          reps: 15,
          weightKg: 18,
          muscle: 'shoulders',
        }),
        planExercise('seed-ex-pull-5', 'Bicep Curl', {
          type: 'sets-reps',
          sets: 3,
          reps: 12,
          weightKg: 14,
          muscle: 'arms',
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
        }),
        planExercise('seed-ex-legs-2', 'Romanian Deadlift', {
          type: 'sets-reps',
          sets: 3,
          reps: 10,
          weightKg: 75,
          muscle: 'hamstrings',
        }),
        planExercise('seed-ex-legs-3', 'Walking Lunge', {
          type: 'sets-reps',
          sets: 3,
          reps: 12,
          weightKg: 22,
          muscle: 'glutes',
        }),
        planExercise('seed-ex-legs-4', 'Leg Press', {
          type: 'sets-reps',
          sets: 3,
          reps: 12,
          weightKg: 140,
          muscle: 'quads',
        }),
        planExercise('seed-ex-legs-5', 'Standing Calf Raise', {
          type: 'sets-reps',
          sets: 4,
          reps: 15,
          weightKg: 45,
          muscle: 'calves',
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
    status: 'active',
    createdAtDaysAgo: 90,
    updatedAtDaysAgo: 0,
    sharedExercises: [],
    days,
  };
}

function buildUpperLowerPlan(): JsonPlan {
  return {
    id: PLAN_ID_UL,
    name: 'Upper / Lower Split',
    status: 'completed',
    createdAtDaysAgo: 180,
    updatedAtDaysAgo: 95,
    completedAtDaysAgo: 95,
    sharedExercises: [],
    days: [
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
          }),
          planExercise('seed-ex-up-2', 'Lat Pulldown', {
            type: 'sets-reps',
            sets: 4,
            reps: 10,
            weightKg: 55,
            muscle: 'back',
          }),
          planExercise('seed-ex-up-3', 'Seated Dumbbell Press', {
            type: 'sets-reps',
            sets: 3,
            reps: 10,
            weightKg: 18,
            muscle: 'shoulders',
          }),
          planExercise('seed-ex-up-4', 'Cable Row', {
            type: 'sets-reps',
            sets: 3,
            reps: 12,
            weightKg: 50,
            muscle: 'back',
          }),
          planExercise('seed-ex-up-5', 'Skullcrusher', {
            type: 'sets-reps',
            sets: 3,
            reps: 12,
            weightKg: 22,
            muscle: 'arms',
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
          }),
          planExercise('seed-ex-lo-2', 'Hip Thrust', {
            type: 'sets-reps',
            sets: 4,
            reps: 10,
            weightKg: 90,
            muscle: 'glutes',
          }),
          planExercise('seed-ex-lo-3', 'Leg Curl', {
            type: 'sets-reps',
            sets: 3,
            reps: 12,
            weightKg: 35,
            muscle: 'hamstrings',
          }),
          planExercise('seed-ex-lo-4', 'Bulgarian Split Squat', {
            type: 'sets-reps',
            sets: 3,
            reps: 10,
            weightKg: 18,
            muscle: 'quads',
          }),
          planExercise('seed-ex-lo-5', 'Seated Calf Raise', {
            type: 'sets-reps',
            sets: 4,
            reps: 15,
            weightKg: 35,
            muscle: 'calves',
          }),
        ],
        optionalExercises: [],
      },
    ],
  };
}

function buildFullBodyPlan(): JsonPlan {
  return {
    id: PLAN_ID_FB,
    name: 'Full Body Beginner',
    status: 'active',
    createdAtDaysAgo: 150,
    updatedAtDaysAgo: 0,
    sharedExercises: [],
    days: [
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
          }),
          planExercise('seed-ex-fb-a-2', 'Push-Up', {
            type: 'sets-reps',
            sets: 3,
            reps: 12,
            muscle: 'chest',
          }),
          planExercise('seed-ex-fb-a-3', 'Dumbbell Row', {
            type: 'sets-reps',
            sets: 3,
            reps: 10,
            weightKg: 16,
            muscle: 'back',
          }),
          planExercise('seed-ex-fb-a-4', 'Plank', {
            type: 'duration',
            duration: 45,
            muscle: 'abs',
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
          }),
          planExercise('seed-ex-fb-b-2', 'Incline Push-Up', {
            type: 'sets-reps',
            sets: 3,
            reps: 12,
            muscle: 'chest',
          }),
          planExercise('seed-ex-fb-b-3', 'Inverted Row', {
            type: 'sets-reps',
            sets: 3,
            reps: 10,
            muscle: 'back',
          }),
          planExercise('seed-ex-fb-b-4', 'Side Plank', {
            type: 'duration',
            duration: 30,
            muscle: 'obliques',
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
    ],
  };
}

// ─── Session generation ──────────────────────────────────────────────────────

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
  progress: number;
  daysAgo: number;
  hour: number;
}

function progressedWeight(baseKg: number, ctx: ProgressionContext): number {
  const gain = 1 + 0.12 * ctx.progress;
  return roundWeight(jitter(baseKg * gain, 0.04));
}

function progressedReps(baseReps: number, ctx: ProgressionContext): number {
  const drift = baseReps + (ctx.progress > 0.6 ? 1 : 0);
  const noise = Math.round((rand() * 2 - 1) * 1.4);
  return Math.max(1, drift + noise);
}

function setsForExercise(planEx: JsonPlanExercise, ctx: ProgressionContext): JsonLoggedSet[] {
  if (planEx.type === 'duration') {
    return [
      {
        weight: 0,
        reps: 0,
        seconds: planEx.duration,
        loggedAt: offset(ctx.daysAgo, ctx.hour, 30 + Math.floor(rand() * 10)),
      },
    ];
  }
  const sets = planEx.sets ?? 3;
  const baseWeight = planEx.weightKg ?? 0;
  const weight = progressedWeight(baseWeight, ctx);
  const repsPerSet = planEx.repsPerSet ?? new Array(sets).fill(planEx.reps ?? 10);

  return repsPerSet.map((targetReps: number, i: number) => {
    const fatigueLoss = i >= sets - 1 ? 1 : 0;
    const reps = Math.max(1, progressedReps(targetReps, ctx) - fatigueLoss);
    return {
      weight,
      reps,
      loggedAt: offset(ctx.daysAgo, ctx.hour, i * 4 + Math.floor(rand() * 3)),
    };
  });
}

function exerciseFromPlan(planEx: JsonPlanExercise, sets: JsonLoggedSet[]): JsonExercise {
  return {
    id: `${planEx.id}-${sets[0]?.loggedAt.daysAgo ?? 'na'}-${sets[0]?.loggedAt.minute ?? 'na'}`,
    name: planEx.name,
    type: planEx.type,
    sets: planEx.sets,
    reps: planEx.reps,
    repsPerSet: planEx.repsPerSet,
    duration: planEx.duration,
    weightKg: planEx.weightKg,
    muscle: planEx.muscle,
    completed: true,
    completedAt: sets.at(-1)!.loggedAt,
    loggedSets: sets,
  };
}

function sessionFromPlanDay(
  plan: JsonPlan,
  day: JsonPlanDay,
  daysAgo: number,
  index: number,
): JsonSession {
  const hour = rand() < 0.55 ? 18 : 7;
  const ctx: ProgressionContext = {
    progress: 1 - daysAgo / 180,
    daysAgo,
    hour,
  };
  const exercises: JsonExercise[] = day.coreExercises.map((ex) =>
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
    startedAt: offset(daysAgo, hour, startMinute),
    completedAt: offset(daysAgo, hour, endMinute),
    planId: plan.id,
    planDayId: day.id,
    rating: pickRating(),
    exercises,
  };
}

interface FreeTemplate {
  name: string;
  type: ExerciseType;
  muscle: Muscle;
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
  { name: 'Pull-Up', type: 'sets-reps', muscle: 'back', baseReps: 6, sets: 3 },
  { name: 'Stretching', type: 'duration', muscle: 'cardio', duration: 600 },
];

function freeSession(daysAgo: number, index: number): JsonSession {
  const hour = rand() < 0.5 ? 18 : 8;
  const ctx: ProgressionContext = { progress: 1 - daysAgo / 180, daysAgo, hour };
  const count = 2 + Math.floor(rand() * 3);
  const picks: FreeTemplate[] = [];
  const pool = [...FREE_POOL];
  for (let i = 0; i < count && pool.length; i++) {
    const idx = Math.floor(rand() * pool.length);
    picks.push(pool.splice(idx, 1)[0]);
  }
  const exercises: JsonExercise[] = picks.map((tpl, i) => {
    const exId = `seed-free-${daysAgo}-${i}`;
    if (tpl.type === 'duration') {
      return {
        id: exId,
        name: tpl.name,
        type: tpl.type,
        muscle: tpl.muscle,
        duration: tpl.duration,
        completed: true,
        completedAt: offset(daysAgo, hour, 20 + i * 8),
        loggedSets: [
          {
            weight: 0,
            reps: 0,
            seconds: tpl.duration,
            loggedAt: offset(daysAgo, hour, 20 + i * 8),
          },
        ],
      };
    }
    const sets = tpl.sets ?? 3;
    const weight = tpl.baseWeight ? progressedWeight(tpl.baseWeight, ctx) : 0;
    const repsTarget = tpl.baseReps ?? 10;
    const loggedSets: JsonLoggedSet[] = Array.from({ length: sets }, (_, k) => {
      const reps = Math.max(1, progressedReps(repsTarget, ctx) - (k === sets - 1 ? 1 : 0));
      return { weight, reps, loggedAt: offset(daysAgo, hour, 20 + i * 8 + k * 3) };
    });
    return {
      id: exId,
      name: tpl.name,
      type: tpl.type,
      sets,
      reps: repsTarget,
      weightKg: tpl.baseWeight,
      muscle: tpl.muscle,
      completed: true,
      completedAt: loggedSets.at(-1)!.loggedAt,
      loggedSets,
    };
  });
  const startMinute = Math.floor(rand() * 30);
  const endMinute = startMinute + 35 + Math.floor(rand() * 30);
  return {
    id: `seed-free-session-${index}`,
    startedAt: offset(daysAgo, hour, startMinute),
    completedAt: offset(daysAgo, hour, endMinute),
    rating: pickRating(),
    exercises,
  };
}

/**
 * Walks 180 days backward, allocating workouts across three timeline phases
 * matching the plan rotation (Full Body → Upper/Lower → PPL). Each weekday
 * has a per-day skip probability that targets ~3-4 sessions per week.
 *
 * NOTE: To keep the file evergreen, the weekday distribution is based on the
 * "daysAgo" index instead of a calendar date — `daysAgo % 7` cycles through
 * a synthetic week (0 ≈ rest-heavy Sunday, 3 ≈ mid-week rest). This is a
 * deliberate departure from the previous algorithm so the JSON corpus does
 * not shift its rest-day pattern depending on which calendar day generation
 * was run on.
 */
function buildSessions(ppl: JsonPlan, upperLower: JsonPlan, fullBody: JsonPlan): JsonSession[] {
  const sessions: JsonSession[] = [];
  let sessionIndex = 0;
  let freeIndex = 0;

  for (let daysAgo = 180; daysAgo >= 1; daysAgo--) {
    const plan = daysAgo > 120 ? fullBody : daysAgo > 60 ? upperLower : ppl;
    const syntheticWeekday = daysAgo % 7;
    const restBias = syntheticWeekday === 0 ? 0.85 : syntheticWeekday === 3 ? 0.55 : 0.4;
    if (rand() < restBias) continue;

    if (rand() < 0.12) {
      sessions.push(freeSession(daysAgo, freeIndex++));
      continue;
    }

    const day = plan.days[Math.floor(rand() * plan.days.length)];
    sessions.push(sessionFromPlanDay(plan, day, daysAgo, sessionIndex++));
  }

  return sessions.sort((a, b) => {
    if (a.startedAt.daysAgo !== b.startedAt.daysAgo) {
      return b.startedAt.daysAgo - a.startedAt.daysAgo;
    }
    if (a.startedAt.hour !== b.startedAt.hour) return a.startedAt.hour - b.startedAt.hour;
    return a.startedAt.minute - b.startedAt.minute;
  });
}

// ─── Profile ─────────────────────────────────────────────────────────────────

function buildProfile(): JsonProfile {
  return {
    userName: 'Dev User',
    sex: 'male',
    age: 30,
    heightCm: 180,
    weightKg: 80,
    profileCreatedAtDaysAgo: 200,
    consentAccepted: true,
  };
}

// ─── Main ────────────────────────────────────────────────────────────────────

function writeJson(path: string, value: unknown): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(value, null, 2) + '\n');
  console.log(`  wrote ${path.replace(REPO_ROOT + '/', '')}`);
}

function main(): void {
  console.log('Generating dev-seed JSON corpus...');
  const ppl = buildPplPlan();
  const upperLower = buildUpperLowerPlan();
  const fullBody = buildFullBodyPlan();
  const sessions = buildSessions(ppl, upperLower, fullBody);
  const profile = buildProfile();

  writeJson(join(PLANS_DIR, 'ppl.json'), ppl);
  writeJson(join(PLANS_DIR, 'upper-lower.json'), upperLower);
  writeJson(join(PLANS_DIR, 'full-body.json'), fullBody);
  writeJson(join(DATA_DIR, 'sessions.json'), sessions);
  writeJson(join(DATA_DIR, 'profile.json'), profile);

  console.log(
    `Done. ${sessions.length} sessions across 3 plans (${
      sessions.filter((s) => !s.planId).length
    } free).`,
  );
}

main();
