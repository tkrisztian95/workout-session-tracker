# Data Structure

This document describes every piece of persisted data in the app and how it maps to TypeScript types. The app stores everything client-side in `localStorage` — there is no backend.

> **Sync rule:** any change to a persisted shape, a `localStorage` key, the export payload, or a migration **must** be reflected here in the same commit. See [CLAUDE.md](../CLAUDE.md).

## Sources of truth

| Concern                                    | File                                                                                          |
| ------------------------------------------ | --------------------------------------------------------------------------------------------- |
| Type definitions                           | [src/lib/types.ts](../src/lib/types.ts)                                                       |
| Storage keys, getters, setters, migrations | [src/lib/storage.ts](../src/lib/storage.ts)                                                   |
| Muscle taxonomy + legacy category map      | [src/lib/muscles.ts](../src/lib/muscles.ts)                                                   |
| Achievement records + definitions          | [src/lib/achievementDefs.ts](../src/lib/achievementDefs.ts)                                   |
| Export payload shape                       | `ExportPayload` in [src/lib/storage.ts](../src/lib/storage.ts)                                |
| Dev seed corpus + JSON Schemas             | [src/lib/dev-seed-data/](../src/lib/dev-seed-data/) (see [Dev seed corpus](#dev-seed-corpus)) |

## localStorage keys

All keys are namespaced with the `wst_` prefix and declared in the `KEYS` const in [src/lib/storage.ts](../src/lib/storage.ts).

| Key                            | Value (JSON unless noted)       | Type / shape                                                      | Accessor functions                                                                      |
| ------------------------------ | ------------------------------- | ----------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `wst_plans`                    | array                           | `WorkoutPlan[]`                                                   | `getPlans` / `savePlan` / `deletePlan` / `duplicatePlan` / `togglePlanStatus`           |
| `wst_sessions`                 | array                           | `WorkoutSession[]`                                                | `getSessions` / `saveSession` / `deleteSession` / `updateSession`                       |
| `wst_active_session`           | object                          | `ActiveSession`                                                   | `getActiveSession` / `setActiveSession` / `clearActiveSession`                          |
| `wst_user_name`                | raw string                      | `string`                                                          | `getUserName` / `saveUserName`                                                          |
| `wst_locale`                   | raw string                      | `'en' \| 'hu' \| 'de'` (`Locale`)                                 | `getLocale` / `saveLocale`                                                              |
| `wst_llm_config`               | object                          | `LlmConfig`                                                       | `getLlmConfig` / `saveLlmConfig`                                                        |
| `wst_user_sex`                 | raw string                      | `'male' \| 'female'` (`Sex`)                                      | `getSex` / `saveSex`                                                                    |
| `wst_user_age`                 | raw number string               | `number`                                                          | `getAge` / `saveAge`                                                                    |
| `wst_user_height_cm`           | raw number string               | `number`                                                          | `getHeightCm` / `saveHeightCm`                                                          |
| `wst_user_weight_kg`           | raw number string               | `number`                                                          | `getWeightKg` / `saveWeightKg`                                                          |
| `wst_theme`                    | raw string                      | `'light' \| 'dark' \| 'system'` (`Theme`)                         | `getTheme` / `saveTheme`                                                                |
| `wst_home_background`          | raw string                      | `'velocity' \| 'charge' \| 'ignite' \| 'none'` (`HomeBackground`) | `getHomeBackground` / `saveHomeBackground`                                              |
| `wst_consent_accepted`         | raw string `'true'` / `'false'` | boolean-as-string (presence = seen)                               | `hasSeenConsent` / `getConsentAccepted` / `saveConsentAccepted` / `saveConsentDeclined` |
| `wst_achievements`             | array                           | `AchievementRecord[]`                                             | `getAchievements` / `saveAchievements`                                                  |
| `wst_profile_created_at`       | raw ISO string                  | `string`                                                          | `getProfileCreatedAt` / `saveProfileCreatedAt`                                          |
| `wst_hidden_exercises`         | array                           | `HiddenExerciseKey[]`                                             | `getHiddenExercises` / `saveHiddenExercises`                                            |
| `wst_muscle_migration_pending` | raw string `'true'`             | flag — set by migration, cleared on dismiss                       | `shouldShowMuscleMigrationNotice` / `dismissMuscleMigrationNotice`                      |
| `wst_muscle_migration_seen`    | raw string `'true'`             | flag — set when the user dismisses the notice                     | same as above                                                                           |

"Raw string" means the value is written directly (no `JSON.stringify`).

## Type definitions

### Profile

```ts
type Sex = 'male' | 'female';
```

Profile fields live as separate keys (`wst_user_name`, `wst_user_sex`, `wst_user_age`, `wst_user_height_cm`, `wst_user_weight_kg`, `wst_profile_created_at`). They are bundled into the export payload as a `profile` object — they are **not** stored as a single object in `localStorage`.

### LLM config

```ts
type LlmProvider = 'openai' | 'gemini';

interface LlmConfig {
  provider: LlmProvider;
  apiKey: string;
  model: string;
}
```

Persisted at `wst_llm_config`. The API key is stored in plaintext on the client.
`provider` selects which backend the four AI features call (`openai` →
OpenAI Chat Completions, `gemini` → Google Generative Language `generateContent`);
`model` is a provider-specific model id (e.g. `gpt-4o-mini`, `gemini-2.5-flash`).

`getLlmConfig()` returns the saved `wst_llm_config` when present. As a dev/preview
convenience, when nothing is saved it falls back to a config synthesized from the
`NEXT_PUBLIC_OPENAI_API_KEY` (+ optional `NEXT_PUBLIC_OPENAI_MODEL`) or
`NEXT_PUBLIC_GEMINI_API_KEY` (+ optional `NEXT_PUBLIC_GEMINI_MODEL`) env vars —
OpenAI takes precedence when both are set, and only in local dev or a Vercel
preview, never production. The fallback never writes to `localStorage`; a saved
config always takes precedence. See `.env.example`.

### Muscle taxonomy

Defined in [src/lib/muscles.ts](../src/lib/muscles.ts):

```ts
type MuscleGroup = 'upper' | 'lower' | 'core' | 'cardio';
type Muscle =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'arms' // upper
  | 'quads'
  | 'hamstrings'
  | 'glutes'
  | 'calves' // lower
  | 'abs'
  | 'obliques'
  | 'lower_back' // core
  | 'cardio'; // cardio
```

`MUSCLE_TO_GROUP`, `MUSCLES_BY_GROUP`, and `ALL_MUSCLES` provide reverse lookups. `migrateLegacyCategory` maps the legacy free-text `category` field onto a canonical `Muscle` (see [Migrations](#migrations)).

### Exercise (in-session and historical)

`Exercise` is used inside both `ActiveSession` and `WorkoutSession`. It includes in-session tracking fields (`completed`, `dismissed`, `completedAt`, `loggedSets`) that `PlanExercise` does not have.

```ts
interface LoggedSet {
  weight: number; // kg
  reps: number;
  seconds?: number; // present for time-based sets (e.g. plank); weight/reps are 0
  loggedAt: string; // ISO timestamp
}

interface Exercise {
  id: string;
  name: string;
  type: 'sets-reps' | 'sets-duration' | 'duration';
  sets?: number; // present for sets-reps / sets-duration; absent for duration
  reps?: number; // uniform rep target; mutually exclusive with repsPerSet
  repsPerSet?: number[]; // per-set rep targets, e.g. [15, 12, 8, 4]; sets equals length
  duration?: number; // seconds; present for sets-duration and duration
  weightKg?: number;
  scalingNote?: string;
  muscle?: Muscle;
  completed?: boolean;
  dismissed?: boolean;
  completedAt?: string;
  loggedSets?: LoggedSet[];
}
```

**Invariants:**

- `reps` and `repsPerSet` are mutually exclusive. When `repsPerSet` is set, `sets === repsPerSet.length`.
- `type === 'duration'` ⇒ no `sets`; `duration` (seconds) is the entire prescription.
- `type === 'sets-duration'` ⇒ both `sets` and `duration` present.
- `type === 'sets-reps'` ⇒ `sets` plus either `reps` or `repsPerSet`.
- `loggedSets[].seconds` is only set for time-based sets where `weight === 0 && reps === 0`.

### Plan models

```ts
interface PlanExercise {
  id: string;
  name: string;
  type: 'sets-reps' | 'sets-duration' | 'duration';
  sets?: number;
  reps?: number;
  repsPerSet?: number[];
  duration?: number;
  weightKg?: number;
  role: 'core' | 'optional';
  scalingNote?: string;
  muscle?: Muscle;
}

interface PlanDay {
  id: string;
  name: string;
  weekdays: number[]; // 0 = Sunday … 6 = Saturday
  coreExercises: PlanExercise[];
  optionalExercises: PlanExercise[];
}

interface WorkoutPlan {
  id: string;
  name: string;
  days: PlanDay[];
  sharedExercises: PlanExercise[];
  createdAt: string;
  updatedAt: string;
  status?: 'active' | 'completed';
  completedAt?: string;
  aiGenerated?: boolean;
  scheduledWeeks?: number;
}
```

`status` defaults to `'active'` when absent. `completedAt` is only present while `status === 'completed'` and is cleared on `togglePlanStatus` back to active.

### Sessions

```ts
interface ActiveSession {
  id: string;
  startedAt: string;
  exercises: Exercise[];
  planId?: string;
  planDayId?: string;
  planName?: string;
  planDayName?: string;
  pausedAt?: string; // present iff paused
  totalPausedMs: number; // cumulative paused time across all pause/resume cycles
}

interface WorkoutSession {
  id: string;
  startedAt: string;
  completedAt: string;
  exercises: Exercise[];
  planId?: string;
  planDayId?: string;
  rating?: 1 | 2 | 3 | 4 | 5;
  updatedAt?: string; // set when edited post-completion
  importedViaAi?: boolean; // set when created via AI import
}
```

At most one `ActiveSession` exists at a time (single value at `wst_active_session`). `WorkoutSession` is the immutable record produced when an active session is completed and pushed onto `wst_sessions`. `updateSession` stamps `updatedAt` on every post-completion edit.

### Achievements

```ts
interface AchievementRecord {
  id: string; // matches an AchievementDef.id
  unlockedAt: string; // ISO timestamp
  seen: boolean; // false until the user has acknowledged the unlock toast
}
```

Definitions live in [src/lib/achievementDefs.ts](../src/lib/achievementDefs.ts) and are **not** persisted — only `AchievementRecord[]` is. Tracks: `sessions`, `plans`, `weekly`, `tenure`, `volume`.

### Hidden exercises

```ts
interface HiddenExerciseKey {
  nameKey: string;
  muscle?: Muscle;
}
```

Stored at `wst_hidden_exercises`. Used to suppress suggestions from the "recent exercises" pool.

## Migrations

Legacy data is rewritten in place on read. Migrations live in [src/lib/storage.ts](../src/lib/storage.ts).

### Legacy `category` → typed `muscle`

`migrateExerciseInPlace` runs on every read of plans, the active session, completed sessions, and hidden exercises. It removes any `category: string` field and writes a canonical `Muscle` via `migrateLegacyCategory` (see [src/lib/muscles.ts](../src/lib/muscles.ts)).

The legacy `'Legs'` category is lossy — it maps to `'quads'`. When this mapping fires, the storage layer sets `wst_muscle_migration_pending = 'true'` so the UI can show a one-time toast (`shouldShowMuscleMigrationNotice`). The user dismisses with `dismissMuscleMigrationNotice`, which sets `wst_muscle_migration_seen = 'true'` and clears the pending flag.

Migration is idempotent: once `category` is gone, subsequent reads are no-ops.

## Export payload

`exportAllData()` produces a single JSON document for backup / portability:

```ts
interface ExportPayload {
  schemaVersion: string; // currently '1'
  exportedAt: string; // ISO timestamp
  profile: {
    name: string | null;
    sex: Sex | null;
    age: number | null;
    heightCm: number | null;
    weightKg: number | null;
  };
  plans: WorkoutPlan[];
  sessions: WorkoutSession[];
}
```

Notes:

- `schemaVersion` must be bumped whenever the payload shape changes in a non-additive way.
- Profile fields are read from their individual `wst_user_*` keys at export time and bundled into the `profile` object.
- The LLM config, theme, locale, achievements, hidden exercises, consent, and migration flags are intentionally **excluded** from the export.

## Dev seed corpus

The development build populates `localStorage` with a sample dataset on first load (see [src/components/DevSeed.tsx](../src/components/DevSeed.tsx)). The data lives as schema-validated JSON under [src/lib/dev-seed-data/](../src/lib/dev-seed-data/) rather than as code literals, so the corpus is editable, diffable, and validated by CI.

### Layout

```
src/lib/dev-seed-data/
├── schemas/
│   ├── plan.schema.json       # one plan per file
│   ├── sessions.schema.json   # array of completed sessions
│   └── profile.schema.json    # profile defaults
├── plans/
│   ├── ppl.json
│   ├── upper-lower.json
│   └── full-body.json
├── sessions.json
└── profile.json
```

All schemas are [JSON Schema draft 2020-12](https://json-schema.org/draft/2020-12) and mirror the runtime TypeScript shapes defined above (`WorkoutPlan`, `WorkoutSession`, `Exercise`, etc.).

### Relative-time format

Timestamps inside the corpus are **not** ISO strings — they are relative offsets so the files stay evergreen across regenerations:

```jsonc
// in sessions.json
{
  "startedAt": { "daysAgo": 12, "hour": 18, "minute": 5 },
  "completedAt": { "daysAgo": 12, "hour": 18, "minute": 47 },
  "exercises": [
    {
      "completedAt": { "daysAgo": 12, "hour": 18, "minute": 40 },
      "loggedSets": [
        { "weight": 70, "reps": 8, "loggedAt": { "daysAgo": 12, "hour": 18, "minute": 5 } },
      ],
    },
  ],
}
```

Plans use scalar `createdAtDaysAgo` / `updatedAtDaysAgo` / `completedAtDaysAgo` integers (day precision only — the runtime loader pins them to a fixed time of day). Profile uses `profileCreatedAtDaysAgo` the same way. The schemas constrain `daysAgo ≥ 0`, `0 ≤ hour ≤ 23`, `0 ≤ minute ≤ 59`.

At runtime [src/lib/devSeed.ts](../src/lib/devSeed.ts) dynamic-imports the JSON, expands every offset against `new Date()`, and writes the result to `localStorage` under the same `wst_*` keys documented above. Dynamic imports keep the corpus out of the production bundle.

### Scripts

| Command                     | Purpose                                                                                                                                                                                         |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run dev-seed:generate` | Re-run the deterministic generator in [scripts/generate-dev-seed.ts](../scripts/generate-dev-seed.ts) and overwrite the JSON files.                                                             |
| `npm run dev-seed:validate` | Validate every JSON file against its schema via AJV (see [scripts/validate-dev-seed.ts](../scripts/validate-dev-seed.ts)). Exits non-zero on the first failure with the offending JSON pointer. |

### Sync rule

When you change a persisted shape (see [When to update this doc](#when-to-update-this-doc)), also:

1. Update the matching JSON Schema in `src/lib/dev-seed-data/schemas/`.
2. Update the generator in [scripts/generate-dev-seed.ts](../scripts/generate-dev-seed.ts) if the field is one it emits.
3. Re-run `npm run dev-seed:generate` and commit the regenerated JSON.
4. Run `npm run dev-seed:validate` and confirm a clean exit.
5. Bump `SEED_VERSION` in [src/lib/devSeed.ts](../src/lib/devSeed.ts) so dev environments re-seed on next load.

## When to update this doc

Update this file in the same commit as the code change whenever you:

1. Add, rename, or remove a `localStorage` key (`KEYS` in [src/lib/storage.ts](../src/lib/storage.ts)).
2. Change any persisted TypeScript shape (`WorkoutPlan`, `PlanDay`, `PlanExercise`, `Exercise`, `LoggedSet`, `ActiveSession`, `WorkoutSession`, `AchievementRecord`, `HiddenExerciseKey`, `LlmConfig`, `Sex`, `Muscle`, `MuscleGroup`).
3. Add, remove, or modify a migration.
4. Change the `ExportPayload` shape or bump `schemaVersion`.
5. Change the dev-seed JSON shape or its schemas (see [Dev seed corpus](#dev-seed-corpus)).
