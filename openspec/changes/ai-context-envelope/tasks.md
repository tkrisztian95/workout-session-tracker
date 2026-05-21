## 1. Type definitions

- [ ] 1.1 Add `AiFeature` literal union (`'plan-suggest' | 'exercise-swap' | 'plan-adjust' | 'notes-import'`) in `src/lib/ai/context.ts`.
- [ ] 1.2 Define `SessionSummary` interface (id, completedAt, planId?, planDayName?, rating?, durationMin?, totalVolumeKg?, exerciseCount, topExercises) in `src/lib/ai/context.ts`.
- [ ] 1.3 Define `ContextProfile` interface (sex?, age?, heightCm?, weightKg?, name?) in `src/lib/ai/context.ts`.
- [ ] 1.4 Declare deferred placeholder types: `ContextPreferences`, `ContextLikes`, plus optional `SessionEvaluation[]` field (use an empty `interface ContextPreferences {}` and `interface ContextLikes {}` so callers can already destructure / pass them around — feeders will widen them).
- [ ] 1.5 Define `AiContext` interface exposing the Phase 1 populated fields (`profile`, `activePlans: WorkoutPlan[]`, `recentSessions: SessionSummary[]`, `progression: ExerciseProgression[]`, `exerciseHistoryNames: string[]`, `language: Locale | null`) and the deferred optional fields (`preferences?`, `evaluation?`, `likes?`).

## 2. Envelope factory

- [ ] 2.1 Implement `summariseSessionToSummary(session: WorkoutSession): SessionSummary` in `src/lib/ai/context.ts` — computes top exercises with best weight, total volume, duration minutes, exercise count.
- [ ] 2.2 Implement `buildAiContext(feature: AiFeature, options?: { now?: Date }): AiContext` in `src/lib/ai/context.ts` reading exclusively through `src/lib/storage.ts`.
- [ ] 2.3 Enforce ordering invariants inside `buildAiContext`: filter `sessions` to those with `completedAt`; sort newest-first; cap at exported constant `RECENT_SESSIONS_LIMIT = 20`.
- [ ] 2.4 Derive `progression` via `getExerciseWeightProgression(recent, all)` from `src/lib/statsUtils.ts` — passing the recent slice as the "in-range" set and the full session list as the "all-time" set so the trend/`isNew` flags stay correct.
- [ ] 2.5 Derive `exerciseHistoryNames` (frequency-sorted, capped at 100) so notes-import keeps its current disambiguation context.
- [ ] 2.6 Populate `language` from `getLocale()` so feature signatures can drop their per-call `language` arg.
- [ ] 2.7 Keep all deferred fields `undefined` in Phase 1 — do not pre-populate or attempt to read non-existent state.

## 3. Unit tests

- [ ] 3.1 Add `src/lib/ai/context.test.ts` covering: empty-state envelope (no plans, no sessions, no metrics).
- [ ] 3.2 Add test: typical user (some plans, some sessions, full profile) — assert populated fields, deferred undefined, `recentSessions` newest-first and capped at 20.
- [ ] 3.3 Add test: 100 synthetic sessions — assert exactly 20 retained, no `completedAt: ''` sessions present, top exercise selection deterministic.
- [ ] 3.4 Add test: `SessionSummary` excludes raw `loggedSets` (regression guard for token bloat).

## 4. Migrate AI feature modules

- [ ] 4.1 Refactor `src/lib/ai/plan.ts` — change `suggestPlan(config, ctx, preferences?)` signature. Drop direct `getSex` / `getAge` / `getHeightCm` / `getWeightKg` imports. Build prompt from `ctx.profile`, `ctx.activePlans`, `ctx.recentSessions`, `ctx.language` (replacing the separate `language` arg).
- [ ] 4.2 Refactor `src/lib/ai/adjust.ts → adjustPlan` — change to `adjustPlan(config, ctx, plan, instruction)`. Add an "About me / recent training" section to the user message using `ctx.profile` + a compact `ctx.recentSessions` rollup so the adjuster has the same context as the suggester.
- [ ] 4.3 Refactor `src/lib/ai/adjust.ts → swapExercise` — change to `swapExercise(config, ctx, plan, target, dayName, instruction?)`. Include a "Recent training" block built from `ctx.recentSessions` + relevant `ctx.progression` entry for `target.name`.
- [ ] 4.4 Refactor `src/lib/ai/import.ts → importSessions` — change to `importSessions(config, ctx, notes)` and read `ctx.exerciseHistoryNames` + `ctx.language` instead of taking them as separate args.
- [ ] 4.5 Update `src/lib/ai/index.ts` re-exports to include `AiContext`, `AiFeature`, `SessionSummary`, `buildAiContext`.

## 5. Migrate callers

- [ ] 5.1 Update `src/components/AiPlanSuggestionModal.tsx` to call `buildAiContext('plan-suggest')` and pass the envelope to `suggestPlan`.
- [ ] 5.2 Update `src/components/AiExerciseSwapModal.tsx` to call `buildAiContext('exercise-swap')` and pass the envelope to `swapExercise`.
- [ ] 5.3 Update `src/components/AiPlanAdjustModal.tsx` to call `buildAiContext('plan-adjust')` and pass the envelope to `adjustPlan`.
- [ ] 5.4 Update `src/components/NewHistorySessionSheet.tsx` to call `buildAiContext('notes-import')` and pass the envelope to `importSessions`. Drop the existing `getRecentExerciseNames` / `getLocale` calls at this site.

## 6. Verification

- [ ] 6.1 Run `npm run lint` and `npm run format:check` — clean.
- [ ] 6.2 Run `npm test` — all green, including the three new tests from section 3.
- [ ] 6.3 Run `npm run build` — production build succeeds with no new warnings.
- [ ] 6.4 Manual smoke (Playwright/Chrome DevTools MCP or local dev): trigger each of the four AI features in dev mode and confirm prompts still parse, plans / sessions / imports still apply correctly. Use the dev-seed corpus.

## 7. Documentation sync

- [ ] 7.1 Update `docs/ai-milestone.md` M1 task 2 to mark the envelope shipped (link to merged PR / commit) and note the new entry-point signatures of the four AI features.
