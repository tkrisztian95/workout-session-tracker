## 1. Catalog data module

- [ ] 1.1 Add `src/lib/exerciseCatalog.ts` with the `CatalogExercise` interface
      and `EXERCISE_CATALOG` array: the user's gym machines (Elliptical,
      Treadmill, Stationary bike, Stair climber, Rowing machine → `cardio`;
      Glute machine + Hip abduction + Hip adduction → `glutes`; Lying & seated
      leg curl → `hamstrings`; Leg extension + Leg press → `quads`; Ab/crunch
      machine → `abs`; Back extension → `lower_back`; Rotary torso → `obliques`)
      plus a common starter set (bench press, incline press, lat pulldown, cable
      row, shoulder press, biceps curl, triceps pushdown, plank, etc.) with
      `type` and type-appropriate defaults.
- [ ] 1.2 Add `catalogName(t, id)` and `catalogByGroup()` helpers (group via
      `MUSCLE_TO_GROUP`, ordered by `ALL_MUSCLE_GROUPS` / `MUSCLES_BY_GROUP`).
- [ ] 1.3 Add `src/lib/exerciseCatalog.test.ts` asserting unique ids, valid
      muscle/type/defaults per type, and that every id has a name in all three
      locales.

## 2. Localization

- [ ] 2.1 Add a `catalog_exercise_names` map (id → localized name) to `en`,
      `hu`, and `de`, using the user's native HU/DE machine names where they
      apply.
- [ ] 2.2 Add `catalog_*` UI keys (picker button + title + search placeholder +
      empty/no-results, browse screen title/subtitle, Profile link label) to all
      three locales.

## 3. Catalog picker

- [ ] 3.1 Create `ExerciseCatalogPicker` mirroring `ExerciseHistoryPicker`:
      `ModalSheet` with search and a muscle-group-grouped list, rendering each
      entry's localized name + `MuscleBadge`.
- [ ] 3.2 Call `onSelect(entry)` on tap and close.

## 4. Add Exercise flow integration

- [ ] 4.1 Add a "Pick from catalog" button + `applyCatalogEntry` to
      `AddExerciseModal`, wiring the picker (gated `isOpen` like the history
      picker) so a selection pre-fills name/muscle/type/defaults.
- [ ] 4.2 Add the same button + `applyCatalogEntry` + picker to
      `AddPlanExerciseModal`.

## 5. Browse screen

- [ ] 5.1 Add `src/app/catalog/page.tsx`: catalog grouped by muscle group with a
      search box and `MuscleBadge`, matching the app's mobile-first styling.
- [ ] 5.2 Add a link to `/catalog` from the Profile page.

## 6. Verification

- [ ] 6.1 Run `npm run lint`, `npm test`, and `npx tsc --noEmit` (or the
      project's typecheck script); fix issues.
- [ ] 6.2 Visual check with Playwright MCP: open the catalog picker from both Add
      Exercise modals, select an entry, and open the `/catalog` browse screen.
