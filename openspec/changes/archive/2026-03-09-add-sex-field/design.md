## Context

The app stores user profile data in localStorage with individual keys (e.g., `wst_user_name`, `wst_locale`). The profile settings screen uses expandable card components — `LanguageCard` is the direct reference pattern for this change. No backend is involved; all persistence is client-side.

## Goals / Non-Goals

**Goals:**

- Add a `wst_user_sex` localStorage key with typed getter/setter helpers
- Add a `SexCard` profile card component following the `LanguageCard` pattern
- Expose the sex value to the AI companion prompt context
- Translate the field label and option labels in all three locales (en, hu, de)

**Non-Goals:**

- Non-binary or custom gender options (out of scope; only Male / Female / Not specified)
- Backend persistence or sync
- Validation or enforcement of the field (it remains optional)

## Decisions

### D1: UI control — Select dropdown (not radio buttons)

**Decision:** Use the existing `<Select>` component from `src/components/ui/Input.tsx`.

**Rationale:** Consistent with the existing `LanguageCard` and `AiConfigCard` patterns. Radio buttons would require a new UI primitive and deviate from established conventions. The dropdown fits the three-option set (Male, Female, Not specified) without consuming excess vertical space.

**Alternative considered:** Styled radio buttons / segmented control — rejected for complexity and inconsistency.

---

### D2: Storage key — `wst_user_sex`

**Decision:** Add a new key `wst_user_sex` to the `KEYS` constant in `src/lib/storage.ts` with helpers `getSex(): Sex | null` and `saveSex(sex: Sex): void`.

**Rationale:** Follows the exact same pattern as `wst_locale` and `wst_user_name`. Keeps storage access centralized and typed.

---

### D3: Type — `'male' | 'female'` union

**Decision:** Define `type Sex = 'male' | 'female'` in `src/lib/types.ts`. Storage returns `Sex | null` (null when not set).

**Rationale:** Minimal and precise. Avoids string literals scattered across components. Null represents "not specified" without adding a third enum value that could complicate downstream logic.

---

### D4: Component — new `SexCard.tsx`

**Decision:** Create `src/components/SexCard.tsx` as a self-contained card, mirroring `LanguageCard.tsx` structure.

**Rationale:** Keeps profile cards independently composable. The profile page simply mounts `<SexCard />` with no prop drilling.

---

### D5: AI integration — inject sex into system prompt

**Decision:** Read `getSex()` in `src/lib/ai.ts` where the system prompt is assembled and append a line such as `User sex: male` if the value is set.

**Rationale:** Minimal change to provide the AI with relevant biometric context. Only injected when value is non-null to avoid polluting the prompt with "not specified".

## Risks / Trade-offs

- **Existing users have no stored sex value** → `getSex()` returns `null`, card defaults to "Not specified". No migration needed.
- **Terminology sensitivity** → "Sex" (biological) is used rather than "Gender" per the requirement. The label should be clearly worded in translations to avoid ambiguity.
- **AI prompt injection** → Injecting biometric data into AI prompts may be unexpected by users. Consider surfacing this in the AI config card description (out of scope for this change).
