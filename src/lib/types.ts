// ─── User profile ─────────────────────────────────────────────────────────────

export type Sex = 'male' | 'female';

// ─── LLM Config ───────────────────────────────────────────────────────────────

export interface LlmConfig {
  provider: 'openai';
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
  reps?: number; // present for sets-reps
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
  reps?: number;
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
}
