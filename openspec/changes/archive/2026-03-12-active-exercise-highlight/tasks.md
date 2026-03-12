## 1. Translations

- [x] 1.1 Add `active_exercise_section`, `upcoming_section`, `target_weight` keys to `src/locales/en.json`
- [x] 1.2 Add translated keys to `src/locales/hu.json`
- [x] 1.3 Add translated keys to `src/locales/de.json`

## 2. ExerciseCard Component

- [x] 2.1 Add `isActive?: boolean` and `targetWeightLabel?: string` props to `ExerciseCard`
- [x] 2.2 Derive `showActiveStyle = isActive && !isDone` guard
- [x] 2.3 Apply brand border (`border-brand`) and expanded padding (`py-5`) when active
- [x] 2.4 Render larger name (`text-lg font-bold`) and detail (`text-base`) when active
- [x] 2.5 Show `weightKg` as "Target: X kg" on active card when field is set
- [x] 2.6 Show `scalingNote` with higher contrast (`text-sm text-secondary`) on active card
- [x] 2.7 Add `onSetActive?: () => void` prop; render play button in button group when provided

## 3. SessionView

- [x] 3.1 Derive `activeExercise = remaining[0] ?? null` and `queue = remaining.slice(1)`
- [x] 3.2 Render active exercise under `t.active_exercise_section` label with `isActive` and `targetWeightLabel` props
- [x] 3.3 Render queue under `t.upcoming_section` label only when `queue.length > 0`
- [x] 3.4 Implement `handleSetActive(id)`: splice target to active position in `session.exercises` and call `onUpdate`
- [x] 3.5 Pass `onSetActive` to queue `ExerciseCard` instances
