## Why

Users need structured workout plans to follow a consistent training program (e.g., twice-a-week A/B splits) rather than always starting ad-hoc sessions. Without plans, there is no way to track progression, assign mandatory vs. optional exercises per day, or scale exercise difficulty over time.

## What Changes

- Introduce a **Workout Plans** feature allowing users to create reusable weekly training plans
- Plans define training days (e.g., Day A, Day B) with scheduled weekdays and per-day exercise lists
- Each day specifies **core exercises** (mandatory) and **optional exercises**
- Exercises in a plan can have **scaling rules** (e.g., progressive overload targets)
- When starting a workout, users choose to either **follow a plan day** or start a **free session**
- Following a plan pre-fills the session with the plan's exercises for that day
- Sessions track which plan (if any) they originated from

## Capabilities

### New Capabilities

- `workout-plans`: Create, view, edit, and delete weekly workout plans with named training days, scheduled weekdays, core/optional exercises, and scaling rules
- `plan-session-start`: Start a workout session from a plan day (pre-fills exercises) or as a free session

### Modified Capabilities

- `workout-sessions`: Sessions now optionally link to a plan and a plan day; the session start flow is extended to support plan selection

## Impact

- New data models: `WorkoutPlan`, `PlanDay`, `PlanExercise` (with scaling config)
- `WorkoutSession` model extended with optional `planId` and `planDayId` fields
- New UI screens: Plan list, Plan detail/edit, Plan day editor
- Modified UI: Session start screen adds "Start from Plan" vs "Free Session" choice
- No breaking changes to existing free sessions
