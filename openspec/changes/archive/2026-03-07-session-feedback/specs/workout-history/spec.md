## ADDED Requirements

### Requirement: History cards display session rating when available

The system SHALL show the session's emoji rating on the history card if the session has a rating.

#### Scenario: Rated session shows emoji badge on card

- **WHEN** a history card is rendered for a session that has a `rating` value
- **THEN** the corresponding emoji is displayed on the card (e.g., 🔥 for rating 5)

#### Scenario: Unrated session shows no rating indicator

- **WHEN** a history card is rendered for a session with no `rating` field
- **THEN** no emoji or rating placeholder is shown on the card
