## Context

The stats page (`src/app/stats/page.tsx`) renders summary cards, a weekly-volume chart, an exercise-weight progression table, and a muscle-category radar — all computed in `src/lib/statsUtils.ts` from completed `WorkoutSession`s, filtered by a `TimeRange`. None of these surface plan adherence.

Per-session adherence already exists, but only on the history detail screen: `SessionPlanComparison` (`src/components/SessionPlanComparison.tsx`) resolves a session's plan day (`plan.days.find(d => d.id === session.planDayId)`), classifies each planned exercise as `overdone | matched | underperformed | missed` (plus `extra` for ad-hoc), and shows the breakdown. The classification leans on `sessionUtils`: `classifyLoggedSets` + `countsTowardSetsGoal` already fold the **weight** target into the set count (sub-target "warmup" sets don't count), so a `matched`/`overdone` status means "completed the prescribed number of qualifying sets at target load."

This change reuses that exact classification, aggregated across sessions, to produce a time-ranged adherence trend on the stats page.

## Goals / Non-Goals

**Goals:**

- Show, on the stats page, how the share of met plan targets trends over the selected time range, plus an average-adherence summary.
- Reuse the existing per-exercise target classification so the aggregate and the per-session `SessionPlanComparison` agree by construction.
- Only count plan-linked sessions; hide the section entirely when there are none in range.

**Non-Goals:**

- No change to persisted data shapes, storage keys, or migrations.
- No change to the per-session `SessionPlanComparison` UI or its semantics (beyond extracting shared logic).
- No new metric beyond adherence (no per-muscle adherence, no streaks) — those can follow later.

## Decisions

### What "met target" means — reuse `SessionPlanComparison`'s status

Extract the per-exercise classification (`actualSetsFor`, `plannedSetsFor`, `statusFor`) out of `SessionPlanComparison.tsx` into shared helpers in `src/lib/sessionUtils.ts` (e.g. `classifyPlannedExercise(planned, actual): 'overdone' | 'matched' | 'underperformed' | 'missed'`). An exercise **met target** when its status is `matched` or `overdone`. `SessionPlanComparison` then imports the helper instead of its private copies, so the per-session view and the stats aggregate can never drift.

- _Alternative considered_: define a fresh weight+reps rule in `statsUtils`. Rejected — it would duplicate subtle logic (warmup filtering, partial-set handling) and risk the stats page disagreeing with the comparison the user sees per session.

### Denominator = the day's **core** planned exercises

A session's adherence score is `metCount / coreCount * 100`, where `coreCount` is the number of the plan day's **core** exercises and `metCount` is how many of those met target. Optional exercises and `extra` (ad-hoc) exercises are excluded from both numerator and denominator.

- _Why core-only_: optional exercises are, by the plan's own definition, not required; skipping them should not drag adherence down. Core exercises are the plan's commitment, so they are the fair basis for "did I hit my plan."
- _Alternative considered_: include optional exercises (as `SessionPlanComparison` does for its breakdown counts). Rejected for the *score* — it would penalize users for skipping work the plan marked optional. The per-session breakdown can still show optional outcomes; only the aggregate score is core-scoped.
- _Edge_: a plan day with **zero** core exercises yields no denominator, so that session is excluded from the adherence trend (it cannot be scored).

### Pure-duration core exercises

`plannedSetsFor` returns 0 for a pure `duration` exercise (no prescribed sets), which would otherwise classify as `missed`. The helper treats a planned exercise with no prescribed sets as **met** when its matching actual exercise is marked `completed`. This keeps timed core work (e.g. a plank hold) from spuriously failing adherence.

### New `statsUtils` aggregator

Add `getPlanAdherenceProgression(sessions, plans, range)` to `src/lib/statsUtils.ts`:

- Filter to completed sessions in range that have a `planId` whose plan + `planDayId` resolve to a plan day with ≥1 core exercise.
- For each, compute the adherence score (above), producing a chronologically sorted array of `{ date, score }` points.
- Return `{ points, average }`, where `average` is the rounded mean of the points' scores (or `null`/empty when there are no points).

Resolving the plan day reuses the same lookup as the history detail page: `plans.find(p => p.id === session.planId)?.days.find(d => d.id === session.planDayId)`.

### Presentation — trend line + average card

A new `PlanAdherence` section component in `src/app/stats/page.tsx` (co-located like `ProgressionTable` / `CategoryRadarChart`):

- An average-adherence summary **stat card** (e.g. "Avg adherence 82%") with an up/down/flat trend chip reusing the same icon/colour treatment as the existing volume-trend block (compare last point vs previous).
- A **line chart** (recharts `LineChart`, matching the progression chart styling) plotting per-session `score` over date labels, y-axis 0–100%.
- The whole section returns `null` when `points.length === 0`, so it never renders an empty placeholder — consistent with how `ProgressionTable` and `CategoryRadarChart` hide themselves.

### i18n

Add keys to `en`, `de`, `hu` (`stats_adherence_title`, `stats_adherence_avg_label`, trend copy, etc.) in the same task. `de`/`hu` may carry English-fallback copy where a translation is uncertain, flagged in the task — matching prior changes.

## Risks / Trade-offs

- **[Core-only denominator surprises users who expect optional work to count]** → Documented in the spec via an explicit scenario; the choice is intentional and defensible (optional ≠ required).
- **[Classification extraction regresses `SessionPlanComparison`]** → Mitigated by extracting the *exact* `actualSetsFor`/`plannedSetsFor`/`statusFor` logic and adding unit tests for the new helper; the component renders identically since it consumes the same function.
- **[Single data point looks sparse]** → The average card stands on its own; a one-point line still renders a dot. Acceptable; the section already hides when there are zero plan-linked sessions.
- **[Sessions whose plan was later deleted]** → If `planId` no longer resolves, the session is simply excluded (treated as non-plan-linked), same as `SessionPlanComparison` showing the no-plan state.
