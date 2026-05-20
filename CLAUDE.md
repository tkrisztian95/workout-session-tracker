# Claude Code

All agent guidance for this project lives in [AGENTS.md](AGENTS.md) — that is the single source of truth. To avoid drift, this file is intentionally thin: it imports `AGENTS.md` via Claude Code's `@<path>` syntax so the full contents load into Claude's memory automatically.

What's covered in AGENTS.md:

- OpenSpec (`/opsx`) workflow — explore → propose → apply → archive
- Branching and commit style — Conventional Commits, one change per branch, identity rules
- Data structure docs — sync rule for changes to persisted shapes (see [docs/data-structure.md](docs/data-structure.md))
- Visual checks with Playwright MCP
- UI/UX design via the `ui-ux-pro-max` skill
- GitNexus — code intelligence rules and MCP tools

Add or edit guidance in `AGENTS.md`, not here. The only content that belongs in this file is Claude-specific harness wiring (hooks, settings pointers) that doesn't apply to other agents.

@AGENTS.md
