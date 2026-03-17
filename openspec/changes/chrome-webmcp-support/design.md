## Context

The app is a client-side Next.js 16 application that stores all data in `localStorage` via `src/lib/storage.ts`. There is no backend — all business logic runs in the browser. The Chrome WebMCP extension implements the Model Context Protocol in the browser, allowing AI agents to call tools exposed by web pages via `window.__webmcp__`.

WebMCP works by the page registering an MCP server object on `window`. The Chrome extension detects this and bridges it to AI agents. This is purely additive: if the extension is not installed, the registration is a no-op.

## Goals / Non-Goals

**Goals:**

- Expose read/write workout data as MCP tools (plans, sessions, exercises)
- Initialize the WebMCP server once at app startup with zero impact on existing UI
- Keep tool handlers thin — reuse existing `storage.ts` functions directly

**Non-Goals:**

- Supporting non-Chrome browsers or non-WebMCP MCP transports
- Exposing AI plan generation (LLM config) via MCP — that's a local key concern
- Building a backend/API layer; all tool execution stays in-browser
- Authentication or authorization of MCP callers (WebMCP handles trust via the browser extension)

## Decisions

### 1. Initialize in a React client component at the root layout

**Decision:** Create `src/components/WebMcpProvider.tsx` (a `"use client"` component with `useEffect`) that registers the MCP server once on mount. Import it in `src/app/layout.tsx`.

**Alternatives considered:**

- _Module-level init in `storage.ts`_: Would run during SSR and fail (`window` undefined). Requires `typeof window` guards everywhere.
- _Next.js middleware or route handler_: MCP needs DOM/`window` access — server contexts don't work.
- _Inline in `layout.tsx`_: Layout is a server component; client logic must be extracted anyway.

**Rationale:** A dedicated provider component is the idiomatic Next.js pattern for client-side singletons. It keeps MCP logic isolated and easy to remove.

---

### 2. Tool surface: read-heavy with targeted writes

**Decision:** Expose these MCP tools:

| Tool                 | Description                                               |
| -------------------- | --------------------------------------------------------- |
| `list_plans`         | Returns all workout plans                                 |
| `get_plan`           | Returns a single plan by ID                               |
| `list_sessions`      | Returns completed workout sessions (with optional limit)  |
| `get_active_session` | Returns the current in-progress session, if any           |
| `get_profile`        | Returns user name and profile settings                    |
| `start_session`      | Creates and persists a new active session from a plan day |
| `log_exercise_set`   | Appends a logged set to an exercise in the active session |
| `complete_session`   | Finalises the active session and moves it to history      |

**Alternatives considered:**

- _Expose every storage function 1:1_: Too granular; AI agents benefit from task-level tools.
- _Read-only first_: Useful, but agents can't actually help users track workouts without write tools.

**Rationale:** Covers the primary agentic use case (an AI coach guiding a workout) without exposing destructive operations like `deletePlan`.

---

### 3. Tool definitions co-located in a single module

**Decision:** Define all tools in `src/lib/mcpTools.ts` as a plain object array (name, description, inputSchema, handler). `WebMcpProvider` imports and registers them.

**Rationale:** Single source of truth; easy to add/remove tools; testable without React.

---

### 4. Use `@webmcp/sdk` package

**Decision:** Add `@webmcp/sdk` as a runtime dependency for the browser-side WebMCP registration API.

**Rationale:** This is the reference implementation. If the package is unavailable, a thin manual `window.__webmcp__` registration can substitute — the provider should fall back gracefully.

## Risks / Trade-offs

- **`window.__webmcp__` API stability** → The Chrome WebMCP spec is early-stage. Mitigation: isolate all WebMCP calls inside `WebMcpProvider` so changes require edits in one file.
- **localStorage read on every tool call** → Reads happen synchronously in the tool handler; no stale-cache problem since we always read fresh from storage.
- **Active session mutations from MCP vs. UI** → If an AI agent calls `log_exercise_set` while the user is on the session screen, React state won't auto-update. Mitigation: session screen should re-read from storage on focus/visibility change (existing behaviour covers this partially).
- **No authorization** → Any extension or agent with WebMCP access can read/write all data. Acceptable for a personal-use local app; document clearly.

## Migration Plan

1. Install `@webmcp/sdk`.
2. Add `src/lib/mcpTools.ts` with tool definitions.
3. Add `src/components/WebMcpProvider.tsx`.
4. Import `WebMcpProvider` into `src/app/layout.tsx` (wrapping children, no UI change).
5. Verify with Chrome WebMCP extension: connect an agent and call `list_plans`.
6. Rollback: remove the `WebMcpProvider` import from layout — zero other changes needed.
