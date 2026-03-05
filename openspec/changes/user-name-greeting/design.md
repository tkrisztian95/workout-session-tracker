## Context

The app is a Next.js 16 / React 19 application with no backend. All state is persisted in `localStorage` via `src/lib/storage.ts`. The home screen (`src/app/page.tsx`) is the primary landing page. There is no existing user identity or profile concept.

## Goals / Non-Goals

**Goals:**
- Allow the user to enter their name on first use (or when no name is stored)
- Persist the name in `localStorage` alongside other app data
- Display a personalized greeting on the home screen

**Non-Goals:**
- Authentication or multi-user support
- Server-side user profiles
- Name validation beyond basic non-empty check
- Ability to change the name after onboarding (out of scope for this change)

## Decisions

### Storage key via existing `storage.ts` pattern
Add a `userName` key to the existing `KEYS` constant in `src/lib/storage.ts` and expose `getUserName` / `saveUserName` helpers. This keeps all persistence in one place and consistent with the project's established pattern.

*Alternative considered*: A separate `userStorage.ts` file — rejected as unnecessary indirection for a single value.

### Onboarding modal shown on home page mount
On mount of the home page (`page.tsx`), check `getUserName()`. If it returns `null`/empty, show a modal overlay with a name input. Submitting the form saves the name and dismisses the modal. This avoids a dedicated route and keeps the flow lightweight.

*Alternative considered*: A dedicated `/onboarding` route with a redirect — rejected as over-engineered for a single-field prompt.

### Greeting displayed as a header element on the home screen
Once a name exists, render a greeting (e.g., "Welcome back, {name}!") as a simple heading at the top of the home page. First visit shows "Welcome, {name}!" after the modal closes; subsequent visits show "Welcome back, {name}!".

*Alternative considered*: A separate greeting component file — the greeting is a single line; it can live inline in `page.tsx` or be extracted later if complexity grows.

## Risks / Trade-offs

- [SSR mismatch] `localStorage` is not available during server-side rendering → Mitigation: follow existing pattern of guarding with `typeof window === 'undefined'` checks, and read the name in a `useEffect`.
- [No edit flow] User cannot change their name after setting it in this version → Mitigation: document as known limitation; a settings screen can be added later.

## Migration Plan

No data migration needed. Existing users will be prompted once on their next visit; they simply enter their name to proceed. No rollback complexity — removing the feature would just skip the prompt.
