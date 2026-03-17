## 1. Storage & Types

- [x] 1.1 Add `Sex` type (`'male' | 'female'`) to `src/lib/types.ts`
- [x] 1.2 Add `wst_user_sex` key to the `KEYS` constant in `src/lib/storage.ts`
- [x] 1.3 Implement `getSex(): Sex | null` helper in `src/lib/storage.ts`
- [x] 1.4 Implement `saveSex(sex: Sex): void` helper in `src/lib/storage.ts`

## 2. Translations

- [x] 2.1 Add `profile_sex_label`, `profile_sex_male`, `profile_sex_female`, `profile_sex_not_specified` keys to `src/locales/en.json`
- [x] 2.2 Add the same keys to `src/locales/hu.json` (Hungarian translations)
- [x] 2.3 Add the same keys to `src/locales/de.json` (German translations)
- [x] 2.4 Add the translation type entries to `src/lib/i18n.ts` (if a `Translations` interface is defined there)

## 3. SexCard Component

- [x] 3.1 Create `src/components/SexCard.tsx` following the `LanguageCard` pattern
- [x] 3.2 Use `<Select>` and `<FieldLabel>` from `src/components/ui/Input.tsx`
- [x] 3.3 Options: Male, Female, Not specified (mapped to `'male'`, `'female'`, `null`)
- [x] 3.4 On change, call `saveSex()` immediately (no separate save button needed, matching LanguageCard behavior)
- [x] 3.5 Read initial value from `getSex()` on mount

## 4. Profile Page Integration

- [x] 4.1 Import and mount `<SexCard />` in `src/app/profile/page.tsx` below the language card

## 5. AI Plan Generation Integration

- [x] 5.1 In `src/lib/ai.ts`, update `buildPlanSuggestionPrompt` to accept an optional `sex` parameter
- [x] 5.2 If sex is non-null, prepend a line such as `My biological sex: male.` to the user message in `buildPlanSuggestionPrompt` so the AI uses it when generating the plan
- [x] 5.3 In `suggestPlan`, call `getSex()` and pass the value through to `buildPlanSuggestionPrompt`
