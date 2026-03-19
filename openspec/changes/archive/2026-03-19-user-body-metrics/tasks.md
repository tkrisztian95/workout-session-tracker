## 1. Storage

- [x] 1.1 Add `wst_user_age`, `wst_user_height_cm`, `wst_user_weight_kg` keys to the `KEYS` object in `src/lib/storage.ts`
- [x] 1.2 Implement `saveAge(age: number): void` and `getAge(): number | null` helpers
- [x] 1.3 Implement `saveHeightCm(cm: number): void` and `getHeightCm(): number | null` helpers
- [x] 1.4 Implement `saveWeightKg(kg: number): void` and `getWeightKg(): number | null` helpers

## 2. Onboarding Modal

- [x] 2.1 Add a second step to `UserNameModal.tsx` that is shown after the first step completes
- [x] 2.2 Add age, height, and weight numeric inputs to the second step (all optional, with unit labels "cm" / "kg")
- [x] 2.3 Add sex selector to the second step (matching the existing profile sex selector: Male, Female, Not specified)
- [x] 2.4 On second-step submit: call `saveAge`, `saveHeightCm`, `saveWeightKg`, and `saveSex` for any non-empty/non-default values
- [x] 2.5 Ensure "Not specified" sex selection does NOT write to localStorage
- [x] 2.6 Ensure the second step is skippable (submitting with all fields empty completes onboarding normally)

## 3. Profile Settings Screen

- [x] 3.1 Add an age input field to `src/app/profile/page.tsx` that saves on blur via `saveAge`
- [x] 3.2 Add a height input field (cm) that saves on blur via `saveHeightCm`
- [x] 3.3 Add a weight input field (kg) that saves on blur via `saveWeightKg`
- [x] 3.4 Pre-populate all three fields with values from `getAge()`, `getHeightCm()`, `getWeightKg()` on mount
- [x] 3.5 Apply range validation: age 10–120, height 50–300, weight 20–500; revert field on invalid blur

## 4. AI Prompt

- [x] 4.1 In `src/lib/ai.ts`, read `getAge()`, `getHeightCm()`, and `getWeightKg()` before calling `buildPlanSuggestionPrompt`
- [x] 4.2 Pass age, height, and weight as optional parameters to `buildPlanSuggestionPrompt` (or extend the existing signature pattern)
- [x] 4.3 Conditionally append each metric to the prompt preamble (alongside the existing sex line) when non-null

## 5. Localization

- [x] 5.1 Add translation keys for "Age", "Height", "Weight", unit labels ("cm", "kg"), and the second onboarding step heading to all three locale files (en, hu, de)
