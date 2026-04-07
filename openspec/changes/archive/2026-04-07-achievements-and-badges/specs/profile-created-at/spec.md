## ADDED Requirements

### Requirement: Profile creation date recorded at onboarding

The system SHALL record the current ISO timestamp in `localStorage` under `wst_profile_created_at` the first time the user enters their name during onboarding. This date serves as the anchor for all tenure-based achievements.

#### Scenario: Profile date set on first name submission

- **WHEN** the user submits a valid name in the `UserNameModal` for the first time
- **THEN** `wst_profile_created_at` SHALL be set to the current ISO timestamp in `localStorage`

#### Scenario: Profile date is not overwritten on subsequent name changes

- **WHEN** the user updates their name from the Profile settings screen
- **THEN** `wst_profile_created_at` SHALL remain unchanged

#### Scenario: Profile date is not set if name modal is dismissed without submitting

- **WHEN** the user opens the app with no stored name but does not submit the modal
- **THEN** `wst_profile_created_at` SHALL NOT be written

---

### Requirement: Storage helpers for profile creation date

The storage module SHALL expose `getProfileCreatedAt(): string | null` and `saveProfileCreatedAt(date: string): void` functions operating on `wst_profile_created_at`.

#### Scenario: getProfileCreatedAt returns null when not set

- **WHEN** `wst_profile_created_at` is not present in localStorage
- **THEN** `getProfileCreatedAt()` SHALL return `null`

#### Scenario: getProfileCreatedAt returns stored ISO string when set

- **WHEN** `wst_profile_created_at` contains a valid ISO timestamp
- **THEN** `getProfileCreatedAt()` SHALL return that string unchanged
