## ADDED Requirements

### Requirement: Achievement catalog

The system SHALL define a static catalog of achievements organized into five tracks: sessions, plans, weekly frequency, tenure, and volume. Each achievement SHALL have a unique ID, a track, a display name, a description, and an associated lucide icon.

The full catalog SHALL be:

**Sessions track**: `session_first` (1 session), `session_10` (10), `session_25` (25), `session_50` (50), `session_100` (100), `session_250` (250)

**Plans track**: `plan_first_created` (1 plan created), `plan_first_completed` (1 plan completed), `plan_5_created` (5 plans created), `plan_10_created` (10 plans created)

**Weekly frequency track**: `weekly_2` (2 distinct training days in rolling 7-day window), `weekly_3` (3 days), `weekly_4` (4 days), `weekly_5` (5 days)

**Tenure track**: `tenure_1month` (profile created ≥ 30 days ago), `tenure_3months` (≥ 90 days), `tenure_6months` (≥ 180 days), `tenure_1year` (≥ 365 days), `tenure_2years` (≥ 730 days)

**Volume track**: `volume_1k` (total lifted ≥ 1,000 kg), `volume_10k` (≥ 10,000 kg), `volume_100k` (≥ 100,000 kg)

#### Scenario: Catalog is complete and static

- **WHEN** the achievement definitions are loaded
- **THEN** all 22 achievements SHALL be present with non-empty id, track, name, description, and icon fields

---

### Requirement: Achievement engine

The system SHALL provide an achievement engine that, given the current sessions, plans, and profile creation date, returns the set of achievement IDs that the user has earned.

#### Scenario: Session count threshold

- **WHEN** the user has completed exactly 10 sessions
- **THEN** the engine SHALL return `session_10` as earned (and `session_first` but not `session_25`)

#### Scenario: Weekly frequency uses rolling 7-day window

- **WHEN** the user has completed sessions on 3 distinct calendar days within the last 7 days
- **THEN** the engine SHALL return `weekly_3` as earned (and `weekly_2` but not `weekly_4`)

#### Scenario: Tenure computed from profile creation date

- **WHEN** `wst_profile_created_at` is set and the elapsed time is ≥ 365 days
- **THEN** the engine SHALL return `tenure_1year` as earned

#### Scenario: Tenure falls back to earliest session when profile date absent

- **WHEN** `wst_profile_created_at` is not set and the user has sessions
- **THEN** the engine SHALL use the earliest `startedAt` timestamp as the tenure anchor

#### Scenario: Volume sums weight × reps across all logged sets

- **WHEN** the user's sessions contain logged sets totaling ≥ 10,000 kg
- **THEN** the engine SHALL return `volume_10k` as earned

#### Scenario: No sessions yields no earned achievements

- **WHEN** the user has zero completed sessions and no plans
- **THEN** the engine SHALL return an empty set (except tenure achievements if profile date qualifies)

---

### Requirement: Achievement storage

The system SHALL persist achievement unlock records in `localStorage` under the key `wst_achievements` as a JSON array of `AchievementRecord` objects.

```ts
interface AchievementRecord {
  id: string; // matches an achievement def ID
  unlockedAt: string; // ISO timestamp of when unlock was first detected
  seen: boolean; // true once the celebration overlay has been shown
}
```

#### Scenario: New unlock is stored with current timestamp

- **WHEN** the engine detects a new earned achievement not yet in `wst_achievements`
- **THEN** a record SHALL be appended with `unlockedAt` set to the current ISO timestamp and `seen: false`

#### Scenario: Existing records are not overwritten

- **WHEN** the engine runs and an achievement was previously stored
- **THEN** its `unlockedAt` and `seen` values SHALL remain unchanged

#### Scenario: Bulk-seen on first install for pre-existing eligibility

- **WHEN** the feature runs for the first time (no `wst_achievements` key exists) and the user already has sessions/plans that qualify for achievements
- **THEN** all currently earned achievements SHALL be stored with `seen: true` so no celebration overlay fires

---

### Requirement: Achievements page

The system SHALL provide a dedicated page at `/profile/achievements` that displays all achievements — both earned and locked — organized by track.

#### Scenario: Earned achievements show unlocked state

- **WHEN** the user visits `/profile/achievements` and has earned `session_10`
- **THEN** the `session_10` badge SHALL be displayed with its icon at full opacity and an unlock indicator

#### Scenario: Unearned achievements show locked state

- **WHEN** the user visits `/profile/achievements` and has not earned `session_25`
- **THEN** the `session_25` badge SHALL be displayed with a visually dimmed/locked appearance

#### Scenario: Achievements grouped by track

- **WHEN** the user views the Achievements page
- **THEN** achievements SHALL be grouped under their track labels (Sessions, Plans, Weekly, Tenure, Volume)

#### Scenario: Unlock date shown for earned achievements

- **WHEN** an achievement has been earned
- **THEN** its badge SHALL display the date it was unlocked

#### Scenario: Back navigation returns to profile

- **WHEN** the user presses Back on the Achievements page
- **THEN** they SHALL be returned to the Profile page
