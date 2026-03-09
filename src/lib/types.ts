// ─── LLM Config ───────────────────────────────────────────────────────────────

export interface LlmConfig {
  provider: 'openai';
  apiKey: string;
  model: string;
}

// ─── Exercise (used in sessions) ─────────────────────────────────────────────

export interface Exercise {
  id: string;
  name: string;
  type: 'sets-reps' | 'sets-duration' | 'duration';
  sets?: number; // present for sets-reps / sets-duration; absent for duration
  reps?: number; // present for sets-reps
  duration?: number; // seconds; present for sets-duration and duration
  weightKg?: number;
  scalingNote?: string;
  category?: string;
  completed?: boolean; // in-session tracking
  dismissed?: boolean; // in-session tracking
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
  category?: string;
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
}
