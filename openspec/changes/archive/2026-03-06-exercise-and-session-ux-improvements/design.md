## Context

The app currently models exercises with a binary `type: 'reps' | 'duration'` field. Cardio exercises (running, elliptic) don't fit neatly — they may have duration but no reps, or vice versa, or neither. Plans have no concept of shared exercises across days (e.g., a warmup). During a session there is no per-exercise completion state, no timer, no dismiss/omit action, and no success feedback on finish. When following a plan, users must remember which day they last completed.

## Goals / Non-Goals

**Goals:**

- Expand exercise `type` to a 3-way model: `'sets-reps'` (classic lifting), `'sets-duration'` (timed sets), `'duration'` (cardio — no sets)
- Add a `sharedExercises` array to `WorkoutPlan` that gets included in every session from that plan
- Track per-exercise `completed` and `dismissed` boolean state in `ActiveSession`
- Add a live elapsed-time timer to the active session view
- Show a success animation and key stats (total exercises, sets, duration) on session completion
- Auto-advance the plan day picker to the first incomplete day when following a plan

**Non-Goals:**

- Automatic rest timers or countdown between sets
- Changing how sessions are persisted to `wst_sessions` (completed session schema stays stable)
- Adding exercise categories or a full exercise library
- Multi-plan day selection in one session

## Decisions

### Exercise type model: extend discriminated union to 3 modes

Current: `type: 'reps' | 'duration'` where `sets` is always required.
Decision: Change `type` to `'sets-reps' | 'sets-duration' | 'duration'`.

| Mode            | `sets`   | `reps`   | `duration` | Example     |
| --------------- | -------- | -------- | ---------- | ----------- |
| `sets-reps`     | required | required | —          | 3×10 squats |
| `sets-duration` | required | —        | required   | 3×30s plank |
| `duration`      | —        | —        | required   | 30 min run  |

`sets` is optional at the type level — present for `sets-reps`/`sets-duration`, absent for `duration`. This keeps a clean discriminated union without making all fields freely optional.

Alternatives considered:

- **Make all fields optional, drop `type`** — too permissive; loses the structured contract between mode and required fields, and the UI has no clear branching signal.
- **Add a `'cardio'` flag alongside existing types** — boolean flags mixed with discriminated unions are hard to reason about.

Migration: existing `type: 'reps'` maps to `'sets-reps'`; existing `type: 'duration'` maps to `'sets-duration'`. A one-time localStorage migration function handles stored plans and sessions on first load.

### Shared exercises: plan-level array, merged at session start

Add `sharedExercises: PlanExercise[]` to `WorkoutPlan`. When a session is started from a plan day, shared exercises are prepended to the exercise list (always core, not optional).

Alternatives considered:

- **Shared exercises as a special "Day 0"** — consistent with existing day model but confusing UX; users might try to follow it like a regular day.
- **Per-day opt-in for shared exercises** — too much friction; the whole point is automatic inclusion.

### Per-exercise state in ActiveSession

Extend `Exercise` (in-session version) with `completed?: boolean` and `dismissed?: boolean`. Dismissed exercises remain in the list but are visually skipped.

Decision: store state on the in-session exercise rather than a parallel map, to keep the data co-located and simplify serialization.

### Timer: elapsed time, not countdown

Show total elapsed time since `startedAt`. No countdown — we don't enforce set rest times yet.

### Success feedback: CSS animation + stat card overlay

On session finish (before save confirmation), show a full-screen overlay with:

- An animation (CSS keyframe: scale + fade, confetti optional via a lightweight lib or pure CSS)
- Stats: exercises completed, sets completed, total duration if tracked, elapsed time

Alternatives considered:

- **Toast notification** — too subtle for a session completion milestone.
- **Navigate to a dedicated "results" route** — adds routing complexity; an overlay is simpler.

### Next-day auto-focus: derive from completed sessions

When the plan day picker opens, compute the last completed `planDayId` for the selected plan from `wst_sessions`. Focus the next day in plan order. If no sessions exist for the plan, focus day 0.

Alternatives considered:

- **Store "current day" on the plan** — couples session progress to the plan definition; hard to reset or override.

## Risks / Trade-offs

- **Existing exercise data uses old `type` values** → `'reps'` → `'sets-reps'`, `'duration'` → `'sets-duration'` via migration on first load. No data loss; migration is additive.
- **Dismissed exercises inflate exercise count** → stat calculation must exclude dismissed exercises. Ensure `completedAt` session stats only count non-dismissed.
- **Success animation performance** → use CSS-only animation to avoid adding a JS animation dependency. Reassess if user feedback asks for richer effects.
- **Shared exercises duplication** → if a user edits shared exercises on the plan, past sessions are unaffected (sessions store a snapshot). This is the existing behavior for all exercises.
