## Why

The app tracks workouts but provides no sense of progression or reward beyond raw stats. Gamifying training with unlockable achievements gives users meaningful milestones to work toward and celebrates consistency, turning data into motivation.

## What Changes

- Introduce a persistent `wst_profile_created_at` date recorded at onboarding (when the user first sets their name), used as the tenure anchor for time-based achievements.
- Add a new achievement engine that evaluates all defined achievements against the user's sessions, plans, and profile date — computing which are unlocked and when.
- Store unlock records in `localStorage` (`wst_achievements`) with unlock timestamps, and track which have been "celebrated" (shown to the user).
- Surface a celebration overlay when the app opens or a session completes, showing any newly unlocked achievements one at a time.
- Add a dedicated Achievements page (accessible from the Profile page) showing all achievements — both unlocked and locked — organized by track.

## Capabilities

### New Capabilities

- `achievements`: The full achievement system — definitions, engine, storage, unlock logic, and the Achievements page (grid of all badges, locked/unlocked state).
- `achievement-celebration`: The in-app celebration overlay shown when new achievements are unlocked, triggered on app open and after session completion.
- `profile-created-at`: Recording and storing the profile creation timestamp at onboarding for use in tenure-based achievements.

### Modified Capabilities

- `user-profile`: Profile page gains an Achievements entry point (link/button to the new Achievements page).
- `session-completion-feedback`: After a session finishes and rating is submitted, the app checks for newly unlocked achievements and shows the celebration overlay.

## Impact

- **New files**: `src/lib/achievementDefs.ts`, `src/lib/achievementEngine.ts`, `src/hooks/useAchievements.ts`, `src/components/AchievementBadge.tsx`, `src/components/AchievementCelebration.tsx`, `src/app/profile/achievements/page.tsx`
- **Modified files**: `src/lib/storage.ts` (new keys + functions), `src/lib/types.ts` (new `AchievementRecord` type), `src/app/page.tsx` (set profile created at on first name save; trigger celebration check), `src/app/profile/page.tsx` (add achievements entry point), `src/app/_views/SessionView.tsx` (trigger celebration after finish)
- **localStorage keys added**: `wst_profile_created_at`, `wst_achievements`
- **No new dependencies** — achievement icons use existing `lucide-react`; no backend required
