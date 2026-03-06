## 1. Storage Layer

- [x] 1.1 Add `locale` key (`wst_locale`) to the `KEYS` constant in `src/lib/storage.ts`
- [x] 1.2 Implement `getLocale(): Locale | null` helper in `src/lib/storage.ts`
- [x] 1.3 Implement `saveLocale(locale: Locale): void` helper in `src/lib/storage.ts`

## 2. Translation Dictionary

- [x] 2.1 Create `src/lib/i18n.ts` with the `Locale` union type (`'en' | 'hu' | 'de'`)
- [x] 2.2 Define the `Translations` interface listing every translatable string key
- [x] 2.3 Implement the English (`en`) translation dictionary
- [x] 2.4 Implement the Hungarian (`hu`) translation dictionary
- [x] 2.5 Implement the German (`de`) translation dictionary
- [x] 2.6 Export a `translations` record mapping each `Locale` to its dictionary
- [x] 2.7 Export a `defaultLocale` constant set to `'en'`

## 3. Locale Context

- [x] 3.1 Create `src/lib/locale-context.tsx` with `LocaleContext` (provides `{ locale, t: Translations }`)
- [x] 3.2 Implement `LocaleProvider` that reads `wst_locale` from localStorage on mount and defaults to `'en'`
- [x] 3.3 Export `useTranslations()` hook that returns the active `Translations` object from context

## 4. Root Layout Integration

- [x] 4.1 Wrap the root layout in `src/app/layout.tsx` with `LocaleProvider`

## 5. Onboarding Modal

- [x] 5.1 Add local state for selected locale (default `'en'`) in `UserNameModal`
- [x] 5.2 Render a segmented language selector with three buttons: English, Magyar, Deutsch
- [x] 5.3 Highlight the active language selection visually
- [x] 5.4 Call `saveLocale(selectedLocale)` alongside `saveUserName` on valid form submit
- [x] 5.5 Replace hardcoded English strings in `UserNameModal` with `useTranslations()` lookups

## 6. Translate Existing UI Components

- [x] 6.1 Replace hardcoded strings in `src/components/BottomNav.tsx` with translation keys
- [x] 6.2 Replace hardcoded strings in `src/components/ActivityTiles.tsx` with translation keys
- [x] 6.3 Replace hardcoded strings in `src/components/ExerciseCard.tsx` with translation keys
- [x] 6.4 Replace hardcoded strings in `src/components/SessionTimer.tsx` with translation keys
- [x] 6.5 Replace hardcoded strings in `src/components/SessionCompleteOverlay.tsx` with translation keys
- [x] 6.6 Replace hardcoded strings in `src/components/AddExerciseModal.tsx` with translation keys
- [x] 6.7 Replace hardcoded strings in `src/components/PlanDayEditor.tsx` with translation keys
- [x] 6.8 Replace hardcoded strings in `src/app/page.tsx` (greeting, labels) with translation keys
- [x] 6.9 Replace hardcoded strings in plan and history page components with translation keys

## 7. Verify

- [x] 7.1 Confirm TypeScript compilation passes with no errors (`tsc --noEmit`)
- [x] 7.2 Manually test onboarding flow in each language (EN, HU, DE) and verify strings display correctly
- [x] 7.3 Confirm that reloading the page after onboarding preserves the selected language
- [x] 7.4 Confirm that a user with no stored locale sees English by default
