## Why

The Plans page renders every plan as a flat list — active plans first, then a collapsible "Completed" section. As a user accumulates plans there is no way to search for a specific plan, reorder the list by relevance, or narrow it down. Finding the plan you trained most recently, or only the AI-generated ones, means scanning the entire list by eye.

## What Changes

- Add a **search** input to the Plans page that filters plan cards by name (case-insensitive substring match).
- Add **sorting** with four options: recently created, recently followed, last updated, and name A–Z.
- "Recently followed" is **derived from workout session history** — a plan's rank is the timestamp of the most recent completed session whose `planId` matches the plan; plans never followed sort last.
- Add **filtering** by: status (active / completed), AI-generated origin, muscle trained, and number of training days.
- The current active-list + collapsible "Completed (N)" section is replaced by a single result list governed by the active sort and the status filter. The status filter defaults to "Active", so the default view stays the same in spirit.
- Show a dedicated "no results" empty state when the active search/filters match no plans — distinct from the existing "no plans yet" empty state.

## Capabilities

### New Capabilities

- `plan-list-organization`: Search, sort, and filter controls for the Plans page plan list, including a session-history–derived "recently followed" ordering.

## Impact

- `src/app/plans/page.tsx` — adds the search/sort/filter UI and result handling; replaces the active/completed split with a single governed result list.
- New `src/lib/plan-list.ts` — pure helpers that derive each plan's last-followed timestamp and apply the search, sort, and filter pipeline.
- New `src/lib/plan-list.test.ts` — unit tests for the helper module.
- Locale strings for the new UI labels in `en`, `hu`, and `de`.
- No localStorage schema changes — "recently followed" is computed on the fly from existing sessions.
