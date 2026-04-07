## Why

The AI import and plan agents currently process any text input without verifying it contains workout-relevant content. This leads to confusing or nonsensical output when users accidentally submit irrelevant text (e.g., a recipe, a shopping list, or random notes) — degrading trust in the AI features.

## What Changes

- The import agent SHALL validate that the submitted text is a workout session before attempting to parse it; invalid input triggers a clear rejection message instead of a malformed session draft.
- The plan agent SHALL validate that the generation context (existing plans and session history) is sufficient and meaningful before invoking the LLM.
- Both agents gain a shared validation step that can classify input relevance and surface a human-readable rejection reason.

## Capabilities

### New Capabilities

- `ai-import-validation`: Pre-parse guardrail for the import agent — classifies submitted text as workout-relevant or not, and returns a rejection reason when irrelevant.
- `ai-plan-validation`: Pre-generation guardrail for the plan agent — validates that the contextual input (history, plans) is coherent and relevant before LLM invocation.

### Modified Capabilities

- `ai-import-from-notes`: Adds a validation step before the parsing call; surfaces rejection UI when input is not a workout.
- `ai-plan-suggestion`: Adds a validation step before the generation call; surfaces rejection UI when context is insufficient or irrelevant.

## Impact

- `src/` — import sheet and plan suggestion components gain new UI states (validation error / rejection feedback).
- LLM prompt layer — new validation prompts or a classification call added ahead of the main agent calls.
- Locale files — new strings for validation error messages.
- No schema or API changes required.
