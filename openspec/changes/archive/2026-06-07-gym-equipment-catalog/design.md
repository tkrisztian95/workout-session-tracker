## Context

The app is a client-only Next.js/React PWA. Exercises are added through two
near-identical modals — `AddExerciseModal` (in-session) and
`AddPlanExerciseModal` (plan editor) — that each already host an
`ExerciseHistoryPicker`. The picker hands back a `HistoryEntry`, and each modal
maps it onto its form fields via an `applyHistoryEntry` function. Muscles come
from the `Muscle` taxonomy in `src/lib/muscles.ts`; localized labels live in the
`en`/`hu`/`de` JSON locale files (e.g. `muscle_labels`, `muscle_group_labels`).
There is no built-in exercise list today — only history and free text.

This change adds a parallel, read-only data source (the catalog) and a second
picker that reuses the exact same pre-fill mechanism.

## Goals / Non-Goals

**Goals:**

- A fixed, code-defined catalog of the user's gym machines + a common starter
  set, each with a localized name, muscle, default type, and default
  sets/reps/duration.
- A "Pick from catalog" picker in both Add Exercise modals that pre-fills the
  form, identical in feel to the history picker.
- A standalone `/catalog` browse screen grouped by muscle group, with search.
- Reuse the existing i18n, muscle taxonomy, and picker UI conventions.

**Non-Goals:**

- User editing of the catalog (add/remove/rename) — v1 is read-only.
- Any new `localStorage` key, persisted type, or migration.
- Images/illustrations, instructions, or per-machine metadata beyond name +
  muscle + defaults.
- A new bottom-nav tab (the screen is reached via a Profile link to keep the
  nav uncluttered).

## Decisions

### Catalog data shape

Entry data lives in `src/lib/exerciseCatalog.json` (a plain array) so it can be
edited without touching code. `src/lib/exerciseCatalog.ts` owns the type and
helpers, importing the JSON and asserting it to `CatalogExercise[]` (the JSON
import widens string fields; the shape is guarded by the unit test):

```ts
export interface CatalogExercise {
  id: string; // stable slug, e.g. 'leg-press'
  muscle: Muscle;
  type: Exercise['type']; // 'sets-reps' | 'sets-duration' | 'duration'
  defaultSets?: number; // for sets-reps / sets-duration
  defaultReps?: number; // for sets-reps
  defaultDurationSec?: number; // for sets-duration / duration
  source: 'gym' | 'starter'; // user's machines vs common additions
}

import catalogData from './exerciseCatalog.json';
export const EXERCISE_CATALOG = catalogData as CatalogExercise[];
```

`id` is a stable English slug used as the i18n key and React key; it is **not**
shown to the user. The `source` flag lets the browse screen optionally separate
"your gym" from "common" entries and documents provenance, but does not change
behaviour. Helper `catalogByGroup()` groups entries by `MUSCLE_TO_GROUP` for the
browse screen.

### Localized names live in the locale files

Display names go in each locale JSON under a `catalog_exercise_names` object
keyed by catalog `id`, exactly mirroring how `muscle_labels` works. This keeps
the `Translations` type aligned across `en`/`hu`/`de` and lets the user's native
HU/DE machine names (e.g. `Beinpresse`, `Lábprés`) be first-class translations
rather than English-with-a-footnote. A `catalogName(t, id)` helper resolves the
name, falling back to the `id` if a key is missing.

### Selection reuses the existing pre-fill path

`ExerciseCatalogPicker` mirrors `ExerciseHistoryPicker`: a `ModalSheet` with a
search box and a list, opened from a new "Pick from catalog" button beside
"Pick from history". `onSelect(entry: CatalogExercise)` is handled by a new
`applyCatalogEntry` in each modal that sets name (resolved localized), type,
muscle, and the type-appropriate defaults — the same state-setting shape as
`applyHistoryEntry`. No changes to `handleSubmit` or the produced
`Exercise`/`PlanExercise`.

### Card note structure (prepared, not yet wired)

To later show a coaching/form note on the exercise card — the way AI-generated
exercises do via `Exercise.scalingNote` — the catalog reserves a localized
`catalog_exercise_notes` map (id → string) in each locale, with a `catalogNote`
helper. The maps are intentionally **empty** for now and `applyCatalogEntry`
does not pass a note through yet; populating the maps and adding one line to seed
`scalingNote` on selection is all that's needed when the feature is wanted. The
unit test already keeps the note map key-aligned across locales so it can't drift
as entries are added.

### Muscle mapping for hip machines

The `Muscle` taxonomy has no dedicated adductors/abductors entry. The user's
notes list `Abduktion` twice; one is treated as **Adduktion** (adductor
machine). Both hip abduction and hip adduction map to `glutes`, the closest hip
musculature bucket in the current taxonomy. This is recorded here so it can be
revisited if a finer-grained muscle is added later.

### Browse screen placement

A new route `src/app/catalog/page.tsx` renders the catalog grouped by muscle
group (reusing `ALL_MUSCLE_GROUPS` / `MUSCLES_BY_GROUP` ordering and
`MuscleBadge`), with a search box. It is reachable via a link on the Profile
page rather than a new `BottomNav` tab, keeping the five-tab nav intact.

## Risks / Trade-offs

- **Catalog name drift across locales.** Mitigated by keying on a stable `id`
  and a `catalogName` fallback; a unit test asserts every catalog `id` has a key
  in all three locales.
- **Adductor/abductor both → `glutes`** is anatomically coarse. Accepted for v1;
  documented above for a future taxonomy refinement.
- **Two near-duplicate Add Exercise modals** each need the new button/handler.
  Accepted (consistent with how the history picker is already wired into both);
  the picker component itself is shared.

### Future extension (out of scope for v1)

v1 is read-only, but the design intentionally leaves room for a v2 that lets the
user personalize the catalog from the same Profile-linked screen:

- **Ignore / hide** an unavailable or disliked machine — would reuse the
  existing `getHiddenExercises()` / `HiddenExerciseKey` mechanism already used by
  the history picker, so hidden catalog entries simply drop out of the picker.
- **Favourite** an entry, and **add custom** machines — these are new persisted
  shapes (a favourites set and a user-catalog list) requiring new `localStorage`
  keys, types, a migration, and a `docs/data-structure.md` update; deferred to a
  separate change.

To keep that door open, v1 (a) addresses every entry by a stable `id` so
favourites/ignore can key off it later, and (b) has the browse screen own the
list rendering so per-entry actions can be added without touching the picker.

## Migration

None. The catalog is code-only and read-only. Selecting an entry yields an
ordinary `Exercise`/`PlanExercise` whose persisted shape is unchanged, so no
`localStorage` key, type, or `docs/data-structure.md` change is required.
