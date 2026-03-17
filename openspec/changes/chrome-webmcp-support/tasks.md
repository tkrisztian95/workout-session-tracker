## 1. Dependencies

- [ ] 1.1 Install `@webmcp/sdk` npm package and add it to `package.json` dependencies

## 2. MCP Tool Definitions

- [ ] 2.1 Create `src/lib/mcpTools.ts` with tool definitions array (name, description, inputSchema, handler) for all 8 tools
- [ ] 2.2 Implement `list_plans` handler — calls `getPlans()` from `storage.ts` and returns the result
- [ ] 2.3 Implement `get_plan` handler — accepts `planId`, returns matching plan or error
- [ ] 2.4 Implement `list_sessions` handler — accepts optional `limit`, returns sorted completed sessions
- [ ] 2.5 Implement `get_active_session` handler — returns the active session or `null`
- [ ] 2.6 Implement `get_profile` handler — returns stored `userName` and other profile fields
- [ ] 2.7 Implement `start_session` handler — accepts `planId` + `planDayId`, creates and persists a new `ActiveSession`, guards against duplicate active sessions
- [ ] 2.8 Implement `log_exercise_set` handler — accepts `exerciseId`, `weight`, `reps`, appends a `LoggedSet` to the active session
- [ ] 2.9 Implement `complete_session` handler — moves active session to completed sessions list and clears the active session key

## 3. WebMCP Provider Component

- [ ] 3.1 Create `src/components/WebMcpProvider.tsx` as a `"use client"` component that registers the MCP server in a `useEffect` on mount
- [ ] 3.2 Import and register all tools from `mcpTools.ts` inside the provider
- [ ] 3.3 Add a silent no-op guard: skip registration if `window.__webmcp__` is undefined

## 4. Layout Integration

- [ ] 4.1 Import `WebMcpProvider` in `src/app/layout.tsx` and wrap the page children with it (no visual change)

## 5. Verification

- [ ] 5.1 Install the Chrome WebMCP extension and verify the app is discoverable as an MCP server
- [ ] 5.2 Call `list_plans` from an AI agent and confirm it returns the correct data from localStorage
- [ ] 5.3 Walk through a full session flow via MCP: `start_session` → `log_exercise_set` → `complete_session` and verify localStorage state matches
- [ ] 5.4 Verify the app loads and functions normally in a browser without the WebMCP extension installed
