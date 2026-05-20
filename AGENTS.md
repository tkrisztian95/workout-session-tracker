# Agents

## Feature Development with OpenSpec

Use the OpenSpec (`/opsx`) workflow for any non-trivial feature or change. It keeps a structured paper trail — proposal, design, tasks — under `openspec/changes/<name>/`.

### Typical flow

**1. Explore** (optional) — think through the problem before committing to a direction:

```
/opsx:explore <idea or vague description>
```

Good for surfacing tradeoffs, mapping the codebase, or clarifying scope. No code is written here.

**2. Propose** — create the change and generate all artifacts in one step:

```
/opsx:propose <change-name or description>
```

Produces `proposal.md`, `design.md`, and `tasks.md` under `openspec/changes/<name>/`. Review them before moving on.

**3. Apply** — implement the tasks from the change:

```
/opsx:apply
```

Works through `tasks.md` sequentially, marking tasks complete as it goes. Pauses on blockers or ambiguity.

**4. Archive** — finalize the change once all tasks are done:

```
/opsx:archive
```

Moves the change to `openspec/changes/archive/YYYY-MM-DD-<name>/`.

### Best practices

- **Branch per change with a Conventional Commits prefix.** Every `/opsx:propose` SHALL start by creating a new branch off the current base (usually `main`) named `<type>/<change-name>`, where `<type>` is one of `feat`, `fix`, `chore`, `refactor`, `docs`, `test`, `perf`, `build`, `ci`, `style`. Use the same kebab-case `<change-name>` as the `openspec/changes/<name>/` directory. Examples: `feat/two-tier-muscle-categories`, `fix/session-pause-resume-drift`, `chore/bump-next-16`. One change per branch. If the user is already on a non-`main` branch when `/opsx:propose` runs, ask before branching off it.
- **Commit the proposal artifacts as the first commit on the branch.** Immediately after `/opsx:propose` finishes generating `proposal.md`, `design.md`, `specs/**`, and `tasks.md`, create one clean commit that contains **only** those artifacts under `openspec/changes/<name>/` — no source-code edits, no doc edits outside the change directory. Subject line: `<type>(<change-name>): propose <one-line summary>`. Body lists the new + modified capabilities from `proposal.md`. This makes the proposal reviewable on its own and gives a stable base for the implementation commits that follow.
- **Validate specs before applying.** Run `openspec validate --strict` after propose and before apply to catch JSON/Markdown formatting errors early.
- **Commit after each task section during `/opsx:apply`.** When working through `tasks.md`, create a git commit at the end of every numbered task group (each `## N. <Group Name>` section) — once every checkbox in that group is marked `[x]` and the work is verified. Subject line should reference the section, e.g. `feat(two-tier-muscle-categories): taxonomy + storage migration (tasks 1.x–3.x)`. This keeps the branch reviewable in slices that match the spec, makes bisecting easy, and prevents one giant end-of-change commit. Do **not** commit mid-section unless the user asks — wait until a section is fully done.
- **Archive on the change branch before the PR merges.** Run `/opsx:archive <change-name>` on the same `<type>/<change-name>` branch as the implementation, **before** opening or merging the PR. The archive move (spec deltas folded into `openspec/specs/`, change directory relocated under `openspec/changes/archive/YYYY-MM-DD-<name>/`) lands as the final commit on the same PR rather than as a separate post-merge cleanup. This keeps the spec history aligned with the merge SHA and avoids drift if multiple changes archive against the same capability. Exception: if the change is one of several in flight that all touch the same capability, archive in dependency order so each PR rebases onto the latest archived spec.
- **Commit after archiving.** After `/opsx:archive`, create a git commit that includes both the spec artifacts and any leftover doc edits. Creates a traceable history linking specs to implementation.
- **Split complex tasks.** If a task is too large or ambiguous, break it into smaller steps — propose first, then apply, then archive. Avoids context overload and implementation drift.

---

## Development Workflow

### Visual Checks with Playwright MCP

After implementing a feature, use the Playwright MCP tools to do a quick visual sanity check without leaving Claude Code:

```
# Navigate to the running dev server
mcp__playwright__browser_navigate  →  http://localhost:3000

# Take a screenshot to inspect the UI
mcp__playwright__browser_take_screenshot

# Interact with the page (click, fill, etc.) to exercise the feature
mcp__playwright__browser_click
mcp__playwright__browser_fill_form
```

Typical flow: navigate → screenshot → interact → screenshot again. Use `browser_snapshot` for an accessibility-tree view when you need to inspect element structure rather than visuals. This is useful for verifying AI modal states (loading, preview, rejection) or the session import review flow without manually opening a browser.

### UI/UX Design with `ui-ux-pro-max`

When adding or redesigning UI components, invoke the `/ui-ux-pro-max` skill to get design guidance aligned with the project's stack (Next.js, Tailwind CSS 4, shadcn/ui, mobile-first):

```
/ui-ux-pro-max build a review step for the AI session import flow
```

The skill understands component design, layout, palette, and typography — use it before implementing any non-trivial UI change to avoid rework.

<!-- gitnexus:start -->

# GitNexus — Code Intelligence

This project is indexed by GitNexus as **workout-session-tracker** (5350 symbols, 6912 relationships, 112 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> If any GitNexus tool warns the index is stale, run `npx gitnexus analyze` in terminal first.

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `gitnexus_impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `gitnexus_detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `gitnexus_query({query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `gitnexus_context({name: "symbolName"})`.

## Never Do

- NEVER edit a function, class, or method without first running `gitnexus_impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `gitnexus_rename` which understands the call graph.
- NEVER commit changes without running `gitnexus_detect_changes()` to check affected scope.

## Resources

| Resource                                                 | Use for                                  |
| -------------------------------------------------------- | ---------------------------------------- |
| `gitnexus://repo/workout-session-tracker/context`        | Codebase overview, check index freshness |
| `gitnexus://repo/workout-session-tracker/clusters`       | All functional areas                     |
| `gitnexus://repo/workout-session-tracker/processes`      | All execution flows                      |
| `gitnexus://repo/workout-session-tracker/process/{name}` | Step-by-step execution trace             |

## CLI

| Task                                         | Read this skill file                                        |
| -------------------------------------------- | ----------------------------------------------------------- |
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus/gitnexus-exploring/SKILL.md`       |
| Blast radius / "What breaks if I change X?"  | `.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?"             | `.claude/skills/gitnexus/gitnexus-debugging/SKILL.md`       |
| Rename / extract / split / refactor          | `.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md`     |
| Tools, resources, schema reference           | `.claude/skills/gitnexus/gitnexus-guide/SKILL.md`           |
| Index, status, clean, wiki CLI commands      | `.claude/skills/gitnexus/gitnexus-cli/SKILL.md`             |

<!-- gitnexus:end -->
