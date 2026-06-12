## Context

Sessions today are manual: `SessionView` renders per-exercise cards and the user taps "Log Set" / "Log Time" / "Done" for every set. Two timer primitives already exist but neither drives a session:

- `SessionTimer` — passive count-up of active (non-paused) elapsed time, derived from `startedAt` + `totalPausedMs` (`src/components/SessionTimer.tsx`).
- `ExerciseStopwatchOverlay` — manual start/stop stopwatch for `sets-duration` / `duration` exercises, `setInterval(…,100)` (`src/components/ExerciseStopwatchOverlay.tsx`).

The persisted shapes (`src/lib/types.ts`) are already partly time-aware: `Exercise.type` ∈ `sets-reps | sets-duration | duration`, `Exercise.duration` (seconds), and `LoggedSet.seconds`. `ActiveSession` carries `startedAt`, `pausedAt`, `totalPausedMs`. Storage is localStorage-only via `KEYS` in `src/lib/storage.ts`, with `ExportPayload.schemaVersion` currently `'1'`.

Issue #49 ("Rest timer between sets") already asks for a countdown + opt-in chime/vibration engine. Timed modes generalize the same engine to drive the whole session, so we build one engine both can share.

This is a cross-cutting change: new state machine, additive schema + migration, plan-editor changes, Start-screen flow, and new live UI — hence a design doc.

## Goals / Non-Goals

**Goals:**

- One reusable, mode-aware interval engine covering `tabata`, `amrap`, `emom`, `for-time`, decoupled from React so it is unit-testable.
- Wall-clock-accurate phase timing that survives pause/resume and page refresh (derive from timestamps, never accumulate drift from `setInterval` ticks).
- Auto-log sets on work-phase completion onto the **existing** `LoggedSet` shape so history/stats/export keep working with no read-path rewrites.
- Additive-only schema change with a forward migration; legacy sessions and older export payloads stay readable.
- Two entry points (ad-hoc quick start, plan-defined timed block) that converge on the same active-session shape and engine.

**Non-Goals:**

