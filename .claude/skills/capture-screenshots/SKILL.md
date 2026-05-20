---
name: capture-screenshots
description: Capture mobile-viewport screenshots of the workout-sessions-tracker app for the README and the docs. Use when the user wants to regenerate README screenshots, add a new screen to the gallery, or refresh stale visuals after a UI change. Output PNGs go to public/screenshots/.
license: MIT
metadata:
  author: workout-sessions-tracker
  version: '1.0'
---

# Capture screenshots

Capture clean mobile-viewport screenshots of the running app for `public/screenshots/`. The screenshots live in the repo at a stable size (448×844 @ 2× DPR) so the README gallery stays consistent across runs.

## Output contract

- **Viewport:** 448×844 CSS px at 2× DPR, mobile, touch — set via `mcp__chrome-devtools__emulate`, **not** `resize_page` (Chrome window has a hard 500 px minimum width on macOS).
- **Theme:** light. The dark default is shipped, so light must be set explicitly.
- **Dev overlay:** hidden via injected CSS. The Next.js `N` badge in the corner must not appear.
- **Data:** the [DevSeed](../../../src/components/DevSeed.tsx) corpus — three plans and ~90 sessions across ~6 months, populated on first dev load.
- **Files:** PNGs under `public/screenshots/`, named `NN-screen-name.png` (e.g. `05-session-detail.png`). Re-use existing filenames when refreshing a screen so the README links don't break.

## Prerequisites

- Dev server running: `npm run dev` (Turbopack on `http://localhost:3000`).
- Chrome launched with the remote-debugging port so the MCP server can attach:

  ```bash
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
    --remote-debugging-port=9222 \
    --user-data-dir=/tmp/chrome-devtools-mcp-profile \
    >/dev/null 2>&1 &
  ```

  Verify with `curl -s http://localhost:9222/json/version` — should return a JSON `Browser` object. If `chrome-devtools` MCP calls fail with "Could not connect to Chrome", relaunch with the flags above.

- Chrome DevTools MCP tools loaded. The ones you need:
  `new_page`, `navigate_page`, `emulate`, `evaluate_script`, `wait_for`, `take_snapshot`, `click`, `take_screenshot`.

## Reproducible flow

### 1. Open the app and set the viewport

```ts
new_page({ url: 'http://localhost:3000' });
emulate({ viewport: '448x844x2,mobile,touch' });
```

`emulate` sets the viewport via Chrome's DevTools protocol, which bypasses the window's 500 px minimum. `resize_page` does **not** — it will silently clamp to 500.

### 2. Force light theme + hide the dev overlay

The first navigation will likely hit the onboarding gate ("What's your name?") because the seed runs on mount. After it seeds, reload once so the home page renders the seeded state. Then set the theme and inject the CSS:

```ts
evaluate_script({ function: `() => {
  localStorage.setItem('wst_theme', 'light');
  document.documentElement.setAttribute('data-theme', 'light');
}` });

navigate_page({ type: 'reload' });

evaluate_script({ function: `() => {
  const s = document.createElement('style');
  s.textContent = 'nextjs-portal, [data-nextjs-toast], [data-next-mark] { display: none !important; }';
  document.head.appendChild(s);
}` });
```

The CSS injection has to be done **after every navigation** — it's bound to the document, not the browser tab.

### 3. Capture each screen

For each route:

1. `navigate_page({ type: 'url', url: 'http://localhost:3000/...' })`
2. Re-inject the dev-overlay-hide CSS (step 2 above).
3. `wait_for({ text: [...something specific to this screen...] })` — pick text that's unique to the loaded state, not text that exists in nav links or seed cards.
4. `take_screenshot({ filePath: 'public/screenshots/NN-name.png' })`

For screens behind a modal or tab:

- Use `take_snapshot()` to get fresh `uid`s for elements.
- `click({ uid })` to open the modal or switch tabs.
- Wait briefly (1 s `sleep`) for the transition.
- Screenshot.

For long pages where you want a screenshot below the fold, **don't use `window.scrollTo`** — the page's real scroll container is usually an inner `div` (the page wrapper), not the window. Find it dynamically and set its `scrollTop`:

