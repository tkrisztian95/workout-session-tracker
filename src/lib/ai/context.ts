import type { WorkoutPlan, WorkoutSession, LoggedSet, Sex } from '../types';
import type { Muscle } from '../muscles';
import type { Locale } from '../i18n';
import {
  getPlans,
  getSessions,
  getRecentExerciseNames,
  getUserName,
  getSex,
  getAge,
  getHeightCm,
  getWeightKg,
  getLocale,
} from '../storage';
import { getExerciseWeightProgression, type ExerciseProgression } from '../statsUtils';

// ─── Tunables ─────────────────────────────────────────────────────────────────

/**
 * Cap on the number of recent sessions included in the envelope. Controlled
 * from this file so the context-budget guard (issue #62) can tighten it
 * without grepping every prompt builder.
 */
export const RECENT_SESSIONS_LIMIT = 20;

/** Cap on exercise-name disambiguation list passed to notes-import. */
const EXERCISE_HISTORY_NAME_LIMIT = 100;

/** Number of "top" exercises retained per session summary. */
const TOP_EXERCISES_PER_SESSION = 6;

// ─── Public types ─────────────────────────────────────────────────────────────

/**
 * Identifies which AI feature is requesting the envelope. New AI features
 * MUST extend this union so future context-shaping logic (budget guards,
 * field selection) can match on the consumer exhaustively.
 */
export type AiFeature = 'plan-suggest' | 'exercise-swap' | 'plan-adjust' | 'notes-import';

export interface ContextProfile {
  name?: string;
  sex?: Sex;
  age?: number;
  heightCm?: number;
  weightKg?: number;
}

/**
 * Compact projection of a `WorkoutSession` used inside the AI envelope.
 * Excludes raw per-set logs (they explode token cost); the prompt-relevant
 * facts are rolled up into `topExercises` and the totals fields.
 */
export interface SessionSummary {
  id: string;
  completedAt: string;
  planId?: string;
  planDayId?: string;
  planDayName?: string;
  rating?: 1 | 2 | 3 | 4 | 5;
  durationMin?: number;
  totalVolumeKg?: number;
  exerciseCount: number;
  topExercises: SessionSummaryExercise[];
}

export interface SessionSummaryExercise {
  name: string;
  muscle?: Muscle;
  /** Heaviest weight (kg) logged for this exercise in this session, if any. */
  bestWeightKg?: number;
  /** Number of completed sets for this exercise in this session. */
  sets: number;
}

// Placeholder shapes for fields populated by future feeder issues. They
// exist now so consumers can already destructure / pass them around;
// feeder issues will widen these as they ship.
//
// - `ContextPreferences` → issue #53 (onboarding)
// - `SessionEvaluation`  → issue #54 (session evaluation meta)
// - `ContextLikes`       → issue #52 (like / dislike exercises)
export type ContextPreferences = Record<string, never>;
export type SessionEvaluation = Record<string, never>;
export type ContextLikes = Record<string, never>;

export interface AiContext {
  /** Locale captured at envelope-build time. Drives response language. */
  language: Locale | null;
  /** Body metrics + display name. Every field is optional. */
  profile: ContextProfile;
  /** Plans the user is actively following (status !== 'completed'). */
  activePlans: WorkoutPlan[];
  /** Last N completed sessions newest-first, compressed shape. */
  recentSessions: SessionSummary[];
  /** Per-exercise weight progression (reused from the stats page). */
  progression: ExerciseProgression[];
  /** Frequency-sorted exercise-name list for notes-import disambiguation. */
  exerciseHistoryNames: string[];

