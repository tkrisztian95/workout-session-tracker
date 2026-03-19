## Context

The Stats page already uses Recharts via a `ChartContainer` wrapper (`src/components/ui/chart.tsx`). It renders a weekly volume bar chart and a `ProgressionTable` showing per-exercise weight history as pills + trend icon.

Two new visualisations are requested:

1. **Collapsible progression line chart** — inline below each exercise row in `ProgressionTable`
2. **Category radar chart** — a new standalone section on the page showing training volume distribution across muscle-group categories

`Exercise.category` is an optional `string` on the data model, already populated by the plan/AI generation flow.

## Goals / Non-Goals

**Goals:**

- Tap any exercise row in the progression table to reveal a small line chart of that exercise's weight over its last sessions
- Only one row expanded at a time (accordion)
- Add a radar chart section to the stats page that visualises session count (or volume) per exercise category
- Reuse existing `ChartContainer` / Recharts primitives; no new chart library

**Non-Goals:**

- Persisting which row is expanded across page loads
- Editing or filtering categories from this page
- Radar chart time-range filtering (uses the same filtered sessions as the rest of the page)

## Decisions

### D1: Line chart data shape

`getExerciseWeightProgression` currently returns `sessionWeights: number[]` (last 5 mean weights). For the chart we need labelled points. Two options:

- **A** Add `sessionDates: string[]` alongside `sessionWeights` in `ExerciseProgression`
- **B** Add a separate `getExerciseProgressionChartData(sessions, exerciseName)` function

**Decision: A.** Less indirection; the existing consumer (weight pills) continues to use `sessionWeights` unchanged, and the chart picks up `sessionDates` for x-axis labels. Labels will be formatted as `"MMM d"` (e.g. `"Mar 5"`).

### D2: Accordion state

State lives in `ProgressionTable` as `useState<string | null>(null)` keyed by `exerciseName`. Clicking the active row collapses it (sets to `null`); clicking any other row sets it.

### D3: Radar chart metric — session count vs. volume

Session count per category is simpler to explain and doesn't depend on weight data (categories often include bodyweight/duration exercises). Volume would exclude uncategorised or non-weighted exercises.

**Decision: session count** (number of sessions containing at least one exercise of that category). Exercises without a category are bucketed under `"Other"`. This is shown as a `RadarChart` from Recharts using `ChartContainer`.

### D4: Radar chart placement

Place the radar chart **between** the summary stat cards and the weekly volume bar chart, so the page order is: time-range selector → stat cards → **category radar** → weekly volume bar → progression table.

### D5: Category data helper

Add `getCategoryDistribution(sessions): { category: string; count: number }[]` to `statsUtils.ts`. Each session contributes 1 count to every unique category present among its exercises (a session with both "Chest" and "Back" exercises increments both).

## Risks / Trade-offs

- `category` is optional — many older sessions may lack it. The `"Other"` bucket handles this gracefully; if every category is `"Other"` the radar is a single-axis chart which looks odd. Mitigation: hide the radar section when all categories resolve to a single value or total sessions < 2.
- The line chart x-axis labels (`"Mar 5"`) will be in English locale regardless of app language (uses `Date.toLocaleDateString('en', …)`). This matches the existing weekly volume chart behaviour, so it's acceptable for now.
- Recharts `RadarChart` requires a fixed `width`/`height` or a responsive container. Using `ChartContainer` (which wraps `ResponsiveContainer`) handles this consistently with the existing chart.
