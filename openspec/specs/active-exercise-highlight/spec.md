### Requirement: Active exercise is visually separated from queue

During an active session with at least one remaining exercise, the system SHALL display the first remaining exercise as the "active" card under a section labelled with the locale's active section label. All other remaining exercises SHALL be displayed below under a separate queue section label.

#### Scenario: Single remaining exercise

- **WHEN** a session has exactly one remaining (non-completed, non-dismissed) exercise
- **THEN** it is rendered as the active card with the active section label
- **THEN** no queue section or label is shown

#### Scenario: Multiple remaining exercises

- **WHEN** a session has two or more remaining exercises
- **THEN** the first remaining exercise is rendered as the active card
- **THEN** all subsequent remaining exercises are rendered in a queue section below

#### Scenario: No remaining exercises

- **WHEN** all exercises are completed or dismissed
- **THEN** neither the active section nor the queue section is shown
- **THEN** completed and dismissed sections render normally

### Requirement: Active exercise card shows expanded details

The active exercise card SHALL display a visually distinct style and SHALL surface all available plan details.

#### Scenario: Active card visual prominence

- **WHEN** an exercise is rendered as active
- **THEN** its card border uses the brand accent color
- **THEN** the exercise name renders larger and bolder than a regular card

#### Scenario: Target weight shown on active card

- **WHEN** an exercise is active and has a `weightKg` value set
- **THEN** the active card displays the target weight with the locale's target weight label

#### Scenario: No target weight when field absent

- **WHEN** an exercise is active and `weightKg` is not set
- **THEN** no weight line is shown on the active card

#### Scenario: Scaling note prominence on active card

- **WHEN** an exercise is active and has a `scalingNote`
- **THEN** the scaling note is shown with higher contrast and larger text than on a regular card

#### Scenario: Active style suppressed on completed/dismissed

- **WHEN** `isActive` is passed to a card that is already completed or dismissed
- **THEN** the card renders with its normal completed/dismissed styling, not the active style

### Requirement: User can promote any queued exercise to active

The system SHALL allow the user to select any queued (non-active remaining) exercise and make it the next exercise to perform.

#### Scenario: Play button visible on queue cards

- **WHEN** an exercise is rendered in the queue (not the active slot)
- **THEN** a play button is visible on that card

#### Scenario: Tapping play promotes exercise to active

- **WHEN** the user taps the play button on a queued exercise
- **THEN** that exercise becomes the active exercise (first remaining)
- **THEN** the previously active exercise moves down in the queue
- **THEN** the session exercise order is persisted immediately

#### Scenario: Play button not shown on active card

- **WHEN** an exercise is rendered as the active card
- **THEN** no play button is shown

#### Scenario: Play button not shown on completed or dismissed cards

- **WHEN** an exercise is completed or dismissed
- **THEN** no play button is shown
