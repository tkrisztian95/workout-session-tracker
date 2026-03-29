import type { WorkoutPlan, ActiveSession, WorkoutSession, LlmConfig, Sex } from './types';
import type { Locale } from './i18n';

const KEYS = {
  plans: 'wst_plans',
  sessions: 'wst_sessions',
  activeSession: 'wst_active_session',
  userName: 'wst_user_name',
  locale: 'wst_locale',
  llmConfig: 'wst_llm_config',
  userSex: 'wst_user_sex',
  userAge: 'wst_user_age',
  userHeightCm: 'wst_user_height_cm',
  userWeightKg: 'wst_user_weight_kg',
  theme: 'wst_theme',
  consentAccepted: 'wst_consent_accepted',
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

export function duplicatePlan(id: string): WorkoutPlan {
  const plans = getPlans();
  const original = plans.find((p) => p.id === id);
  if (!original) throw new Error(`Plan ${id} not found`);
  const now = new Date().toISOString();
  const copy: WorkoutPlan = {
    ...original,
    id: crypto.randomUUID(),
    name: `${original.name} (copy)`,
    status: 'active',
    createdAt: now,
    updatedAt: now,
    days: original.days.map((day) => ({
      ...day,
      id: crypto.randomUUID(),
      coreExercises: day.coreExercises.map((ex) => ({ ...ex, id: crypto.randomUUID() })),
      optionalExercises: day.optionalExercises.map((ex) => ({ ...ex, id: crypto.randomUUID() })),
    })),
    sharedExercises: original.sharedExercises.map((ex) => ({ ...ex, id: crypto.randomUUID() })),
  };
  savePlan(copy);
  return copy;
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

// ─── User sex ─────────────────────────────────────────────────────────────────

export function getSex(): Sex | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(KEYS.userSex);
  if (stored === 'male' || stored === 'female') return stored;
  return null;
}

export function saveSex(sex: Sex | null): void {
  if (sex === null) {
    localStorage.removeItem(KEYS.userSex);
  } else {
    localStorage.setItem(KEYS.userSex, sex);
  }
}

// ─── Body metrics ─────────────────────────────────────────────────────────────

export function getAge(): number | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(KEYS.userAge);
  if (!stored) return null;
  const n = Number(stored);
  return Number.isFinite(n) ? n : null;
}

export function saveAge(age: number): void {
  localStorage.setItem(KEYS.userAge, String(age));
}

export function getHeightCm(): number | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(KEYS.userHeightCm);
  if (!stored) return null;
  const n = Number(stored);
  return Number.isFinite(n) ? n : null;
}

export function saveHeightCm(cm: number): void {
  localStorage.setItem(KEYS.userHeightCm, String(cm));
}

export function getWeightKg(): number | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(KEYS.userWeightKg);
  if (!stored) return null;
  const n = Number(stored);
  return Number.isFinite(n) ? n : null;
}

export function saveWeightKg(kg: number): void {
  localStorage.setItem(KEYS.userWeightKg, String(kg));
}

// ─── LLM Config ───────────────────────────────────────────────────────────────

export function getLlmConfig(): LlmConfig | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(KEYS.llmConfig);
    if (!raw) return null;
    return JSON.parse(raw) as LlmConfig;
  } catch {
    return null;
  }
}

export function saveLlmConfig(config: LlmConfig): void {
  localStorage.setItem(KEYS.llmConfig, JSON.stringify(config));
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

export function getRecentExerciseNames(): string[] {
  const sessions = getSessions();
  const sorted = [...sessions].sort((a, b) => b.completedAt.localeCompare(a.completedAt));
  const seen = new Set<string>();
  const names: string[] = [];
  for (const session of sorted) {
    for (const exercise of session.exercises) {
      const name = exercise.name.trim();
      if (name && !seen.has(name)) {
        seen.add(name);
        names.push(name);
        if (names.length >= 100) return names;
      }
    }
  }
  return names;
}

// ─── Theme ────────────────────────────────────────────────────────────────────

export type Theme = 'light' | 'dark' | 'system';

export function getTheme(): Theme | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(KEYS.theme);
  if (stored === 'light' || stored === 'dark' || stored === 'system') return stored;
  return null;
}

export function saveTheme(theme: Theme): void {
  localStorage.setItem(KEYS.theme, theme);
}

// ─── Consent ──────────────────────────────────────────────────────────────────

export function hasSeenConsent(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(KEYS.consentAccepted) !== null;
}

export function getConsentAccepted(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(KEYS.consentAccepted) === 'true';
}

export function saveConsentAccepted(): void {
  localStorage.setItem(KEYS.consentAccepted, 'true');
}

export function saveConsentDeclined(): void {
  localStorage.setItem(KEYS.consentAccepted, 'false');
}

// ─── Data export ──────────────────────────────────────────────────────────────

export interface ExportPayload {
  schemaVersion: string;
  exportedAt: string;
  profile: {
    name: string | null;
    sex: Sex | null;
    age: number | null;
    heightCm: number | null;
    weightKg: number | null;
  };
  plans: WorkoutPlan[];
  sessions: WorkoutSession[];
}

export function exportAllData(): ExportPayload {
  return {
    schemaVersion: '1',
    exportedAt: new Date().toISOString(),
    profile: {
      name: getUserName(),
      sex: getSex(),
      age: getAge(),
      heightCm: getHeightCm(),
      weightKg: getWeightKg(),
    },
    plans: getPlans(),
    sessions: getSessions(),
  };
}
