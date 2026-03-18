## Context

Next.js 16 / React 19 app, no backend. All persistence in `localStorage` via `src/lib/storage.ts`. The profile page is `src/app/profile/page.tsx` and renders a vertical stack of cards. The onboarding modal is `src/components/UserNameModal.tsx`, shown on first launch when no `wst_user_name` exists. UI primitives live in `src/components/ui`. Existing card components (e.g. `DangerZoneCard`, `AiConfigCard`) serve as structural templates. Translations live in `src/lib/i18n.ts` with keys per locale.

## Goals / Non-Goals

**Goals:**

- Add a privacy acknowledgment (checkbox + notice) to the onboarding modal; block submit until checked.
- Record consent acceptance in localStorage (`wst_consent_accepted = "true"`).
- Build a reusable `PrivacyPolicyModal` that displays the minimal privacy policy text, triggered from onboarding and from the About card.
- Add an `AboutCard` to the profile page showing app name, version (from `package.json` via env), license (MIT), GitHub repo link, and a "Privacy Policy" trigger.

**Non-Goals:**

- A dedicated `/privacy` route — keeps everything in-app and lightweight.
- Re-asking consent on subsequent launches — once accepted it is stored.
- Multi-user or account-level consent — this is a single-user local app.

## Decisions

### Consent stored as a boolean flag in localStorage

Add `consentAccepted: 'wst_consent_accepted'` to the `KEYS` map in `storage.ts`, with `getConsentAccepted(): boolean` and `saveConsentAccepted(): void` helpers. The flag is set to `"true"` on first onboarding submit.

### PostHog initialized only after consent

`PostHogProvider` is refactored to delay `posthog.init()` until consent is confirmed. On mount, it reads `getConsentAccepted()` from localStorage; if `false`, PostHog is not initialized and no cookies or network requests are made. When consent is granted during onboarding, `posthog.init()` is called at that point (or on the next app load). A `usePostHogConsent()` hook (or a context event) signals the provider to initialize after the onboarding modal completes.

_Alternative considered_: Initialize PostHog unconditionally and call `posthog.opt_out_capturing()` until consent — rejected because cookies are still set before opt-out is applied, which defeats the purpose.

_Alternative considered_: Store a timestamp — unnecessary overhead; a boolean is sufficient for a single-version OSS app with no versioned policy.

### Checkbox in `UserNameModal`, not a separate screen

Extend the existing onboarding form with a styled checkbox row below the name input. The "Get started" button remains disabled until both name is non-empty AND the checkbox is checked. This minimizes friction — one screen, one submit action.

_Alternative considered_: A separate pre-onboarding consent screen — rejected as over-engineered for a hobby/OSS app; adds an extra navigation step with no legal benefit.

### `PrivacyPolicyModal` as a shared bottom-sheet-style overlay

A modal component (`src/components/PrivacyPolicyModal.tsx`) that renders the policy text in a scrollable sheet. It accepts an `isOpen` + `onClose` prop pair. Triggered by a "Privacy Policy" link in the onboarding checkbox label AND a row in the `AboutCard`.

_Alternative considered_: Inline expandable accordion in the About card — less discoverable from onboarding; a modal reuses cleanly across both entry points.

### Privacy policy text is hardcoded in the component

The policy is short (3–4 bullet points) and infrequently updated. Hardcoding avoids fetching a remote URL or managing a markdown file. The relevant facts are:

1. All workout data is stored locally in your browser (localStorage).
2. Anonymous usage events are sent to PostHog (EU servers) for product analytics. PostHog sets anonymous cookies (prefixed `ph_`) to identify sessions across page loads. No personal data is included.
3. If you use the AI plan feature with your own API key, your workout history and preferences are sent to OpenAI to generate a plan.
4. No account, no server, no personal data sold or shared.

### `AboutCard` positioned at the bottom of the profile page, below `DangerZoneCard`

About/meta information is low-priority for daily use; placing it last keeps the profile's primary controls (name, language, theme, AI) prominent.

_Alternative considered_: A dedicated `/about` page — unnecessary route for a handful of static lines.

### Version sourced from `package.json` via `NEXT_PUBLIC_APP_VERSION` env var

In `next.config.ts`, expose `NEXT_PUBLIC_APP_VERSION: process.env.npm_package_version`. The `AboutCard` reads `process.env.NEXT_PUBLIC_APP_VERSION`. This avoids importing `package.json` at runtime.

_Alternative considered_: Import `package.json` directly — works but adds a large JSON module to the client bundle.

## Risks / Trade-offs

- [SSR] `getConsentAccepted()` reads localStorage — guard with `typeof window !== 'undefined'` following existing project patterns.
- [Policy accuracy] The hardcoded text must stay in sync if PostHog or OpenAI usage changes — mitigated by keeping the policy high-level and non-prescriptive.
- [i18n] Privacy policy text and new onboarding labels need translations for `en`, `hu`, and `de`. Initially ship English-only strings for `hu`/`de` as fallback to unblock the release; a follow-up can add translations.

## Migration Plan

Existing users (those who already have `wst_user_name` set) bypass the onboarding modal entirely, so they will never see the consent checkbox. They do not need retroactive consent — the app has always disclosed its data practices in the README, and no PII is stored. The `wst_consent_accepted` key will simply remain absent for existing users, which is acceptable. A profile-page prompt for existing users is explicitly out of scope.