```ts
evaluate_script({ function: `() => {
  const el = [...document.querySelectorAll('div')]
    .find(e => e.scrollHeight > e.clientHeight && e.scrollHeight > 1000);
  el.scrollTop = 950;
}` });
```

## Screens worth capturing

The README's screenshot gallery covers these. Refresh them in this order when doing a full regen so the gallery feels coherent:

| File                          | Route                                       | Capture state                                                |
| ----------------------------- | ------------------------------------------- | ------------------------------------------------------------ |
| `01-home.png`                 | `/`                                         | Seeded user, achievements badge populated                    |
| `02-plans.png`                | `/plans`                                    | First plan marked `aiGenerated: true` (see tip below)        |
| `03-history.png`              | `/history`                                  | Weekday strip + first scroll of session list                 |
| `04-stats.png`                | `/stats`                                    | Top of page: summary + progression table                     |
| `04b-stats-charts.png`        | `/stats` (scrolled ~950 px)                 | Training Balance radar + Weekly Volume bar chart             |
| `05-session-detail.png`       | `/history/seed-session-seed-plan-fb-0`      | Exercises tab (default)                                      |
| `05b-session-timeline.png`    | same, **Timeline** tab                      | Click the Timeline tab via snapshot uid                      |
| `05c-session-vs-plan.png`     | same, **vs Plan** tab                       | Click the vs Plan tab                                        |
| `06-ai-suggest-prefs.png`     | `/plans` → AI Suggest Plan                  | Pick Hypertrophy / 4 days / Build muscle for visual interest |
| `07-ai-loading.png`           | same, after Generate                        | Grab quickly while "Generating your plan…" is on screen      |
| `08-ai-preview.png`           | same, after generation finishes             | The full preview before clicking **Use this plan**           |
| `09-session-active.png`       | `/` after starting a plan-based session     | Click `Follow a Plan` → pick plan → pick day → Start Session, log 1–2 sets, then screenshot. See tip below. |

### Tip: AI marker on the plans page

The seed doesn't mark any plan as AI-generated, but the AI chip on the card is a key product detail. Set it for one plan before reloading:

```ts
evaluate_script({ function: `() => {
  const plans = JSON.parse(localStorage.getItem('wst_plans') || '[]');
  if (plans[0]) plans[0].aiGenerated = true;
  localStorage.setItem('wst_plans', JSON.stringify(plans));
}` });

navigate_page({ type: 'reload' });
```

This is a per-browser-session tweak; the seed JSON on disk is untouched.

### Tip: capturing the active session

The active session is rendered on the home route (`/`) when `localStorage.wst_active_session` is set — there's no separate URL. To capture it:

1. Navigate to `/`, click **Follow a Plan**.
2. Pick a plan (e.g. PPL), pick a day (e.g. Push).
3. Skip the Optional Exercises step or pick none, click **Start Session**.
4. The home route now renders the in-progress UI. Click **Log set** on the focused exercise, accept the default target weight/reps, **Save**. Repeat once or twice so the screenshot shows logged sets instead of empty slots.
5. Screenshot.

Don't `clearActiveSession` / `Discard` after capturing — leaving the session active is harmless and the user can resume from home.

### Tip: AI screens need an OpenAI key

The AI generation screens require the user to paste an OpenAI key in `/profile` → AI Configuration first. The app reads it from `localStorage` (`wst_llm_config`). Without a key, you'll only get the prefs screen — the loading and preview screens will fail. If the user wants to regenerate the AI screenshots, ask them to set the key first.

## Verifying a capture

After each screenshot, `Read` the PNG and confirm:

- No Next.js dev overlay (`N` badge in corner).
- No dark background — base color is `#f8f8f8`-ish.
- Bottom nav reaches both screen edges (no white gap).
- The intended state is visible (modal open, tab selected, scroll position correct).

If any of those are wrong, redo just that screen — don't redo the whole gallery.

## After a UI change

When `data-structure.md`, the muscle taxonomy, or major UI surfaces change:

1. Regenerate only the affected screenshots (the table above maps screen → file).
2. If a route is removed or renamed, update both `README.md` (the gallery grid) and `public/screenshots/README.md` (the index) in the same commit as the deletion.
3. Commit message: `docs: refresh screenshots after <feature>` (or `style:` if purely cosmetic).
