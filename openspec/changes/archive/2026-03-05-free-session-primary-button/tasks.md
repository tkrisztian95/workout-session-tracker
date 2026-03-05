## 1. Update StartScreen component

- [x] 1.1 Add a `hasPlans` prop (boolean) to `StartScreen` in `src/app/page.tsx`
- [x] 1.2 When `hasPlans` is false, render "Start Free Session" with primary button styling (`bg-[#F97316]`) and "Create New Plan" with secondary button styling
- [x] 1.3 When `hasPlans` is true, keep the existing button order and styling unchanged
- [x] 1.4 Wire "Create New Plan" secondary button to navigate to `/plans/new`

## 2. Pass plan data to StartScreen

- [x] 2.1 In `HomePage`, pass `plans.length > 0` as `hasPlans` to `StartScreen`
- [x] 2.2 Ensure `plans` state is populated before rendering `StartScreen` (show nothing or a minimal loading state until `useEffect` resolves)
