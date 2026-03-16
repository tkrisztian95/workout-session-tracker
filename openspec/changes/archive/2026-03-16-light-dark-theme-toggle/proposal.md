## Why

Users have no control over the app's visual theme — it always appears in the same mode regardless of their system preferences or personal taste. Adding light/dark theme support improves accessibility, reduces eye strain in low-light environments, and aligns the app with modern mobile UX expectations.

## What Changes

- Add a theme toggle (light / dark / system) accessible from the profile/settings screen
- Automatically detect and apply the device's system color scheme on first launch
- Persist the user's theme preference across sessions
- Apply theme-aware colors throughout the app (backgrounds, text, cards, buttons, icons)

## Capabilities

### New Capabilities

- `theme-preference`: User can select a theme preference (light, dark, or system default) that is persisted and applied across the app

### Modified Capabilities

- `profile-settings`: Add theme selector control to the profile/settings screen

## Impact

- **UI components**: All screens and shared components need to consume theme colors from a central theme context
- **State/storage**: Theme preference stored in local persistent storage (AsyncStorage or equivalent)
- **Dependencies**: No new external dependencies expected; uses React Native's `Appearance` API for system theme detection
