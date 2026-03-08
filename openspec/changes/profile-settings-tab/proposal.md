## Why

Users currently set their name and language only during the initial onboarding prompt, with no way to change these settings afterward. Adding a dedicated Profile tab gives users control over their identity, language, and app data without requiring a re-install.

## What Changes

- Add a new **Profile** tab to the bottom navigation bar
- Allow users to edit their display name from the profile screen
- Allow users to change their active language from the profile screen
- Provide a **Clear Data & Reset** action that wipes all local storage and returns the app to its initial state (triggering the onboarding prompt again)

## Capabilities

### New Capabilities

- `profile-settings`: A profile settings screen where users can view and edit their name, change their language, and perform a full data reset

### Modified Capabilities

- `user-profile`: The name and locale can now be changed post-onboarding, not only during the initial prompt
- `localization`: The language selector is now also accessible from the profile settings screen (not only at onboarding)

## Impact

- `src/app/` — New profile route/page added
- Navigation component — Profile tab added to bottom nav
- `user-profile` and `localization` context/hooks — Must support updating stored values after initial onboarding
- localStorage — Clear Data resets all keys (`wst_name`, `wst_locale`, and all workout/session data)
