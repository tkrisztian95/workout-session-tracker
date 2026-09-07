# session-evaluation-meta Specification

## Purpose

Persist a small deterministic evaluation object on every completed workout session, together with a frozen snapshot of the plan day it was judged against, so plan-adherence rollups are computed once and reused — by the vs-Plan history tab and by AI prompt construction — and are not silently rewritten when the underlying plan is later edited.

## Requirements

### Requirement: Origin plan day is snapshotted onto the session

When a session with a resolvable plan origin (`planId` + `planDayId` matching an existing plan) is first persisted, the system SHALL store a `planDaySnapshot` on the `WorkoutSession`: a deep copy of that plan day, the plan's name, and a `capturedAt` ISO timestamp. All plan-adherence evaluation and the vs-Plan comparison view SHALL read this snapshot rather than the live plan, so editing or deleting the plan afterwards SHALL NOT change the session's stored verdict or its rendered comparison.

#### Scenario: Snapshot captured on first save

- **WHEN** a session started from a plan day is finished
- **THEN** the persisted `WorkoutSession` SHALL carry a `planDaySnapshot` whose `day` deep-equals the plan day at that moment and whose `planName` matches the origin plan

#### Scenario: Later plan edit does not touch historical sessions

- **WHEN** a plan day is edited (set counts, weight targets, or exercises changed) after a session run against it was completed
- **THEN** that session's `evaluation` and its vs-Plan comparison SHALL remain exactly as they were before the plan edit

#### Scenario: Plan deletion preserves the comparison

- **WHEN** the origin plan is deleted after a session run against it was completed
- **THEN** the session SHALL still render its vs-Plan comparison and retain its `evaluation`, both sourced from `planDaySnapshot`

#### Scenario: Free session has no snapshot

- **WHEN** a session with no `planId` is persisted
- **THEN** `planDaySnapshot` SHALL be absent and `evaluation.overall` SHALL be `'no-plan'`

### Requirement: Persisted session evaluation shape

Each `WorkoutSession` SHALL carry an optional `evaluation` object of shape `SessionEvaluation` with a schema version field `v` equal to `1`. The object SHALL contain:

- `overall`: one of `'overdone' | 'on-target' | 'underperformed' | 'no-plan'` — the session verdict relative to its `planDaySnapshot`, or `'no-plan'` when the session has no snapshot.
- `counts`: an object with numeric fields `overdone`, `matched`, `underperformed`, `missed`, `extra` — the number of session exercises in each plan-comparison status.
- `highlights`: an optional array, capped at 3 entries, each `{ exerciseName: string; status: 'overdone' | 'underperformed' | 'missed' | 'extra'; delta?: string }`, ordered by how far the exercise deviated from plan.
- `totalVolumeKg`: an optional number — summed `weight × reps` across all logged sets in the session.
- `avgWeightKg`: an optional number — mean logged set weight across sets that carried a weight.
- `setCount`: an optional number — total logged sets in the session.
- `rating`: an optional `1 | 2 | 3 | 4 | 5` — copied from the session's own `rating` when present.

#### Scenario: Evaluation object is versioned

- **WHEN** a `SessionEvaluation` is produced
- **THEN** its `v` field SHALL equal `1`

#### Scenario: Plan session verdict reflects per-exercise deviation

- **WHEN** a session evaluated against its snapshot has more exercises classified `underperformed` + `missed` than `overdone`, with at least one deviation
- **THEN** `overall` SHALL be `'underperformed'` and `counts` SHALL reflect the per-status tally of every session exercise

#### Scenario: On-target session

- **WHEN** every exercise in the snapshot was matched and no extra exercises were performed
- **THEN** `overall` SHALL be `'on-target'` and `counts.matched` SHALL equal the number of snapshot exercises

### Requirement: Deterministic computation reusing plan-comparison logic

