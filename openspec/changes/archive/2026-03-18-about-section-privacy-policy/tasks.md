## 1. Storage

- [x] 1.1 Add `consentAccepted: 'wst_consent_accepted'` to the `KEYS` constant in `src/lib/storage.ts`
- [x] 1.2 Add `getConsentAccepted(): boolean` function to `src/lib/storage.ts` (returns `true` if the key equals `"true"`)
- [x] 1.3 Add `saveConsentAccepted(): void` function to `src/lib/storage.ts` (sets key to `"true"`)

## 2. App Version Env Var

- [x] 2.1 In `next.config.ts`, add `NEXT_PUBLIC_APP_VERSION: process.env.npm_package_version` to `env` (or `publicRuntimeConfig`) so the version from `package.json` is available client-side

## 3. Translations

- [x] 3.1 Add onboarding consent label key (`onboarding_consent_label`) to `src/lib/i18n.ts` for `en`, `hu`, `de` (use English as fallback for `hu`/`de`)
- [x] 3.2 Add "Privacy Policy" link label key (`onboarding_privacy_link`) for all three locales
- [x] 3.3 Add About card keys: `about_title`, `about_version`, `about_license`, `about_source_code`, `about_privacy_policy`, `about_data_summary` for all three locales
- [x] 3.4 Add `PrivacyPolicyModal` title and body keys (or keep body hardcoded in English — either is acceptable)

## 4. PrivacyPolicyModal Component

- [x] 4.1 Create `src/components/PrivacyPolicyModal.tsx` accepting `isOpen: boolean` and `onClose: () => void` props
- [x] 4.2 Render a full-screen or bottom-sheet overlay (consistent with app modal style, e.g. `fixed inset-0 bg-base z-50`)
- [x] 4.3 Display the four disclosure points as a styled list:
  - All workout data is stored locally in your browser only.
  - Anonymous usage events are sent to PostHog for product analytics.
  - If you use the AI plan feature, your workout history is sent to OpenAI using your own API key.
  - No account, no server, no personal data is sold or shared.
- [x] 4.4 Include a close button (X icon or "Close" button) that calls `onClose`

## 5. PostHog Consent Gating

- [x] 5.1 In `PostHogProvider`, wrap `posthog.init()` in a condition: only call it if `getConsentAccepted()` returns `true`
- [x] 5.2 Expose a `initPostHog()` helper function (or call `posthog.init()` directly) that can be called after consent is granted, so analytics start in the same session without requiring a reload
- [x] 5.3 In `UserNameModal`, after `saveConsentAccepted()`, call `initPostHog()` to activate analytics immediately for the current session

## 6. UserNameModal — Consent Checkbox

- [x] 6.1 Add `consentChecked` boolean state to `UserNameModal`
- [x] 6.2 Add `isPolicyOpen` boolean state and render `<PrivacyPolicyModal>` conditionally
- [x] 6.3 Render a checkbox row below the name input: a styled `<input type="checkbox">` with a label containing the consent text and an inline "Privacy Policy" link that sets `isPolicyOpen = true`
- [x] 6.4 Disable the submit button when `!name.trim() || !consentChecked` (extend existing disabled condition)
- [x] 6.5 In `handleSubmit`, call `saveConsentAccepted()` then `initPostHog()` before calling `onComplete`

## 7. AboutCard Component

- [x] 7.1 Create `src/components/AboutCard.tsx` following the card structure of existing cards (e.g. `DangerZoneCard`)
- [x] 7.2 Display app name ("Workout Sessions Tracker") and version (`process.env.NEXT_PUBLIC_APP_VERSION ?? '—'`)
- [x] 7.3 Display license row: "MIT License"
- [x] 7.4 Display source code row with an external link icon linking to the GitHub repository URL
- [x] 7.5 Display a "Privacy Policy" row that opens `<PrivacyPolicyModal>` on tap/click
- [x] 7.6 Add `isPolicyOpen` state and render `<PrivacyPolicyModal>` conditionally inside `AboutCard`

## 8. Profile Page Integration

- [x] 8.1 Import `AboutCard` in `src/app/profile/page.tsx`
- [x] 8.2 Render `<AboutCard />` below `<DangerZoneCard />` in the profile page card stack
