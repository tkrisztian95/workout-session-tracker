## ADDED Requirements

### Requirement: Server route resolves a YouTube URL to its description

The system SHALL expose a server-side route that accepts a YouTube URL or video
id and returns the video's title and full description via the YouTube Data API
v3. The route SHALL run server-side and read the API key from a server-only
environment variable so the key is never exposed to the browser.

#### Scenario: Valid watch URL returns title and description

- **WHEN** the route is called with a valid `youtube.com/watch?v=<id>` URL for an
  available public video
- **THEN** the response SHALL include the video's title and its full
  (untruncated) description text
- **AND** the response SHALL include the resolved 11-character video id

#### Scenario: Short and alternate URL forms are accepted

- **WHEN** the route is called with a `youtu.be/<id>`, `/shorts/<id>`,
  `/embed/<id>`, or bare 11-character id input
- **THEN** the system SHALL resolve the same video id as the canonical watch URL
- **AND** SHALL return the same title and description

#### Scenario: API key is never exposed to the client

- **WHEN** the route calls the YouTube Data API
- **THEN** it SHALL use a server-only environment variable for the key
- **AND** the key SHALL NOT be included in any response or client bundle

### Requirement: The route returns structured errors for unusable input

When a description cannot be produced, the system SHALL return a structured
error with an appropriate HTTP status rather than a success payload, so the
client can show a localized message.

#### Scenario: Unparseable URL

- **WHEN** the route is called with input that contains no recognizable YouTube
  video id
- **THEN** the system SHALL return an `invalid_url` error
- **AND** SHALL NOT attempt any upstream request

#### Scenario: API key not configured

- **WHEN** the server has no YouTube Data API key configured
- **THEN** the system SHALL return a `not_configured` error
- **AND** SHALL NOT affect any other part of the app

#### Scenario: Video unavailable

- **WHEN** the Data API returns no item for the id (private, deleted, or
  otherwise not retrievable)
- **THEN** the system SHALL return a `not_found` error

#### Scenario: Video has no usable description

- **WHEN** the video is retrievable but its description is empty
- **THEN** the system SHALL return a `no_description` error

#### Scenario: Upstream request fails

- **WHEN** the Data API request fails (network error, timeout, quota, or invalid
  key)
- **THEN** the system SHALL return a `fetch_failed` error that the client can
  surface as retryable

### Requirement: Video id parsing is a shared pure helper

The system SHALL provide a pure function that extracts a YouTube video id from
the supported URL forms, usable by both the server route and the client for fast
inline validation.

#### Scenario: Recognized forms yield the id

- **WHEN** the helper is given any supported URL form or a bare 11-character id
- **THEN** it SHALL return the 11-character video id

#### Scenario: Unrecognized input yields null

- **WHEN** the helper is given input with no recognizable video id
- **THEN** it SHALL return `null`
