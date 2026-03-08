## 1. Extend the data model

- [ ] 1.1 Add `aiGenerated?: boolean` to the `WorkoutPlan` interface in `src/lib/types.ts`

## 2. Flag AI-generated plans on save

- [ ] 2.1 In `handleAiApply` in `src/app/plans/page.tsx`, set `aiGenerated: true` on the new plan object before calling `savePlan`

## 3. Show AI icon on plan card

- [ ] 3.1 In `PlanCard` (`src/app/plans/page.tsx`), wrap the plan name `<p>` and a conditional `<Sparkles>` icon in a flex row
- [ ] 3.2 Render `<Sparkles className="w-3.5 h-3.5 text-brand flex-shrink-0" />` only when `plan.aiGenerated === true`
- [ ] 3.3 Verify that plan cards without `aiGenerated` (or with `aiGenerated: false`) show no icon
