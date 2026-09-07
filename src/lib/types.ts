// ─── User profile ─────────────────────────────────────────────────────────────

export type Sex = 'male' | 'female';

// ─── LLM Config ───────────────────────────────────────────────────────────────

export type LlmProvider = 'openai' | 'gemini';

export interface LlmConfig {
  provider: LlmProvider;
  apiKey: string;
  model: string;
}

// ─── Exercise (used in sessions) ─────────────────────────────────────────────

import type { Muscle } from './muscles';

export interface LoggedSet {
  weight: number; // kg
  reps: number;
  seconds?: number; // elapsed time for time-based sets (e.g. plank); weight/reps are 0
  loggedAt: string; // ISO timestamp
}

export interface Exercise {
  id: string;
  name: string;
  type: 'sets-reps' | 'sets-duration' | 'duration';
  sets?: number; // present for sets-reps / sets-duration; absent for duration
  reps?: number; // uniform rep target; mutually exclusive with repsPerSet
  repsPerSet?: number[]; // per-set rep targets (e.g. [15, 12, 8, 4]); sets equals length when present
  duration?: number; // seconds; present for sets-duration and duration
  weightKg?: number;
  scalingNote?: string;
  muscle?: Muscle;
  completed?: boolean; // in-session tracking
  dismissed?: boolean; // in-session tracking
  completedAt?: string; // ISO timestamp set when exercise is marked complete
  loggedSets?: LoggedSet[]; // per-set log for sets-reps exercises
}

// ─── Plan data models ─────────────────────────────────────────────────────────

export interface PlanExercise {
  id: string;
  name: string;
  type: 'sets-reps' | 'sets-duration' | 'duration';
  sets?: number;
  reps?: number; // uniform rep target; mutually exclusive with repsPerSet
  repsPerSet?: number[]; // per-set rep targets (e.g. [15, 12, 8, 4]); sets equals length when present
  duration?: number;
  weightKg?: number;
  role: 'core' | 'optional';
  scalingNote?: string;
  muscle?: Muscle;
}

export interface PlanDay {
  id: string;
  name: string;
  weekdays: number[]; // 0 = Sunday … 6 = Saturday
  coreExercises: PlanExercise[];
  optionalExercises: PlanExercise[];
}

export interface WorkoutPlan {
  id: string;
  name: string;
  days: PlanDay[];
  sharedExercises: PlanExercise[];
  createdAt: string; // ISO date string
  updatedAt: string;
  status?: 'active' | 'completed';
  completedAt?: string; // ISO timestamp set when the plan is marked completed
  aiGenerated?: boolean;
  scheduledWeeks?: number;
}

// ─── Session data models ──────────────────────────────────────────────────────

/** A session that is currently in progress (stored in wst_active_session). */
export interface ActiveSession {
  id: string;
  startedAt: string;
  exercises: Exercise[];
  planId?: string;
  planDayId?: string;
  planName?: string;
  planDayName?: string;
  pausedAt?: string; // ISO timestamp set when session is paused; absent when active
  totalPausedMs: number; // cumulative ms spent paused across all pause/resume cycles
}

// ─── Achievements ─────────────────────────────────────────────────────────────

export interface AchievementRecord {
  id: string;
  unlockedAt: string; // ISO timestamp
  seen: boolean;
}

/**
 * Frozen copy of the plan day a session was run against, captured the first
 * time the session is persisted. The session's plan-adherence evaluation and
 * its vs-Plan comparison read this snapshot rather than the live plan, so
 * editing or deleting the plan afterwards never rewrites historical verdicts.
 * A shared plan-version log (issue #134) is the eventual replacement.
 */
export interface PlanDaySnapshot {
  planName: string;
  day: PlanDay; // deep copy of the origin plan day at capture time
  capturedAt: string; // ISO timestamp
}

/**
 * Deterministic plan-adherence rollup for a completed session. Computed once
 * per session write against {@link PlanDaySnapshot}, backfilled onto legacy
 * sessions, and read by the vs-Plan tab and AI prompt construction.
 */
export interface SessionEvaluation {
  /** Session verdict relative to the plan-day snapshot, or `no-plan`. */
  overall: 'overdone' | 'on-target' | 'underperformed' | 'no-plan';
  /** Number of session exercises in each plan-comparison status. */
  counts: {
    overdone: number;
    matched: number;
    underperformed: number;
    missed: number;
    extra: number;
  };
  /** Top deviations, ranked, capped at 3. Omitted for no-plan sessions. */
  highlights?: Array<{
    exerciseName: string;
    status: 'overdone' | 'underperformed' | 'missed' | 'extra';
    /** Human-readable set delta, e.g. "+2 set" / "−1 set". Absent for `missed`. */
    delta?: string;
  }>;
  /** Σ weight × reps across every logged set. Omitted when 0. */
  totalVolumeKg?: number;
  /** Mean logged set weight across sets that carried a weight. Omitted when none. */
  avgWeightKg?: number;
  /** Total logged sets across non-dismissed exercises. Omitted when 0. */
  setCount?: number;
  /** Copied from the session's own rating when present. */
  rating?: 1 | 2 | 3 | 4 | 5;
  /** Schema version for future migrations. */
  v: 1;
}

/** A completed session (stored in the wst_sessions array). */
export interface WorkoutSession {
  id: string;
  startedAt: string;
  completedAt: string;
  exercises: Exercise[];
  planId?: string;
  planDayId?: string;
  rating?: 1 | 2 | 3 | 4 | 5;
  updatedAt?: string; // set when the session is edited after completion
  importedViaAi?: boolean; // set when the session was created via AI import
  planDaySnapshot?: PlanDaySnapshot; // frozen plan-day baseline; captured on first save
  evaluation?: SessionEvaluation; // plan-adherence rollup; refreshed on every write
}
