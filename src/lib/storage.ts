import type { WorkoutPlan, ActiveSession, WorkoutSession } from './types';

const KEYS = {
  plans: 'wst_plans',
  sessions: 'wst_sessions',
  activeSession: 'wst_active_session',
  userName: 'wst_user_name',
} as const;

// ─── Plans ────────────────────────────────────────────────────────────────────

export function getPlans(): WorkoutPlan[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEYS.plans);
    return raw ? (JSON.parse(raw) as WorkoutPlan[]) : [];
  } catch {
    return [];
  }
}

export function savePlan(plan: WorkoutPlan): void {
  const plans = getPlans();
  const index = plans.findIndex((p) => p.id === plan.id);
  if (index >= 0) {
    plans[index] = plan;
  } else {
    plans.push(plan);
  }
  localStorage.setItem(KEYS.plans, JSON.stringify(plans));
}

export function deletePlan(id: string): void {
  const plans = getPlans().filter((p) => p.id !== id);
  localStorage.setItem(KEYS.plans, JSON.stringify(plans));
}

// ─── Active session ───────────────────────────────────────────────────────────

export function getActiveSession(): ActiveSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(KEYS.activeSession);
    return raw ? (JSON.parse(raw) as ActiveSession) : null;
  } catch {
    return null;
  }
}

export function setActiveSession(session: ActiveSession): void {
  localStorage.setItem(KEYS.activeSession, JSON.stringify(session));
}

export function clearActiveSession(): void {
  localStorage.removeItem(KEYS.activeSession);
}

// ─── Completed sessions ───────────────────────────────────────────────────────

export function getSessions(): WorkoutSession[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEYS.sessions);
    return raw ? (JSON.parse(raw) as WorkoutSession[]) : [];
  } catch {
    return [];
  }
}

// ─── User name ────────────────────────────────────────────────────────────────

export function getUserName(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(KEYS.userName);
}

export function saveUserName(name: string): void {
  localStorage.setItem(KEYS.userName, name);
}

export function saveSession(session: WorkoutSession): void {
  const sessions = getSessions();
  sessions.push(session);
  localStorage.setItem(KEYS.sessions, JSON.stringify(sessions));
}
