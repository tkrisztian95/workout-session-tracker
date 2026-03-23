## 1. History Card Start Time Display

- [x] 1.1 Add a `formatStartTime(startedAt: string): string` helper in `src/app/history/page.tsx` that formats the ISO timestamp using `Date.toLocaleTimeString` with `{ hour: '2-digit', minute: '2-digit' }`
- [x] 1.2 Append the formatted start time to the card subtitle line (after duration), e.g. `"3 exercises · 42 min · 14:32"`

## 2. Within-Day Sort Order

- [x] 2.1 After grouping sessions by date, sort each day's session array by `startedAt` descending so the latest-started session appears first
