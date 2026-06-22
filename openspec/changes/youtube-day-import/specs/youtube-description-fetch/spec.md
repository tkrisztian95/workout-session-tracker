## ADDED Requirements

### Requirement: Server route resolves a YouTube URL to its description

The system SHALL expose a server-side route that accepts a YouTube URL or video
id and returns the video's title and full description. The route SHALL run
server-side so the browser is never subject to cross-origin restrictions.

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

#### Scenario: Full description is preferred over truncated metadata

- **WHEN** the fetched page contains both an embedded player-response description
  and a truncated meta-tag description
- **THEN** the system SHALL return the full player-response description rather
  than the truncated meta description

### Requirement: The route returns structured errors for unusable input

When a description cannot be produced, the system SHALL return a structured
error with an appropriate HTTP status rather than a success payload, so the
client can show a localized message.

#### Scenario: Unparseable URL

- **WHEN** the route is called with input that contains no recognizable YouTube
  video id
- **THEN** the system SHALL return an `invalid_url` error
- **AND** SHALL NOT attempt to fetch any page

#### Scenario: Video unavailable

- **WHEN** the referenced video is private, deleted, or otherwise not retrievable
- **THEN** the system SHALL return a `not_found` error

#### Scenario: Video has no usable description

- **WHEN** the video is retrievable but exposes no description text
- **THEN** the system SHALL return a `no_description` error

#### Scenario: Upstream fetch fails

- **WHEN** fetching the YouTube page fails (network error, timeout, or throttling)
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
