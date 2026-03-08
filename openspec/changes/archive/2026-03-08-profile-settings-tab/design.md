## Context

The app already supports name and locale selection via an onboarding modal (`UserNameModal`) shown at first launch. The `LocaleProvider` exposes `setLocale()` via context, and `src/lib/storage.ts` has `getUserName` / `saveUserName` helpers. The bottom navigation currently has three tabs: Home, Plans, History — rendered by `BottomNav`.

There is no mechanism to change the name or locale post-onboarding, and no way to clear app data without browser dev tools.

## Goals / Non-Goals

**Goals:**

- Add a Profile tab to the bottom navigation (4th tab)
- Allow in-app editing of display name and language
- Provide a destructive "Clear Data & Reset" action with a confirmation step
- Re-use existing locale context (`setLocale`) and storage utilities

**Non-Goals:**

- User accounts or cloud sync
- Changing any other settings beyond name, language, and data reset
- Animations or complex profile media (avatars, etc.)

## Decisions

### 1. New route `src/app/profile/page.tsx` (Next.js App Router)

The app uses Next.js App Router with directory-based routing. Adding `/profile` as a new route is consistent with `/plans` and `/history`. The profile page renders inside the same `RootLayout` which already wraps everything with `LocaleProvider`.

### 2. Inline editing (no separate modal)

Name editing uses an inline input field on the profile page rather than opening a new modal. This keeps the interaction lightweight and avoids introducing another modal layer on top of a page.

### 3. Language selector reuses the same 3-option pattern from onboarding

The onboarding modal already has a 3-button language picker (en/hu/de). The profile screen uses the same visual pattern for consistency.

### 4. Clear Data uses a two-step confirmation

The reset action is destructive and irreversible. A single confirmation button press inside an inline warning panel (not a modal) prevents accidental taps while staying on-page.

Alternatives considered:

- Native `confirm()` dialog — avoided for UX consistency and because it blocks the thread
- Separate modal — adds complexity for a single destructive action

### 5. Clear Data calls `localStorage.clear()` and then reloads

Wiping all localStorage keys and reloading the page is the simplest strategy: the app re-initializes in its default state, `LocaleProvider` reads no locale, and the onboarding modal appears again. No need to manually reset React state across all contexts.

### 6. `saveUserName` added to storage helpers

A `saveUserName(name: string)` function already exists conceptually (used during onboarding). Verify it exists in `storage.ts`; add it if missing.

### 7. BottomNav extended to 4 tabs

`BottomNav` accepts `active: 'home' | 'plans' | 'history'`. This union is extended to include `'profile'`. All existing pages that pass `active` prop remain unchanged; only the Profile page passes `'profile'`.

## Risks / Trade-offs

- **Destructive reset is irreversible** → Mitigated by two-step confirmation with explicit warning text
- **`localStorage.clear()` removes all keys including LLM config** → This is intentional (full reset), and the warning text should make this clear to the user
- **Adding a 4th nav tab narrows the tap targets** → Acceptable given the current minimum of 3 tabs on a small screen; each tab remains accessible

## Migration Plan

No data migration needed. The profile page reads from existing localStorage keys. Adding `saveUserName` (if missing) is a backwards-compatible addition to `storage.ts`.
