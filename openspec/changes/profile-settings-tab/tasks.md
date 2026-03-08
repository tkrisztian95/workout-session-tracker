## 1. Navigation

- [x] 1.1 Add `'profile'` to the `active` prop union type in `BottomNav`
- [x] 1.2 Add a Profile tab link (icon + label) to `BottomNav` pointing to `/profile`
- [x] 1.3 Add translation keys `nav_profile` for all three locales (en/hu/de) in `src/lib/i18n.ts`

## 2. Profile Page

- [x] 2.1 Create `src/app/profile/page.tsx` with `'use client'` directive
- [x] 2.2 Read stored name with `getUserName()` and pre-fill an inline name input field
- [x] 2.3 Disable the Save button when the name input is empty
- [x] 2.4 On Save, call `saveUserName(name)` and show brief confirmation feedback (e.g. updated label)
- [x] 2.5 Render a 3-option language selector (English / Magyar / Deutsch) with the current locale highlighted
- [x] 2.6 On language selection, call `setLocale(locale)` from `useLocale()` and persist to `localStorage` via `saveLocale(locale)` (verify or add `saveLocale` to `storage.ts`)
- [x] 2.7 Add translation keys for all profile screen strings (heading, name label, save button, language section, reset section) in all three locales

## 3. Clear Data & Reset

- [x] 3.1 Add a "Clear Data & Reset" button at the bottom of the profile screen
- [x] 3.2 On first press, reveal an inline confirmation panel (warning text + Confirm and Cancel buttons)
- [x] 3.3 On Cancel, hide the confirmation panel without changing any data
- [x] 3.4 On Confirm, call `localStorage.clear()` then `window.location.reload()`
- [x] 3.5 Add translation keys for confirmation panel text (warning message, confirm label, cancel label) in all three locales

## 4. Wire Up to Layout

- [x] 4.1 Pass `active="profile"` to `<BottomNav>` in the new profile page
- [x] 4.2 Verify all existing pages (`/`, `/plans`, `/history`) still compile and pass their own `active` prop without type errors
