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
