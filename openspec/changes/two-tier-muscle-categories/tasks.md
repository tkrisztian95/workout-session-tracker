## 1. Define the muscle taxonomy

- [x] 1.1 Create `src/lib/muscles.ts` with `Muscle` and `MuscleGroup` union types
- [x] 1.2 Add the `MUSCLE_TO_GROUP` static map covering all 12 muscles
- [x] 1.3 Add `ALL_MUSCLES: Muscle[]` and `MUSCLES_BY_GROUP: Record<MuscleGroup, Muscle[]>` helpers used by the picker and radar
- [x] 1.4 Add `migrateLegacyCategory(value: string | undefined): Muscle | undefined` implementing the legacy mapping table from `design.md` §3
- [x] 1.5 Unit-test `migrateLegacyCategory` for every legacy label, `undefined`, unknown strings, and case-insensitive matches

## 2. Update the schema

- [x] 2.1 Rename `Exercise.category?: string` to `Exercise.muscle?: Muscle` in `src/lib/types.ts`
- [x] 2.2 Rename `PlanExercise.category?: string` to `PlanExercise.muscle?: Muscle` in `src/lib/types.ts`
- [x] 2.3 Run `tsc --noEmit` and fix every compile error surfaced by the rename (this is intentional — the rename is the cutover signal)

## 3. Migrate stored data lazily on read

- [x] 3.1 In `src/lib/storage.ts`, add a migration pass inside `loadSessions` that walks every exercise in every session and replaces a legacy `category` field with a `muscle` field via `migrateLegacyCategory`
- [x] 3.2 Add the same pass inside `loadPlans` for plan days' core/optional exercises and shared exercises
- [x] 3.3 Persist the migrated array back to localStorage only if at least one record was rewritten (avoid noisy writes on already-migrated data)
- [x] 3.4 Cover the migration path in `src/lib/__tests__/storage.test.ts` (or equivalent) with sessions that mix legacy + migrated records

## 4. Update AI import & plan prompts

- [x] 4.1 Update `src/lib/ai/prompts/import/v1.ts` and `src/lib/ai/prompts/import/v2.ts` so the `muscle` field enumerates the 12 canonical keys (replace the old `"Chest", "Back", "Legs", "Shoulders", "Arms", "Core", "Cardio"` example)
- [x] 4.2 Update `src/lib/ai/prompts/plan/v1.ts` likewise (note the inline category list at line 59)
- [x] 4.3 In `src/lib/ai/plan.ts`, accept `muscle` instead of `category` from the parsed response and run `migrateLegacyCategory` defensively on any incoming value (transitional safety net)
- [x] 4.4 Update evals in `evals/score.ts` that reference the old `category` field

## 5. Update wger lookup

- [x] 5.1 In `src/lib/wgerClient.ts`, replace the `CATEGORIES` constant with the wger-category → `Muscle` mapping from `design.md` §5
- [x] 5.2 Update every consumer of the wger client so suggestions carry `muscle: Muscle` instead of `category: string`
- [x] 5.3 Ensure `ExerciseSuggestionList.tsx` displays the suggestion's muscle via the new `MuscleBadge` component

## 6. Rename and reshape the badge

- [x] 6.1 Rename `src/components/CategoryBadge.tsx` to `src/components/MuscleBadge.tsx`
- [x] 6.2 Replace the `category` prop with `muscle: Muscle`; update the icon map (`MUSCLE_ICONS`) to cover all 12 muscles, picking sensible Lucide icons (e.g., `Heart` for chest, `Target` for quads, `Flame` for abs, etc.)
- [x] 6.3 Resolve the label via `t.muscle_labels[muscle]`
- [x] 6.4 Update every import site (`PlanExerciseRow`, `SessionExerciseItem`, `WorkoutHistoryCard`, `ExerciseSuggestionList`, `ExerciseHistoryPicker`, `NewHistorySessionSheet`, `AiPlanSuggestionModal`, `PlanForm`, etc.) — `tsc` will list them after step 2.3

## 7. Grouped picker in add-exercise modals

- [x] 7.1 In `AddExerciseModal.tsx`, replace the flat category `<select>` with a grouped `<select>` using `<optgroup>` per `MuscleGroup`; iterate `MUSCLES_BY_GROUP` to render
- [x] 7.2 Mirror the change in `AddPlanExerciseModal.tsx`
- [x] 7.3 Keep the "None" / empty-default option behaviour from `plan-exercise-category` (selector hidden when a wger suggestion's muscle is active)
- [x] 7.4 Update the manual `useState` typing from `string` to `Muscle | ''`

## 8. Stats: group / muscle distribution + view toggle

- [x] 8.1 In `src/lib/statsUtils.ts`, remove `getCategoryDistribution` and add `getGroupDistribution(sessions): GroupDistributionPoint[]` and `getMuscleDistribution(sessions): MuscleDistributionPoint[]`
- [x] 8.2 Each distribution function counts sessions-containing-at-least-one-exercise-of-that-axis, mirroring the existing logic
- [x] 8.3 Add unit tests for both functions (empty sessions, sessions with mixed/missing muscle, group aggregation correctness)
- [x] 8.4 Update `src/app/stats/page.tsx` (or the radar sub-component) to render a `Groups | Muscles` toggle above the radar; default to `Groups`
- [x] 8.5 Persist the toggle choice in the same component-local state used by other stats filters (no localStorage key needed in v1)
- [x] 8.6 Apply the "hide when fewer than 2 axes have data" rule per view, not globally

## 9. Localisation

- [x] 9.1 Replace the existing `category_labels` block in `src/locales/en.json` with a `muscle_labels` block covering all 12 keys (`chest`, `back`, `shoulders`, `arms`, `quads`, `hamstrings`, `glutes`, `calves`, `abs`, `obliques`, `lower_back`, `cardio`)
- [x] 9.2 Add a `muscle_group_labels` block in `en.json` covering `upper`, `lower`, `core`, `cardio`
- [x] 9.3 Mirror both blocks in `src/locales/hu.json` with Hungarian translations
- [x] 9.4 Mirror both blocks in `src/locales/de.json` with German translations
- [x] 9.5 Add i18n strings for the new radar toggle labels and the first-load migration toast

## 10. First-load migration notice

- [ ] 10.1 Add a one-time toast / banner shown on first load after the update, informing the user that `Legs`-tagged exercises were mapped to `Quads` and can be reclassified via the edit flow
- [ ] 10.2 Store the dismissed flag in localStorage (`wst_muscle_migration_seen` or similar) so the notice only appears once
- [ ] 10.3 Add the toast copy to all three locales

## 11. Cleanup

- [ ] 11.1 Remove any dead imports/types referencing the old `category` field
- [ ] 11.2 Confirm `grep -rn "category" src/` shows only intentional residual usages (e.g., unrelated `useTranslations` keys)
- [ ] 11.3 Run the full test suite + `tsc --noEmit` + lint and fix any fallout
- [ ] 11.4 Manually verify in the browser: create a new exercise with a muscle, see the badge render, confirm the stats radar toggle works, confirm legacy sessions show migrated muscles
