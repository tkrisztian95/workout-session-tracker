## Why

AI configuration (OpenAI API key and model) is currently buried inside the AI Plan Suggestion modal, forcing users to manage API credentials mid-flow every time they want to generate a plan. Moving this to the profile settings page gives it a permanent, discoverable home and simplifies the modal to focus solely on plan generation.

## What Changes

- **Add AI Configuration section to the profile settings page** — users can enter and save their OpenAI API key and preferred model outside of the generation flow
- **Remove config form from AiPlanSuggestionModal** — the modal no longer collects API key or model; it reads them from saved settings
- **Add "no config" state to modal** — when no API key is saved, the modal shows a prompt directing the user to Profile > AI Configuration instead of an inline form

## Capabilities

### New Capabilities

- `ai-settings-config`: AI provider configuration (API key, model) manageable from the profile settings page

### Modified Capabilities

- `profile-settings`: Profile screen gains an AI Configuration section with API key and model fields
- `ai-plan-config-persistence`: Modal no longer owns config input; config is read from settings, and missing config prompts navigation to settings

## Impact

- `src/app/profile/page.tsx` — add AI Configuration section
- `src/components/AiPlanSuggestionModal.tsx` — remove Step 1 config form and collapsible edit-settings panel; add no-config state
- `src/lib/storage.ts` and `src/lib/types.ts` — no changes needed; existing `getLlmConfig`/`saveLlmConfig` and `LlmConfig` type reused
