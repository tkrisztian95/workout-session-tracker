# 🏋️ Workout Sessions Tracker

A mobile-first web app for tracking workout sessions and managing personalized fitness plans. All data is stored locally in the browser — no account or backend required.

## ✨ Features

- 🏃 **Workout Sessions** — Start free-form or plan-based sessions with a real-time timer. Log sets, reps, and weights per exercise. Pause and resume anytime. Rate sessions on completion.
- 📋 **Workout Plans** — Create multi-day plans with core and optional exercises per day, plus shared exercises that apply to every day. Schedule days by weekday and manage plan status (active/archived).
- 📅 **Session History** — Browse completed sessions grouped by date with an activity heatmap. Filter by date range, drill into session details, or manually log past sessions.
- 📊 **Statistics** — Summary stats (total sessions, volume, average duration, weekly frequency). Exercise weight progression table with trend indicators and expandable line charts. Category distribution radar chart. Volume bar chart with time-range filters (today, week, month, 90 days, all time).
- 🤖 **AI Plan Suggestions** — Generate personalized workout plans using OpenAI based on your history and profile. Review and import the suggestion before saving (requires your own API key).
- ⚙️ **Profile & Settings** — Configure name, theme (light/dark/system), and language (English, Hungarian, German).

## 🛠 Tech Stack

- **Next.js 16** (App Router) + **React 19**
- **TypeScript 5**
- **Tailwind CSS 4**
- **localStorage** for all persistence (no backend)
- **PostHog** for analytics
- **OpenAI** for AI plan generation

## 🚀 Getting Started

```bash
npm install
cp .env.example .env.local   # optional — only needed for analytics / evals
npm run dev
```

The app runs at [http://localhost:3000](http://localhost:3000).

### Environment variables

All env vars are optional — the app works fully offline without any of them.

| Variable                   | Purpose                                                                                                 |
| -------------------------- | ------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_POSTHOG_KEY`  | Enables PostHog analytics. Leave unset to disable PostHog entirely.                                     |
| `NEXT_PUBLIC_POSTHOG_HOST` | PostHog ingest host (defaults to `https://eu.i.posthog.com`).                                           |
| `OPENAI_API_KEY`           | Only used by `npm run eval`. The app itself reads the user's OpenAI key from `localStorage` at runtime. |

See [.env.example](.env.example) for the full template.

## 📜 Scripts

| Command                | Description              |
| ---------------------- | ------------------------ |
| `npm run dev`          | Start development server |
| `npm run build`        | Build for production     |
| `npm start`            | Run production build     |
| `npm run lint`         | Run ESLint               |
| `npm run lint:fix`     | Auto-fix lint issues     |
| `npm run format`       | Format with Prettier     |
| `npm run format:check` | Check formatting         |

## 🔒 Data & Privacy

All user data (plans, sessions, profile) is stored exclusively in `localStorage` under `wst_*` keys. Nothing is sent to any server except:

- **PostHog** — anonymous usage analytics, only when `NEXT_PUBLIC_POSTHOG_KEY` is configured and the user has accepted the consent prompt
- **OpenAI** — only when you explicitly use an AI feature with your own API key (stored in `localStorage`, sent directly from the browser to `api.openai.com`)

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for branching, commit style, and the OpenSpec change workflow used in this repo.

To report a security issue, see [SECURITY.md](SECURITY.md).

## 📄 License

[MIT](LICENSE)
