## Context

- Skipping sets `dismissed: true` on the in-session `Exercise` in `SessionView.handleDismiss`. Undo sets `dismissed: false`. There are two entry points in `ExerciseCard`: the **Skip** button on the active card and the dismiss (X) `IconButton` on non-active cards. Both call the same `onDismiss` prop.
- `ActiveSession.exercises` is copied into `WorkoutSession.exercises` on finish, so any field on `Exercise` flows into history with no extra wiring.
- Bottom sheets in the app are hand-rolled (`DiscardSessionConfirmSheet`, `FinishSessionConfirmSheet`): a fixed `bg-black/70` overlay with a `rounded-t-3xl` panel, using `Button` and `HeadingXL` from `@/components/ui`.
- The debrief builds its facts in `formatFinishedSession` (`src/lib/ai/debrief.ts`). Prompts are versioned under `src/lib/ai/prompts/session-debrief/` (`v1` is current).
- History edit mode works on a draft via `updateDraftExercise(id, patch)` in `src/app/history/[id]/page.tsx`.

## Goals / Non-Goals

**Goals:**

- One sheet component used by the live session and by history edit mode.
- Pure, unit-tested logic for reason labels and the pain streak check.
- No storage migration and no export schema bump.

**Non-Goals:**

- An in-session exercise swap. The hint only points the user at the plan. `AiExerciseSwapModal` stays inside `PlanForm`.
- Persistent per-exercise notes across sessions (#50).
- Analytics or stats on skip reasons (for example, a "most skipped" chart).
- Dismissing or snoozing the pain hint.

## Decisions

### D1. Data shape: two optional fields on `Exercise`

```ts
export type SkipReason =
  'pain' | 'equipment-broken' | 'equipment-busy' | 'fatigue' | 'time' | 'other';

interface Exercise {
  // …
  skipReason?: SkipReason; // only meaningful when dismissed === true
  skipNote?: string; // trimmed, 1–200 chars; absent when empty
}
```

Stable string ids, not localized labels, so language switches and exports work. Fields are optional, so old sessions and imports validate unchanged. The export `schemaVersion` stays `'1'`, because additive optional fields do not break older readers.

_Alternative:_ a nested `skip?: { reason?, note? }` object. Rejected because it adds a presence check at every read site and does not match the flat style of `completed` / `completedAt` / `dismissed`.

_Alternative:_ a separate `wst_skip_reasons` storage key. Rejected because the reason belongs to one exercise instance in one session, which is exactly what `Exercise` already models.

Invariant: whenever `dismissed` becomes `false`, both fields are removed (not set to `undefined` placeholders). The handlers build the new exercise object without them, so the JSON stays clean.

### D2. Skip flow owned by `SessionView`, not `ExerciseCard`

`ExerciseCard` keeps its `onDismiss` prop. `SessionView` changes what the prop does: it stores `skipTargetId` in state and renders `<SkipExerciseSheet>`. On confirm it calls `handleDismiss(id, { reason, note })`. This keeps the card presentational and puts sheet state in one place instead of one per card.

_Alternative:_ the sheet inside `ExerciseCard`. Rejected: N cards would each hold sheet state, and history edit mode needs the same sheet outside of any card.

### D3. `SkipExerciseSheet` is reusable in two modes

Props: `exerciseName`, `initialReason?`, `initialNote?`, `mode: 'skip' | 'edit'`, `onConfirm({ reason?, note? })`, `onSkipWithoutReason?`, `onCancel`.

- `skip` mode (live session): primary button **Skip**, secondary **Skip without reason**. Backdrop tap and Escape cancel.
- `edit` mode (history): primary **Save**, secondary **Cancel**. No "without reason" action; clearing is done by deselecting the chip and emptying the note.

The chips are a labelled `role="group"` of toggle buttons with `aria-pressed`. A radio group was rejected: a second tap on the selected chip clears it, which radio semantics don't allow, and toggle buttons need no roving-tabindex arrow-key handling. Tap targets are at least 44px. The note is a `<textarea maxLength={200}>` with a character counter near the limit. Run `/ui-ux-pro-max` for the chip and sheet styling before building it.

### D4. Pure helpers in `src/lib/skipReasons.ts`

- `SKIP_REASONS: readonly SkipReason[]`: the display order.
- `skipReasonLabel(reason, t)`: maps an id to the locale key `skip_reason_<id>`.
- `normalizeSkipNote(raw): string | undefined`: trim, cap at 200, empty becomes `undefined`.
- `hasPainStreak(sessions, exerciseName, streak = 2): boolean`: walks sessions newest-first by `completedAt`. It takes the first `streak` appearances of an exercise whose `name.trim().toLowerCase()` matches, and returns `true` only if there are exactly `streak` appearances and each has `dismissed && skipReason === 'pain'`. If one session has the same exercise twice, the first match in that session counts once.

`SessionView` reads `getSessions()` once into state (saved history doesn't change mid-session; the React Compiler rejects a `useMemo` over an impure read), computes the hint for the active exercise, and passes `painStreak` to `ExerciseCard`. The card renders it in the same info-box style as `scalingNote`, using a warning tone.

_Alternative:_ store a per-exercise pain counter. Rejected: that is derived state that can drift when the user edits history. Scanning history is cheap for localStorage-sized data and always stays correct.

### D5. Debrief: add facts and a v2 prompt

`formatFinishedSession` adds a `- skipped:` line when any exercise is dismissed:

```
- skipped: Overhead Press (pain — "right shoulder"), Cable Row (equipment broken), Lunges (no reason)
```

Reasons use the stable English id text, not the UI locale, so the model input does not depend on UI language. The note is quoted verbatim and capped at 200 chars by D1. The system prompt gets one added rule: it may acknowledge a pain skip in one brief, non-medical clause, must not diagnose or prescribe, and must not repeat the note back verbatim. This is a text change, so add `v2.ts`, point `index.ts` at it, and set `version = 2`, following the existing versioning pattern.

### D6. History edit mode

In edit mode, each skipped exercise gets a small "reason" affordance (a pencil or tag icon next to the reason line, or "Add reason" when none is set). It opens `SkipExerciseSheet` in `edit` mode and writes `updateDraftExercise(id, { skipReason, skipNote })`. The existing un-skip toggle (which sets `dismissed: false, completed: false`) also removes both fields via `clearSkip`. Save and Cancel follow the existing draft flow, so no new persistence path is needed.

## Risks / Trade-offs

- **Extra tap on every skip** → The sheet adds one tap for users who never want reasons. Mitigation: "Skip without reason" is a full-width button in the sheet. If this proves annoying, a later settings toggle can bypass the sheet (out of scope here).
- **Name-based matching for the pain streak** → Renamed or differently spelled exercises break the streak. This is acceptable and matches how the history picker already matches exercises by name.
- **Health-adjacent text sent to the LLM** → Notes such as "left shoulder" go to the user's configured provider. The debrief already sends session data under the existing AI consent. No new consent is needed, but the prompt forbids medical advice (D5).
- **`dismissed` toggled directly by other code paths** (history toggle, AI import) could leave stale reason fields → Mitigation: the history toggle clears them (D6). AI import never sets them. Readers treat `skipReason` as meaningful only when `dismissed === true`.

## Migration Plan

None. The fields are optional and additive. Rollback means reverting the commit. Any `skipReason` / `skipNote` values already written are ignored by older code.
