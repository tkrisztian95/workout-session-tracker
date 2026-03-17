## 1. Update prompt builder

- [x] 1.1 Add `AiPlanPreferences` type (focus, daysPerWeek, goal — all optional strings) to `src/lib/ai.ts`
- [x] 1.2 Update `buildPlanSuggestionPrompt` signature to accept an optional `preferences: AiPlanPreferences` param
- [x] 1.3 Append selected preferences as a natural-language sentence to the end of the generated user prompt
- [x] 1.4 Update `suggestPlan` to accept and forward preferences to `buildPlanSuggestionPrompt`

## 2. Add preferences UI to modal

- [x] 2.1 Define preference option constants (focus options, days-per-week options, goal options) in `AiPlanSuggestionModal.tsx`
- [x] 2.2 Add `focus`, `daysPerWeek`, `goal` state fields (all `string`, default `''`) to the modal component
- [x] 2.3 Render a "Preferences (optional)" section in the config view with three labeled chip/select pickers
- [x] 2.4 Reset preference state when the user taps "Regenerate" (back to config view)

## 3. Wire preferences through generation

- [x] 3.1 Pass the current preference state to `suggestPlan` when the user taps "Save & Generate"
- [x] 3.2 Verify that generating with no preferences selected produces the same prompt as before (no regression)
