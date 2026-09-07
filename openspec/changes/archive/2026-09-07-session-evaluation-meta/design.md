## Context

See [proposal.md](proposal.md) — Why. Relevant current state:

- `src/components/SessionPlanComparison.tsx` owns `buildRows(session, planDay)` and a `counts` reducer producing the per-status tally (`overdone | matched | underperformed | missed | extra`). The result is rendered and discarded. The component takes `planDay: PlanDay | undefined` + `planName?: string` props.
- `src/app/history/[id]/page.tsx` resolves `planDay` by looking the session's `planId`/`planDayId` up in the **live** `getPlans()` result, then passes it to the tab and the edit form.
- `src/lib/sessionUtils.ts` already exports the per-exercise primitives `classifyPlannedExercise`, `plannedSetsForPlan`, `actualSetsForPlan`, and `PlanComparisonStatus`.
- `src/lib/storage.ts`: `saveSession` (finish, manual record, AI import) just pushes; `updateSession` (history edit) stamps `updatedAt`. Legacy data is rewritten in place on read (`getSessions`, `getPlans`) with idempotent, self-persisting migrations.
- `src/lib/ai/context.ts` declares `SessionEvaluation = Record<string, never>` and `AiContext.evaluation?: SessionEvaluation[]` as a deferred no-op.

Two facts force the design:

