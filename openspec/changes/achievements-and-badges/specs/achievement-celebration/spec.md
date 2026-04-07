## ADDED Requirements

### Requirement: Celebration overlay for newly unlocked achievements

The system SHALL display a full-screen celebration overlay whenever one or more achievements have been unlocked but not yet shown to the user (`seen: false`). The overlay SHALL show one achievement at a time and queue remaining ones for display after dismissal.

#### Scenario: Single new achievement shows one overlay

- **WHEN** exactly one achievement has `seen: false`
- **THEN** a celebration overlay SHALL appear showing that achievement's icon, name, and description

#### Scenario: Multiple new achievements queue sequentially

- **WHEN** two or more achievements have `seen: false`
- **THEN** the first overlay SHALL appear, and after dismissal the next SHALL appear, continuing until all are seen

#### Scenario: No overlay when all achievements are seen

- **WHEN** all stored achievements have `seen: true` (or no achievements are stored)
- **THEN** no celebration overlay SHALL be displayed

#### Scenario: Dismissing marks achievement as seen

- **WHEN** the user dismisses the celebration overlay for an achievement
- **THEN** that achievement's `seen` flag SHALL be set to `true` in `wst_achievements`

---

### Requirement: Celebration triggered on app open

The system SHALL check for unseen achievements each time the app's home screen renders (after consent is accepted and the user name is set), and display the celebration overlay if any are found.

#### Scenario: App open triggers celebration check

- **WHEN** the home screen renders with a valid user name and consent accepted
- **THEN** the system SHALL read `wst_achievements`, run the achievement engine, persist any new unlocks, and show the celebration overlay for any `seen: false` records

#### Scenario: Celebration not shown during onboarding

- **WHEN** the `UserNameModal` or `ConsentModal` is visible
- **THEN** the celebration overlay SHALL NOT be displayed

---

### Requirement: Celebration triggered after session completion

The system SHALL check for newly unlocked achievements immediately after a workout session is saved (after the user submits their rating or skips it), and display the celebration overlay if any are found.

#### Scenario: Session finish triggers achievement check

- **WHEN** `handleFinish` saves the completed session and the session complete overlay is dismissed
- **THEN** the system SHALL run the achievement engine and show the celebration overlay for any newly unlocked achievements

#### Scenario: Celebration shown after rating overlay closes

- **WHEN** the session completion rating overlay is dismissed
- **THEN** if new achievements were unlocked, the celebration overlay SHALL appear
