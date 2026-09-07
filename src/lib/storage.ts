import type {
  WorkoutPlan,
  ActiveSession,
  WorkoutSession,
  LlmConfig,
  Sex,
  AchievementRecord,
  PlanDaySnapshot,
} from './types';
import type { Locale } from './i18n';
import type { Muscle } from './muscles';
import { migrateLegacyCategory } from './muscles';
import { evaluateSession } from './sessionUtils';

interface LegacyExercise {
  category?: string;
  muscle?: Muscle;
  [k: string]: unknown;
}

/**
 * Rewrites a single exercise-like record in place: if it has a legacy `category`
 * string, convert it to the typed `muscle` field and drop `category`. Returns
 * true when the record was changed. Records a pending-migration flag when the
 * legacy value was `Legs` (the lossy mapping that triggers the user toast).
 */
function migrateExerciseInPlace(ex: LegacyExercise): boolean {
  if (typeof ex.category !== 'string') return false;
  const legacy = ex.category.trim().toLowerCase();
  const migrated = migrateLegacyCategory(ex.category);
  delete ex.category;
  if (migrated) ex.muscle = migrated;
  if (legacy === 'legs') {
    try {
      localStorage.setItem(KEYS.muscleMigrationPending, 'true');
    } catch {
      // localStorage may be unavailable (private mode, quota); migration still
      // completes — the toast simply won't fire.
    }
  }
  return true;
}

function migrateExerciseList(list: LegacyExercise[] | undefined): boolean {
  if (!Array.isArray(list)) return false;
  let mutated = false;
  for (const ex of list) {
    if (migrateExerciseInPlace(ex)) mutated = true;
  }
  return mutated;
}

function migratePlanExercises(plan: WorkoutPlan): boolean {
  let mutated = false;
  for (const day of plan.days ?? []) {
    if (migrateExerciseList(day.coreExercises as unknown as LegacyExercise[])) mutated = true;
    if (migrateExerciseList(day.optionalExercises as unknown as LegacyExercise[])) mutated = true;
  }
  if (migrateExerciseList(plan.sharedExercises as unknown as LegacyExercise[])) mutated = true;
  return mutated;
}

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
  homeBackground: 'wst_home_background',
  consentAccepted: 'wst_consent_accepted',
  achievements: 'wst_achievements',
  profileCreatedAt: 'wst_profile_created_at',
  hiddenExercises: 'wst_hidden_exercises',
  muscleMigrationPending: 'wst_muscle_migration_pending',
  muscleMigrationSeen: 'wst_muscle_migration_seen',
} as const;

export interface HiddenExerciseKey {
  nameKey: string;
  muscle?: Muscle;
}

// ─── Plans ────────────────────────────────────────────────────────────────────

export function getPlans(): WorkoutPlan[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEYS.plans);
    if (!raw) return [];
    const plans = JSON.parse(raw) as WorkoutPlan[];
    const mutated = plans.reduce((acc, plan) => migratePlanExercises(plan) || acc, false);
    if (mutated) localStorage.setItem(KEYS.plans, JSON.stringify(plans));
    return plans;
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
    completedAt: undefined,
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
  if (current === 'active') {
    plans[index] = {
      ...plans[index],
      status: 'completed',
      completedAt: new Date().toISOString(),
    };
  } else {
    const next = { ...plans[index], status: 'active' as const };
    delete next.completedAt;
    plans[index] = next;
  }
  localStorage.setItem(KEYS.plans, JSON.stringify(plans));
}

// ─── Active session ───────────────────────────────────────────────────────────

/**
 * Repairs an in-progress session whose sets-reps exercises are missing
 * `repsPerSet`. Sessions started before per-set rep schemes were carried into
 * the session exercise (the `toExercise` mapper in page.tsx) lost the scheme at
 * creation time — it can't be recovered from the session alone, but the source
 * plan still has it. When the session records its origin (`planId` +
 * `planDayId`), we look up that plan day and backfill the scheme onto matching
 * exercises by name, so a workout already underway shows the correct per-set
 * targets without discarding logged progress. Returns true when anything was
 * changed. No-ops for free sessions or sessions whose exercises already carry a
 * scheme. Matched by name within the plan day (shared + core + optional).
 */
