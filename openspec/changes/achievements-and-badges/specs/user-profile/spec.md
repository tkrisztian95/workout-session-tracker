## ADDED Requirements

### Requirement: Achievements entry point on Profile page

The Profile page SHALL include a tappable row that navigates the user to the Achievements page at `/profile/achievements`. The row SHALL display the count of earned achievements out of the total available.

#### Scenario: Achievements row is visible on Profile page

- **WHEN** the user views the Profile page
- **THEN** an Achievements row SHALL be present showing an icon, a label, and the earned/total count

#### Scenario: Tapping Achievements row navigates to Achievements page

- **WHEN** the user taps the Achievements row
- **THEN** the app SHALL navigate to `/profile/achievements`

#### Scenario: Earned count updates as achievements are unlocked

- **WHEN** the user has earned 5 out of 22 achievements
- **THEN** the row SHALL display "5 / 22" (or equivalent locale-aware format)
