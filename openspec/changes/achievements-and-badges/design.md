## Context

The app is a fully client-side Next.js app with no backend. All user data lives in `localStorage` under `wst_*` keys. Sessions (`wst_sessions`) and plans (`wst_plans`) are the primary data sources. There is no server, no database, and no sync — so all achievement logic must run in the browser against local data only.

The onboarding flow in `src/app/page.tsx` gates entry behind `UserNameModal` (sets name) and `ConsentModal` (accepts consent). The `handleNameComplete` callback is the earliest reliable hook for "profile just created."

Existing data exports (`exportAllData`) must eventually include achievement records so users don't lose them when using the export/import feature.

## Goals / Non-Goals

**Goals:**

- Define a static catalog of ~25 achievements across 5 tracks (sessions, plans, weekly frequency, tenure, volume)
- Compute which achievements are earned purely from existing localStorage data
- Store unlock timestamps and celebration-seen state in `wst_achievements`
- Show a celebration overlay for newly unlocked achievements on app open and after session completion
- Provide an Achievements page (at `/profile/achievements`) showing all achievements, locked and unlocked

**Non-Goals:**

- Server-side achievement sync or cross-device support
- Push notifications or scheduled checks
- Social/sharing features
- Achievement points or leaderboards
- Retroactive celebration for achievements earned before this feature ships (they will be shown as unlocked with their computed date, but no celebration overlay)

## Decisions

### 1. Compute eligibility, store timestamps

**Decision**: Achievement _eligibility_ is always computed from raw data (sessions, plans, profile date). Achievement _unlock records_ (`{ id, unlockedAt, seen }`) are stored in `wst_achievements`.

**Rationale**: Computing from data means achievements can never get out of sync with reality — if a user imports session data, they'll automatically earn the right achievements. Storing timestamps means we can show "unlocked X days ago" without re-deriving it every time.

**Alternative considered**: Storing full achievement state (earned: true/false). Rejected because it can desync if sessions are deleted or imported.

---

### 2. Achievement definition structure

Each achievement is a static object:

```ts
interface AchievementDef {
  id: string; // e.g. 'session_10'
  track: AchievementTrack; // 'sessions' | 'plans' | 'weekly' | 'tenure' | 'volume'
  icon: string; // lucide icon name
  check: (data: AchievementData) => boolean;
}

interface AchievementData {
  sessions: WorkoutSession[];
  plans: WorkoutPlan[];
  profileCreatedAt: string | null; // ISO date from wst_profile_created_at
}
```

**Rationale**: Pure functions with no side effects make the engine trivially testable. Each `check` receives a snapshot of all relevant data. No dependency injection or context needed.

---

### 3. Rolling 7-day window for weekly frequency

**Decision**: The weekly frequency track uses a rolling 7-day window (last 7 days from now), not calendar weeks.

**Rationale**: More forgiving for users who train across week boundaries (e.g., Sunday + Monday counts as a 2-day run even if they're in different calendar weeks). Consistent with user preference.

**How computed**: Count distinct calendar days within the past 7 days that have at least one completed session. If that count reaches N, the `weekly_N` achievement is earned.

---

### 4. Celebration overlay: one at a time, queued

**Decision**: The celebration overlay shows one achievement at a time. If multiple are newly unlocked, they queue and show sequentially after dismissal.

**Rationale**: Showing all at once feels overwhelming. Sequential celebrates each unlock individually, reinforcing the reward loop.

**Trigger points**:

1. On app open (in `page.tsx`, after consent is seen and user name exists)
2. After session finish (in `SessionView`, after `handleFinish` runs and the session is saved)

**"Seen" tracking**: A `seen: boolean` flag on each stored `AchievementRecord`. The engine returns all unlocked achievements; the celebration layer filters to `!seen` ones.

---

### 5. Profile created at — fallback for existing users

**Decision**: `wst_profile_created_at` is set once at first name entry (in `handleNameComplete`). For existing users who already have sessions, the key won't exist yet. Fallback: use the earliest session's `startedAt` date.

**Rationale**: Avoids losing tenure progress for existing users. The fallback is conservative (could overestimate tenure) but is the best available proxy.

---

### 6. Achievement tracks and full catalog

| Track        | ID                     | Condition                                          |
| ------------ | ---------------------- | -------------------------------------------------- |
| **sessions** | `session_first`        | ≥ 1 completed session                              |
|              | `session_10`           | ≥ 10 sessions                                      |
|              | `session_25`           | ≥ 25 sessions                                      |
|              | `session_50`           | ≥ 50 sessions                                      |
|              | `session_100`          | ≥ 100 sessions                                     |
|              | `session_250`          | ≥ 250 sessions                                     |
| **plans**    | `plan_first_created`   | ≥ 1 plan created                                   |
|              | `plan_first_completed` | ≥ 1 plan with status 'completed'                   |
|              | `plan_5_created`       | ≥ 5 plans created                                  |
|              | `plan_10_created`      | ≥ 10 plans created                                 |
| **weekly**   | `weekly_2`             | ≥ 2 distinct training days in rolling 7-day window |
|              | `weekly_3`             | ≥ 3 distinct training days in rolling 7-day window |
|              | `weekly_4`             | ≥ 4 distinct training days in rolling 7-day window |
|              | `weekly_5`             | ≥ 5 distinct training days in rolling 7-day window |
| **tenure**   | `tenure_1month`        | Profile created ≥ 30 days ago                      |
|              | `tenure_3months`       | ≥ 90 days ago                                      |
|              | `tenure_6months`       | ≥ 180 days ago                                     |
|              | `tenure_1year`         | ≥ 365 days ago                                     |
|              | `tenure_2years`        | ≥ 730 days ago                                     |
| **volume**   | `volume_1k`            | Total lifted ≥ 1,000 kg                            |
|              | `volume_10k`           | ≥ 10,000 kg                                        |
|              | `volume_100k`          | ≥ 100,000 kg                                       |

---

### 7. Achievements page location

**Decision**: Route at `/profile/achievements` (Next.js App Router nested route under `/profile`).

**Rationale**: Achievements are profile-adjacent content. Entry point is a row/button on the Profile page. Bottom nav stays on `profile` when viewing achievements.

---

### 8. No retroactive celebrations for existing users

**Decision**: On first load after feature ships, existing unlocked achievements are stored with their computed `unlockedAt` but with `seen: true` — so no celebration overlay fires for them.

**Rationale**: Firing 10 celebration overlays for a long-time user on first open would feel jarring. They can discover their achievements naturally on the Achievements page.

## Risks / Trade-offs

- **localStorage cleared** → all achievement records lost. Unavoidable without a backend. Mitigated somewhat by the compute-from-data approach (eligibility is recovered; timestamps are not).
- **Export/import doesn't include achievements yet** → existing `exportAllData` doesn't cover `wst_achievements`. This is acceptable for v1 but should be addressed in a follow-up.
- **Rolling 7-day window resets** → a user who once achieved `weekly_5` will always have it (stored), even if they stop training 5x/week. This is intentional — achievements are permanent milestones.
- **Performance** → The achievement engine iterates all sessions on each check. For users with hundreds of sessions this is still sub-millisecond. No memoization needed.

## Open Questions

- Should the `profile-created-at` date be visible anywhere on the Profile page ("Member since X")? Would be a natural addition given we're storing it. Out of scope for v1 but worth flagging.
- Should the export/import spec be updated in this change to include `wst_achievements`? Deferred to a follow-up to keep scope tight.
