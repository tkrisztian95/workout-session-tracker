import type { WorkoutPlan, ActiveSession, WorkoutSession } from './types';
import type { Locale } from './i18n';

const KEYS = {
  plans: 'wst_plans',
  sessions: 'wst_sessions',
  activeSession: 'wst_active_session',
  userName: 'wst_user_name',
  locale: 'wst_locale',
} as const;

// ─── Plans ────────────────────────────────────────────────────────────────────

export function getPlans(): WorkoutPlan[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEYS.plans);
    if (!raw) return [];
    return JSON.parse(raw) as WorkoutPlan[];
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

export function togglePlanStatus(id: string): void {
  const plans = getPlans();
  const index = plans.findIndex((p) => p.id === id);
  if (index === -1) return;
  const current = plans[index].status ?? 'active';
  plans[index] = { ...plans[index], status: current === 'active' ? 'completed' : 'active' };
  localStorage.setItem(KEYS.plans, JSON.stringify(plans));
}

// ─── Active session ───────────────────────────────────────────────────────────

export function getActiveSession(): ActiveSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(KEYS.activeSession);
    if (!raw) return null;
    return JSON.parse(raw) as ActiveSession;
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
    if (!raw) return [];
    return JSON.parse(raw) as WorkoutSession[];
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

// ─── Locale ───────────────────────────────────────────────────────────────────

export function getLocale(): Locale | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(KEYS.locale);
  if (stored === 'en' || stored === 'hu' || stored === 'de') return stored;
  return null;
}

export function saveLocale(locale: Locale): void {
  localStorage.setItem(KEYS.locale, locale);
}

export function saveSession(session: WorkoutSession): void {
  const sessions = getSessions();
  sessions.push(session);
  localStorage.setItem(KEYS.sessions, JSON.stringify(sessions));
}

export function deleteSession(id: string): void {
  const sessions = getSessions().filter((s) => s.id !== id);
  localStorage.setItem(KEYS.sessions, JSON.stringify(sessions));
}

export function updateSession(session: WorkoutSession): void {
  const sessions = getSessions();
  const index = sessions.findIndex((s) => s.id === session.id);
  if (index >= 0) {
    sessions[index] = session;
  }
  localStorage.setItem(KEYS.sessions, JSON.stringify(sessions));
}
