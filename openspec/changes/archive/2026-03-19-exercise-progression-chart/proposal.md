## Why

The exercise progression table shows weight history as pills and a trend icon, but it's hard to visually grasp the rate and shape of progression at a glance. Additionally, users have no overview of which muscle groups they train most — a radar chart showing category distribution would make training balance visible at a glance.

## What Changes

- Each row in the exercise progression table gains a collapsible chart section below the existing weight pills / trend icon
- Tapping a row expands it to reveal a small line chart showing weight over sessions (up to last 5 data points)
- Tapping again collapses it; only one row expanded at a time (accordion behavior)
- A radar chart is added to the Stats page showing training volume or session count per exercise category (muscle group), giving users a bird's-eye view of training balance
- Both charts use the existing `ChartContainer` / Recharts stack already present on the stats page

## Capabilities

### New Capabilities

- `exercise-progression-chart`: Collapsible per-exercise weight progression chart embedded within each row of the exercise progression table on the Stats page
- `training-category-radar`: Radar chart on the Stats page visualising session or volume distribution across exercise categories

### Modified Capabilities

- `workout-statistics`: The exercise progression table rows become interactive (tappable to expand/collapse a chart); a radar chart section is added to the page

## Impact

- `src/app/stats/page.tsx` — `ProgressionTable` rows gain collapse state + line chart; new `CategoryRadarChart` section added
- `src/lib/statsUtils.ts` — `getExerciseWeightProgression` may need to expose session date labels for the x-axis; new `getCategoryDistribution` helper needed for radar data
- No new dependencies; Recharts (`RadarChart`) and `ChartContainer` are already installed
