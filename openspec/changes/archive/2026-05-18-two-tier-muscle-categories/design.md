## Context

Today, exercise classification is a single flat string `category` on `Exercise` ([src/lib/types.ts:30](src/lib/types.ts#L30)) and `PlanExercise` ([src/lib/types.ts:49](src/lib/types.ts#L49)). The 8 allowed labels live in `src/lib/wgerClient.ts:2-9` (`Arms, Legs, Abs, Chest, Back, Shoulders, Calves, Cardio`) and are echoed in `CATEGORY_ICONS` ([src/components/CategoryBadge.tsx:16-25](src/components/CategoryBadge.tsx#L16-L25)) and the locale `category_labels` blocks ([src/locales/en.json:160-169](src/locales/en.json#L160-L169) + `hu.json`, `de.json`).

Three problems flow from this:

1. **`Legs` is one bucket** that hides Quads/Hamstrings/Glutes, so the radar chart and any future balance check cannot tell a quad-heavy plan from a glute-heavy one.
2. **Obliques and Lower Back have no label**, so torso work outside straight Abs falls into `Other` on `getCategoryDistribution` ([src/lib/statsUtils.ts:307-325](src/lib/statsUtils.ts#L307-L325)).
3. **AI prompts emit a `"Core"` value** ([src/lib/ai/prompts/import/v1.ts:18](src/lib/ai/prompts/import/v1.ts#L18), `import/v2.ts:18`, `plan/v1.ts:59`) that the UI cannot render — no icon, no localized label, just the raw string.

A two-tier taxonomy (group → muscle) maps cleanly onto standard fitness terminology and onto how the user already thinks about plan balance.

## Goals / Non-Goals

**Goals:**

- Replace the flat `category` string with a typed `muscle` enum that covers the canonical 12 muscles.
- Surface a derived `group` tier (Upper / Lower / Core / Cardio) without storing it.
- Migrate existing user data automatically with no data loss.
- Give the radar chart a group/muscle view toggle so the user can see balance at either zoom level.
- Keep AI import and wger lookup producing valid `muscle` values out of the box.

**Non-Goals:**

- Multi-muscle exercises (e.g., a deadlift tagged both `back` and `hamstrings`). Each exercise still has at most one primary muscle. Multi-tag support can come later.
- Plan-balance warnings, target-volume per muscle, or any UI that depends on the new schema beyond the radar toggle.
- A custom-muscle escape hatch — the enum is closed.
- Backfill for `Legs`-tagged entries beyond the default `quads` mapping. The user reclassifies via the existing edit flow.

## Decisions

### 1. Store one field, derive the other

The schema stores `muscle: Muscle` only. `group: MuscleGroup` is computed by a static `MUSCLE_TO_GROUP` map shared across all consumers.

```ts
// src/lib/muscles.ts
export type MuscleGroup = 'upper' | 'lower' | 'core' | 'cardio';

export type Muscle =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'arms'
  | 'quads'
  | 'hamstrings'
  | 'glutes'
  | 'calves'
  | 'abs'
  | 'obliques'
  | 'lower_back'
  | 'cardio';

export const MUSCLE_TO_GROUP: Record<Muscle, MuscleGroup> = {
  chest: 'upper',
  back: 'upper',
  shoulders: 'upper',
  arms: 'upper',
  quads: 'lower',
  hamstrings: 'lower',
  glutes: 'lower',
  calves: 'lower',
  abs: 'core',
  obliques: 'core',
  lower_back: 'core',
  cardio: 'cardio',
};
```

**Why:** No impossible states (`muscle: 'chest', group: 'lower'` cannot exist). No data duplication. Group can never drift out of sync with muscle on edit.

### 2. Field rename: `category` → `muscle`

The field is renamed rather than reused. `category` was a free-form string; `muscle` is a typed enum. Renaming makes the schema change visible to every caller and forces the compiler to flag every consumer that needs updating.

**Why:** A silent type-narrowing of `category: string` to `category: Muscle` would let stale string literals slip through where TypeScript narrows via inference. The rename creates a fail-loud cutover.

### 3. Lazy migration on storage read

`loadSessions` and `loadPlans` in `src/lib/storage.ts` rewrite any record carrying the old `category` field into the new `muscle` field, then persist the migrated array back via `saveSessions` / `savePlans`. The migration is idempotent — once a record has `muscle` and no `category`, it is skipped.

Mapping table (case-insensitive on the legacy string):

| Legacy `category` | New `muscle` |
| ----------------- | ------------ |
| `Arms`            | `arms`       |
| `Legs`            | `quads`      |
| `Abs`             | `abs`        |
| `Chest`           | `chest`      |
| `Back`            | `back`       |
| `Shoulders`       | `shoulders`  |
| `Calves`          | `calves`     |
| `Cardio`          | `cardio`     |
| `Core`            | `abs`        |
| `Other` / unknown | `undefined`  |

**Why:** Lazy migration runs on first read after the app loads — no boot-time hook, no async migration step in `app/layout.tsx`. The `Legs → quads` default is the most common interpretation in beginner / intermediate plans; the user can reclassify hamstrings/glutes via the existing edit flow on each exercise.

### 4. AI prompts emit canonical muscle keys

The system prompts in `src/lib/ai/prompts/import/v1.ts`, `import/v2.ts`, and `plan/v1.ts` are updated to enumerate the 12 canonical muscle keys (lowercase, snake_case where applicable) and instruct the LLM to pick one or omit the field. The post-parse validation in `src/lib/ai/plan.ts` widens to accept the new keys.

A defensive normalizer in `src/lib/ai/plan.ts` runs the same legacy-string mapping as the storage migration, so any prompt that still emits old values (cached prompt revisions, stale model output) gets cleaned at the import boundary.

**Why:** The LLM produces the new format directly when prompted. The normalizer is belt-and-braces for transitional cases.

### 5. wger category mapping

`src/lib/wgerClient.ts` is the only file that adapts wger's flat category list. The `CATEGORIES` constant becomes a hard-coded mapping from wger's API category strings to our `Muscle` keys:

| wger category | Our `Muscle` |
| ------------- | ------------ |
| Arms          | `arms`       |
| Legs          | `quads`      |
| Abs           | `abs`        |
| Chest         | `chest`      |
| Back          | `back`       |
| Shoulders     | `shoulders`  |
| Calves        | `calves`     |
| Cardio        | `cardio`     |

wger does not split lower-body finely, so `Legs` defaults to `quads` (the same default as the storage migration). The user can reclassify after the suggestion is accepted.

**Why:** Keeping the adapter narrow means the rest of the app only ever sees canonical `Muscle` values.

### 6. Grouped picker in add-exercise modals

`AddExerciseModal` and `AddPlanExerciseModal` replace the flat category dropdown with a grouped picker. Implementation: a `<select>` with `<optgroup>` per group (zero new dependencies), or a custom dropdown that highlights the group header. The native `<optgroup>` route is preferred — it is one element type, screen-reader-friendly, and renders correctly on mobile.

**Why:** Native `<optgroup>` covers the UX requirement (visual grouping) without a new component.

### 7. Radar chart: group/muscle view toggle

The radar component on the Stats page gains a two-position toggle (segmented control or two-button group) above the chart: **Groups** (4 axes — Upper / Lower / Core / Cardio) and **Muscles** (up to 12 axes plus `Other`). The default is **Groups**.

`statsUtils.ts` exposes two functions:

- `getGroupDistribution(sessions): { group: MuscleGroup | 'other'; count: number }[]`
- `getMuscleDistribution(sessions): { muscle: Muscle | 'other'; count: number }[]`

The existing `getCategoryDistribution` is removed; its single caller (the radar) picks the right function based on the toggle.

The "fewer-than-2-distinct-axes hides the chart" rule from the existing spec is preserved per view: if the group view has fewer than 2 distinct group axes the muscle view may still render, and vice versa.

**Why:** Groups give the user the at-a-glance balance check that motivates the change; muscles give the detail view for digging in. A toggle is cheap and keeps both audiences happy.

### 8. CategoryBadge becomes MuscleBadge

The component is renamed and reshaped: it accepts a `muscle: Muscle` prop, resolves the icon via a `MUSCLE_ICONS` map, and renders the localized muscle label. Group is not surfaced on the badge itself (no hover tooltip in v1) — the badge stays compact.

**Why:** Renaming follows the field rename in (2). A single tier on the badge keeps it small enough to inline on cramped rows.

## Risks / Trade-offs

- **`Legs → quads` migration is lossy.** Users with a lot of hamstring or glute work tagged `Legs` will see those exercises classified as quads until they reclassify. Mitigated by a one-time toast on first load after the update.
- **Closed enum is rigid.** A user who wants a niche tag (forearms, traps, abductors) cannot add one. Acceptable for a hobby project; opening the enum is a follow-up if needed.
- **Native `<optgroup>` styling is limited** on iOS Safari. Acceptable — the grouping is conveyed by indentation and the header text even when custom styling is dropped.
- **Lazy migration writes on read** — first `loadSessions` after the update is a write. On large histories (hundreds of sessions) this is still well under 50 ms in practice on localStorage. No spinner needed.

## Migration Plan

1. Add `src/lib/muscles.ts` with the `Muscle` / `MuscleGroup` types, `MUSCLE_TO_GROUP` map, and `migrateLegacyCategory` helper.
2. Rename the field on `Exercise` and `PlanExercise` in `src/lib/types.ts` (`category?: string` → `muscle?: Muscle`).
3. Update `src/lib/storage.ts` `loadSessions` / `loadPlans` to call `migrateLegacyCategory` and persist back.
4. Update AI prompts and `src/lib/ai/plan.ts` to emit + accept the new keys; add the defensive normalizer.
5. Update `src/lib/wgerClient.ts` mapping to canonical muscle keys.
6. Rename `CategoryBadge` to `MuscleBadge` and update all import sites.
7. Update add-exercise modals to use the grouped picker.
8. Add `getGroupDistribution` / `getMuscleDistribution` in `statsUtils.ts`; remove `getCategoryDistribution`.
9. Update the Stats page radar to consume the new functions + render the view toggle.
10. Expand `category_labels` to 12 muscles and add `muscle_group_labels` to all three locale files.
11. Add the one-time first-load toast describing the `Legs → Quads` mapping.

## Open Questions

- Should the first-load toast also link to a Settings page that lists migrated exercises so the user can bulk-reclassify? Probably overkill for v1 — per-exercise edit is already in place.
- Does the radar's "hide when only one axis has data" rule apply per view, or globally? Per view, as described in decision (7).
- Should `Cardio` exercises with `type: 'duration'` auto-tag `muscle: 'cardio'` on creation? Out of scope — keep the muscle field user-driven for now.
