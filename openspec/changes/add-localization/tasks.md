## 1. Storage Layer

- [ ] 1.1 Add `locale` key (`wst_locale`) to the `KEYS` constant in `src/lib/storage.ts`
- [ ] 1.2 Implement `getLocale(): Locale | null` helper in `src/lib/storage.ts`
- [ ] 1.3 Implement `saveLocale(locale: Locale): void` helper in `src/lib/storage.ts`

## 2. Translation Dictionary

- [ ] 2.1 Create `src/lib/i18n.ts` with the `Locale` union type (`'en' | 'hu' | 'de'`)
- [ ] 2.2 Define the `Translations` interface listing every translatable string key
- [ ] 2.3 Implement the English (`en`) translation dictionary
- [ ] 2.4 Implement the Hungarian (`hu`) translation dictionary
- [ ] 2.5 Implement the German (`de`) translation dictionary
- [ ] 2.6 Export a `translations` record mapping each `Locale` to its dictionary
- [ ] 2.7 Export a `defaultLocale` constant set to `'en'`

## 3. Locale Context

- [ ] 3.1 Create `src/lib/locale-context.tsx` with `LocaleContext` (provides `{ locale, t: Translations }`)
- [ ] 3.2 Implement `LocaleProvider` that reads `wst_locale` from localStorage on mount and defaults to `'en'`
- [ ] 3.3 Export `useTranslations()` hook that returns the active `Translations` object from context

## 4. Root Layout Integration

- [ ] 4.1 Wrap the root layout in `src/app/layout.tsx` with `LocaleProvider`

## 5. Onboarding Modal

- [ ] 5.1 Add local state for selected locale (default `'en'`) in `UserNameModal`
- [ ] 5.2 Render a segmented language selector with three buttons: English, Magyar, Deutsch
- [ ] 5.3 Highlight the active language selection visually
- [ ] 5.4 Call `saveLocale(selectedLocale)` alongside `saveUserName` on valid form submit
- [ ] 5.5 Replace hardcoded English strings in `UserNameModal` with `useTranslations()` lookups

## 6. Translate Existing UI Components

- [ ] 6.1 Replace hardcoded strings in `src/components/BottomNav.tsx` with translation keys
- [ ] 6.2 Replace hardcoded strings in `src/components/ActivityTiles.tsx` with translation keys
- [ ] 6.3 Replace hardcoded strings in `src/components/ExerciseCard.tsx` with translation keys
- [ ] 6.4 Replace hardcoded strings in `src/components/SessionTimer.tsx` with translation keys
- [ ] 6.5 Replace hardcoded strings in `src/components/SessionCompleteOverlay.tsx` with translation keys
- [ ] 6.6 Replace hardcoded strings in `src/components/AddExerciseModal.tsx` with translation keys
- [ ] 6.7 Replace hardcoded strings in `src/components/PlanDayEditor.tsx` with translation keys
- [ ] 6.8 Replace hardcoded strings in `src/app/page.tsx` (greeting, labels) with translation keys
- [ ] 6.9 Replace hardcoded strings in plan and history page components with translation keys

## 7. Verify

- [ ] 7.1 Confirm TypeScript compilation passes with no errors (`tsc --noEmit`)
- [ ] 7.2 Manually test onboarding flow in each language (EN, HU, DE) and verify strings display correctly
- [ ] 7.3 Confirm that reloading the page after onboarding preserves the selected language
- [ ] 7.4 Confirm that a user with no stored locale sees English by default
