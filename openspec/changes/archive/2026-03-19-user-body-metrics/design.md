## Context

The app already collects a user's name, language, and sex. Storage helpers follow a consistent pattern in `src/lib/storage.ts` with `wst_*` localStorage keys, SSR guards, and try-catch wrappers. The onboarding modal (`UserNameModal.tsx`) currently captures name and language. The profile page (`src/app/profile/page.tsx`) uses expandable cards with save-on-blur. The AI prompt builder (`src/lib/ai.ts` — `buildPlanSuggestionPrompt`) already injects sex into the prompt.

## Goals / Non-Goals

**Goals:**

- Add age (years), height (cm), and weight (kg) fields to onboarding and profile
- Move sex selector into onboarding (it currently only lives on the profile screen)
- Include all four metrics in the AI plan generation prompt when available
- Follow existing patterns: storage helpers, card UI, save-on-blur, optional fields

**Non-Goals:**

- Imperial/US units (metric only for now)
- BMI calculation or any derived health metrics
- Mandatory field validation — all body metrics remain optional

## Decisions

### D1: Extend onboarding modal with optional body-metrics step

**Decision:** Add a second step to `UserNameModal.tsx` for age, height, weight, and sex — shown after the user submits their name and language.

**Rationale:** Keeps the initial name/language gate lightweight. Body metrics feel like a natural follow-up "get to know you" step. Marking all fields as optional reduces friction.

**Alternative considered:** Single combined form — rejected because it makes the already-small modal feel crowded and raises the barrier to completing onboarding.

### D2: Store each metric under its own `wst_*` key

**Decision:** Three new keys — `wst_user_age`, `wst_user_height_cm`, `wst_user_weight_kg` — matching the existing `wst_user_sex` pattern.

**Rationale:** Granular keys make it easy to read or clear a single field. Consistent with how all other user profile data is stored.

**Alternative considered:** Single JSON blob under `wst_user_body` — rejected because it complicates partial reads and diverges from the established pattern.

### D3: Number inputs with sensible range constraints

**Decision:** Age: integer 10–120. Height: integer 50–300 cm. Weight: number 20–500 kg (one decimal allowed). Empty input → null (not stored).

**Rationale:** Range guards prevent obviously invalid values from reaching the AI prompt without enforcing mandatory completion.

### D4: Inject body metrics into AI prompt alongside existing sex field

**Decision:** Extend `buildPlanSuggestionPrompt` to accept age, height, and weight as optional parameters (similar to how `sex` is already passed). Each metric is conditionally appended to the prompt preamble.

**Rationale:** The function already reads `getSex()` before calling the builder. Same pattern: callers read the storage helpers, pass values in, function renders them into the prompt string.

## Risks / Trade-offs

- **Onboarding length increases** → Mitigated by making all body-metric fields optional and providing a clear "Skip" affordance on the second step.
- **Users may enter inaccurate values** → Acceptable; the AI uses this as soft context, not medical data. No validation beyond range bounds.
- **Localization** → New label strings (Age, Height, Weight, unit labels) need entries in all three locales (en, hu, de). Scope is contained to a handful of keys.

## Open Questions

- Should the second onboarding step be skippable with a single "Skip" button, or should "Continue" work with all fields empty? (Recommendation: "Continue" works with empty fields — no explicit Skip button needed.)
- Should height/weight show unit labels inline (e.g. "cm", "kg") or as suffix text next to the input? (Recommendation: suffix text, matching common form patterns.)
