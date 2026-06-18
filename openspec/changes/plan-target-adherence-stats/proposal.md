## Why

The stats page already trends raw performance — exercise weight progression, weekly volume, muscle distribution — but none of it answers the question a user following a plan actually cares about: **"Am I hitting my targets, and is that getting better or worse over time?"**

The app already classifies a single finished session against its plan day (on-target / overdone vs underperformed / missed) in `SessionPlanComparison`, but that view lives on the per-session history detail and is never aggregated. A user who follows a plan across many sessions has no way to see their overall adherence trend. This change closes that gap by lifting the existing per-session target classification into an aggregate, time-ranged view on the stats page.

No open GitHub issue overlaps with this work (checked repo `tkrisztian95/workout-session-tracker`; the closest items, AI coaching #63/#64, are out of scope).

## What Changes

- Add a **Plan Adherence** section to the stats page, shown only when the selected time range contains at least one plan-linked completed session (a session with a `planId` whose plan day can be resolved).
- For each plan-linked session, compute an **adherence score** = the percentage of that day's *planned* exercises that **met or exceeded** their target, reusing the existing on-target/overdone vs underperformed/missed classification from `SessionPlanComparison`'s logic (extracted into a reusable helper). Extra (ad-hoc) exercises do not count toward or against the score.
- Render a **trend line** of per-session adherence over time within the selected range, plus an **average-adherence summary stat card** (mean of the per-session scores in range) with an up/down/flat trend indicator consistent with the existing volume-trend treatment.
- The section is **gracefully hidden** when there are no plan-linked sessions in range (e.g. the user only logs ad-hoc sessions, or the range is empty) — no empty placeholder.
- Add the required i18n keys to the `en`, `de`, and `hu` locales.

## Capabilities

### New Capabilities

- `plan-target-adherence`: An aggregate plan-adherence view on the stats page that scores each plan-linked session by the share of its planned exercises that met target, trends those scores over the selected time range, and surfaces an average-adherence summary.

### Modified Capabilities

<!-- None. The existing `workout-statistics` spec enumerates specific sections (summary cards, volume chart, progression table) and does not constrain the page to *only* those, so adding a new section introduces a new capability rather than altering a specified requirement. -->

## Impact

- `src/lib/statsUtils.ts` — new `getPlanAdherenceProgression(sessions, plans, range)` (or similar) returning per-session adherence points + average; new unit tests in `src/lib/statsUtils.test.ts`.
- `src/lib/sessionUtils.ts` — extract the per-exercise "met target" classification used by `SessionPlanComparison` into a shared, unit-testable helper so the stats aggregate and the per-session comparison agree by construction.
- `src/app/stats/page.tsx` — new `PlanAdherence` section component + wiring (load `getPlans()`, pass range-filtered sessions).
- `src/locales/{en,de,hu}.json` — new adherence section strings (title, summary label, trend copy, empty handling).
- No persisted data shapes change; no `localStorage` key, type, or migration is touched, so no `docs/data-structure.md` update is needed.
