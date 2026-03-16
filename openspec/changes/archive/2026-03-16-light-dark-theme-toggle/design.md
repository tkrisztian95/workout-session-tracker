## Context

The app is a Next.js 16 / React 19 web app styled with Tailwind CSS v4. All colors are defined as CSS custom properties in `tokens.css` and exposed as semantic Tailwind utility classes (`bg-base`, `text-foreground`, etc.). The current tokens are hardcoded to a single dark theme (gray-900 base, gray-100 foreground, orange accent). There is no existing theming mechanism.

Persistence uses `localStorage` via a shared `storage.ts` module. Locale and other preferences follow this same pattern. The app has a `LocaleProvider` context in `layout.tsx` — theme preference will follow the same pattern.

## Goals / Non-Goals

**Goals:**

- Let users choose between Light, Dark, and System (auto) theme modes
- Persist the preference in `localStorage`
- On first visit, default to System (follow `prefers-color-scheme`)
- Apply the theme with zero flash on load
- Expose the toggle in the Profile/Settings screen alongside Language

**Non-Goals:**

- Custom color themes beyond light/dark
- Per-page theme overrides
- Server-side theme detection (SSR color values are not required to match client)

## Decisions

### 1. CSS custom properties + `data-theme` attribute on `<html>`

**Decision**: Add a `data-theme="light"` or `data-theme="dark"` attribute on `<html>`. Define light-theme token overrides under `[data-theme="light"]` in `tokens.css`.

**Rationale**: All color tokens are already CSS variables. Swapping them via a single attribute on `<html>` is instant, requires no JavaScript class toggling in component trees, and avoids re-renders. Tailwind's `@theme inline` remains the source of truth; light overrides shadow the dark defaults.

**Alternative considered**: Tailwind `dark:` variant with `darkMode: 'class'`. Rejected because it would require adding `dark:` prefixes to every utility in every component — a large, error-prone change. The CSS variable approach requires changes only in `tokens.css`.

### 2. Theme context (`ThemeProvider`) at the root layout

**Decision**: Create a `ThemeProvider` (similar to `LocaleProvider`) that reads the stored preference, subscribes to `window.matchMedia` for system changes, and writes `data-theme` to `document.documentElement`.

**Rationale**: Centralises all theme logic. Components that need to read the current preference (the toggle control in Profile) can `useTheme()` without prop drilling.

### 3. Inline script to prevent FOUC

**Decision**: Inject a tiny inline `<script>` in `<head>` (before any CSS) via Next.js `<Script strategy="beforeInteractive">` or a raw `<script>` tag in `layout.tsx` that reads `localStorage` and sets `data-theme` synchronously.

**Rationale**: Without this, on first paint the browser renders with the default (dark) tokens before React hydrates and the `ThemeProvider` runs, causing a flash for light-mode users. The inline script is ~5 lines and has no runtime dependencies.

### 4. Light palette

**Decision**: Reuse the existing palette primitives and add light-mode semantic overrides. Light theme: white/gray-50 base, gray-900 foreground, same orange accent.

**Rationale**: Keeps the brand identity consistent. Only semantic tokens change; primitive palette values stay the same.

### 5. Toggle control UI

**Decision**: Add a `ThemeCard` component in the Profile screen (between Language and AI Config cards). It presents three segmented options: Light / System / Dark — matching the pattern of `LanguageCard`.

## Risks / Trade-offs

- **FOUC on slow connections**: The inline script mitigates this, but if JS is blocked or very slow there may be a brief flash. Acceptable for a PWA-style app.
- **SSR mismatch**: Next.js renders HTML on the server without knowing the user's preference. The inline script corrects this client-side. Next.js `suppressHydrationWarning` on `<html>` should be set to prevent hydration warnings about the `data-theme` attribute difference.
- **Tailwind `@theme inline` scoping**: Tailwind v4's `@theme inline` generates CSS variables globally. Light-mode overrides must be placed outside `@theme inline` (directly in `:root` under `[data-theme="light"]`) to actually override the generated vars at runtime.
