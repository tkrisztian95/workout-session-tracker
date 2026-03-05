## Context

The app is a Next.js 15 mobile-first workout tracker. Currently it has a single page (`/`) that manages an in-memory workout session. There is no data persistence and no routing. All state lives in React `useState`. The UI is dark-themed with orange accents (`#F97316`), using Tailwind CSS and Lucide icons.

This change introduces workout plans (structured multi-day programs) and persists both plans and sessions via `localStorage`, keeping the app dependency-free (no backend).

## Goals / Non-Goals

**Goals:**
- Let users create and manage workout plans with named training days, scheduled weekdays, core/optional exercises, and per-exercise scaling rules
- When starting a session, offer a choice: "Follow a Plan" or "Free Session"
- Pre-fill the session with the plan day's exercises when following a plan
- Store plans and session history in `localStorage`
- Keep the UI consistent with the existing dark mobile-first design

**Non-Goals:**
- Backend / remote sync
- User accounts or authentication
- Automatic progression tracking (scaling is defined as a target suggestion, not auto-applied)
- Calendar view or session history browsing (future)

## Decisions

### 1. Persistence: localStorage with JSON

**Decision**: Store plans and sessions as serialized JSON in `localStorage`.

**Rationale**: The app has no backend. `localStorage` is sufficient for a personal hobby tracker on a single device. Adding a database or API layer would be over-engineering for this scope.

**Alternative considered**: IndexedDB — more capable but complex API with no clear benefit at this data scale.

### 2. Routing: Next.js App Router pages

**Decision**: Add routes for plans (`/plans`, `/plans/new`, `/plans/[id]`) and update the home page (`/`) to be the session-start screen.

**Rationale**: The app already uses Next.js App Router. Separate pages per feature keeps concerns isolated and enables browser back/forward navigation.

**Alternative considered**: Single-page with view state — simpler but harder to navigate and share deep links.

### 3. Data model: flat localStorage keys

**Decision**: Use two top-level keys — `wst_plans` (array of `WorkoutPlan`) and `wst_sessions` (array of `WorkoutSession`).

**Rationale**: Keeps serialization trivial. Plans and sessions are small datasets (dozens of items at most).

### 4. Scaling rules: simple target suggestion

**Decision**: Scaling is represented as an optional `scalingNote` string per plan exercise (e.g., "Add 2.5 kg when you complete all reps for 2 sessions"). It is displayed to the user but not auto-applied.

**Rationale**: Automated progressive overload requires tracking session history per exercise, which is a larger feature. A human-readable note is the minimum viable approach.

**Alternative considered**: Structured scaling formula (baseWeight + increment × sessionCount) — too complex for MVP; revisit in a future change.

### 5. Session start flow: home page becomes a chooser

**Decision**: The `/` page becomes "Start Workout" with two options: pick a plan day or start free. An active session is tracked in `localStorage` (`wst_active_session`). Completing/discarding a session saves or discards it.

**Rationale**: The current home page is stateless. Making it a session launcher is a natural pivot without breaking the existing exercise management UX.

## Risks / Trade-offs

- **localStorage size limit (~5 MB)**: For a personal tracker with text-only data this is not a concern. → No mitigation needed now.
- **No conflict resolution**: If the user opens the app in two tabs simultaneously, writes can conflict. → Acceptable for a single-user hobby app; document as a known limitation.
- **Scaling note is manual**: Users must self-track whether they earned a progression. → By design at this stage; reduces scope significantly.

## Migration Plan

1. Existing sessions are in-memory only (no persistence), so there is no migration needed for session data.
2. The home page changes from "Today's Session" to the session start screen — the exercise list UI moves into an active-session sub-view.
3. No breaking API changes; all changes are client-side.
4. Rollback: revert commits; `localStorage` keys prefixed with `wst_` can be cleared without affecting other apps.
