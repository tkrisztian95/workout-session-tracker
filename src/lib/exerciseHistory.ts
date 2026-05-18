import type { Exercise, PlanExercise, WorkoutPlan, WorkoutSession } from './types';
import type { HiddenExerciseKey } from './storage';
import type { Muscle } from './muscles';

export interface HistoryEntry {
  key: string;
  nameKey: string;
  name: string;
  muscle?: Muscle;
  type: Exercise['type'];
  sets?: number;
  reps?: number;
  duration?: number;
  weightKg?: number;
  lastUsedAt: string;
  isHidden: boolean;
}

export function canonicalExerciseKey(name: string, muscle?: string): string {
  const nameKey = name.trim().toLowerCase();
  const m = (muscle ?? '').trim().toLowerCase();
  return m ? `${nameKey}|${m}` : nameKey;
}

function nameKeyOnly(name: string): string {
  return name.trim().toLowerCase();
}

interface CandidateExercise {
  name: string;
  muscle?: Muscle;
  type: Exercise['type'];
  sets?: number;
  reps?: number;
  duration?: number;
  weightKg?: number;
  timestamp: string;
}

function fromSessionExercise(ex: Exercise, timestamp: string): CandidateExercise {
  return {
    name: ex.name,
    muscle: ex.muscle,
    type: ex.type,
    sets: ex.sets,
    reps: ex.reps,
    duration: ex.duration,
    weightKg: ex.weightKg,
    timestamp,
  };
}

function fromPlanExercise(ex: PlanExercise, timestamp: string): CandidateExercise {
  return {
    name: ex.name,
    muscle: ex.muscle,
    type: ex.type,
    sets: ex.sets,
    reps: ex.reps,
    duration: ex.duration,
    weightKg: ex.weightKg,
    timestamp,
  };
}

function collectCandidates(sessions: WorkoutSession[], plans: WorkoutPlan[]): CandidateExercise[] {
  const out: CandidateExercise[] = [];
  for (const session of sessions) {
    const ts = session.completedAt;
    for (const ex of session.exercises) {
      if (!ex.name?.trim()) continue;
      out.push(fromSessionExercise(ex, ts));
    }
  }
  for (const plan of plans) {
    const ts = plan.updatedAt;
    for (const day of plan.days) {
      for (const ex of day.coreExercises) {
        if (!ex.name?.trim()) continue;
        out.push(fromPlanExercise(ex, ts));
      }
      for (const ex of day.optionalExercises) {
        if (!ex.name?.trim()) continue;
        out.push(fromPlanExercise(ex, ts));
      }
    }
    for (const ex of plan.sharedExercises) {
      if (!ex.name?.trim()) continue;
      out.push(fromPlanExercise(ex, ts));
    }
  }
  return out;
}

export interface DeriveOptions {
  includeHidden?: boolean;
}

export function deriveExerciseHistory(
  sessions: WorkoutSession[],
  plans: WorkoutPlan[],
  hidden: HiddenExerciseKey[],
  options: DeriveOptions = {},
): HistoryEntry[] {
  const { includeHidden = false } = options;
  const candidates = collectCandidates(sessions, plans);

  const map = new Map<string, CandidateExercise>();
  for (const c of candidates) {
    const key = canonicalExerciseKey(c.name, c.muscle);
    const prev = map.get(key);
    if (!prev || c.timestamp > prev.timestamp) {
      map.set(key, c);
    }
  }

  const hiddenSet = new Set(hidden.map((h) => canonicalExerciseKey(h.nameKey, h.muscle)));

  const entries: HistoryEntry[] = [];
  for (const [key, c] of map) {
    const isHidden = hiddenSet.has(key);
    if (isHidden && !includeHidden) continue;
    entries.push({
      key,
      nameKey: nameKeyOnly(c.name),
      name: c.name,
      muscle: c.muscle,
      type: c.type,
      sets: c.sets,
      reps: c.reps,
      duration: c.duration,
      weightKg: c.weightKg,
      lastUsedAt: c.timestamp,
      isHidden,
    });
  }

  entries.sort((a, b) => b.lastUsedAt.localeCompare(a.lastUsedAt));
  return entries;
}
