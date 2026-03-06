## Why

On mobile, the "Back" button at the top of the plan create and edit pages is hard to reach with one hand (it sits in the top-left corner). All primary actions on mobile-first UIs should live at the bottom of the screen where thumbs naturally rest. The top back button also lacks clarity — on a form page, users need to know their changes will be discarded, not just "going back".

## What Changes

- Remove the `ArrowLeft` / "Back" button from the header on the New Plan page (`/plans/new`)
- Remove the `ArrowLeft` / "Back" button from the header on the Edit Plan page (`/plans/[id]`)
- Add a "Discard" button in the fixed bottom bar alongside the existing "Save" button on both pages
- The Discard button navigates back without saving (same behavior as the current back button)

## Capabilities

### New Capabilities

- `plan-form-discard-action`: A bottom-bar discard action for the plan create and edit forms that navigates away without saving changes

### Modified Capabilities

- `workout-plans`: The plan form UX now uses bottom-bar navigation instead of a top back button

## Impact

- `src/app/plans/new/page.tsx` — remove top back button, add Discard button to bottom bar
- `src/app/plans/[id]/page.tsx` — remove top back button, add Discard button to bottom bar
- No data model or API changes
- No new dependencies
