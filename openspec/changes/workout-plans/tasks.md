## 1. Data Models & Storage

- [x] 1.1 Define TypeScript types: `WorkoutPlan`, `PlanDay`, `PlanExercise` (with `scalingNote?`), `WorkoutSession` (with optional `planId`, `planDayId`)
- [x] 1.2 Create `src/lib/storage.ts` with helpers to read/write `wst_plans`, `wst_sessions`, and `wst_active_session` from localStorage
- [x] 1.3 Write unit-level smoke tests (or manual verification) for storage helpers (get/set/clear)

## 2. Plan Management UI

- [x] 2.1 Create `/plans` page listing all saved plans (name + day count), with empty state and "New Plan" CTA
- [x] 2.2 Create `/plans/new` page with a form: plan name input, ability to add training days
- [x] 2.3 Create plan day editor component: day name, weekday selector (Mon–Sun checkboxes), core/optional exercise lists
- [x] 2.4 Add exercise entry to a plan day: reuse or adapt `AddExerciseModal`, add "Core / Optional" toggle and optional scaling note field
- [x] 2.5 Create `/plans/[id]` page showing plan detail with edit capability (inline or via edit mode)
- [x] 2.6 Implement plan deletion with confirmation dialog
- [x] 2.7 Add navigation link from home/session start screen to Plans list

## 3. Session Start Flow

- [x] 3.1 Refactor `/` (home) into a session start screen: "Follow a Plan" and "Free Session" buttons
- [x] 3.2 Implement plan picker step: list of plans → select one → show its training days
- [x] 3.3 Implement suggested day highlighting: highlight days whose scheduled weekdays match today
- [x] 3.4 Implement optional exercise selection screen before starting a plan session (checkboxes for optional exercises)
- [x] 3.5 On confirmation, create an active session object with core + selected optional exercises, store in `wst_active_session`, and navigate to session view

## 4. Active Session View

- [x] 4.1 Create session view page/component (can be `/` with active session detected, or a dedicated `/session` route)
- [x] 4.2 Display pre-filled exercises from the plan (or empty list for free session); allow adding more exercises
- [x] 4.3 Show scaling note on exercise card when present (small styled label below exercise name)
- [x] 4.4 Implement "Finish Session" action: persist session to `wst_sessions`, clear `wst_active_session`, return to start screen
- [x] 4.5 Implement "Discard Session" action: clear `wst_active_session` without saving, return to start screen

## 5. Session Restore on Refresh

- [x] 5.1 On app load, check `wst_active_session` in localStorage; if present, show the active session view instead of the start screen
- [x] 5.2 Verify that exercises, plan origin, and session metadata are fully restored after a page refresh

## 6. Polish & Navigation

- [x] 6.1 Add bottom navigation bar or header links: Home (start) and Plans
- [x] 6.2 Ensure all new pages match the existing dark theme (`#111827` background, `#F97316` accents, Barlow Condensed font for headings)
- [x] 6.3 Test the full happy-path flow on mobile viewport: create plan → start session from plan → finish session
- [x] 6.4 Test free session flow: start → add exercises → finish session
