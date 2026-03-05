## Why

New users have no sense of personalization when opening the app. Allowing users to set their name on first launch creates a welcoming, personalized experience that sets a positive tone before any workout tracking begins.

## What Changes

- On app startup (or first launch), a name-entry prompt is shown if no name has been set
- The user's name is persisted locally
- A personalized greeting (e.g., "Welcome back, Alex!") is displayed on the home screen

## Capabilities

### New Capabilities

- `user-profile`: Manages user identity data (name), including onboarding input and persistent storage, and surfaces a personalized greeting on the home screen.

### Modified Capabilities

<!-- No existing capabilities have requirement-level changes -->

## Impact

- New onboarding/name-entry UI component shown at app start
- Local storage (AsyncStorage or equivalent) for persisting the user's name
- Home screen updated to display personalized greeting
