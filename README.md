# 🏋️ Workout Sessions Tracker

A mobile-first web app for tracking workout sessions and managing personalized fitness plans. All data is stored locally in the browser — no account or backend required.

## ✨ Features

- 🏃 **Workout Sessions** — Start free-form or plan-based sessions with a real-time timer. Log sets, reps, and weights per exercise. Pause and resume anytime. Rate sessions on completion.
- 📋 **Workout Plans** — Create multi-day plans with core and optional exercises. Schedule days by weekday and manage plan status (active/archived).
- 📅 **Session History** — Browse completed sessions grouped by date, view an activity heatmap, and drill into session details.
- 🤖 **AI Plan Suggestions** — Generate personalized workout plans using OpenAI based on your history and profile (requires your own API key).
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
npm run dev
```

The app runs at [http://localhost:3000](http://localhost:3000).

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

- **PostHog** — anonymous usage analytics
- **OpenAI** — only when you explicitly use the AI plan suggestion feature with your own API key

## 📄 License

MIT
