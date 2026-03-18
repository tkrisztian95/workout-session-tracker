## Why

The app is being open-sourced. Before doing so, it needs to be transparent about what data it collects and how it uses third-party services (PostHog analytics, OpenAI). Currently there is no in-app disclosure anywhere. Additionally, the onboarding flow is the ideal moment to surface a privacy acknowledgment — before the user's name is saved — since that is the first meaningful data capture event. An About card on the profile page also gives the app a credible, open-source-ready identity (version, license, source link).

## What Changes

- The onboarding name modal (`UserNameModal`) gains a brief privacy notice and a required consent acknowledgment before the user can submit their name.
- A new **About** card is added to the profile page showing: app name, version, license (MIT), a link to the GitHub repository, and a short data disclosure summary.
- A minimal, in-app **Privacy Policy** modal (or expandable section) is accessible from both the About card and the onboarding notice, listing exactly what data leaves the device (PostHog events, OpenAI prompt data) and what stays local.

## Capabilities

### New Capabilities

- `privacy-policy`: Stores and surfaces the app's minimal privacy policy text and tracks whether the user has acknowledged it.
- `about-section`: Displays open-source identity information (version, license, repo link) and links to the privacy policy on the profile page.

### Modified Capabilities

- `user-profile`: Onboarding prompt is extended with a privacy acknowledgment checkbox/notice. Consent acceptance is recorded in localStorage alongside the name.

## Impact

- `UserNameModal` updated with privacy notice text and a checkbox; submit is blocked until consent is given.
- New `AboutCard` component added to the profile page below the Danger Zone card.
- New `PrivacyPolicyModal` component (reusable, triggered from onboarding and About card).
- New `consentAccepted` storage key (`wst_consent_accepted`) added to `storage.ts`.
- No backend changes — all consent and identity data remains in localStorage.