function backfillRepsPerSetFromPlan(session: ActiveSession): boolean {
  if (!session.planId || !session.planDayId) return false;
  const needsBackfill = session.exercises.some(
    (ex) => ex.type === 'sets-reps' && !(ex.repsPerSet && ex.repsPerSet.length > 0),
  );
  if (!needsBackfill) return false;

  const plan = getPlans().find((p) => p.id === session.planId);
  const day = plan?.days.find((d) => d.id === session.planDayId);
  if (!day) return false;

  const schemeByName = new Map<string, number[]>();
  for (const ex of [
    ...(plan!.sharedExercises ?? []),
    ...day.coreExercises,
    ...day.optionalExercises,
  ]) {
    if (ex.repsPerSet && ex.repsPerSet.length > 0) schemeByName.set(ex.name, ex.repsPerSet);
  }
  if (schemeByName.size === 0) return false;

  let mutated = false;
  for (const ex of session.exercises) {
    if (ex.type !== 'sets-reps' || (ex.repsPerSet && ex.repsPerSet.length > 0)) continue;
    const scheme = schemeByName.get(ex.name);
    if (scheme) {
      ex.repsPerSet = [...scheme];
      mutated = true;
    }
  }
  return mutated;
}

export function getActiveSession(): ActiveSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(KEYS.activeSession);
    if (!raw) return null;
    const session = JSON.parse(raw) as ActiveSession;
    let mutated = migrateExerciseList(session.exercises as unknown as LegacyExercise[]);
    if (backfillRepsPerSetFromPlan(session)) mutated = true;
    if (mutated) {
      localStorage.setItem(KEYS.activeSession, JSON.stringify(session));
    }
    return session;
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

/**
 * Builds a {@link PlanDaySnapshot} for a session from an already-loaded plan
 * list. Returns `undefined` when the session has no plan origin or the origin
 * plan / day no longer exists.
 */
function planDaySnapshotFrom(
  session: Pick<WorkoutSession, 'planId' | 'planDayId'>,
  plans: WorkoutPlan[],
): PlanDaySnapshot | undefined {
  if (!session.planId || !session.planDayId) return undefined;
  const plan = plans.find((p) => p.id === session.planId);
  const day = plan?.days.find((d) => d.id === session.planDayId);
  if (!plan || !day) return undefined;
  return {
    planName: plan.name,
    day: structuredClone(day),
    capturedAt: new Date().toISOString(),
  };
}

/**
 * Resolves the frozen plan-day snapshot a session should be evaluated against,
 * looking the origin plan up in live storage. `undefined` for free sessions or
 * a deleted origin plan.
 */
export function resolvePlanDaySnapshot(
  session: Pick<WorkoutSession, 'planId' | 'planDayId'>,
): PlanDaySnapshot | undefined {
  if (!session.planId || !session.planDayId) return undefined;
  return planDaySnapshotFrom(session, getPlans());
}

/**
 * One-time backfill: gives any session missing a current `evaluation` a
 * plan-day snapshot (captured once from the plan as it exists now) and a
 * computed evaluation. Idempotent — a session already at the current schema
 * version is skipped. Returns true when anything changed.
 */
function backfillSessionEvaluations(sessions: WorkoutSession[]): boolean {
  const pending = sessions.filter((s) => !(s.evaluation != null && s.evaluation.v === 1));
  if (pending.length === 0) return false;
  const plans = getPlans();
  for (const s of pending) {
    const snapshot = s.planDaySnapshot ?? planDaySnapshotFrom(s, plans);
    if (snapshot && !s.planDaySnapshot) s.planDaySnapshot = snapshot;
    s.evaluation = evaluateSession(s, snapshot?.day);
  }
  return true;
}

export function getSessions(): WorkoutSession[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEYS.sessions);
    if (!raw) return [];
    const sessions = JSON.parse(raw) as WorkoutSession[];
    let mutated = sessions.reduce(
      (acc, s) => migrateExerciseList(s.exercises as unknown as LegacyExercise[]) || acc,
      false,
    );
    if (backfillSessionEvaluations(sessions)) mutated = true;
    if (mutated) localStorage.setItem(KEYS.sessions, JSON.stringify(sessions));
    return sessions;
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

/**
 * Dev/preview convenience: seed the AI key from a build-time env var so the AI
 * features are usable without hand-entering a key in Profile → AI Configuration.
 *
 * SECURITY: `NEXT_PUBLIC_*` vars are inlined into the client bundle and visible
 * to anyone. This fallback is honored ONLY in local dev or a Vercel preview —
 * never production. The gate fails closed: if the deployment environment can't
 * be confirmed as non-production, the env key is ignored. The primary safeguard
 * is still not setting `NEXT_PUBLIC_OPENAI_API_KEY` / `NEXT_PUBLIC_GEMINI_API_KEY`
 * on the Production env in Vercel; this code gate is defense-in-depth.
 */
