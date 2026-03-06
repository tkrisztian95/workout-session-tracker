## Why

The app currently lacks a way to review past workout sessions, and the main tab's action buttons sit in a visually sparse area with no at-a-glance summary of recent activity. Adding a history tab and GitHub-style activity tiles gives users insight into their training consistency and progress over time.

## What Changes

- Add a dedicated **History tab** showing a chronological list of completed workout sessions with key details (date, plan name, exercises completed, duration)
- Add **activity tiles** to the main tab above the action buttons — a GitHub contribution graph-style grid showing workout frequency over recent weeks/months
- Each tile is color-coded by activity level (rest day, light, moderate, heavy) and tappable to navigate to that session's detail

## Capabilities

### New Capabilities

- `workout-history`: Browsable list of past sessions with summary cards, filterable by plan or date range
- `activity-tiles`: Heatmap/tile grid on the main tab visualizing workout frequency over time, with tap-to-view session detail

### Modified Capabilities

- `workout-sessions`: Sessions need to be queryable by date range for the activity tile data source

## Impact

- New History tab added to the bottom tab navigator
- Main tab screen updated with activity tiles component above existing buttons
- Session data queries extended to support date-range filtering
- No breaking changes to existing session creation or tracking flows
