## Why

Users have no visual way to distinguish AI-generated plans from manually created ones in the plan list. Adding an AI badge on the plan card lets users quickly identify which plans were suggested by the AI, adding context and reinforcing the value of the feature.

## What Changes

- `WorkoutPlan` gets a new optional `aiGenerated?: boolean` field persisted to local storage.
- When an AI-suggested plan is saved, `aiGenerated: true` is set on it.
- The `PlanCard` component renders a small AI icon (Sparkles) next to the plan name when `plan.aiGenerated === true`.

## Capabilities

### New Capabilities

- `ai-generated-plan-badge`: Display a visual indicator on plan cards that were created via the AI suggestion feature.

### Modified Capabilities

- `workout-plans`: `WorkoutPlan` type gains a new optional `aiGenerated` field — no breaking change, existing plans without the field are treated as manually created.

## Impact

- `src/lib/types.ts` — add `aiGenerated?: boolean` to `WorkoutPlan`.
- `src/app/plans/page.tsx` — set `aiGenerated: true` in `handleAiApply` when building the new plan object; update `PlanCard` to show a Sparkles icon when the field is true.
- No migration needed — the field is optional and existing stored plans without it render unchanged.
