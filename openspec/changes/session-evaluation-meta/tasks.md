## 1. Types

- [x] 1.1 Add `SessionEvaluation` and `PlanDaySnapshot` interfaces plus `WorkoutSession.evaluation?` and `WorkoutSession.planDaySnapshot?` to `src/lib/types.ts`, per the spec shapes (`SessionEvaluation`: `overall`, `counts`, `highlights?`, `totalVolumeKg?`, `avgWeightKg?`, `setCount?`, `rating?`, `v: 1`; `PlanDaySnapshot`: `planName`, `day: PlanDay`, `capturedAt`). Verify `npx tsc --noEmit` passes.

## 2. Shared comparison core

- [x] 2.1 Extract `buildRows` + `ComparisonRow` + the `counts` reducer from `src/components/SessionPlanComparison.tsx` into a pure `compareSessionToPlan(session, planDay?): ComparisonRow[]` in `src/lib/sessionUtils.ts`. Verify a new unit test asserts row status + counts for a mixed session (overdone + matched + underperformed + missed + extra).
- [x] 2.2 Rewire `SessionPlanComparison.tsx` onto `compareSessionToPlan`; delete its local `buildRows`. Verify the tab still renders the same legend counts (run the tests touching it, or a Playwright screenshot of a session's vs-Plan tab).

## 3. `evaluateSession`

- [x] 3.1 Implement `evaluateSession(session, planDay?): SessionEvaluation` in `src/lib/sessionUtils.ts` — `overall` rule from design §3, `counts` from `compareSessionToPlan`, numeric rollups from design §3, `highlights` top-3 from design §3. No `storage.ts` import. Verify unit tests: plan verdicts (overdone / on-target / underperformed), `no-plan` session (counts.extra + volume + rating), determinism (two calls deeply equal), `v === 1`.
- [x] 3.2 Add a unit test asserting the vs-Plan comparison counts for a fixture session equal `evaluateSession(session, planDay).counts` for all five statuses (spec: "vs-Plan tab and persisted meta agree").

## 4. Snapshot + centralized compute in the storage layer

- [x] 4.1 Add `resolvePlanDaySnapshot(session): PlanDaySnapshot | undefined` to `src/lib/storage.ts` — `planId` + `planDayId` → `getPlans()` lookup → deep-copied `day`, `planName`, `capturedAt: now`; `undefined` when no origin resolves. Verify a unit test covering resolved / no-planId / dangling-planId cases.
- [x] 4.2 In `saveSession`, capture `planDaySnapshot` (reuse `session.planDaySnapshot` if already present, else `resolvePlanDaySnapshot`) and attach `evaluation = evaluateSession(session, snapshot?.day)` before persisting. Verify unit tests: finishing a plan session persists `evaluation.v === 1` + a `planDaySnapshot` whose `day` deep-equals the plan day; a free session persists `overall: 'no-plan'` and no snapshot; a session created via the manual-record / AI-import paths (also `saveSession`) is evaluated.
- [x] 4.3 In `updateSession`, recompute `evaluation` against the **existing** `session.planDaySnapshot?.day` alongside the `updatedAt` stamp; do not re-capture the snapshot. Verify a unit test: editing a fixture session's logged sets matched→overdone updates `evaluation.counts` and leaves `planDaySnapshot` byte-for-byte unchanged.
- [x] 4.4 Verify no other module calls `evaluateSession` for a write — `grep -rn evaluateSession src --include='*.ts' --include='*.tsx'` shows only `sessionUtils`, `storage`, and tests.

## 5. Backfill migration

- [x] 5.1 Add a backfill pass in `getSessions` (`src/lib/storage.ts`): for each session where `evaluation == null || evaluation.v !== 1`, resolve the snapshot (`s.planDaySnapshot ?? resolvePlanDaySnapshot(s)`), capture it onto the session when newly resolved, set `s.evaluation = evaluateSession(s, snapshot?.day)`; persist once if anything changed. Verify unit tests: legacy session with a live plan origin gains `planDaySnapshot` + `evaluation` and is persisted; a second read does not rewrite storage; a session with a dangling `planId` gets `overall: 'no-plan'`, no snapshot, volume totals still present.
- [x] 5.2 Verify `npm run test` passes for the full `storage` + `sessionUtils` suites.

## 6. vs-Plan tab reads the snapshot

- [ ] 6.1 In `src/app/history/[id]/page.tsx`, source `planDay` from `session.planDaySnapshot?.day` (falling back to the live `getPlans()` lookup only when the snapshot is absent) and `planName` from `session.planDaySnapshot?.planName ?? plan?.name`. Verify: after finishing a session then editing its origin plan day, the session detail's vs-Plan tab is unchanged (Playwright, or a unit test on the resolution logic if extracted).

## 7. AI envelope wiring

- [ ] 7.1 In `src/lib/ai/context.ts`, replace `export type SessionEvaluation = Record<string, never>` with a re-export of the `SessionEvaluation` type from `src/lib/types.ts`. Verify `npx tsc --noEmit` passes.
- [ ] 7.2 Populate `AiContext.evaluation` in `buildAiContext` from the recent-session window (`recentRaw` sessions' `.evaluation`, `Boolean`-filtered, default `[]`). Verify the envelope unit test: user with evaluated recent sessions → non-empty `evaluation`; empty-state user → `evaluation === []`.
- [ ] 7.3 Add optional `evaluation?: SessionEvaluation` to `SessionSummary`; copy it through in `summariseSessionToSummary`. Append the compact strip in `formatSessionSummaryLine` (plan: `· on-target · 1 overdone · 1 underperformed`; no-plan: `· no-plan`; missing: no strip). Verify unit tests for all three line variants.

## 8. Docs + validation

- [ ] 8.1 Update `docs/data-structure.md` in the same PR: add `SessionEvaluation` and `PlanDaySnapshot` to the Sessions type section; document the backfill migration under Migrations (incl. the "legacy sessions snapshot the current plan, not the plan at workout time" caveat and the link to #134); note both fields flow into the export payload with no `schemaVersion` bump. Verify every Sync-rule checklist item for this change is covered.
- [ ] 8.2 Run `openspec validate session-evaluation-meta --strict`, `npm run lint`, `npx tsc --noEmit`, `npm run test` — all green.
