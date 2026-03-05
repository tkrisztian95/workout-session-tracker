## Context

The `PlanDay` type has a `weekdays: number[]` field (0=Sun…6=Sat). The `PlanDayEditor` component always renders a weekday picker — even when the user just wants a simple recurring day without a fixed schedule. The data model already supports empty `weekdays: []`, so no storage migration is needed. The change is purely UI-level.

## Goals / Non-Goals

**Goals:**
- Hide the weekday picker by default when editing/creating a training day
- Let users reveal the picker via a toggle ("Schedule specific days")
- Show the picker expanded (and the toggle active) when a day already has weekdays saved
- Keep the data model unchanged (`weekdays` remains `number[]`, empty means unscheduled)

**Non-Goals:**
- Adding a separate "number of occasions per week" numeric input — the simpler model is just "no weekday assignment"
- Changing session-start logic or plan-selection logic
- Migrating existing plan data

## Decisions

### Toggle approach over always-visible picker
A small "Schedule specific days" toggle/checkbox collapses the weekday picker until the user explicitly wants it. This is simpler than adding a new field (e.g., `occasionsPerWeek`) and keeps the data model stable. The alternative — removing the picker entirely — would break plans that rely on weekday-based suggestions.

### State derived from existing data
On mount, if `day.weekdays.length > 0`, the picker is shown expanded. If `day.weekdays.length === 0`, it is hidden. When the user hides the picker after having weekdays selected, the weekdays array is cleared (set to `[]`). This avoids storing hidden-but-selected state.

### Change scoped to `PlanDayEditor`
All rendering logic lives in `PlanDayEditor.tsx`. No changes needed to pages, storage, or types.

## Risks / Trade-offs

- **User confusion** → Mitigation: toggle label is clear ("Schedule specific days"); selected day chips are visible when expanded so state is obvious
- **Clearing weekdays on collapse** → Mitigation: collapse only clears if the user explicitly toggles off; opening the picker again starts fresh (empty)
