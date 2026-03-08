## Context

The AI Plan Suggestion flow uses a modal (`AiPlanSuggestionModal`) with three views: `config` → `loading` → `preview`. On every open, the modal initialises the API key and model from `getLlmConfig()`, but always renders the full config form regardless of whether a saved config exists. The underlying `suggestPlan` function in `ai.ts` calls the OpenAI chat completions endpoint with `response_format: json_object`, returning only the plan JSON — no explanatory text.

## Goals / Non-Goals

**Goals:**

- When a saved LLM config exists, skip the config form and go directly to generating.
- Surface a lightweight "Edit settings" control so users can still change the key/model.
- Extend the AI response to include a short `reasoning` field (1–3 sentences) surfaced in the preview.

**Non-Goals:**

- Storing reasoning persistently (it is ephemeral, shown once per generation).
- Supporting providers other than OpenAI.
- Changing how the plan is stored or applied.

## Decisions

### 1. Skip config form when saved config is present

**Decision:** On modal open, detect whether `getLlmConfig()` returns a non-null config with a non-empty API key. If so, immediately start generating (bypassing the config view entirely). If no saved config exists, show the config form as today.

**Rationale:** The config form's sole purpose is to capture the key/model. Once saved, re-showing it every time adds unnecessary friction. An "Edit settings" link in the config view (shown when a key is already saved) or a small gear icon in the loading/preview header handles the escape hatch.

**Alternative considered:** Keep the form but pre-fill and auto-submit — rejected because it still flashes the form briefly and does not feel seamless.

### 2. Edit settings affordance

**Decision:** Add a small "Edit settings" text button below the Generate button in the config view (or always accessible via a gear icon in the modal header when a saved config exists). Clicking it shows the config form. When auto-generating, show a minimal header note (e.g. "Using saved API key · gpt-4o-mini") with a tappable "Change" link.

**Rationale:** Must be discoverable without cluttering the happy path.

### 3. Reasoning field in the AI response

**Decision:** Update the system prompt to return a `reasoning` field (string, ≤3 sentences) alongside the existing plan JSON. Extend the `suggestPlan` return type to include `reasoning?: string`. Display it in the preview view above the plan summary card.

**Rationale:** Asking the model to explain the plan inside the same `json_object` response is zero-latency (no extra API call). The field is optional so older cached responses and error paths are unaffected.

**Alternative considered:** Second API call for reasoning after the plan is returned — rejected due to extra latency and cost.

### 4. Type changes

`suggestPlan` currently returns `Omit<WorkoutPlan, 'id' | 'status'>`. We extend this to a new local result type `AiPlanResult` that wraps the plan plus `reasoning?: string`. This keeps `WorkoutPlan` unchanged (reasoning is not persisted).

## Risks / Trade-offs

- **Model ignores reasoning field** → The prompt explicitly instructs the model to always include `reasoning`. Parsing treats it as optional, so an absent field silently degrades to no reasoning text.
- **Auto-generate on stale/invalid key** → If the saved key has expired the user will see an error and be returned to the config form (existing error path). This is acceptable.
- **Config form flash** → When no saved config exists the UX is identical to today. No regression.

## Migration Plan

No data migration needed. `getLlmConfig` / `saveLlmConfig` remain unchanged. The only storage impact is that `saveLlmConfig` continues to be called before the API request (existing behaviour).

Rollback: revert the two changed files (`AiPlanSuggestionModal.tsx`, `ai.ts`). No schema changes to undo.

## Open Questions

- Should the "Edit settings" affordance be a gear icon in the header (visible on all views) or a text link only visible on the config/auto-generate state? → Lean toward text link to keep the header clean; revisit in implementation.
