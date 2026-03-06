## Context

The app is a Next.js client-side workout tracker. All state is stored in `localStorage`. UI text is currently hardcoded in English across many components. The user-profile onboarding (`UserNameModal`) is the first interaction a new user has with the app—making it the natural place to also capture language preference.

## Goals / Non-Goals

**Goals:**

- Add language selection (English, Hungarian, German) to the onboarding modal
- Persist locale alongside user name in `localStorage`
- Provide a single hook (`useTranslations`) that all components use to get translated strings
- Default to English for existing users who have no saved locale

**Non-Goals:**

- RTL language support
- Dynamic locale switching after onboarding (locale is set once at onboarding)
- Server-side i18n or Next.js `i18n` routing
- Number/date/unit formatting (only UI string translation)

## Decisions

### 1. Inline dictionary over i18n library (e.g. next-intl, react-i18next)

A typed TypeScript dictionary (`src/lib/i18n.ts`) avoids adding a dependency for three static languages with a small set of strings. The dictionary is keyed by string ID, typed with a union of supported locales, and always exhaustive at compile time. If the string count grows significantly a library can be introduced later.

### 2. React Context for locale distribution

A `LocaleProvider` wraps the app at `layout.tsx` level. It reads the stored locale from `localStorage` on mount and exposes `{ locale, translations }` via context. Components call `useTranslations()` and get back the string dictionary for the active locale. This avoids prop drilling and stays framework-agnostic.

### 3. Locale stored as a separate key in localStorage

`wst_locale` stores the locale code (`en`, `hu`, `de`). Keeping it separate from the user name allows each concern to be read/written independently and simplifies the `user-profile` onboarding flow.

### 4. Language selector rendered as segmented control in the onboarding modal

Three labelled buttons ("English", "Magyar", "Deutsch") replace a dropdown to keep the UI touch-friendly and immediately scannable. The selector appears below the name input, above the submit button.

## Risks / Trade-offs

- **Risk**: Incomplete translations ship with some strings still in English.
  → Mitigation: TypeScript ensures every key present in the English dictionary is also present for all other locales (all locale objects share one `Translations` interface).

- **Risk**: Existing users have no locale saved; they must see English strings even if they'd prefer another language.
  → Mitigation: Acceptable — they can clear storage to re-trigger onboarding, or we can add a settings screen later.

- **Risk**: The translation dictionary grows large and hurts bundle size.
  → Mitigation: Three languages × ~50 strings is negligible. Revisit if languages are added.

## Migration Plan

1. Add `wst_locale` key to `KEYS` in `storage.ts` with `saveLocale` / `getLocale` helpers.
2. Create `src/lib/i18n.ts` with the `Locale` type, `Translations` interface, and full dictionaries.
3. Create `src/lib/locale-context.tsx` with `LocaleProvider` and `useTranslations`.
4. Wrap root layout in `LocaleProvider`.
5. Update `UserNameModal` to include the language selector and save locale on submit.
6. Replace all hardcoded UI strings in components with `useTranslations()` lookups.

No rollback strategy needed—changes are purely additive and backwards-compatible (missing locale defaults to English).
