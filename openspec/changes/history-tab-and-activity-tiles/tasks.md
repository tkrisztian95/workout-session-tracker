## 1. Bottom Nav & Routing

- [ ] 1.1 Add `'history'` to the `active` prop union type in `BottomNav`
- [ ] 1.2 Add History tab link (with `Clock` or `History` icon) to `BottomNav`
- [ ] 1.3 Create `/history` route directory and `page.tsx` scaffold
- [ ] 1.4 Create `/history/[id]` route directory and `page.tsx` scaffold

## 2. History List Screen

- [ ] 2.1 Read all sessions from `getSessions()` and sort by `completedAt` descending
- [ ] 2.2 Build plan name lookup map from `getPlans()` to resolve `planId` → plan name
- [ ] 2.3 Render session summary cards (date, plan/day name or "Free Session", exercise count, duration in minutes)
- [ ] 2.4 Add empty state UI when there are no completed sessions
- [ ] 2.5 Wire card tap to navigate to `/history/[id]`

## 3. Session Detail Screen

- [ ] 3.1 Look up session by `id` from `getSessions()` in the `[id]` page
- [ ] 3.2 Display session header: date, plan name, total duration
- [ ] 3.3 Render exercise list with name, type, sets/reps/duration, and completed state
- [ ] 3.4 Add back navigation to `/history`
- [ ] 3.5 Handle 404 case when session ID is not found

## 4. Activity Tiles Component

- [ ] 4.1 Create `ActivityTiles` component that accepts a session date map (`Record<string, number>`)
- [ ] 4.2 Compute 16-week grid (112 days) anchored to today, Sunday-first columns
- [ ] 4.3 Apply color logic: 0 = rest, 1 = low, 2 = medium, 3+ = high intensity using brand orange
- [ ] 4.4 Make the grid container horizontally scrollable for narrow screens
- [ ] 4.5 Wire tile tap: navigate to `/history/[id]` for single-session days; navigate to `/history` for multi-session days; no-op for rest days

## 5. Home Screen Integration

- [ ] 5.1 In `page.tsx` (Home), compute session-by-date map from `getSessions()`
- [ ] 5.2 Render `ActivityTiles` above the action buttons in `StartScreen`, hidden during active session
- [ ] 5.3 Pass `BottomNav` the `active="home"` prop (already set; verify it still renders correctly with three tabs)

## 6. Polish & Edge Cases

- [ ] 6.1 Verify `BottomNav` active highlight works for all three tabs
- [ ] 6.2 Ensure future-date tiles (rest of current week) render as empty/rest color without interaction
- [ ] 6.3 Test with no sessions: activity grid shows all rest tiles, history shows empty state
- [ ] 6.4 Test with sessions on same day: tile shows multi-session color; tap navigates to history list
