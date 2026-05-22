import type {
  Exercise,
  LoggedSet,
  PlanDay,
  PlanExercise,
  WorkoutPlan,
  WorkoutSession,
} from './types';
import type { Muscle } from './muscles';

// The corpus is checked in under `src/lib/dev-seed-data/` as JSON validated
// against the schemas in `src/lib/dev-seed-data/schemas/`. Timestamps are
// stored as relative day offsets so the corpus stays evergreen. This module
// loads the JSON, expands offsets to ISO strings anchored at "now", and
// writes the result to localStorage.

const SEED_FLAG = 'wst_dev_seeded';
const SEED_VERSION = '3';

// ─── JSON shapes (mirror the schemas) ────────────────────────────────────────

interface TimeOffset {
  daysAgo: number;
  hour: number;
  minute: number;
}

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

// ─── Offset expansion ────────────────────────────────────────────────────────

function expandOffset(o: TimeOffset, anchor: Date): string {
  const d = new Date(anchor);
  d.setDate(d.getDate() - o.daysAgo);
  d.setHours(o.hour, o.minute, 0, 0);
  return d.toISOString();
}

function expandFromDaysAgo(daysAgo: number, hour: number, minute: number, anchor: Date): string {
  return expandOffset({ daysAgo, hour, minute }, anchor);
}

function expandPlanExercise(ex: JsonPlanExercise): PlanExercise {
  return {
    id: ex.id,
    name: ex.name,
    type: ex.type,
    role: ex.role,
    sets: ex.sets,
    reps: ex.reps,
    repsPerSet: ex.repsPerSet,
    duration: ex.duration,
    weightKg: ex.weightKg,
    scalingNote: ex.scalingNote,
    muscle: ex.muscle,
  };
}

function expandPlanDay(day: JsonPlanDay): PlanDay {
  return {
    id: day.id,
    name: day.name,
    weekdays: day.weekdays,
    coreExercises: day.coreExercises.map(expandPlanExercise),
    optionalExercises: day.optionalExercises.map(expandPlanExercise),
  };
}

function expandPlan(plan: JsonPlan, anchor: Date): WorkoutPlan {
  // Plan-level timestamps in the corpus only carry day precision; pin them to
  // 12:00 noon on the offset day for stability across regenerations.
  return {
    id: plan.id,
    name: plan.name,
    days: plan.days.map(expandPlanDay),
    sharedExercises: plan.sharedExercises.map(expandPlanExercise),
    createdAt: expandFromDaysAgo(plan.createdAtDaysAgo, 12, 0, anchor),
    updatedAt: expandFromDaysAgo(plan.updatedAtDaysAgo, 12, 0, anchor),
    status: plan.status,
    completedAt:
      plan.completedAtDaysAgo !== undefined
        ? expandFromDaysAgo(plan.completedAtDaysAgo, 20, 0, anchor)
        : undefined,
  };
}

function expandLoggedSet(set: JsonLoggedSet, anchor: Date): LoggedSet {
  return {
    weight: set.weight,
    reps: set.reps,
    seconds: set.seconds,
    loggedAt: expandOffset(set.loggedAt, anchor),
  };
}

function expandExercise(ex: JsonExercise, anchor: Date): Exercise {
  return {
    id: ex.id,
    name: ex.name,
    type: ex.type,
    sets: ex.sets,
    reps: ex.reps,
    repsPerSet: ex.repsPerSet,
    duration: ex.duration,
    weightKg: ex.weightKg,
    scalingNote: ex.scalingNote,
    muscle: ex.muscle,
    completed: ex.completed,
    completedAt: ex.completedAt ? expandOffset(ex.completedAt, anchor) : undefined,
    loggedSets: ex.loggedSets.map((s) => expandLoggedSet(s, anchor)),
  };
}

