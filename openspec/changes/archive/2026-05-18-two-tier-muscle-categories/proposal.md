## Why

The current `category` field on `Exercise` / `PlanExercise` is a single flat string drawn from 8 labels (`Arms, Legs, Abs, Chest, Back, Shoulders, Calves, Cardio`). This does not match standard fitness taxonomy and limits the value of category-driven features:

- **`Legs` is a single bucket** that conflates Quads, Hamstrings, and Glutes — three muscle groups that are programmed independently in any balanced plan.
- **Obliques** and **Lower Back** have no category, so they fall under `Other` on the training radar even though they are first-class core targets.
- **No grouping concept** (Upper / Lower / Core). The training radar can only show 8 flat axes, which obscures the user's actual upper-vs-lower-vs-core balance.
- **AI prompts reference a `"Core"` category that the UI never defined** ([import/v1.ts:18](src/lib/ai/prompts/import/v1.ts#L18), [import/v2.ts:18](src/lib/ai/prompts/import/v2.ts#L18), [plan/v1.ts:59](src/lib/ai/prompts/plan/v1.ts#L59)), so imported data can carry an orphan category that has no badge, no icon, and no translation.

The hobby tracker's stats and plan-balance features are the main beneficiaries of a richer category model — without it, the radar chart and any future "is this plan balanced?" check are misleading.

## What Changes

- Replace the free-form `category?: string` field on `Exercise` and `PlanExercise` with a typed two-tier model: **`muscle`** (one of 12 canonical muscles) and a derived **`group`** (Upper / Lower / Core / Cardio).
- `group` is **not stored** — it is derived from `muscle` via a static `MUSCLE_TO_GROUP` map. The schema keeps a single field; the UI surfaces both tiers.
- Canonical muscles:
  - **Upper**: Chest, Back, Shoulders, Arms
  - **Lower**: Quads, Hamstrings, Glutes, Calves
  - **Core**: Abs, Obliques, Lower Back
  - **Cardio**: Cardio
- Category selector in `AddExerciseModal` / `AddPlanExerciseModal` becomes a grouped picker (group header + muscles under it) instead of a flat dropdown.
- `CategoryBadge` renders the muscle label; on hover/long-press it can show the group.
- The training-category radar gains a **group view toggle** — show 4 group axes (balanced overview) or 12 muscle axes (detailed view). Group view is the default.
- AI prompts (`import/v1`, `import/v2`, `plan/v1`) are updated to emit the new canonical muscle strings; old `"Core"` and `"Legs"` values are mapped on read.
- A one-time lazy migration on storage read maps legacy values: `Legs → quads` (default; user can reclassify), `Core → abs`, all others 1:1 lowercase. The original string is logged in case the user wants to audit.
- wger category mapping (`src/lib/wgerClient.ts`) updated to emit canonical muscle keys instead of the old labels.

## Capabilities

### Modified Capabilities

- **`plan-exercise-category`** — field type changes from `string` to a typed `Muscle` enum; selector becomes a two-tier grouped picker; badge displays the muscle label and resolves group via the static map.
- **`training-category-radar`** — gains a group/muscle view toggle; default view changes from 8 flat axes to 4 group axes; "Other" bucket is retained for exercises with no muscle.

### New Capabilities

None — the change reshapes existing functionality rather than adding new surface area.

## Impact

- **Schema** ([src/lib/types.ts](src/lib/types.ts)): `Exercise.category?: string` and `PlanExercise.category?: string` become `Exercise.muscle?: Muscle` and `PlanExercise.muscle?: Muscle`. New shared `Muscle` and `MuscleGroup` enums + `MUSCLE_TO_GROUP` map.
- **Storage** ([src/lib/storage.ts](src/lib/storage.ts)): lazy migration on `loadSessions` / `loadPlans` rewrites legacy `category` strings to the new `muscle` enum and persists the migrated value back. No version bump needed — the field rename is detected by presence.
- **Stats** ([src/lib/statsUtils.ts:307-325](src/lib/statsUtils.ts#L307-L325)): `getCategoryDistribution` is replaced by `getMuscleDistribution` and `getGroupDistribution`. The radar component picks the right one based on the view toggle.
- **UI components**: `CategoryBadge`, `AddExerciseModal`, `AddPlanExerciseModal`, `ExerciseSuggestionList`, `PlanExerciseRow`, `SessionExerciseItem`, `WorkoutHistoryCard`, `NewHistorySessionSheet`, `PlanForm`, `AiPlanSuggestionModal`, `ExerciseHistoryPicker` — all consume `category` today and switch to `muscle`. Most just swap the prop name + label lookup.
- **AI prompts**: `src/lib/ai/prompts/import/v1.ts`, `import/v2.ts`, `plan/v1.ts` — enumerate the canonical 12 muscle keys in the prompt instead of the old 7-label set with `"Core"`. `src/lib/ai/plan.ts` validation widened to accept the new keys.
- **wger client** ([src/lib/wgerClient.ts:2-9](src/lib/wgerClient.ts#L2-L9)): the `CATEGORIES` array and the wger-API → category mapping switch to the new keys. `Legs` from wger maps to `Quads` by default (wger does not split lower-body finely enough to disambiguate).
- **Locales** ([src/locales/en.json:160-169](src/locales/en.json#L160-L169), `hu.json`, `de.json`): `category_labels` block expands from 8 to 12 muscle labels; new `muscle_group_labels` block adds 4 group labels.
- **Existing user data**: lazy-migrated. Users with `Legs`-tagged exercises see `Quads` after migration; they can reclassify via edit. A one-time toast on first run after the update explains this. No data loss.
- **Non-goals**: no UI for adding custom muscles, no per-muscle volume targets, no plan-balance warnings — those can be layered on once the schema is in place.