1. The vs-Plan tab reads the **live** plan. If persisted `evaluation` were computed once and frozen, a later plan edit would make the tab and the meta disagree — the spec forbids that.
2. The issue says store only `planId`/`planDayId`. A shared plan-version log ([#134](https://github.com/tkrisztian95/workout-session-tracker/issues/134)) is the real fix but carries GC, retention, and export complexity out of scope here.

## Goals / Non-Goals

**Goals:**

- One pure function is the single producer of `SessionEvaluation`; one pure function is the shared comparison core.
- The vs-Plan view and the persisted meta read the **same** plan-day baseline — they cannot drift, before or after a plan edit.
- A session's verdict is stable for the life of the session, regardless of later plan edits or deletion.
- Every session-write path yields a current `evaluation` with no per-call-site wiring.
- Existing sessions upgrade transparently on read, once.

**Non-Goals:**

- Shared plan-version history / dedupe — [#134](https://github.com/tkrisztian95/workout-session-tracker/issues/134).
- Per-exercise rolling trend persisted on the exercise.
- Changing the classification rules themselves (weight-vs-sets nuance) — v1 inherits `classifyPlannedExercise`.
- A standalone backfill `npm run` script — the on-read migration covers it.
- Backfilling the _historically accurate_ plan for legacy sessions — the one-time backfill snapshots the plan as it is now (best available).

## Decisions

### 1. Freeze the baseline: `WorkoutSession.planDaySnapshot`

```ts
interface PlanDaySnapshot {
  planName: string;
  day: PlanDay; // deep copy of the origin plan day at capture time
  capturedAt: string; // ISO
}
interface WorkoutSession {
  // …
  planDaySnapshot?: PlanDaySnapshot;
  evaluation?: SessionEvaluation;
}
```

Captured once, when the session is first persisted. Both `evaluateSession` and `SessionPlanComparison` read `planDaySnapshot.day`. Plan edits and deletion no longer touch history — a strictly better property than today, where deleting a plan blanks the vs-Plan tab.

_Why the full `PlanDay` and not a trimmed projection:_ `SessionPlanComparison` already consumes `PlanDay`; reusing the type means zero mapping code and no second shape to keep in sync. Cost is ~a few hundred bytes/session (`weekdays` + core/optional arrays) — acceptable at localStorage scale.

_Alternative — derived cache that tracks the live plan (recompute `evaluation` on every `savePlan`/`deletePlan`):_ rejected. Keeps tab+meta consistent but the verdict for a past session silently changes when you tweak next week's plan, `savePlan` has to walk all sessions, and there is still no baseline for a deleted plan.

_Alternative — plan-version log:_ [#134](https://github.com/tkrisztian95/workout-session-tracker/issues/134), deferred.

### 2. `compareSessionToPlan` — shared comparison core in `sessionUtils.ts`

Extract `buildRows` + `ComparisonRow` + the `counts` reducer from `SessionPlanComparison.tsx` into a pure `compareSessionToPlan(session, planDay?): ComparisonRow[]`. The component imports it for rendering; `evaluateSession` consumes it for counts + highlights. Same code path = the "tab and meta agree" spec scenario holds by construction.

### 3. `evaluateSession(session, planDay?): SessionEvaluation` — pure, storage-free

Takes the already-resolved `PlanDay | undefined` (the snapshot's `day`), never a `planId`. No `storage.ts` import, trivially testable.

`overall` derivation:

```
no planDay                                               → 'no-plan'
counts.overdone > counts.underperformed + counts.missed  → 'overdone'
counts.underperformed + counts.missed > counts.overdone  → 'underperformed'
otherwise                                                → 'on-target'
```

`extra` exercises do not shift the verdict. Ties → `on-target`.

Numeric rollups:

- `totalVolumeKg` = Σ `weight × reps` over every logged set of non-dismissed exercises; time-only sets (`seconds != null`) contribute 0. Omit when 0.
- `avgWeightKg` = mean `set.weight` over logged sets where `weight > 0`. Omit when none.
- `setCount` = count of logged sets across non-dismissed exercises. Omit when 0.
- `rating` = `session.rating` when present.

`highlights`: from `compareSessionToPlan` rows, drop `matched`, sort by `|actualSets − plannedSets|` desc (numeric deviations first, then `missed`/`extra`), take 3. `delta`: `"+N set"` / `"−N set"` for count deviations, `undefined` for `missed`. Omitted for `no-plan`.

### 4. Centralize compute in `storage.ts`, not at call sites

New helper:

```ts
function resolvePlanDaySnapshot(session): PlanDaySnapshot | undefined;
// planId + planDayId → live getPlans() lookup → deep-copy day, { planName, day, capturedAt: now }
```

- `saveSession(session)`: `snapshot = session.planDaySnapshot ?? resolvePlanDaySnapshot(session)`; `evaluation = evaluateSession(session, snapshot?.day)`; persist `{ ...session, planDaySnapshot?, evaluation }`.
- `updateSession(session)`: keep the existing `planDaySnapshot` as-is; `evaluation = evaluateSession(session, session.planDaySnapshot?.day)`; stamp `updatedAt`.

This covers all four write paths — `handleFinish` (`page.tsx`), the manual record + AI import in `NewHistorySessionSheet.tsx`, and the edit in `history/[id]/page.tsx` — with no change to any of them. `handleFinish` builds a bare `WorkoutSession` literal (no `planName`); `resolvePlanDaySnapshot` recovers it via `getPlans()`.

### 5. Backfill in `getSessions`

After the existing `migrateExerciseList` pass, for any session where `evaluation == null || evaluation.v !== 1`:

```
snapshot = s.planDaySnapshot ?? resolvePlanDaySnapshot(s)
if (snapshot && !s.planDaySnapshot) s.planDaySnapshot = snapshot   // one-time capture
s.evaluation = evaluateSession(s, snapshot?.day)
mutated = true
```

Persist once if `mutated`. `getPlans()` called at most once per `getSessions()` and only when a session needs work.

### 6. vs-Plan tab reads the snapshot

`src/app/history/[id]/page.tsx`:

```ts
const snapshot = session.planDaySnapshot;
const planDay = snapshot?.day ?? liveLookup; // fallback only for a not-yet-backfilled read
const planName = snapshot?.planName ?? plan?.name;
```

After `getSessions` runs its backfill the fallback is dead code in practice, but keeps the page safe if a session object reaches it pre-migration.

### 7. AI envelope

- Replace `export type SessionEvaluation = Record<string, never>` in `context.ts` with a re-export of the `SessionEvaluation` type from `src/lib/types.ts` (single definition).
- `AiContext.evaluation` populated in `buildAiContext` from `recentRaw.map(s => s.evaluation).filter(Boolean)` — same window as `recentSessions`, sessions without meta omitted, default `[]`.
- `SessionSummary` gains optional `evaluation?: SessionEvaluation`; `summariseSessionToSummary` copies it through.
- `formatSessionSummaryLine` appends a compact strip when `s.evaluation` is set: `· on-target · 1 overdone · 1 underperformed` (plan) or `· no-plan` (no-plan; volume/rating already in the line).

## Risks / Trade-offs

- **First read after deploy backfills every session** → O(sessions × exercises) pure arithmetic + name matching + one deep-copy per session, one localStorage write. Negligible at realistic history sizes; `v !== 1` guard prevents repeats.
- **Legacy backfill snapshots the _current_ plan, not the plan at workout time** → a session from six weeks ago is judged against today's plan day. Accepted: `planId`/`planDayId` are the only origin signal stored, and this is a one-time capture — after backfill the session is frozen like any new one. Documented in `docs/data-structure.md`. [#134](https://github.com/tkrisztian95/workout-session-tracker/issues/134) would fix it properly.
- **`compareSessionToPlan` extraction touches a rendered component** → mitigated by keeping `ComparisonRow` identical and a unit test asserting the tab's counts equal `evaluation.counts`.
- **Snapshot duplicates plan data across sessions** → the [#134](https://github.com/tkrisztian95/workout-session-tracker/issues/134) tradeoff, taken deliberately for a self-contained change. Migration path: `planDaySnapshot` → `{ planId, planVersion }` reference + dedupe into the version store.
- **Weight-vs-sets classification is inherited, not improved** → `classifyPlannedExercise` already downgrades a wholly-underloaded exercise to `underperformed`; partial underloading is out of scope for v1 (spec non-goal).
- **Export payload grows** → snapshot + evaluation add ~1 KB/session; `schemaVersion` stays `'1'` (additive, optional).

## Migration Plan

1. Ship the types + `compareSessionToPlan` + `evaluateSession` together (no behavior change to the tab yet).
2. Ship the `storage.ts` centralization (`resolvePlanDaySnapshot`, `saveSession`/`updateSession`) + the `getSessions` backfill + the tab reading `planDaySnapshot` — existing data upgrades on next read.
3. Ship the envelope wiring.
4. Rollback: both fields are optional and ignored by every pre-change reader; reverting the code leaves harmless `planDaySnapshot` / `evaluation` objects in storage. No data cleanup needed.
