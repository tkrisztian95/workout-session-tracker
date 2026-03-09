## 1. Profile Page — AI Configuration Section

- [ ] 1.1 Add AI Configuration section to `src/app/profile/page.tsx` with API key (password input) and model selector (gpt-4o-mini / gpt-4o), pre-filled from `getLlmConfig()`
- [ ] 1.2 Add Save button that calls `saveLlmConfig()` with the entered values; disable Save when API key field is empty
- [ ] 1.3 Add "Get API key ↗" link next to the API key field and a privacy note ("Stored locally on this device")

## 2. Simplify AiPlanSuggestionModal

- [ ] 2.1 Remove Step 1 config form (API key + model inputs) and related state (`configStep`, `editingSettings`, `apiKey`, `model`) from `src/components/AiPlanSuggestionModal.tsx`
- [ ] 2.2 Remove the collapsible "Edit settings" panel shown to returning users
- [ ] 2.3 Add `'no-config'` view state: when `getLlmConfig()` returns no config with an API key, show a message with a button/link directing the user to Profile > AI Configuration
- [ ] 2.4 Update `handleGenerate` to read config directly from `getLlmConfig()` instead of local state; ensure `saveLlmConfig` is no longer called from the modal
- [ ] 2.5 Update initial view: start in `'config'` (preferences) if a saved config exists, `'no-config'` otherwise