`SessionEvaluation` SHALL be computed by a single pure function that takes a session and its optional plan day (the snapshot's `day`) and returns the object with no side effects, no randomness, and no AI calls. The per-exercise status (`overdone | matched | underperformed | missed | extra`) SHALL be derived from the same classification logic that the vs-Plan comparison view uses, so the persisted meta and the rendered comparison cannot diverge.

#### Scenario: Same inputs yield identical output

- **WHEN** the evaluation function is called twice with the same session and plan day
- **THEN** it SHALL return deeply equal objects both times

#### Scenario: vs-Plan tab and persisted meta agree

- **WHEN** the vs-Plan comparison view renders a session from its `planDaySnapshot` and that session's `evaluation` is read
- **THEN** the comparison's per-status counts SHALL equal `evaluation.counts` for `overdone`, `matched`, `underperformed`, `missed`, and `extra`

### Requirement: No-plan sessions still produce useful signal

A session with no `planDaySnapshot` (`overall: 'no-plan'`) SHALL still populate `counts.extra` with the count of performed exercises, and SHALL still populate `totalVolumeKg`, `avgWeightKg`, `setCount`, and `rating` where the underlying data exists. `highlights` MAY be omitted for no-plan sessions.

#### Scenario: Free session records volume and rating

- **WHEN** a session with no `planId` is finished with three logged exercises and a rating of 4
- **THEN** its `evaluation.overall` SHALL be `'no-plan'`, `evaluation.counts.extra` SHALL be `3`, `evaluation.rating` SHALL be `4`, and `evaluation.totalVolumeKg` SHALL be the summed set volume

### Requirement: Evaluation attached and refreshed on every session write

Every code path that persists a `WorkoutSession` — session finish, manual history record, AI session import, and post-completion edit — SHALL produce a record with a current `evaluation`. On first save the plan-day snapshot SHALL be captured and the evaluation computed against it. On a post-completion edit the evaluation SHALL be recomputed against the **existing** snapshot; the snapshot SHALL NOT be re-captured.

#### Scenario: Finish attaches evaluation

- **WHEN** a user finishes an active session
- **THEN** the persisted `WorkoutSession` SHALL have a defined `evaluation` with `v: 1`

#### Scenario: Manually recorded and AI-imported sessions are evaluated

- **WHEN** a session is created through the manual history-record form or through AI session import
- **THEN** the persisted record SHALL carry a `SessionEvaluation`, and a `planDaySnapshot` when a plan day was selected

#### Scenario: Post-completion edit refreshes evaluation against the same snapshot

- **WHEN** a completed session's logged sets are edited such that an exercise changes from `matched` to `overdone`
- **THEN** the session's stored `evaluation.counts` SHALL reflect the new status and `planDaySnapshot` SHALL be byte-for-byte unchanged

### Requirement: One-time backfill of existing sessions

Sessions stored before this capability shipped SHALL have `planDaySnapshot` (where a plan origin resolves) and `evaluation` populated on read. The backfill SHALL capture the snapshot once from the plan **as it currently exists**, then compute the evaluation against it. Sessions whose plan origin no longer resolves SHALL get a `'no-plan'` evaluation that still carries `counts.extra`, volume totals, and rating. The backfill SHALL be idempotent — once a session has an `evaluation` at the current `v`, subsequent reads SHALL NOT recompute it or re-capture the snapshot.

#### Scenario: Legacy session gains snapshot and evaluation on read

- **WHEN** stored sessions include a record with no `evaluation` field and a still-existing plan origin
- **THEN** reading sessions SHALL return that record with a populated `planDaySnapshot` and `evaluation`, and SHALL persist both

#### Scenario: Backfill is idempotent

- **WHEN** sessions are read twice in succession
- **THEN** the second read SHALL NOT rewrite storage for records that already carry an `evaluation` at the current schema version

#### Scenario: Backfill tolerates a deleted origin plan

- **WHEN** a legacy session references a `planId` that no longer exists
- **THEN** its backfilled `evaluation.overall` SHALL be `'no-plan'`, `planDaySnapshot` SHALL be absent, and volume totals SHALL still be computed

### Requirement: Snapshot and evaluation are included in the data export

The exported data payload SHALL carry `planDaySnapshot` and `evaluation` on each session as part of the existing `sessions: WorkoutSession[]` array, with no change to the export schema version.

#### Scenario: Exported session carries snapshot and evaluation

- **WHEN** the user exports their data after this capability ships
- **THEN** each session object in the export SHALL include its `evaluation` object, and its `planDaySnapshot` when one exists
