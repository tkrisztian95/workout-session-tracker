## Why

The app currently only supports English, limiting accessibility for Hungarian and German-speaking users. Adding language selection during onboarding allows the UI to greet and interact with users in their preferred language from the start.

## What Changes

- The name-entry onboarding modal gains a language selector (English, Hungarian, German)
- The selected language is persisted alongside the user name in local storage
- All static UI text (greetings, labels, buttons, prompts) is served in the selected language
- A locale context/hook provides translated strings throughout the app

## Capabilities

### New Capabilities

- `localization`: Translation system with string dictionaries for English, Hungarian, and German; locale stored in local storage; app-wide locale context exposing translated strings

### Modified Capabilities

- `user-profile`: Onboarding prompt now includes a language selector; both name and locale are saved and restored on subsequent launches

## Impact

- `src/components/UserNameModal.tsx` — add language selector UI
- `src/lib/storage.ts` — add `saveLocale` / `getLocale` helpers
- `src/lib/i18n.ts` (new) — translation dictionaries and `useTranslations` hook
- All components that render user-visible static text will use translated strings via the locale context
- No breaking changes; existing users without a saved locale default to English
