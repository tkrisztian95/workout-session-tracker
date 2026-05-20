# Contributing

Thanks for your interest in contributing!

## Getting set up

```bash
npm install
cp .env.example .env.local   # optional
npm run dev
```

See [README.md](README.md) for the available scripts and the environment-variable reference.

## Branching

One change per branch. Name branches with a [Conventional Commits](https://www.conventionalcommits.org/) type prefix and a kebab-case slug:

```
feat/<change-name>
fix/<change-name>
chore/<change-name>
docs/<change-name>
refactor/<change-name>
```

Allowed types: `feat`, `fix`, `chore`, `refactor`, `docs`, `test`, `perf`, `build`, `ci`, `style`.

## Commit style

Subject: `<type>(<scope>)?: <imperative summary>` — under ~72 chars, lowercase first word, no trailing period.

Body (optional, blank line above): explain _why_, wrap at ~72 chars.

Examples:

- `feat(plans): allow shared exercises across all days`
- `fix: drop hardcoded PostHog fallback key`
- `docs: document persisted data structure`

## Feature work: OpenSpec

Non-trivial changes go through the OpenSpec workflow under `openspec/changes/<change-name>/`:

1. `/opsx:propose <change-name>` — generates `proposal.md`, `design.md`, `tasks.md`. Commit those artifacts as the first commit on the branch.
2. `/opsx:apply` — implements the tasks. Commit at the end of each numbered task group.
3. `/opsx:archive` — folds spec deltas into `openspec/specs/` and moves the change under `openspec/changes/archive/`. Commit the archive move on the same branch, before merging the PR.

See [AGENTS.md](AGENTS.md) for the full workflow and tooling notes.

## Code quality

Before opening a PR:

```bash
npm run lint
npm run format:check
npm test
npm run build
```

A pre-commit hook (`husky` + `lint-staged`) runs `prettier --write` and `eslint --fix` on staged files.

## Data-structure changes

If your change touches `localStorage` keys, persisted TypeScript types, the muscle taxonomy, storage migrations, or the export payload — update [docs/data-structure.md](docs/data-structure.md) in the **same commit**. See [AGENTS.md § Data structure docs](AGENTS.md#data-structure-docs) for the full list of triggers.

## Pull requests

- Keep PRs scoped to one OpenSpec change (or one isolated fix).
- Reference the change directory (`openspec/changes/<name>/`) in the PR description when applicable.
- Visual changes: include a before/after screenshot or a short note on how to reproduce.

## Issue & PR labels

The label taxonomy is small on purpose. Apply at least one **type** label and one **area** label to every issue; cross-cutting and workflow labels are optional but useful.

**Type** (default GitHub labels, what kind of work)

| Label              | When to apply                                                                   |
| ------------------ | ------------------------------------------------------------------------------- |
| `bug`              | Existing behavior is broken or surprising.                                      |
| `enhancement`      | New feature, new UI, new AI capability, new export, etc.                        |
| `documentation`    | README, AGENTS.md, OpenSpec specs, code comments — no runtime behavior changes. |
| `question`         | Discussion / clarification, no clear action yet.                                |
| `good first issue` | Small, well-scoped, no deep context needed. Use sparingly so it stays useful.   |
| `help wanted`      | Maintainer is happy to accept a PR from anyone for this.                        |

**Area** (orange, prefixed `area:` — which part of the app the change touches)

| Label           | What's in it                                                               |
| --------------- | -------------------------------------------------------------------------- |
| `area:sessions` | Active session UI, set logging, pause/resume, finish flow                  |
| `area:plans`    | Plan CRUD, plan day editor, plan scheduling, plan list                     |
| `area:history`  | Past sessions list, session detail, timeline, vs-plan comparison           |
| `area:stats`    | Statistics page, progression table, radar / volume charts                  |
| `area:ai`       | AI plan suggestions, exercise swap, import-from-notes, prompt construction |
| `area:profile`  | Profile, theme, language, achievements, AI config card                     |
| `area:storage`  | `localStorage` keys, persisted types, migrations, export/import payload    |

**Cross-cutting** (apply when relevant, even if an area label is already on)

| Label         | When to apply                                                                   |
| ------------- | ------------------------------------------------------------------------------- |
| `a11y`        | Keyboard navigation, screen-reader output, focus order, color contrast          |
| `i18n`        | Translations (en, hu, de), new locale strings, locale-aware formatting          |
| `performance` | Bundle size, render perf, slow interactions, long tasks                         |
| `security`    | XSS, prototype pollution, dependency CVEs, OpenAI key handling                  |
| `privacy`     | What leaves the device — telemetry, third-party scripts, external network calls |

**Workflow** (optional process hints)

| Label        | When to apply                                                                          |
| ------------ | -------------------------------------------------------------------------------------- |
| `needs-spec` | Scope is fuzzy enough that it should go through `/opsx:propose` before implementation. |

**Triage** (default GitHub labels, used to close issues without merging)

`duplicate`, `invalid`, `wontfix`.

**Automation** (don't apply manually)

`dependencies`, `javascript` — set by Dependabot on its own PRs.

### Examples

- A bug where the focused exercise card mis-renders on iPhone SE: `bug`, `area:sessions`.
- A new "rest timer" feature: `enhancement`, `area:sessions`.
- An XSS in the AI import preview: `bug`, `area:ai`, `security`.
- A new Hungarian translation for the stats page: `i18n`, `area:stats`.
- A fuzzy idea like "mark exercises as liked/disliked": `enhancement`, `area:sessions`, `area:ai`, `needs-spec`.

Don't add `priority:` labels — they age badly on a hobby project. Promote things by working on them.