- No new persistence backend; localStorage only.
- No background service worker / push notifications (cues fire only while the tab is foregrounded — same limitation noted in #49; revisit there).
- No heart-rate / wearable integration.
- No redesign of standard manual sessions — that path is untouched.
- No new history/stats visualizations specific to timed data beyond what the reused shape already renders (a richer timed-result view is a possible follow-up).

## Decisions

### 1. Pure engine module, React-thin wrapper

Implement the state machine as a pure module (e.g. `src/lib/timedSession.ts`) exposing `createTimedEngine(config)` → `{ phase, roundIndex, totalRounds, clockMs, advance(nowMs), tapRound(), finish() }`, computed as a pure function of `(config, startedAt, totalPausedMs, now)`. A small `useTimedEngine` hook ticks via `requestAnimationFrame`/`setInterval` only to re-render; the _source of truth is timestamps_, so a dropped tick or a refresh never desyncs the schedule.

- **Alternative considered:** stateful engine that mutates a counter each tick. Rejected — accumulates drift and can't reconstruct phase after refresh.

### 2. Discriminated `mode` + `timedConfig` on the session, not a parallel type

Add additive fields to `ActiveSession` / `WorkoutSession`:

```ts
type TimedMode = 'tabata' | 'amrap' | 'emom' | 'for-time';
interface TimedConfig {
  mode: TimedMode;
  workSec?: number; // tabata
  restSec?: number; // tabata
  rounds?: number; // tabata, amrap, emom — number of passes through the circuit
  periodSec?: number; // emom (default 60)
  totalSec?: number; // amrap
  capSec?: number; // for-time — optional hard time cap (0/undefined = uncapped count-up)
}
// ActiveSession / WorkoutSession gain:  timed?: TimedConfig
// The session's `exercises` array IS the circuit (ordered). See Decision 7.
```

Absence of `timed` ⇒ standard session. This keeps one session type, one code path for save/load/export, and makes the migration a no-op for existing data (the field is simply absent).

- **Alternative considered:** separate `TimedSession` type and `wst_active_timed_session` key. Rejected — doubles storage/getter/finish/export logic and complicates "resume active session" which must check one key.

### 3. Auto-log maps round→set, elapsed→`seconds`

On each work-phase completion the engine emits an auto-log intent; the session layer appends a `LoggedSet { weight: 0, reps: 0, seconds, loggedAt }` to the active exercise — identical to what `ExerciseStopwatchOverlay` already produces, so `buildSessionTimeline`, stats, and history need no changes. Reps/weight stay editable after via the existing edit flow.

- **Alternative considered:** new `loggedRounds` array. Rejected — forces every history/stats reader to learn a new shape.

### 4. Plan timed-block config lives on `PlanDay`

Add `PlanDay.timed?: TimedConfig` (and optionally allow it on a block). `plan-session-start` checks `day.timed`; if present it builds the `ActiveSession` with `timed` set and launches the engine, else the standard pre-fill. Quick-start builds the same `timed` config without `planId`/`planDayId`. One `startTimedSession(config, exercises, planRefs?)` helper serves both entry points.

### 5. Ship the shared cue setting in this change

Phase transitions call a single `emitCue(kind)`. Visual cue always fires; audible chime and device vibration are gated by an opt-in **cue setting added in this change** (Profile/Settings, persisted with the existing profile keys). It is authored as a shared setting so issue #49's rest timer reuses it rather than adding a parallel one — this change does **not** block on #49 landing.

### 6. Schema version bump + migration

Bump `ExportPayload.schemaVersion` `'1'` → `'2'`. Migration is additive: reading v1 data needs no transform (missing `timed` ⇒ standard). Import tolerates both versions. Update `docs/data-structure.md` in the same commit per the repo's sync rule. The cue opt-in is a profile/settings flag (not part of session data), documented alongside the other settings keys.

### 7. Circuit model — the exercise list is the circuit (full circuit in v1)

A timed session's ordered `exercises` array IS the circuit. One **round** = one pass through the whole circuit; `rounds` counts passes. For multi-exercise modes (Tabata, EMOM, AMRAP) the engine walks the circuit exercise-by-exercise: in Tabata each `work` phase is the next circuit exercise; in EMOM each interval/period is the next circuit exercise; in AMRAP a round tap means one full pass completed. Single-exercise circuits are just length-1 — no special case. Auto-log targets the circuit exercise active for the current phase, so a multi-exercise circuit produces sets distributed across the right exercises.

- **Alternative considered:** single-exercise-per-round only, circuit as follow-up. Rejected per scope decision — full circuit ships in v1.

## Risks / Trade-offs

- **Backgrounded tab freezes timers / cues don't fire** → Derive elapsed from timestamps so the clock is _correct_ on refocus even if it visually froze; document the foreground-only cue limitation (shared with #49). Service-worker scheduling is an explicit non-goal/follow-up.
- **Drift from `setInterval`** → Mitigated by Decision 1 (ticks only trigger renders; time read from `Date.now()`/`startedAt`).
- **Pause/resume interaction with phase math** → Reuse the proven `totalPausedMs` model; phase boundaries computed against active (paused-subtracted) elapsed, with a unit test per mode covering pause across a phase boundary.
- **Schema drift between persisted shape and docs** → Single commit updates `types.ts`, `storage.ts`, and `docs/data-structure.md` together; covered by a task.
- **Scope creep across 4 modes + 2 entry points** → Sequence tasks so the engine + Tabata + ad-hoc quick start ship as the vertical slice first; AMRAP/EMOM/For-Time and plan blocks layer on without touching the core.
- **GitNexus impact on shared symbols** (`getActiveSession`/`setActiveSession`, `saveSession`, `SessionView`) → Run `gitnexus_impact` before editing these; expect SessionView to be HIGH-touch and gate behind the `timed` discriminant to avoid regressing the standard path.

## Migration Plan

1. Land additive types + `schemaVersion` bump + `docs/data-structure.md` (no data transform needed; v1 reads as standard).
2. Ship engine + Tabata + ad-hoc quick start as the first reviewable slice.
3. Layer AMRAP, EMOM, For Time.
4. Add plan-editor timed blocks + `plan-session-start` routing.
5. Verify export/import round-trip across v1↔v2 and history/stats render of auto-logged timed sessions.

**Rollback:** the feature is gated by the presence of `timed` on a session and a new Start-screen entry; reverting the UI entry points disables creation while existing timed sessions still read back as standard sessions (mode metadata ignored), so no data is stranded.

## Open Questions

_Resolved during proposal:_

- **EMOM/intervals circuit:** full circuit ships in v1 — the exercise list is the circuit (Decision 7).
- **Shared cue setting:** shipped in this change; #49 reuses it (Decision 5). Not blocked on #49.
- **For Time time cap:** in scope now — optional `capSec` (Decision 2); uncapped count-up when unset.
