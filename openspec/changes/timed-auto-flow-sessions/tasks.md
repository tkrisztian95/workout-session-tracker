## 1. Schema + storage foundation

- [ ] 1.1 Add `TimedMode` and `TimedConfig` (incl. `capSec` for for-time) types to `src/lib/types.ts`; add optional `timed?: TimedConfig` to `ActiveSession`, `WorkoutSession`, and `PlanDay`. The session's ordered `exercises` array is the circuit — no separate circuit field
- [ ] 1.2 Run `gitnexus_impact` on `getActiveSession`/`setActiveSession`/`saveSession` before editing; confirm additive change is low risk
- [ ] 1.3 Bump `ExportPayload.schemaVersion` `'1'` → `'2'` in `src/lib/storage.ts`; make read paths treat missing `timed` as a standard session; ensure import tolerates v1 and v2 payloads
- [ ] 1.4 Update `docs/data-structure.md` in the same commit to document `TimedConfig`, the new session/plan-day field, and the `schemaVersion` bump
- [ ] 1.5 Add a unit test confirming v1 sessions/export payloads round-trip and read back as standard sessions

## 2. Interval engine (pure, mode-aware)

- [ ] 2.1 Create `src/lib/timedSession.ts` exposing `createTimedEngine(config, startedAt)` computing `{ phase, roundIndex, totalRounds, circuitIndex, activeExercise, clockMs }` as a pure function of `(config, exercises, startedAt, totalPausedMs, now)`
- [ ] 2.2 Implement the circuit walk: one round = one full pass through the ordered `exercises`; engine exposes the active circuit exercise per phase; length-1 is the trivial case
- [ ] 2.3 Implement Tabata schedule: work→rest cycles stepping through the circuit, N rounds, no trailing rest after the last round, transition to `done`
- [ ] 2.4 Implement AMRAP: single count-down of `totalSec`, `tapRound()` = one full circuit pass, `done` at zero with round count preserved
- [ ] 2.5 Implement EMOM: new interval each `periodSec` (default 60) stepping through the circuit for `rounds` passes; early finish leaves remainder as rest; `done` after last
- [ ] 2.6 Implement For Time: single count-**up**; auto-`done` at `capSec` when set (uncapped otherwise); `finish()` records total elapsed
- [ ] 2.7 Integrate pause/resume: phase math computed against active (paused-subtracted) elapsed using `totalPausedMs`
- [ ] 2.8 Emit auto-log intents on work-phase completion targeting the active circuit exercise (round→set, elapsed→`seconds`)
- [ ] 2.9 Unit tests per mode incl. multi-exercise circuit distribution, For Time cap, pause across a phase boundary, and refresh-reconstruction from timestamps

## 3. React integration + auto-log wiring

- [ ] 3.1 Add `useTimedEngine` hook that ticks (rAF/`setInterval`) only to re-render; reads time from timestamps
- [ ] 3.2 Wire auto-log intents to append `LoggedSet { weight: 0, reps: 0, seconds, loggedAt }` to the active exercise and persist via `setActiveSession`
- [ ] 3.3 Ensure `buildSessionTimeline`, stats, and history consume auto-logged timed sessions unchanged (verify, no rewrites)

## 4. Live timed session UI

- [ ] 4.1 Run `gitnexus_impact` on `SessionView`; gate all timed UI behind the `session.timed` discriminant so the standard path is untouched
- [ ] 4.2 Build the timed live view: large phase clock (count-down/count-up), work/rest phase indicator, round/interval tracker
- [ ] 4.3 AMRAP round-tap control and For Time Done button wired to the engine
- [ ] 4.4 Visual transition cue on every phase change; opt-in chime/vibration gated by the shared cue setting (task 4.6)
- [ ] 4.6 Add the shared cue preference (chime/vibration opt-in) to Profile/Settings, persisted in localStorage; `emitCue()` reads it; document the key in `docs/data-structure.md`. Authored so issue #49's rest timer reuses it
- [ ] 4.5 Use `/ui-ux-pro-max` for the timed live view before implementing; verify states with Playwright MCP (work, rest, done, paused)

## 5. Ad-hoc quick start

- [ ] 5.1 Add "Timed workout" entry to the session start screen alongside plan/free
- [ ] 5.2 Build the configuration flow: mode picker + per-mode parameter fields (defaults: Tabata 20/10/8; For Time optional `capSec`) with irrelevant fields hidden
- [ ] 5.3 Circuit selection reusing the existing catalog/picker; preserve order as the circuit sequence (one round = one pass)
- [ ] 5.4 `startTimedSession(config, exercises)` creates an active session with `timed` set, no plan refs, and starts the engine
- [ ] 5.5 Validate config per mode before launch

## 6. Plan-defined timed blocks

- [ ] 6.1 Plan editor: flag a plan day as timed and edit its `TimedConfig` (mode + params), persisted on the plan
- [ ] 6.2 Reuse the per-mode validation from the quick-start flow in the editor; block save on invalid config
- [ ] 6.3 `plan-session-start`: when `day.timed` is present, build the active session with `timed` + `planId`/`planDayId` and launch the engine; otherwise standard pre-fill unchanged

## 7. Verification + finalize

- [ ] 7.1 Manual end-to-end per mode (ad-hoc + plan entry) verified via Playwright MCP screenshots
- [ ] 7.2 Export a dataset with timed sessions, re-import, confirm round-trip and history/stats render correctly
- [ ] 7.3 Run `gitnexus_detect_changes()` to confirm only expected symbols/flows changed
- [ ] 7.4 `openspec validate timed-auto-flow-sessions --strict`; lint/typecheck/build pass
