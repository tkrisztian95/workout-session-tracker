## 1. Add translation keys

- [x] 1.1 In `src/locales/en.json`, add `"history_filter_no_results_title": "No workouts in this range"` and `"history_filter_no_results_subtitle": "Try widening your date range"`
- [x] 1.2 In `src/locales/hu.json`, add the same keys with Hungarian translations
- [x] 1.3 In `src/locales/de.json`, add the same keys with German translations

## 2. Update History page empty state

- [x] 2.1 In `src/app/history/page.tsx`, change the `visibleGroups.length === 0` branch to use `t.history_filter_no_results_title` and `t.history_filter_no_results_subtitle` instead of the generic keys

## 3. Verification

- [ ] 3.1 Set a date range with no sessions → confirm "No workouts in this range" message appears
- [ ] 3.2 Clear filter → confirm full list returns
- [ ] 3.3 No sessions at all (fresh install / empty state) → confirm "No sessions yet" still shows
