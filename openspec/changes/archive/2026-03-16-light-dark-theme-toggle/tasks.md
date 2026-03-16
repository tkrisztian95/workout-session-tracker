## 1. Token & CSS Foundation

- [x] 1.1 Add light-theme color token overrides to `tokens.css` under `[data-theme="light"]` (map semantic vars to light palette: white base, gray-900 foreground, same orange accent)
- [x] 1.2 Add a light palette set to the raw palette block (e.g. `--palette-white`, `--palette-gray-50`) if needed for the light theme surfaces

## 2. Storage & Theme Logic

- [x] 2.1 Add `wst_theme` key to the `KEYS` object in `storage.ts`
- [x] 2.2 Add `getTheme()` and `saveTheme()` functions to `storage.ts` (values: `'light' | 'dark' | 'system'`)
- [x] 2.3 Create `src/lib/theme-context.tsx` with `ThemeProvider` and `useTheme()` hook — reads stored preference, resolves system theme via `window.matchMedia('(prefers-color-scheme: dark)')`, writes `data-theme` attribute on `document.documentElement`, subscribes to system media query changes

## 3. No-Flash Inline Script

- [x] 3.1 Add an inline `<script>` tag inside `<head>` in `layout.tsx` that synchronously reads `localStorage.getItem('wst_theme')` and sets `data-theme` on `<html>` before any paint
- [x] 3.2 Add `suppressHydrationWarning` to the `<html>` element in `layout.tsx` to suppress Next.js hydration mismatch warning for `data-theme`

## 4. Provider Integration

- [x] 4.1 Wrap the app with `ThemeProvider` in `layout.tsx` (alongside the existing `LocaleProvider`)

## 5. Theme Toggle UI (Profile Screen)

- [x] 5.1 Create `src/components/ThemeCard.tsx` — a card component with three segmented options (Light / System / Dark), styled consistently with `LanguageCard`
- [x] 5.2 Add `ThemeCard` to the profile page (`src/app/profile/page.tsx`) between the Language and AI Config sections
- [x] 5.3 Add translation keys for theme labels (`theme_light`, `theme_dark`, `theme_system`, `theme_label`) to all locale files in `src/locales/`

## 6. Verification

- [x] 6.1 Verify light theme renders correctly on all main screens (Home, Plans, History, Profile)
- [x] 6.2 Verify system theme auto-switches when toggling device dark/light mode
- [x] 6.3 Verify preference persists after page reload with no visible flash
