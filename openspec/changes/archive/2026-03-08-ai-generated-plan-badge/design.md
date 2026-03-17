## Context

`WorkoutPlan` is stored in local storage and rendered as `PlanCard` rows in `src/app/plans/page.tsx`. The `PlanCard` component currently shows the plan name, day count, category badges, and status controls. There is no field on `WorkoutPlan` to distinguish AI-generated plans from manually created ones. AI-generated plans are saved via `handleAiApply` in the plans page, which already has the right insertion point.

## Goals / Non-Goals

**Goals:**

- Persist `aiGenerated: true` on plans created via the AI suggestion flow.
- Show a Sparkles icon inside `PlanCard` for AI-generated plans.
- Require no data migration for existing plans.

**Non-Goals:**

- Toggling or removing the AI badge after creation.
- Showing AI provenance anywhere other than the plan list card (e.g. plan detail page).
- Tracking which model or prompt version generated the plan.

## Decisions

### 1. Store `aiGenerated` on `WorkoutPlan`

**Decision:** Add `aiGenerated?: boolean` to the `WorkoutPlan` interface in `types.ts`. Set it to `true` only in `handleAiApply`.

**Rationale:** Keeping provenance on the plan object is the simplest approach — no separate lookup table, no migration, and the field travels naturally with the plan through storage. `undefined` (absent) is treated identically to `false` by the UI, so existing plans are unaffected.

**Alternative considered:** Store a separate set of AI-generated plan IDs in local storage — rejected as unnecessary indirection.

### 2. Icon placement in `PlanCard`

**Decision:** Render a small `Sparkles` icon (16×16, `text-brand` colour, from lucide-react which is already used in the file) inline with the plan name — specifically as a small sibling to the `<p>` element containing the name, using `flex items-center gap-1.5`.

**Rationale:** Placing the icon next to the name is immediately scannable and requires only a minor layout adjustment to the name row. Lucide's `Sparkles` is already imported in `plans/page.tsx` for the AI modal button, so no new dependency is introduced.

**Alternative considered:** A text badge ("AI") below the name — less elegant and takes more vertical space.

### 3. No retroactive back-fill

**Decision:** Existing stored plans without `aiGenerated` simply show no badge. No migration script.

**Rationale:** The field is optional; old plans are correctly identified as manually created by absence of the flag.

## Risks / Trade-offs

- **User manually created a plan that coincidentally looks AI-generated** → No risk: the badge is only set programmatically in `handleAiApply`.
- **Icon adds visual noise for power users with many AI plans** → Low risk; the icon is small and uses the brand colour which is already used for category badges.

## Migration Plan

No migration required. The `aiGenerated` field is optional; absent means `false`. Rollback is a simple revert of the two changed files (`types.ts`, `plans/page.tsx`) — stored data is unaffected.
