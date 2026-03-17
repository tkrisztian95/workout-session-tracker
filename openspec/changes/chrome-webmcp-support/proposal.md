## Why

AI agents currently have no programmatic way to interact with the workout tracker app. Adding Chrome WebMCP support exposes the app's core functionality as MCP (Model Context Protocol) tools, enabling AI agents to read workout history, log sessions, manage plans, and track exercises on behalf of users.

## What Changes

- Add a WebMCP server endpoint that exposes app capabilities as MCP tools
- Implement MCP tool handlers for reading and writing workout data
- Register MCP tool definitions covering core user workflows (plans, sessions, exercises)
- Add a Chrome extension manifest or WebMCP bootstrap script to activate the MCP server in the browser context

## Capabilities

### New Capabilities

- `webmcp-server`: WebMCP server bootstrap and tool registration — exposes the app as an MCP server accessible by AI agents via the Chrome WebMCP extension

### Modified Capabilities

<!-- No existing capability requirements are changing — this is purely additive -->

## Impact

- **New dependency**: `@webmcp/sdk` or equivalent WebMCP browser library
- **New files**: WebMCP server init, tool definitions for plans/sessions/exercises
- **Existing API layer**: Tool handlers will reuse existing hooks/fetch logic — no new backend required
- **No breaking changes**: Feature is purely additive; existing UI is unaffected