function getEnvLlmConfig(): LlmConfig | null {
  const openaiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
  const geminiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!openaiKey && !geminiKey) return null;
  const vercelEnv = process.env.NEXT_PUBLIC_VERCEL_ENV;
  const isNonProduction =
    process.env.NODE_ENV === 'development' ||
    vercelEnv === 'preview' ||
    vercelEnv === 'development';
  if (!isNonProduction) return null;
  // OpenAI keeps precedence when both keys are present.
  if (openaiKey) {
    return {
      provider: 'openai',
      apiKey: openaiKey,
      model: process.env.NEXT_PUBLIC_OPENAI_MODEL || 'gpt-4o-mini',
    };
  }
  return {
    provider: 'gemini',
    apiKey: geminiKey as string,
    model: process.env.NEXT_PUBLIC_GEMINI_MODEL || 'gemini-2.5-flash',
  };
}

export function getLlmConfig(): LlmConfig | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(KEYS.llmConfig);
    if (raw) return JSON.parse(raw) as LlmConfig;
  } catch {
    // Corrupt localStorage value — fall through to the env fallback.
  }
  return getEnvLlmConfig();
}

export function saveLlmConfig(config: LlmConfig): void {
  localStorage.setItem(KEYS.llmConfig, JSON.stringify(config));
}

export function saveSession(session: WorkoutSession): void {
  const sessions = getSessions();
  const snapshot = session.planDaySnapshot ?? resolvePlanDaySnapshot(session);
  const record: WorkoutSession = {
    ...session,
    ...(snapshot ? { planDaySnapshot: snapshot } : {}),
    evaluation: evaluateSession(session, snapshot?.day),
  };
  sessions.push(record);
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
    sessions[index] = {
      ...session,
      updatedAt: new Date().toISOString(),
      evaluation: evaluateSession(session, session.planDaySnapshot?.day),
    };
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

// ─── Home background ──────────────────────────────────────────────────────────

export type HomeBackground = 'velocity' | 'charge' | 'ignite' | 'none';

export function getHomeBackground(): HomeBackground {
  if (typeof window === 'undefined') return 'velocity';
  const stored = localStorage.getItem(KEYS.homeBackground);
  if (stored === 'velocity' || stored === 'charge' || stored === 'ignite' || stored === 'none') {
    return stored;
  }
  return 'velocity';
}

export function saveHomeBackground(value: HomeBackground): void {
  localStorage.setItem(KEYS.homeBackground, value);
}

// ─── Profile created at ───────────────────────────────────────────────────────

export function getProfileCreatedAt(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(KEYS.profileCreatedAt);
}

export function saveProfileCreatedAt(date: string): void {
  localStorage.setItem(KEYS.profileCreatedAt, date);
}

// ─── Achievements ─────────────────────────────────────────────────────────────

export function getAchievements(): AchievementRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEYS.achievements);
    if (!raw) return [];
    return JSON.parse(raw) as AchievementRecord[];
  } catch {
    return [];
  }
}

export function saveAchievements(records: AchievementRecord[]): void {
  localStorage.setItem(KEYS.achievements, JSON.stringify(records));
}

// ─── Hidden exercises ─────────────────────────────────────────────────────────

export function getHiddenExercises(): HiddenExerciseKey[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEYS.hiddenExercises);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    let mutated = false;
    const entries: HiddenExerciseKey[] = [];
    for (const entry of parsed) {
      if (!entry || typeof entry !== 'object' || typeof entry.nameKey !== 'string') continue;
      if (migrateExerciseInPlace(entry as LegacyExercise)) mutated = true;
      entries.push(entry as HiddenExerciseKey);
    }
    if (mutated) localStorage.setItem(KEYS.hiddenExercises, JSON.stringify(entries));
    return entries;
  } catch {
    return [];
  }
}

export function saveHiddenExercises(entries: HiddenExerciseKey[]): void {
  localStorage.setItem(KEYS.hiddenExercises, JSON.stringify(entries));
}

// ─── Muscle migration notice ──────────────────────────────────────────────────

/**
 * True when the storage layer rewrote at least one `Legs` category to `quads`
 * during the most recent load and the user has not yet dismissed the notice.
 */
export function shouldShowMuscleMigrationNotice(): boolean {
  if (typeof window === 'undefined') return false;
  const pending = localStorage.getItem(KEYS.muscleMigrationPending) === 'true';
  const seen = localStorage.getItem(KEYS.muscleMigrationSeen) === 'true';
  return pending && !seen;
}

export function dismissMuscleMigrationNotice(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEYS.muscleMigrationSeen, 'true');
  localStorage.removeItem(KEYS.muscleMigrationPending);
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
