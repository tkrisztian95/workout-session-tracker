// ─── Exercise (used in sessions) ─────────────────────────────────────────────

export interface Exercise {
  id: string;
  name: string;
  type: 'reps' | 'duration';
  sets: number;
  reps?: number;       // set when type === 'reps'
  duration?: number;   // seconds, set when type === 'duration'
  scalingNote?: string; // shown when exercise originated from a plan
}

// ─── Plan data models ─────────────────────────────────────────────────────────

export interface PlanExercise {
  id: string;
  name: string;
  type: 'reps' | 'duration';
  sets: number;
  reps?: number;
  duration?: number;
  role: 'core' | 'optional';
  scalingNote?: string;
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
  createdAt: string; // ISO date string
  updatedAt: string;
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
}
