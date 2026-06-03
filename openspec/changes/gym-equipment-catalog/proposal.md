## Why

Adding an exercise today means either typing its name from scratch or picking
one you have already logged (the history picker). A brand-new user — or anyone
walking up to an unfamiliar machine — has no built-in starting point. The user
has been noting down the equipment at their gym (in Hungarian and German) and
wants those machines available in the app as a ready-made list so they can drop
them into plans and sessions without re-typing or guessing the muscle group.

This change introduces a small, fixed, **built-in exercise catalog**: the
user's gym machines plus a handful of ubiquitous movements, each with a
localized (en/hu/de) name, a muscle, a sensible default type, and default
sets/reps or duration. It is code-defined and read-only in v1 — no new
persistence, no migration.

## What Changes

- Add a built-in catalog module (`src/lib/exerciseCatalog.ts`) defining ~25
  entries: the user's gym machines (cardio + resistance) de-duplicated from
  their HU/DE notes, plus a common starter set (bench press, lat pulldown,
  cable row, shoulder press, etc.). Each entry has a stable `id`, a `Muscle`, a
  default `type`, and default sets/reps/duration. Display names are localized
  in the `en`/`hu`/`de` locale files (keyed by catalog id), reusing the
  existing i18n convention used for `muscle_labels`.
- Add an **"Pick from catalog"** picker (`ExerciseCatalogPicker`) to the Add
  Exercise flow in both `AddExerciseModal` (session) and `AddPlanExerciseModal`
  (plans), sitting beside the existing "Pick from history" button. Selecting an
  entry pre-fills name + muscle + type + default sets/reps/duration, mirroring
  the existing `ExerciseHistoryPicker` → `applyHistoryEntry` pattern.
- Add a **standalone browse screen** (`/catalog`) listing every catalog entry
  grouped by muscle group, with search, reachable from the Profile page.

## Capabilities

### New Capabilities

- `exercise-catalog`: a built-in, localized, read-only list of gym machines and
  common movements, surfaced both as a picker in the Add Exercise flow and as a
  standalone browse screen.

### Modified Capabilities

- `exercise-history-picker`: the Add Exercise modals gain a second pre-fill
  source (catalog) alongside history; the history picker itself is unchanged.

## Impact

- **New module**: `src/lib/exerciseCatalog.ts` (catalog data + lookup helpers).
- **New components**: `ExerciseCatalogPicker`, plus a `/catalog` route screen.
- **UI**: `AddExerciseModal` and `AddPlanExerciseModal` gain a "Pick from
  catalog" entry point; the Profile page gains a link to the browse screen.
- **i18n**: new `catalog_*` UI keys and a `catalog_exercise_names` map (one
  localized name per entry) in `en`, `de`, `hu`.
- **Persistence**: none. The catalog is code-only and read-only; selecting an
  entry produces an ordinary `Exercise` / `PlanExercise`, whose shape is already
  documented. No `localStorage` key, type, or migration changes — therefore no
  `docs/data-structure.md` update is required.
- **Dependencies**: none.
