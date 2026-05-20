# Screenshots

All screenshots are captured at **448×844 (CSS) @ 2× DPR**, in **light theme**, against the [DevSeed](../../src/components/DevSeed.tsx) corpus. The 448 px width matches the `max-w-md` cap on the bottom nav so the nav reaches the screen edges. The dev-seed populates `localStorage` with three plans and ~90 sessions across ~6 months, so the data shown is realistic but reproducible.

To regenerate them, follow the [`capture-screenshots` skill](../../.claude/skills/capture-screenshots/SKILL.md).

## Index

| File | Route | What to see |
| ---- | ----- | ----------- |
| [`01-home.png`](01-home.png) | `/` | Home with greeting, last-workout summary, achievements badge, and the two primary start-workout CTAs. |
| [`02-plans.png`](02-plans.png) | `/plans` | Plans list with an AI-marked plan, follow-count progress bar, muscle chips, completed plans group, and the **AI Suggest Plan** entry point in the header. |
| [`03-history.png`](03-history.png) | `/history` | Weekday strip with completed days highlighted, then date-grouped session cards with rating emoji, duration, and muscle chips. |
| [`04-stats.png`](04-stats.png) | `/stats` | Top of the stats page: time-range chips, summary tiles (sessions, total volume, avg duration, avg weight, frequency, plans done), and the exercise-progression table with trend arrows. |
| [`04b-stats-charts.png`](04b-stats-charts.png) | `/stats` (scrolled) | Lower half of stats: bottom of the progression table, the **Training Balance** radar (Groups / Muscles toggle), and the **Weekly Volume** bar chart. |
| [`05-session-detail.png`](05-session-detail.png) | `/history/[id]` | Session detail header with plan name and duration, plus the **Exercises** tab listing logged sets per exercise. |
| [`05b-session-timeline.png`](05b-session-timeline.png) | `/history/[id]` | **Timeline** tab — chronological per-exercise events with completion timestamps and rest gaps. |
| [`05c-session-vs-plan.png`](05c-session-vs-plan.png) | `/history/[id]` | **vs Plan** tab — planned vs actual sets per exercise, with overdone / on-target / underperformed status pills. |
| [`06-ai-suggest-prefs.png`](06-ai-suggest-prefs.png) | `/plans` → AI modal | AI Plan Suggestion sheet with selected preferences: training focus (Hypertrophy), days per week (4), and fitness goal (Build muscle). |
| [`07-ai-loading.png`](07-ai-loading.png) | `/plans` → AI modal | Loading state while the OpenAI request is in flight. |
| [`08-ai-preview.png`](08-ai-preview.png) | `/plans` → AI modal | Generated plan preview ("4-Day Hypertrophy Split") with per-day exercise counts, a collapsible **WHY THIS PLAN** rationale, plus **Regenerate** and **Use this plan** actions. |
| [`09-session-active.png`](09-session-active.png) | `/` (with `wst_active_session` set) | Plan-based session in progress: header with elapsed timer + remaining/done counts, the focused exercise card with two logged sets (`70 kg × 8`) of four planned, the **Up Next** queue with quick-complete and dismiss actions per exercise, and the bottom **Discard / Finish Session** bar. |

## Notes

- **Light theme** is forced via `localStorage.setItem('wst_theme', 'light')` before reload.
- The **Next.js dev overlay** (bottom-left N badge) is hidden via injected CSS — see the capture skill.
- The plans page screenshot has `aiGenerated: true` set on the first plan to show the **AI** marker. This is a runtime tweak in the browser, not in the seed JSON.
- All screenshots are committed PNGs (~150 KB each). If they get stale after a major UI change, regenerate the affected ones rather than the whole set.
