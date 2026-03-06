## Context

The plan create (`/plans/new`) and plan edit (`/plans/[id]`) pages each have a small "Back" button in the header (top-left, `ArrowLeft` icon + "Back" text). This pattern is unfriendly on mobile because the top-left corner is the hardest area to reach with one thumb. Both pages already have a fixed bottom action bar containing the primary "Save" / "Save Changes" button. The change co-locates the cancel/discard action in that same thumb-friendly bottom bar.

## Goals / Non-Goals

**Goals:**

- Move the exit action to the bottom bar on both plan form pages
- Label it "Discard" to be explicit that unsaved changes are lost
- Keep behavior identical to the current back button (`router.back()`)
- Keep the header clean (just the page title, no nav chrome)

**Non-Goals:**

- Unsaved-changes confirmation dialog (the label "Discard" is sufficient signal)
- Any change to the save flow
- Affecting any other page or form in the app

## Decisions

**Two-button bottom bar layout**

The bottom bar gains a secondary "Discard" button beside the existing primary "Save" button. Layout: `[Discard]  [Save Plan]` with Discard taking roughly 1/3 width and Save taking 2/3, so the primary action stays prominent. This keeps both actions in one thumb zone without adding scroll or hidden gestures.

Alternatives considered:

- _Keep top back button, add bottom discard_: Redundant; two ways to do the same thing causes confusion.
- _Replace Save button area entirely_: Loses the current button's prominence.
- _Ghost/text-only Discard_: A visible outlined button is clearer than a bare text link in a form context.

**`router.back()` for Discard**

Same navigation as the removed back button. No state to reset — navigating away naturally discards in-progress form state.

## Risks / Trade-offs

- [Users may accidentally tap Discard] → Positioning Discard on the left and Save on the right follows the natural left-destructive / right-constructive pattern. No mitigation beyond label clarity needed for this scope.
- [Header feels empty without back button] → The page title ("New Plan" / "Edit Plan") is sufficient orientation; the bottom bar Discard provides the exit. Remove the `ArrowLeft` import if no longer used.
