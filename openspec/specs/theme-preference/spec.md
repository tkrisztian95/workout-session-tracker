### Requirement: Theme preference selection

The system SHALL allow users to select a theme preference from three options: Light, Dark, and System. "System" follows the device's `prefers-color-scheme` media query.

#### Scenario: Default is System on first launch

- **WHEN** a user opens the app for the first time with no stored theme preference
- **THEN** the app SHALL apply the theme matching the device's system color scheme

#### Scenario: Light theme applies light colors

- **WHEN** the user selects Light theme
- **THEN** the app SHALL display light backgrounds (white/near-white) and dark text

#### Scenario: Dark theme applies dark colors

- **WHEN** the user selects Dark theme
- **THEN** the app SHALL display dark backgrounds and light text

#### Scenario: System theme tracks device changes

- **WHEN** the user has System selected and changes their device's color scheme
- **THEN** the app SHALL update its theme to match the new system color scheme without requiring a reload

### Requirement: Theme preference persistence

The system SHALL persist the user's chosen theme preference in `localStorage` under the key `wst_theme`.

#### Scenario: Preference survives page reload

- **WHEN** the user sets a theme preference and reloads the app
- **THEN** the same theme SHALL be applied without any visible flash before page interactive

#### Scenario: No-flash on load

- **WHEN** the app loads with a stored light theme preference
- **THEN** the light theme SHALL be applied before the first paint, with no dark flash

### Requirement: Theme applied globally

All screens and UI surfaces SHALL respect the active theme tokens. No component SHALL use hardcoded color values that bypass the semantic token system.

#### Scenario: Theme tokens propagate to all surfaces

- **WHEN** any theme is active
- **THEN** background, text, border, and brand colors on all screens SHALL reflect the active theme's token values
