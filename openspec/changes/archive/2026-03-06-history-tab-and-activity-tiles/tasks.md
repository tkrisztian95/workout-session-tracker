## 1. Bottom Nav & Routing

- [x] 1.1 Add `'history'` to the `active` prop union type in `BottomNav`
- [x] 1.2 Add History tab link (with `Clock` or `History` icon) to `BottomNav`
- [x] 1.3 Create `/history` route directory and `page.tsx` scaffold
- [x] 1.4 Create `/history/[id]` route directory and `page.tsx` scaffold

## 2. History List Screen

- [x] 2.1 Read all sessions from `getSessions()` and sort by `completedAt` descending
- [x] 2.2 Build plan name lookup map from `getPlans()` to resolve `planId` → plan name
- [x] 2.3 Render session summary cards (date, plan/day name or "Free Session", exercise count, duration in minutes)
- [x] 2.4 Add empty state UI when there are no completed sessions
- [x] 2.5 Wire card tap to navigate to `/history/[id]`

## 3. Session Detail Screen

- [x] 3.1 Look up session by `id` from `getSessions()` in the `[id]` page
- [x] 3.2 Display session header: date, plan name, total duration
- [x] 3.3 Render exercise list with name, type, sets/reps/duration, and completed state
- [x] 3.4 Add back navigation to `/history`
- [x] 3.5 Handle 404 case when session ID is not found

## 4. Activity Tiles Component

- [x] 4.1 Create `ActivityTiles` component that accepts a session date map (`Record<string, number>`)
- [x] 4.2 Compute 16-week grid (112 days) anchored to today, Sunday-first columns
- [x] 4.3 Apply color logic: 0 = rest, 1 = low, 2 = medium, 3+ = high intensity using brand orange
- [x] 4.4 Make the grid container horizontally scrollable for narrow screens
- [x] 4.5 Wire tile tap: navigate to `/history/[id]` for single-session days; navigate to `/history` for multi-session days; no-op for rest days

## 5. Home Screen Integration

- [x] 5.1 In `page.tsx` (Home), compute session-by-date map from `getSessions()`
- [x] 5.2 Render `ActivityTiles` above the action buttons in `StartScreen`, hidden during active session
- [x] 5.3 Pass `BottomNav` the `active="home"` prop (already set; verify it still renders correctly with three tabs)

## 6. Polish & Edge Cases

- [x] 6.1 Verify `BottomNav` active highlight works for all three tabs
- [x] 6.2 Ensure future-date tiles (rest of current week) render as empty/rest color without interaction
- [x] 6.3 Test with no sessions: activity grid shows all rest tiles, history shows empty state
- [x] 6.4 Test with sessions on same day: tile shows multi-session color; tap navigates to history list
