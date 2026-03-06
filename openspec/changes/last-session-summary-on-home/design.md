## Context

The home screen (`src/app/page.tsx`) shows a greeting and action buttons. Session history is already stored in localStorage via `getSessions()` and the `WorkoutSession` type has `completedAt`, `planId`, and `planDayId`. However, `WorkoutSession` does not store `planName` or `planDayName` — those only live on `ActiveSession`. To resolve the plan name for display, we must cross-reference the `plans` list. The `HomePage` component already loads both `sessions` and `plans`.

## Goals / Non-Goals

**Goals:**

- Show the most recent completed session's relative date and name on the home start screen beneath the greeting
- Compute relative time on the client without adding a dependency

**Non-Goals:**

- Showing full session details or exercise list
- Linking to the session history page
- Persisting planName to WorkoutSession (out of scope)

## Decisions

### Relative time formatting — custom helper vs. library

**Decision**: Implement a minimal inline helper using `Date` arithmetic.

**Rationale**: The app has no date utility library and the requirement is simple (today / yesterday / N days ago). Adding `date-fns` or `dayjs` would be disproportionate. The helper is <10 lines.

**Alternative considered**: `Intl.RelativeTimeFormat` — more robust but slightly more verbose. Acceptable alternative if needed for i18n in future.

### Plan name resolution — look up from plans vs. store on session

**Decision**: Look up plan name from the plans list at render time using `planId`.

**Rationale**: `WorkoutSession` intentionally omits `planName`/`planDayName`. Changing the storage schema to add them would require a migration and could break existing sessions. Looking up from plans is cheap (localStorage, small list) and keeps the schema clean.

**Risk**: If a plan is deleted, the session's plan name won't be resolvable — fall back to "Free session" label in that case.

### Component placement

**Decision**: Add the last session summary as a small block inside `StartScreen`, directly below the greeting and above the action buttons.

**Rationale**: Keeps it contextual to the welcome area without disrupting the CTA layout.

## Risks / Trade-offs

- [Plan deleted after session] Plan name becomes unavailable → Mitigation: fall back to generic label ("Free session")
- [First-time user] No sessions exist → Mitigation: render nothing (no card shown)
- [Clock drift / timezone] `completedAt` is stored as ISO string (UTC). Relative day comparison is done using local calendar days, which is the user's expected frame of reference.

## Migration Plan

No data migration required. The feature reads existing localStorage data.