function expandSession(session: JsonSession, anchor: Date): WorkoutSession {
  return {
    id: session.id,
    startedAt: expandOffset(session.startedAt, anchor),
    completedAt: expandOffset(session.completedAt, anchor),
    planId: session.planId,
    planDayId: session.planDayId,
    rating: session.rating,
    exercises: session.exercises.map((ex) => expandExercise(ex, anchor)),
  };
}

// ─── Corpus loader ───────────────────────────────────────────────────────────

interface Corpus {
  plans: JsonPlan[];
  sessions: JsonSession[];
  profile: JsonProfile;
}

// Dynamic imports keep the JSON corpus out of the production bundle. DevSeed
// is only rendered in development (gated in `layout.tsx`), so the loader is
// only ever exercised at dev time.
async function loadCorpus(): Promise<Corpus> {
  const [ppl, ul, fb, sessions, profile] = await Promise.all([
    import('./dev-seed-data/plans/ppl.json'),
    import('./dev-seed-data/plans/upper-lower.json'),
    import('./dev-seed-data/plans/full-body.json'),
    import('./dev-seed-data/sessions.json'),
    import('./dev-seed-data/profile.json'),
  ]);
  return {
    plans: [ppl.default as JsonPlan, ul.default as JsonPlan, fb.default as JsonPlan],
    sessions: sessions.default as JsonSession[],
    profile: profile.default as JsonProfile,
  };
}

// ─── Public API ──────────────────────────────────────────────────────────────

export type SeedResult =
  | { seeded: true; sessionCount: number }
  | { seeded: false; reason: 'ssr' | 'already-seeded' | 'user-data-present' };

function looksLikeOurSeed(plans: WorkoutPlan[], sessions: WorkoutSession[]): boolean {
  const seedPrefixes = ['seed-plan-', 'seed-session-', 'seed-free-session-'];
  const planHit = plans.some((p) => p.id.startsWith('seed-plan-'));
  const sessionHit = sessions.some((s) => seedPrefixes.some((pfx) => s.id.startsWith(pfx)));
  return planHit || sessionHit;
}

export async function seedDevDataIfEmpty(): Promise<SeedResult> {
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

  // Leave real user data alone; only overwrite our own previous seed output.
  if (hasAnyData && !looksLikeOurSeed(parsedPlans, parsedSessions)) {
    localStorage.setItem(SEED_FLAG, SEED_VERSION);
    return { seeded: false, reason: 'user-data-present' };
  }

  const corpus = await loadCorpus();
  const anchor = new Date();
  const plans = corpus.plans.map((p) => expandPlan(p, anchor));
  const sessions = corpus.sessions.map((s) => expandSession(s, anchor));
  const profile = corpus.profile;

  localStorage.setItem('wst_plans', JSON.stringify(plans));
  localStorage.setItem('wst_sessions', JSON.stringify(sessions));
  localStorage.setItem('wst_user_name', profile.userName);
  localStorage.setItem('wst_user_sex', profile.sex);
  localStorage.setItem('wst_user_age', String(profile.age));
  localStorage.setItem('wst_user_height_cm', String(profile.heightCm));
  localStorage.setItem('wst_user_weight_kg', String(profile.weightKg));
  localStorage.setItem(
    'wst_profile_created_at',
    expandFromDaysAgo(profile.profileCreatedAtDaysAgo, 12, 0, anchor),
  );
  localStorage.setItem('wst_consent_accepted', profile.consentAccepted ? 'true' : 'false');
  localStorage.setItem(SEED_FLAG, SEED_VERSION);

  return { seeded: true, sessionCount: sessions.length };
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

/**
 * Wipe all seeded data but mark the seed flag as applied, so the next load does
 * NOT re-seed — leaving the app on a clean onboarding flow. Used by the dev-only
 * reset control to exercise onboarding from scratch without re-seeding.
 */
export function resetToOnboarding(): void {
  if (typeof window === 'undefined') return;
  clearDevSeed();
  localStorage.setItem(SEED_FLAG, SEED_VERSION);
}