  // ── Deferred (declared optional; populated by future feeder issues) ──────
  /** Onboarding-captured preferences. Populated by #53. */
  preferences?: ContextPreferences;
  /** Per-session evaluation meta. Populated by #54. */
  evaluation?: SessionEvaluation[];
  /** Liked / disliked exercise names. Populated by #52. */
  likes?: ContextLikes;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function bestWeightInSession(loggedSets: LoggedSet[] | undefined): number | undefined {
  if (!loggedSets || loggedSets.length === 0) return undefined;
  let max = -Infinity;
  for (const set of loggedSets) {
    if (typeof set.weight === 'number' && set.weight > max) max = set.weight;
  }
  return Number.isFinite(max) && max > 0 ? max : undefined;
}

function totalVolumeForSession(session: WorkoutSession): number | undefined {
  let total = 0;
  let hadAny = false;
  for (const ex of session.exercises) {
    for (const set of ex.loggedSets ?? []) {
      if (typeof set.weight === 'number' && typeof set.reps === 'number') {
        total += set.weight * set.reps;
        hadAny = true;
      }
    }
  }
  return hadAny ? Math.round(total) : undefined;
}

function durationMinutes(session: WorkoutSession): number | undefined {
  if (!session.startedAt || !session.completedAt) return undefined;
  const start = Date.parse(session.startedAt);
  const end = Date.parse(session.completedAt);
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return undefined;
  return Math.round((end - start) / 60000);
}

function lookupPlanDayName(
  plans: WorkoutPlan[],
  planId: string | undefined,
  planDayId: string | undefined,
): string | undefined {
  if (!planId || !planDayId) return undefined;
  const plan = plans.find((p) => p.id === planId);
  if (!plan) return undefined;
  return plan.days.find((d) => d.id === planDayId)?.name;
}

/**
 * Compresses a `WorkoutSession` to the prompt-essential rollup carried by the
 * envelope. Picks up to `TOP_EXERCISES_PER_SESSION` exercises ordered by
 * appearance, with each exercise's best weight + completed-set count.
 */
export function summariseSessionToSummary(
  session: WorkoutSession,
  plans: WorkoutPlan[] = [],
): SessionSummary {
  const topExercises: SessionSummaryExercise[] = session.exercises
    .slice(0, TOP_EXERCISES_PER_SESSION)
    .map((ex) => {
      const sets = (ex.loggedSets ?? []).length || ex.sets || 0;
      const entry: SessionSummaryExercise = { name: ex.name, sets };
      if (ex.muscle) entry.muscle = ex.muscle;
      const best = bestWeightInSession(ex.loggedSets) ?? ex.weightKg;
      if (typeof best === 'number') entry.bestWeightKg = best;
      return entry;
    });

  const summary: SessionSummary = {
    id: session.id,
    completedAt: session.completedAt,
    exerciseCount: session.exercises.length,
    topExercises,
  };
  if (session.planId) summary.planId = session.planId;
  if (session.planDayId) summary.planDayId = session.planDayId;
  const dayName = lookupPlanDayName(plans, session.planId, session.planDayId);
  if (dayName) summary.planDayName = dayName;
  if (session.rating) summary.rating = session.rating;
  const dur = durationMinutes(session);
  if (typeof dur === 'number') summary.durationMin = dur;
  const vol = totalVolumeForSession(session);
  if (typeof vol === 'number') summary.totalVolumeKg = vol;
  return summary;
}

// ─── Factory ──────────────────────────────────────────────────────────────────

interface BuildOptions {
  /**
   * Override the "now" timestamp used for session sorting. Reserved for tests
   * and future scenarios where the envelope is built for a non-live audience.
   */
  now?: Date;
}

/**
 * Assembles the single typed envelope every AI feature consumes. Reads
 * exclusively through `src/lib/storage.ts` — never `localStorage` directly.
 *
 * Phase 1 populates `profile`, `activePlans`, `recentSessions`, `progression`,
 * `exerciseHistoryNames`, and `language`. The deferred fields (`preferences`,
 * `evaluation`, `likes`) are declared optional and left `undefined` until
 * their feeder issues (#52, #53, #54) ship.
 *
 * The `feature` parameter is currently unused for field selection but exists
 * so the future budget guard (#62) can switch on it exhaustively.
 */
export function buildAiContext(feature: AiFeature, options?: BuildOptions): AiContext {
  // Reserved for #62 — feature-aware field shaping. No-op today but keeps the
  // signature stable.
  void feature;
  void options;

  const allPlans = getPlans();
  const activePlans = allPlans.filter((p) => p.status !== 'completed');

  const sessions = getSessions();
  const completedSessions = sessions.filter((s) => s.completedAt);
  const sortedSessions = [...completedSessions].sort((a, b) =>
    b.completedAt.localeCompare(a.completedAt),
  );
  const recentRaw = sortedSessions.slice(0, RECENT_SESSIONS_LIMIT);
  const recentSessions = recentRaw.map((s) => summariseSessionToSummary(s, allPlans));

  const progression = getExerciseWeightProgression(recentRaw, completedSessions);
  const exerciseHistoryNames = getRecentExerciseNames().slice(0, EXERCISE_HISTORY_NAME_LIMIT);

  const profile: ContextProfile = {};
  const name = getUserName();
  if (name) profile.name = name;
  const sex = getSex();
  if (sex) profile.sex = sex;
  const age = getAge();
  if (typeof age === 'number') profile.age = age;
  const heightCm = getHeightCm();
  if (typeof heightCm === 'number') profile.heightCm = heightCm;
  const weightKg = getWeightKg();
  if (typeof weightKg === 'number') profile.weightKg = weightKg;

  return {
    language: getLocale(),
    profile,
    activePlans,
    recentSessions,
    progression,
    exerciseHistoryNames,
  };
}
