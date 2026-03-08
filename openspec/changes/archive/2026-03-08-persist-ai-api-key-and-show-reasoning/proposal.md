## Why

After a user successfully generates an AI plan, they must re-enter their API key and re-select the model on every subsequent use, which is repetitive friction. Additionally, the AI currently provides no explanation for why it chose the suggested plan, leaving users without context to evaluate the suggestion.

## What Changes

- When a user opens the AI Plan Suggestion modal and a saved API key exists, the API key input and model selector are hidden by default (the user skips straight to generating).
- A clearly visible "Edit" or "Change settings" affordance lets users update the saved key/model when needed.
- The OpenAI system prompt is updated to also return a short `reasoning` string alongside the plan JSON.
- The preview view displays the AI's reasoning text before the plan details.

## Capabilities

### New Capabilities

- `ai-plan-config-persistence`: Skip API key / model input when a saved config already exists; provide a way to edit it.
- `ai-plan-reasoning`: AI returns a 1–3 sentence explanation of why it suggested the plan; displayed in the preview.

### Modified Capabilities

- `workout-plans`: No spec-level requirement changes (UI-only update to the suggestion flow).

## Impact

- `src/components/AiPlanSuggestionModal.tsx` — primary UI change; config view becomes conditional.
- `src/lib/ai.ts` — system prompt updated; `suggestPlan` return type extended with `reasoning` field.
- `src/lib/types.ts` — `WorkoutPlan` or a new response type may need a `reasoning` field (transient, not persisted).
- `src/lib/storage.ts` — `getLlmConfig` / `saveLlmConfig` already exist; no storage changes required.
