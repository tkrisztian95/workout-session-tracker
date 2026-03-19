## Why

The AI plan generator currently lacks key physical attributes — age, height, weight, and sex — that significantly affect workout recommendations. Collecting these during onboarding (and making them editable on the profile screen) enables the AI to produce more personalized and physiologically appropriate plans.

## What Changes

- Onboarding flow gains three new optional fields: age, height, and weight (sex already exists via `user-sex` spec but is currently only on the profile screen — it will be moved into onboarding)
- Profile settings screen gains editable fields for age, height, and weight (alongside the existing sex selector)
- AI plan generation prompt includes age, height, weight, and sex when available

## Capabilities

### New Capabilities

- `user-body-metrics`: Collect, persist, and expose the user's age, height, and weight. Includes onboarding steps, profile editing, and localStorage storage helpers.

### Modified Capabilities

- `user-profile`: Onboarding flow gains body-metrics fields (age, height, weight) and the sex selector is added to onboarding in addition to its existing profile location.
- `user-sex`: Sex selector is surfaced in onboarding (currently profile-only). Onboarding scenario added.
- `ai-plan-preferences`: AI prompt construction is extended to include age, height, and weight alongside the existing sex field.

## Impact

- `src/storage.ts` — new helpers: `saveAge`, `getAge`, `saveHeight`, `getHeight`, `saveWeight`, `getWeight`
- Onboarding modal component — new step or additional fields for age, height, weight, sex
- Profile settings screen — new editable cards for age, height, weight
- AI plan prompt builder — reads and injects body metrics into the prompt
- Localization strings — new keys for labels and units (metric/imperial consideration out of scope for now; metric only)
