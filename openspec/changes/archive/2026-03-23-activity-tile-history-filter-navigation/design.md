## Context

The History page (`src/app/history/page.tsx`) is a client-side Next.js page that loads all completed sessions from local storage and renders them grouped by date. The `ActivityTiles` component is embedded both on the Home screen and on the History page. Currently, tapping a multi-session tile pushes `/history` with no parameters, leaving the user to manually locate the day.

The app uses `next/navigation` (`useRouter`, `useSearchParams`) for client-side routing. There is no server-side state — all data lives in `localStorage` via `lib/storage`.

## Goals / Non-Goals

**Goals:**

- Tapping a multi-session tile navigates to History filtered to that date
- The active date filter is reflected in the URL (`?date=YYYY-MM-DD`) so back-navigation clears it
- A visible filter badge on History shows the active date and provides a one-tap dismiss
- The history list scrolls to the filtered date group on load
- Single-session tile navigation is unchanged (goes directly to `/history/[id]`)

**Non-Goals:**

- Persistent filter state across sessions (filter lives only in the URL)
- Filtering by ranges (week, month) — single-day only
- Server-side rendering or URL-based deep links beyond this feature

## Decisions

### URL query param as filter source (`?date=YYYY-MM-DD`)

Using a query param makes the filter stateless from the component's perspective — no extra React state is needed, and the browser back button naturally clears the filter when the user navigates back from History. Alternative: pass filter via React context or router state (`router.push('/history', { state: { date } })`). Rejected because Next.js App Router does not expose `history.state` cleanly in client components, and context would not survive a direct URL load.

### Filter applied in `HistoryPage`, not in `ActivityTiles`

`ActivityTiles` is a presentational component that emits navigation events. Keeping filtering logic in `HistoryPage` avoids coupling the tile component to the history page's internal grouping logic.

### `useSearchParams` + `Suspense` boundary for reading `?date`

Next.js requires components that call `useSearchParams()` to be wrapped in a `<Suspense>` boundary (otherwise a build warning/error is emitted). The cleanest approach is to extract the filter-aware part of `HistoryPage` into a child component (`HistoryContent`) that reads the param, and wrap it in `<Suspense>` at the page level.

### Scroll-to-date via `useRef` + `scrollIntoView`

When a date filter is active, a `ref` is attached to the matching day group element. After mount, `scrollIntoView({ behavior: 'smooth' })` is called. This is consistent with the existing scroll behavior in `ActivityTiles` (which uses the same pattern for the today tile).

### Filter badge placement

The filter badge is rendered inside `PageHeader`, inline with the history title, as a secondary row. It shows the formatted date and an `×` dismiss button that pushes `/history` (no query param). This keeps the affordance close to the content it affects.

## Risks / Trade-offs

- **`useSearchParams` Suspense requirement** → Mitigated by the `HistoryContent` split described above. If not done, Next.js will emit a build warning and the page may not statically optimize correctly.
- **Scroll behavior on filtered load** → If the filtered date group is near the bottom of a long list, `scrollIntoView` may conflict with the page's own scroll restoration. Mitigated by wrapping in a `useEffect` with a short `requestAnimationFrame` delay.
- **ActivityTiles on History page also receives `sessionsByDate`** — tapping a tile while a filter is active will re-navigate with a new `?date`, replacing the current filter. This is correct behavior and requires no special handling.
