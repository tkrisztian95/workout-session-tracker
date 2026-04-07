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
