## Context

The app uses a bottom-nav mobile layout (`src/app/profile/page.tsx` for settings, `src/components/AiPlanSuggestionModal.tsx` for AI plan generation). Currently, the modal has a two-step config form (Step 1: API key + model; Step 2: preferences) with a collapsible "Edit settings" panel for returning users. All config is stored in `localStorage` via `getLlmConfig`/`saveLlmConfig` in `src/lib/storage.ts`. The `LlmConfig` type (`src/lib/types.ts`) holds `provider`, `apiKey`, and `model`.

## Goals / Non-Goals

**Goals:**

- Users can configure their OpenAI API key and model from the profile settings page
- The AI plan modal is simplified to preferences-only + a "no config" fallback state
- No new dependencies or data structures introduced

**Non-Goals:**

- Supporting multiple AI providers (only OpenAI for now)
- Validating the API key on the settings page (validation happens at generation time)
- Moving workout preferences to settings (they remain per-generation, ephemeral)

## Decisions

**1. Where in the profile page to place AI Configuration**

Placed between the Language section and the Danger Zone. This positions it logically after identity/locale settings and before destructive actions. The section follows the same visual pattern (card/section container) as other profile sections.

**2. No inline config in the modal**

Instead of keeping a fallback inline form in the modal, show a clear "No AI configuration set" message with a direct link/button to the profile page. This keeps the modal focused and avoids duplicating form logic.

- Alternative considered: keep the inline form as fallback — rejected because it duplicates configuration UI and makes the profile section feel optional.

**3. Save behavior on profile page**

API key and model are saved together when the user taps "Save". Pre-filled from `getLlmConfig()` on mount. No auto-save on blur (consistent with existing name-save pattern on the profile page that uses an explicit Save button).

**4. Modal flow simplification**

Remove `configStep` and `editingSettings` state. New view states: `'no-config' | 'config' | 'loading' | 'preview'`. On mount, if `getLlmConfig()` returns a config with a non-empty `apiKey`, start in `'config'` view. Otherwise `'no-config'`.

## Risks / Trade-offs

- **User discovers AI only after visiting profile** → Mitigation: "no-config" modal state has a prominent CTA pointing to Profile
- **Existing users with saved config** → No migration needed; `getLlmConfig()` already reads from `wst_llm_config`, which remains unchanged
- **API key visible on profile page** → Stored as password input (masked), same as current modal behavior
