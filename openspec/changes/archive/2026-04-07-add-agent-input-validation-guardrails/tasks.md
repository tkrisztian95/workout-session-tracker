## 1. Shared Infrastructure

- [x] 1.1 Add `AiValidationError` class to `src/lib/ai/index.ts` (extends `Error`, carries a `reason: string` field)
- [x] 1.2 Add fallback locale strings for validation rejection messages to all locale files (e.g. `ai.validation.notWorkout`, `ai.validation.notFitnessGoal`)

## 2. Import Agent Guardrail

- [x] 2.1 Extend the import system prompt in `src/lib/ai/import.ts` to include `"valid": boolean` and `"validationError": string | undefined` in the response schema description, instructing the model to set `valid: false` only for clearly non-workout content
- [x] 2.2 After `JSON.parse` in `importSessions`, check `parsed.valid`; if `false`, throw `new AiValidationError(parsed.validationError || fallback)`
- [x] 2.3 Treat missing `valid` field as `true` (safe default — no change to current happy path)

## 3. Plan Agent Guardrail

- [x] 3.1 Extend the plan system prompt in `src/lib/ai/plan.ts` to include `"valid": boolean` and `"validationError": string | undefined` in the response schema description, instructing the model to set `valid: false` only when preferences are clearly irrelevant to fitness
- [x] 3.2 After `JSON.parse` in `suggestPlan`, check `parsed.valid`; if `false`, throw `new AiValidationError(parsed.validationError || fallback)`
- [x] 3.3 Treat missing `valid` field as `true` (safe default — no change to current happy path)

## 4. Import UI — Rejection State

- [x] 4.1 In `AiImportReviewView` (or its parent sheet component), catch `AiValidationError` separately from generic errors
- [x] 4.2 Render a rejection banner/message showing `AiValidationError.reason` when caught; keep the text area editable and re-enable the submit button

## 5. Plan UI — Rejection State

- [x] 5.1 In `AiPlanSuggestionModal`, catch `AiValidationError` separately from generic errors
- [x] 5.2 Render a rejection message showing `AiValidationError.reason` in place of the plan preview; keep the "Regenerate" button enabled

## 6. Verification

- [ ] 6.1 Manually test import with a stew recipe — confirm rejection message appears and notes remain editable
- [ ] 6.2 Manually test import with valid workout notes — confirm normal session draft appears
- [ ] 6.3 Manually test plan generation with irrelevant preferences — confirm rejection message appears and Regenerate is available
- [ ] 6.4 Manually test plan generation with normal preferences — confirm plan preview appears as before
