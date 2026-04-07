## 1. Storage & Types

- [x] 1.1 Add `AchievementRecord` interface to `src/lib/types.ts` (`id`, `unlockedAt`, `seen`)
- [x] 1.2 Add `wst_achievements` and `wst_profile_created_at` keys to the `KEYS` constant in `src/lib/storage.ts`
- [x] 1.3 Implement `getProfileCreatedAt(): string | null` and `saveProfileCreatedAt(date: string): void` in `src/lib/storage.ts`
- [x] 1.4 Implement `getAchievements(): AchievementRecord[]` and `saveAchievements(records: AchievementRecord[]): void` in `src/lib/storage.ts`

## 2. Profile Created At — Onboarding Hook

- [x] 2.1 In `src/app/page.tsx`, call `saveProfileCreatedAt(new Date().toISOString())` inside `handleNameComplete` if `getProfileCreatedAt()` returns `null`

## 3. Achievement Definitions

- [x] 3.1 Create `src/lib/achievementDefs.ts` — define `AchievementDef` type (`id`, `track`, `name`, `description`, `icon`, `check`)
- [x] 3.2 Implement all 22 achievement definitions with their `check` functions (sessions count, plans count, rolling 7-day frequency, tenure days, total volume kg)
- [x] 3.3 Export the static `ACHIEVEMENTS` array and the `AchievementTrack` union type

## 4. Achievement Engine

- [x] 4.1 Create `src/lib/achievementEngine.ts` — define `AchievementData` type and `computeUnlockedIds(data: AchievementData): Set<string>` function
- [x] 4.2 Implement `syncAchievements(data: AchievementData, firstRun: boolean): AchievementRecord[]` — compares computed earned set against stored records, appends new ones (with `seen: firstRun` to suppress celebration on first-ever run), and persists the updated list

## 5. useAchievements Hook

- [x] 5.1 Create `src/hooks/useAchievements.ts` — loads sessions, plans, profile date; calls `syncAchievements`; returns `{ newUnlocks: AchievementRecord[], allRecords: AchievementRecord[], markSeen: (id: string) => void }`
- [x] 5.2 Implement `markSeen(id)` to update the `seen` flag in storage and local state

## 6. AchievementBadge Component

- [x] 6.1 Create `src/components/AchievementBadge.tsx` — renders a single badge with icon (from lucide-react), name, description, locked/unlocked state (dimmed when locked), and unlock date when earned

## 7. AchievementCelebration Component

- [x] 7.1 Create `src/components/AchievementCelebration.tsx` — full-screen overlay showing one achievement at a time with icon, name, description, and a dismiss button; accepts a queue of `AchievementRecord[]` and an `onDismiss` callback
- [x] 7.2 Wire `onDismiss` to call `markSeen(id)` and advance to the next item in the queue

## 8. Achievements Page

- [x] 8.1 Create `src/app/profile/achievements/page.tsx` — loads all achievements via `useAchievements`, groups by track, renders `AchievementBadge` for each
- [x] 8.2 Add track section headings (Sessions, Plans, Weekly, Tenure, Volume) with track-level icons
- [x] 8.3 Add a back button that navigates to `/profile`
- [x] 8.4 Set bottom nav active state to `profile`

## 9. Profile Page — Achievements Entry Point

- [x] 9.1 In `src/app/profile/page.tsx`, add an Achievements row (trophy icon, label, earned/total count) that navigates to `/profile/achievements` on tap

## 10. Celebration Trigger — App Open

- [x] 10.1 In `src/app/page.tsx`, after consent is seen and username exists, instantiate `useAchievements` and render `AchievementCelebration` when `newUnlocks.length > 0`

## 11. Celebration Trigger — Session Completion

- [x] 11.1 In `src/app/_views/SessionView.tsx`, after the session rating overlay is dismissed (both rating and skip paths), run the achievement check and render `AchievementCelebration` if new unlocks are found

## 12. i18n Strings

- [x] 12.1 Add translation keys for achievement names, descriptions, track labels, and the celebration overlay UI to all three locale files (`en`, `hu`, `de`) in `src/locales/`
- [x] 12.2 Add translation key for the Achievements row label on the Profile page
