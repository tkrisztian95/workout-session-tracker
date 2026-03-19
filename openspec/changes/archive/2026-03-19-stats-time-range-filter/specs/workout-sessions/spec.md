## ADDED Requirements

### Requirement: Stats utilities accept pre-filtered session lists

The `computeStats`, `getWeeklyVolumeChartData`, and `getExerciseWeightProgression` functions in `statsUtils.ts` SHALL continue to accept a `WorkoutSession[]` array. Callers are responsible for pre-filtering the array to the desired date range before passing it to these functions. No date range parameter SHALL be added to the utility function signatures.

#### Scenario: Filtered sessions produce scoped stats

- **WHEN** a caller filters sessions to a specific date window
- **AND** passes the filtered array to `computeStats`
- **THEN** the returned stats reflect only the sessions in that filtered array

#### Scenario: Empty filtered array returns zero stats

- **WHEN** a caller passes an empty array to `computeStats`
- **THEN** all numeric fields in `StatsResult` are 0
