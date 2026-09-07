## Why

Every AI feature already receives serialized session history, but the interesting signal — _"this session: 1 overdone, 3 on target, 1 underperformed, overall on track"_ — is computed by `SessionPlanComparison.tsx` at render time and thrown away. The model is left to re-derive plan adherence from raw sets, which is token-expensive, slow, and unreliable (it usually skims the last few sessions and guesses).

Persisting a small deterministic evaluation object on each session lets the AI skim a session header instead of re-reading every set. This is a required feeder for the M2 AI features — the session debrief ([#64](https://github.com/tkrisztian95/workout-session-tracker/issues/64)) and in-session coach ([#63](https://github.com/tkrisztian95/workout-session-tracker/issues/63)) both read the evaluation strip as their primary input.

Closes [#54](https://github.com/tkrisztian95/workout-session-tracker/issues/54).

## What Changes

- **New persisted shape** `SessionEvaluation` on `WorkoutSession.evaluation?` — overall verdict, per-status exercise counts, ranked highlights, rolled-up volume/intensity totals, copied rating, and a schema version `v: 1`.
- **New persisted shape** `PlanDaySnapshot` on `WorkoutSession.planDaySnapshot?` — a deep copy of the origin plan day (plus plan name and capture timestamp), taken when the session is first saved. The session is evaluated against this snapshot, not the live plan, so later plan edits do not silently rewrite historical verdicts. A shared plan-version log ([#134](https://github.com/tkrisztian95/workout-session-tracker/issues/134)) is the eventual replacement; the snapshot is the self-contained interim.
- **New pure function** `evaluateSession(session, planDay?)` in `src/lib/sessionUtils.ts` that computes a `SessionEvaluation`, reusing the existing `classifyPlannedExercise` / `plannedSetsForPlan` / `actualSetsForPlan` logic.
- **New pure function** `compareSessionToPlan(session, planDay?)` in `src/lib/sessionUtils.ts` — the name-matching + `extra`-bucket row builder lifted out of `SessionPlanComparison.tsx`, now the shared core for both the vs-Plan tab and `evaluateSession` so they cannot drift.
- **Centralized compute in the storage layer** — `saveSession` and `updateSession` (`src/lib/storage.ts`) attach/refresh `evaluation` for every write path (session finish, manual history record, AI import, post-completion edit). `saveSession` also captures `planDaySnapshot` on first save; `updateSession` recomputes against the existing snapshot without re-capturing it.
- **One-time backfill migration** in `getSessions` — populates `planDaySnapshot` (from the current plan, one time) and `evaluation` on any stored session missing them.
- **vs-Plan tab reads the snapshot** — `src/app/history/[id]/page.tsx` feeds `session.planDaySnapshot` to `SessionPlanComparison` (falling back to a live lookup only for a not-yet-backfilled session).
- **AI envelope wiring** — `buildAiContext` populates `AiContext.evaluation`, and recent-session prompt lines gain a compact evaluation strip.
- **Docs** — `docs/data-structure.md` updated in the same PR (new types, new migration).
- No-plan sessions (`overall: 'no-plan'`) still get `counts`, volume totals, and rating.

## Capabilities

### New Capabilities

- `session-evaluation-meta`: Deterministic per-session evaluation object plus the plan-day snapshot it is judged against — computed centrally on every session write, backfilled onto existing sessions, and exposed as the single source of truth for plan-adherence rollups shared by the vs-Plan tab and AI prompt construction.

### Modified Capabilities

- `ai-context-envelope`: The `evaluation` field graduates from a declared-but-unpopulated deferred field to a populated field carrying `SessionEvaluation` data, and recent-session prompt lines gain an evaluation strip.

## Impact

- **Types** — `src/lib/types.ts`: `SessionEvaluation` + `PlanDaySnapshot` interfaces; `WorkoutSession.evaluation?` + `WorkoutSession.planDaySnapshot?`.
- **Logic** — `src/lib/sessionUtils.ts`: new `compareSessionToPlan` + `evaluateSession`; `src/components/SessionPlanComparison.tsx` refactored onto `compareSessionToPlan`.
- **Storage** — `src/lib/storage.ts`: `resolvePlanDaySnapshot` helper; `saveSession` + `updateSession` attach/refresh evaluation; backfill migration in `getSessions`; `docs/data-structure.md` sync.
- **History detail** — `src/app/history/[id]/page.tsx`: resolve `planDay` from the snapshot.
- **Session finish** — `src/app/page.tsx` `handleFinish` needs no change (delegates to `saveSession`).
- **AI** — `src/lib/ai/context.ts`: widen `SessionEvaluation` type, populate `AiContext.evaluation`, add the evaluation strip to `formatSessionSummaryLine`; envelope unit tests.
- **Export payload** — unchanged shape; the new optional fields ride along on `sessions: WorkoutSession[]`, no `schemaVersion` bump.
- No new dependencies. No breaking changes — both fields are optional and backfilled.
