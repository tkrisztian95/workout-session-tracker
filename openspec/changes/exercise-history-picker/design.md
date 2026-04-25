## Context

The app is a local-only PWA-style tracker. Plans are stored in `wst_plans` and completed sessions in `wst_sessions` (see `src/lib/storage.ts`). Each `Exercise` and `PlanExercise` carries a `name`, optional `category`, and shape (`type`, `sets`, `reps`, `duration`, `weightKg`). Today, adding an exercise to a session or plan day always opens a free-form modal (`AddExerciseModal`, `AddPlanExerciseModal`) where the user types a name and gets wger online suggestions. There is no way to reuse an exercise the user has already done — they retype it every time.

The user's stated motivation: returning users want a "contact book" of exercises they have personally used. They also want to prune that list. The wger lookup is considered low-value and will be removed in a follow-up change; this design must not depend on wger and must not regress the existing wger flow until the removal change lands.

## Goals / Non-Goals

**Goals:**

- Provide a fast, offline picker over the user's own exercise vocabulary, reachable from the in-session add-exercise flow and from the plan editor (day exercises and shared exercises).
- Derive the vocabulary from existing local data with no schema migration.
- Let the user permanently hide entries from the picker without deleting any session or plan.
- Keep the existing manual entry / wger flow functional and reachable.
- Keep the picker fully usable when no history exists yet (clear empty state).

**Non-Goals:**

- Removing the wger integration (separate follow-up change).
- Server-side or cross-device sync of the history or hidden list.
- Tracking usage frequency for ranking beyond "most-recently-used".
- Editing past exercises through the picker (only pick + hide).
- Recommending exercises the user has not done before.

## Decisions

### Decision 1: Derive history on the fly, do not persist a separate list

Compute the history from `getSessions()` + `getPlans()` at picker open time and memoize per render. A persisted list would drift from the source of truth, require migration when sessions are edited/deleted, and add storage complexity for no benefit at the data sizes we expect (low thousands of exercises max).

**Alternative considered:** maintain a `wst_exercise_history` cache updated on every save. Rejected — unnecessary indirection, and history must follow session edits/deletes anyway.

### Decision 2: De-duplication key is `name + category` (case-insensitive on name)

A user's "Bench Press" with category "Chest" should collapse across sessions; the same name with a different category should remain a distinct entry, because category drives the in-session UI grouping and progression chart. Trim and lower-case the name for keying; preserve original casing for display from the most recent occurrence.

**Alternative considered:** key on name only. Rejected — would merge entries the user themselves chose to differentiate.

### Decision 3: Shape (type/sets/reps/duration/weightKg) comes from the most-recent occurrence as a pre-fill

Picking an entry pre-fills the standard add-exercise form, where the user can adjust before confirming. Two reasons:
1. The user's most recent set/rep scheme is usually the right starting point.
2. Reusing the existing form keeps validation, scaling notes, and category UI consistent — the picker is a name+category lookup, not a parallel data-entry path.

### Decision 4: Hidden entries stored in `wst_hidden_exercises` as a list of canonical keys

Persist hidden entries as `Array<{ nameKey: string; category?: string }>` (where `nameKey` is the trimmed lowercased name). Storing keys rather than ids means new sessions that produce the same key stay hidden — which matches the user's mental model of "I never want to see this exercise again."

**Alternative considered:** soft-delete via a `hiddenFromHistory` flag on each `Exercise`. Rejected — would mutate session records (which double as historical truth) and require updating every occurrence.

### Decision 5: Picker is a separate component from `AddExerciseModal`, not a tab inside it

Add a "Pick from history" button in the modal's header (and the same in `AddPlanExerciseModal`) that opens `ExerciseHistoryPicker` as its own bottom-sheet/modal. On select, close the picker and pre-fill the parent modal. This keeps each modal's responsibility narrow and makes the picker reusable from anywhere a "add exercise" flow exists.

### Decision 6: Sort by most-recently-used, with a search box

Sort entries by the most recent `completedAt` (sessions) or `updatedAt` (plans) the entry appeared in, descending. Provide a single search input that filters by name substring (case-insensitive) and by category match. No category filter chips in v1 — simpler and the search box covers it.

### Decision 7: Hide action is reversible only via a "Show hidden" toggle

In the picker, each row has an overflow menu with "Forget this exercise". Hidden entries are removed from the visible list but a "Show hidden (n)" toggle at the bottom of the picker lets the user un-hide. This is cheap insurance against accidental hides and avoids needing a separate settings screen.

## Risks / Trade-offs

- **Long histories may be slow to compute on each open** → memoize the derived list with `useMemo` keyed on session/plan timestamps; even at thousands of exercises this is sub-millisecond on local data, so we accept the on-demand cost.
- **Users may expect the hide action to delete past data** → label clearly: "Hide from picker (does not affect history)" and confirm only on first use.
- **Category drift over time** (the same exercise logged with different categories) creates split entries → acceptable for v1; the search box mitigates and the user can hide stale variants.
- **Wger removal lands later** → the picker must coexist with the wger suggestion list inside `AddExerciseModal` without confusing the user. Place the "Pick from history" button prominently above the name input; keep wger suggestions inline below the input as today.

## Migration Plan

No data migration. New `wst_hidden_exercises` key starts empty. Feature ships behind no flag — additive UI only. Rollback = revert the change; no persisted state to clean up beyond the (empty by default) hidden list.

## Open Questions

- Should the picker also surface exercises currently defined in plans the user has NOT yet executed? Leaning yes (a planned but never-done exercise is still part of the user's vocabulary), but it means the source includes plans even when zero sessions exist. Going with **yes** unless feedback during implementation suggests otherwise.
- Should picking an entry that was last logged with `loggedSets` data carry that data forward as the new set's defaults? **No** for v1 — only the static shape (sets/reps/duration/weight) pre-fills; logged sets stay scoped to their original session.
