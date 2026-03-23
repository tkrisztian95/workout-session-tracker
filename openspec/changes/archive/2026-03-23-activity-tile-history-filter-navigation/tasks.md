## 1. ActivityTiles — multi-session navigation

- [x] 1.1 In `src/components/ActivityTiles.tsx`, update `handleTileTap` so that when `sessions.length > 1`, it calls `router.push(`/history?date=${iso}`)` instead of `router.push('/history')`

## 2. History page — date filter reading and list filtering

- [x] 2.1 Extract the main content of `HistoryPage` into a `HistoryContent` child component that calls `useSearchParams()` to read the `date` query param
- [x] 2.2 Wrap `<HistoryContent>` in a `<Suspense>` boundary inside `HistoryPage` (required by Next.js for `useSearchParams`)
- [x] 2.3 When a `date` param is present, filter the `grouped` array to only include the matching date group before rendering

## 3. History page — filter badge UI

- [x] 3.1 Add a filter badge row below the page title in `HistoryContent` that renders only when `dateFilter` is non-null
- [x] 3.2 The badge displays the formatted date (e.g. "Nov 14, 2025") and an `×` dismiss button
- [x] 3.3 The dismiss button calls `router.push('/history')` to clear the filter

## 4. History page — scroll to filtered date group

- [x] 4.1 Add a `ref` (e.g. `filteredGroupRef`) to the day group element that matches the active `dateFilter`
- [x] 4.2 In a `useEffect` that depends on `dateFilter`, call `filteredGroupRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })` inside a `requestAnimationFrame` callback to ensure the DOM is ready

## 5. Verification

- [ ] 5.1 Tap a tile with one session on the Home screen — confirm it navigates to `/history/[id]`
- [ ] 5.2 Tap a tile with multiple sessions on the Home screen — confirm it navigates to `/history?date=YYYY-MM-DD` and the history list shows only that day's sessions
- [ ] 5.3 Confirm the filter badge is visible and displays the correct date when a `?date` param is present
- [ ] 5.4 Tap the dismiss `×` on the filter badge — confirm all sessions are shown and the badge disappears
- [ ] 5.5 Confirm the page scrolls to the filtered date group when navigating from a tile tap
- [ ] 5.6 Confirm navigating to `/history` (no param) shows the full unfiltered session list with no badge
