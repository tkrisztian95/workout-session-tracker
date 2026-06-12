## Why

Today every session is driven by the user manually tapping "Log Set" / "Done" for each set. That breaks down for time-driven training formats — Tabata, AMRAP, EMOM, For Time — where the clock, not the user, dictates pace. There's no way to run a structured interval workout in the app, so users fall back to a separate timer app and lose the round/time data. Issue #49 (rest timer between sets) already asks for a countdown engine; timed modes generalize that same engine to drive the whole session.

## What Changes

- Add **timed auto-flow sessions**: an interval/countdown engine drives the session and auto-advances through work/rest phases instead of the user ticking each set.
- Support four modes:
  - **Tabata / intervals** — fixed work + rest cycles repeated for N rounds (e.g. 20s work / 10s rest × 8).
  - **AMRAP** — single count-down clock; user loops a circuit and taps to count completed rounds; session auto-ends at zero.
  - **EMOM** — every minute on the minute the next exercise/round auto-starts; the remainder of each minute is rest.
  - **For Time** — count-**up** stopwatch over a fixed amount of work; user taps Done to stop the clock. Supports an optional hard time cap.
- **Circuit model:** a timed session's ordered exercise list is the circuit; one round = one pass through it. Multi-exercise circuits are supported in v1 across Tabata, EMOM, and AMRAP.
- **Two entry points:**
  - **Ad-hoc quick start** from the Start screen — configure mode, rounds, work/rest durations, and pick exercises on the fly. Not tied to a plan.
  - **Plan-defined timed blocks** — a plan day (or an exercise block within it) can be flagged as a timed block with its config saved during plan editing; starting that day runs the auto-flow.
- **Live UI per mode:** large countdown/count-up clock, round/interval tracker, work↔rest phase indicator, and transition cues — visual always; audible chime + device vibration gated by a new opt-in cue setting added in this change (issue #49's rest timer reuses it).
- **Auto-logging:** completing a work phase auto-writes a `LoggedSet` (rounds→sets, elapsed→`seconds`) so no manual ticking is needed; user can still adjust reps/weight after.
- **History reuse:** persist results onto the existing `WorkoutSession` / `Exercise` / `LoggedSet` shape with a minimal additive schema change (mode + config metadata), so existing history, stats, and export keep working.

## Capabilities

### New Capabilities

- `timed-session-engine`: the mode-aware interval/countdown engine — phase state machine (work/rest/round/done), auto-advance, auto-log on phase completion, pause/resume integration, and transition cues. Defines behavior for Tabata, AMRAP, EMOM, and For Time.
- `timed-session-quick-start`: ad-hoc entry from the Start screen — mode picker, on-the-fly config (rounds, work/rest, exercise selection), and launch into an auto-flow session not tied to a plan.
- `timed-plan-blocks`: plan-editor support for flagging a plan day or exercise block as a timed block, persisting its mode + config, and launching it from `plan-session-start`.

### Modified Capabilities

- `workout-sessions`: persisted `ActiveSession` / `WorkoutSession` gain additive timed-mode metadata (mode + interval config) so a session records how it was driven. Export `schemaVersion` and `docs/data-structure.md` updated accordingly.
- `session-exercise-tracking`: the in-session tracking flow gains an auto-flow path where set logging is driven by the engine (auto-log on phase end) rather than manual taps, while preserving manual edit-after.
- `plan-session-start`: starting a plan day routes into the timed auto-flow when the day/block is flagged as timed.
- `profile-settings`: add an opt-in cue setting (audible chime / device vibration) for timed phase transitions; shared so issue #49's rest timer reuses it.

## Impact

- **Types/storage:** additive fields on `ActiveSession` / `WorkoutSession` (and likely `PlanDay` / `PlanExercise` for timed-block config) in `src/lib/types.ts`; `schemaVersion` bump and migration in `src/lib/storage.ts`; `docs/data-structure.md` sync.
- **Engine:** new timer/interval engine module building on existing `SessionTimer` and `ExerciseStopwatchOverlay` patterns; precise wall-clock timing with backgrounding considerations (shared concern with issue #49).
- **UI:** new mode-specific live session views/components; quick-start config flow on the Start screen; timed-block controls in the plan editor.
- **History/stats/export:** read paths must tolerate timed-mode metadata; verify history cards, stats, and `ExportPayload` round-trip.
- **Related issue:** #49 (rest timer between sets) — shares the countdown/cue engine; coordinate so the rest-timer work reuses this engine rather than duplicating it.
