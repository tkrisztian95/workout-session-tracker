## 1. New Plan page (`/plans/new`)

- [ ] 1.1 Remove the `ArrowLeft` back button from the header section in `src/app/plans/new/page.tsx`
- [ ] 1.2 Remove the `ArrowLeft` import from lucide-react if it is no longer used after step 1.1
- [ ] 1.3 Add a "Discard" button to the fixed bottom bar alongside the existing "Save Plan" button, calling `router.back()` on click
- [ ] 1.4 Style the bottom bar with a two-button layout: Discard (outlined, ~1/3 width) on the left, Save Plan (orange filled, ~2/3 width) on the right

## 2. Edit Plan page (`/plans/[id]`)

- [ ] 2.1 Remove the `ArrowLeft` back button from the header section in `src/app/plans/[id]/page.tsx`
- [ ] 2.2 Remove the `ArrowLeft` import from lucide-react if it is no longer used after step 2.1
- [ ] 2.3 Add a "Discard" button to the fixed bottom bar alongside the existing "Save Changes" button, calling `router.back()` on click
- [ ] 2.4 Style the bottom bar with a two-button layout: Discard (outlined, ~1/3 width) on the left, Save Changes (orange filled, ~2/3 width) on the right
