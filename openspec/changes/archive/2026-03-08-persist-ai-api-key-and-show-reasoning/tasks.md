## 1. Extend AI layer with reasoning

- [x] 1.1 Update the system prompt in `src/lib/ai.ts` to instruct the model to include a `reasoning` field (1–3 sentences) in the JSON response
- [x] 1.2 Define a local `AiPlanResult` type in `ai.ts` that wraps the returned plan plus an optional `reasoning?: string` field
- [x] 1.3 Update `suggestPlan` to extract and return `reasoning` from the parsed response (treat as optional — omit gracefully if absent)

## 2. Update modal to skip config when key is saved

- [x] 2.1 On modal mount in `AiPlanSuggestionModal.tsx`, check if `getLlmConfig()` returns a config with a non-empty `apiKey`
- [x] 2.2 If a saved config exists, skip the `config` view and call `handleGenerate` immediately (add a new `'auto-generating'` state or reuse `'loading'`)
- [x] 2.3 Add a "Change settings" text button visible during auto-generate / loading when a saved config exists, that returns the user to the `config` view

## 3. Surface saved config info and edit affordance

- [x] 3.1 When auto-generating, display a short status line (e.g. "Using saved API key · gpt-4o-mini") with the "Change" link in the config/loading header area
- [x] 3.2 Ensure that clicking "Change" / "Edit settings" shows the config form pre-filled with the current saved key and model, and stops/resets any in-progress generation

## 4. Display reasoning in preview

- [x] 4.1 Pass `reasoning` from `suggestPlan` result through to the preview view state
- [x] 4.2 In the `preview` view, render the `reasoning` text in a styled block above the plan summary card (only when non-empty)
- [x] 4.3 Verify no empty placeholder is shown when `reasoning` is absent
