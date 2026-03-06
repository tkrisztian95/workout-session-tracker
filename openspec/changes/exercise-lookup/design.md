## Context

Exercise names are currently free-text fields in both `AddPlanExerciseModal` and `AddExerciseModal`. There is no shared catalog, so users repeat typing, introduce inconsistent names, and have no guidance on what to add. The project is a Next.js/React client-only app storing data in localStorage — no backend exists.

## Goals / Non-Goals

**Goals:**

- Ship a static exercise library (name + category) bundled with the app
- Add autocomplete/suggestion UX to the exercise name input in both add-exercise modals
- Allow custom (non-library) names so existing workflows are not broken
- Show the matched category as a passive label when a library exercise is selected

**Non-Goals:**

- User-editable or server-persisted exercise library
- Saving category metadata onto the stored exercise (name stays a plain string)
- Deduplication or normalization of historical exercise data
- Search/filter on category in the plan or session views

## Decisions

### 1. Static TypeScript data file over JSON or remote fetch

The library is a typed `const` array in `src/lib/exerciseLibrary.ts`. This keeps the data tree-shakeable, fully typed, and zero-latency.

Alternatives considered:

- JSON file: works but loses static type inference at the call site
- Remote API: unnecessary infrastructure for a personal local-first app

### 2. Filtered suggestion list (not a combobox library)

A simple filtered `<ul>` dropdown rendered below the input, filtered by substring match on the exercise name, capped at ~8 visible results. No third-party autocomplete/combobox library is introduced.

Alternatives considered:

- `react-select` / `downshift`: adds dependency weight for a straightforward requirement; overkill here
- Native `<datalist>`: poor mobile UX (no category display, inconsistent styling)

### 3. Input remains a plain text field; selection just fills the value

Picking a suggestion sets the input value to the exercise name. Category is shown as an inline badge/label below or beside the input — not stored. Users can still type anything and submit.

Alternatives considered:

- Storing category on the exercise object: would require schema migration and spec changes in multiple areas; deferred per Non-Goals

### 4. Single shared hook `useExerciseSuggestions(query)`

A custom hook encapsulates filtering logic and returns `{ suggestions, clearSuggestions }`. Both modals use the same hook — no duplication.

## Risks / Trade-offs

- **Library size** → The static list adds bundle weight. Mitigation: keep the list to ~150–200 well-known exercises; lazy-import if it grows.
- **Suggestion UX on mobile** → Keyboard may cover the dropdown. Mitigation: limit list to 5–6 items visible; scroll within dropdown.
- **Stale suggestions after selection** → User selects a name, then edits it; suggestions reappear. Mitigation: clear suggestions on blur or explicit selection; re-show on focus.
