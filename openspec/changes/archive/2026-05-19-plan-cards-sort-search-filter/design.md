## Context

The Plans page (`src/app/plans/page.tsx`) is a client component. It loads plans synchronously from localStorage via `getPlans()` into `useState`, then splits them into `activePlans` (status `active` or absent) and `completedPlans` (status `completed`). Active plans render directly; completed plans render inside a collapsible `Completed (N)` section.

`WorkoutPlan` already carries `createdAt`, `updatedAt`, `status?`, and `aiGenerated?`. There is no "last followed" field — that information lives in workout history. `getSessions()` returns `WorkoutSession[]`, each with an optional `planId` and a `completedAt` ISO timestamp.

## Goals / Non-Goals

**Goals:**

- Let the user search plans by name, sort them four ways, and filter them by four dimensions.
- Keep the page a single client component with synchronous localStorage reads — no new data layer.
- Keep the sort/filter logic pure and unit-tested.

**Non-Goals:**

- Persisting the chosen sort/filter across navigation or reloads (ephemeral component state for v1).
- URL-param–driven filters (the History page uses `useSearchParams`; the Plans page does not need deep-linkable filters).
- Storing a `lastFollowedAt` field on `WorkoutPlan` — it stays derived.
- Multi-select filters (each filter dimension is single-select for v1).

## Decisions

### 1. "Recently followed" is derived, not stored

For each plan, the last-followed timestamp is `max(completedAt)` over all sessions where `session.planId === plan.id`. Plans with no matching session have no timestamp and sort after all followed plans (and among themselves by `createdAt` descending as a stable tiebreaker).

**Why:** Avoids a localStorage migration and keeps a single source of truth. Session history is small enough that an O(plans × sessions) pass per render is negligible. The page already loads both plans and can cheaply load sessions.

### 2. Pure helper module `src/lib/plan-list.ts`

Add a module exporting:

- `getPlanLastFollowedAt(planId, sessions): string | null`
- `PlanSort` type (`'created' | 'followed' | 'updated' | 'name'`) and `PlanFilters` type.
- `organizePlans(plans, sessions, { search, sort, filters }): WorkoutPlan[]` — applies search → filters → sort and returns the final ordered list.
- `availableMuscles(plans)` and `availableDayCounts(plans)` — distinct filterable values present in the current plan set, so the filter UI only offers meaningful options.

**Why:** Mirrors the existing `statsUtils.ts` / `muscles.ts` pattern of pure, unit-tested lib helpers. Keeps the page component focused on rendering.

### 3. Status filter replaces the active/completed split

The collapsible `Completed (N)` section is removed. Status becomes a filter with three values: `active` (default), `completed`, `all`. With a single governed result list, sorting applies uniformly across whatever the status filter admits.

**Why:** A collapsible section and a sortable list conflict — you cannot globally sort plans that are visually partitioned. Folding status into the filter set keeps one consistent mental model. Defaulting to `active` preserves the current "active plans front and center" behaviour.

### 4. Search and sort inline; filters in a bottom sheet

- The **search** input sits directly under the page header, always visible, with a leading search icon and a clear (×) button when non-empty.
- **Sort** is an inline control next to the search row for quick access.
- **Filters** (status, AI-generated, muscle, training days) open in a `BottomSheet` triggered by a "Filters" button that shows a badge with the count of non-default filters.

**Why:** Search and sort are high-frequency and benefit from being one tap away. Filters are lower-frequency and multi-dimensional, so a sheet keeps the page uncluttered. `BottomSheet` already exists in `src/components/ui`.

### 5. Filter value shapes

- `status`: `'active' | 'completed' | 'all'`, default `'active'`.
- `aiGenerated`: `'any' | 'ai' | 'manual'`, default `'any'`.
- `muscle`: `Muscle | null`, default `null`; the sheet only lists muscles present in at least one plan.
- `trainingDays`: `number | null`, default `null`; the sheet only lists day counts present in at least one plan.

**Why:** Single-select tri-state / nullable values keep both the UI and the filter predicate simple. Offering only present values avoids dead filter options that always yield zero results.

### 6. Ephemeral state, no persistence

Search text, sort, and filters live in `useState` on the page. They reset on navigation away.

**Why:** Smallest correct v1. Persistence (localStorage or URL params) can be layered on later without reworking the pipeline.

### 7. Dedicated no-results empty state

When the plan set is non-empty but the organized result is empty, render an `EmptyState` with a "no plans match" message and a control to clear search/filters. This is distinct from the existing "no plans yet" empty state shown when the user has zero plans.

**Why:** Matches the precedent set by the `history-filter-empty-state` capability — an empty filtered list should explain itself rather than look like an empty account.

## Risks / Trade-offs

- **Removing the collapsed Completed section changes the default page shape.** Mitigated by defaulting the status filter to `active`, which yields the same set of cards the user saw before (just without the collapsible completed group one tap away). Completed plans remain reachable via the status filter.
- **Derived "recently followed" recomputes every render.** Acceptable — both arrays come from localStorage and are small; the pass is memoized with `useMemo` keyed on plans, sessions, and the control state.
- **Filter options depend on the current plan set.** If a plan is the only one training a muscle and is filtered out, that option can vanish on the next open. Acceptable for v1 — the option list is computed from all plans, not the already-filtered list, so this does not actually happen.

## Migration Plan

1. Add `src/lib/plan-list.ts` and its test file.
2. Refactor `src/app/plans/page.tsx`: load sessions, add control state, replace the active/completed render branch with a single organized list, add search/sort/filter UI and the no-results empty state.
3. Add locale strings for the new labels in `en`, `hu`, `de`.
4. No data migration — no schema change.

## Open Questions

- Should "recently followed" count in-progress (active, not yet completed) sessions? For v1 it counts only completed sessions (`completedAt` present), since an abandoned active session is a weak signal of "followed".
- Should the muscle filter use individual muscles or the four `MuscleGroup` buckets? v1 uses individual `Muscle` values to stay consistent with the muscle badges already shown on each card.
