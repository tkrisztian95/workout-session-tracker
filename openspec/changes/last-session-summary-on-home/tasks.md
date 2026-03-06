## 1. Relative Time Helper

- [ ] 1.1 Add a `getRelativeDayLabel(dateStr: string): string` helper in `src/lib/utils.ts` (or inline in `page.tsx`) that returns "Today", "Yesterday", or "N days ago" based on calendar day difference

## 2. Last Session Data Computation

- [ ] 2.1 In `HomePage`, derive `lastSession` from the existing `sessions` state: sort by `completedAt` descending and take the first entry
- [ ] 2.2 Compute the session display name: look up the plan by `planId` from `plans`, find the day by `planDayId`, use `day.name`; fall back to "Free session" if plan/day not found or no planId

## 3. StartScreen UI

- [ ] 3.1 Add a `lastSession` prop to `StartScreen` of type `{ relativeLabel: string; sessionName: string } | null`
- [ ] 3.2 Render the last session summary block below the greeting and above the action buttons — show relative label and session name; render nothing when `lastSession` is null
- [ ] 3.3 Style the block to match the app's dark theme (muted text, small font, consistent with existing `[#6B7280]` / `[#9CA3AF]` palette)

## 4. Locale Strings

- [ ] 4.1 Add translation keys to `en.json`, `de.json`, `hu.json`: `last_session_today`, `last_session_yesterday`, `last_session_days_ago` (with `{n}` placeholder), `last_session_free`
- [ ] 4.2 Wire the locale keys into the relative label computation and session name fallback
