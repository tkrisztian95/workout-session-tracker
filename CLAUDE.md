# Claude Code

This project's agent guidelines live in [AGENTS.md](AGENTS.md). It covers:

- The OpenSpec (`/opsx`) workflow — explore → propose → apply → archive
- Branching and commit conventions (one change per branch, proposal-first commit, per-section commits during apply, archive on the change branch before PR merge)
- Visual checks with Playwright MCP
- UI/UX design guidance via `ui-ux-pro-max`

Read `AGENTS.md` before starting work.

# Data structure docs

Persisted data shapes (localStorage keys, TypeScript types, migrations, export payload) are documented in [docs/data-structure.md](docs/data-structure.md).

**Keep that doc in sync** in the same commit whenever you change any of:

- A `localStorage` key — the `KEYS` const in [src/lib/storage.ts](src/lib/storage.ts).
- A persisted type in [src/lib/types.ts](src/lib/types.ts) (`WorkoutPlan`, `PlanDay`, `PlanExercise`, `Exercise`, `LoggedSet`, `ActiveSession`, `WorkoutSession`, `AchievementRecord`, `LlmConfig`, `Sex`).
- The `Muscle` / `MuscleGroup` taxonomy or legacy-category mapping in [src/lib/muscles.ts](src/lib/muscles.ts).
- `HiddenExerciseKey` or any new persisted shape declared in [src/lib/storage.ts](src/lib/storage.ts).
- A storage migration (any function called from a getter that rewrites old data).
- The `ExportPayload` shape or `schemaVersion` in [src/lib/storage.ts](src/lib/storage.ts).

If you're unsure whether a change qualifies: if it affects what is written to or read from `localStorage`, update the doc.

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
