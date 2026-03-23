## 1. Revert badge & list-filtering from previous change

- [x] 1.1 In `src/app/history/page.tsx`, remove the `formattedFilterDate` variable and the `{dateFilter && ...}` badge JSX block from `PageHeader`
- [x] 1.2 Replace `visibleGroups` (filtered by `dateFilter`) with the full `grouped` array when no range filter is active — the `?date` param now only drives scroll-to-day, not filtering
- [x] 1.3 Remove unused imports: `X` from lucide-react, `useLocale` (if only used for badge formatting), `useRouter` (if only used for badge dismiss)

## 2. Build `DrumColumn` — single scroll-snap column

- [x] 2.1 Create `src/components/DateRangePicker.tsx` with an internal `DrumColumn` component
- [x] 2.2 `DrumColumn` renders a fixed-height scrollable `<div>` with `scroll-snap-type: y mandatory`; each item div uses `scroll-snap-align: center`
- [x] 2.3 On mount, scroll the column to the initial selected index (using `scrollTop = index * itemHeight`)
- [x] 2.4 Attach a `scroll` event listener; inside a `requestAnimationFrame` debounce, compute `Math.round(scrollTop / itemHeight)` and call `onChange(newIndex)` when it changes
- [x] 2.5 Show a centred highlight bar (semi-transparent overlay or border) behind the middle item to indicate the selected value

## 3. Build `DrumDatePicker` — three columns for one date endpoint

- [x] 3.1 Inside `DateRangePicker.tsx`, add a `DrumDatePicker` component that composes three `DrumColumn` instances: Year, Month, Day
- [x] 3.2 Year column: range from earliest session year to current year (minimum window: current year − 5 to current year)
- [x] 3.3 Month column: Jan–Dec (12 items, localised month abbreviations)
- [x] 3.4 Day column: 1–N where N is the number of days in the selected month/year (updates reactively when month or year changes)
- [x] 3.5 Clamp the day value when the month/year change reduces the max days (e.g. switching from Jan 31 → Feb clamps to Feb 28/29)
- [x] 3.6 `DrumDatePicker` reports its selected date as `{ year, month, day }` via `onChange` prop

## 4. Build `DateRangePicker` sheet component

- [x] 4.1 `DateRangePicker` accepts `isOpen`, `onClose`, `value: { from: string | null; to: string | null }`, and `onApply(from: string, to: string) / onClear()` props
- [x] 4.2 Renders two `DrumDatePicker` instances side-by-side (or stacked on narrow screens) labelled "From" and "To"
- [x] 4.3 When From changes to a date after To, auto-update To to equal From
- [x] 4.4 "Apply" button calls `onApply(fromISO, toISO)` and closes the sheet
- [x] 4.5 "Clear" button calls `onClear()` and closes the sheet
- [x] 4.6 Wrap the whole sheet content in the existing `BottomSheet` component

## 5. Wire `DateRangePicker` into `HistoryContent`

- [x] 5.1 Add `dateRange: { from: string | null; to: string | null }` state (initially `{ from: null, to: null }`) to `HistoryContent`
- [x] 5.2 Add `isPickerOpen` boolean state to `HistoryContent`
- [x] 5.3 Add a calendar icon button to the History `PageHeader` (next to the existing `+` button) that sets `isPickerOpen = true`
- [x] 5.4 Filter `grouped` to `visibleGroups`: when `dateRange.from` and `dateRange.to` are set, keep only groups where `group.date >= from && group.date <= to`
- [x] 5.5 Render `<DateRangePicker>` passing `isOpen`, `onClose`, `value={dateRange}`, `onApply` (sets `dateRange`, closes picker), and `onClear` (resets `dateRange` to null/null, closes picker)

## 6. Active range label in header

- [x] 6.1 When `dateRange.from && dateRange.to` are set, render a compact label in the header (e.g. `"Mar 1 – Mar 23"`) with an `×` button that clears the range
- [x] 6.2 The `×` button sets `dateRange` back to `{ from: null, to: null }`

## 7. Verification

- [ ] 7.1 Tap a multi-session activity tile → page navigates to History and scrolls to that day's group (all other sessions still visible)
- [ ] 7.2 Tap the calendar button → date range picker sheet opens with From = 30 days ago, To = today
- [ ] 7.3 Scroll Year/Month/Day columns → each settles via snap and updates the selected date
- [ ] 7.4 Set From to a date after To → To auto-updates to match From
- [ ] 7.5 Tap Apply → sheet closes, history list shows only sessions within the range, header shows the range label
- [ ] 7.6 Tap × on the range label → filter cleared, all sessions shown, label disappears
- [ ] 7.7 Open picker while range is active → drum columns initialised to current From/To values
- [ ] 7.8 Tap Clear in picker → sheet closes, filter cleared, all sessions shown
