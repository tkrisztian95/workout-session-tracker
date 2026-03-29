## Context

All user data (plans, sessions, profile) lives in `localStorage` under `wst_*` keys. There is no backend — the app is a client-only Next.js PWA. The profile page uses a collapsible card pattern (`LanguageCard`, `ThemeCard`, `DangerZoneCard`, etc.) making it the natural home for an Export Data card.

## Goals / Non-Goals

**Goals:**

- Let users download all their data as a single JSON file from the Profile page
- Collect data from all `wst_*` localStorage keys into one structured export payload
- Trigger a browser `<a download>` file download with no server involvement

**Non-Goals:**

- CSV export (JSON is more complete; CSV can be a follow-on)
- Selective/partial export (full dump is simpler and more useful for backup/migration)
- Import / restore functionality (out of scope for this change)
- Cloud backup or scheduled exports

## Decisions

### 1. Export format: JSON only

JSON preserves all data types and nested structures without lossy flattening. A single file is simpler than multiple CSVs. Rationale: primary use case is backup/migration, not spreadsheet analysis.

Alternatives considered: CSV per data type — more portable for spreadsheets, but requires multiple files and loses nested exercise data.

### 2. Trigger mechanism: browser anchor download

Construct a `Blob` from the JSON string, create an object URL, click a hidden `<a download="workout-data.json">` element, then revoke the URL. This works without any server and is the standard browser file download pattern.

Alternatives considered: `navigator.share()` — better on mobile but not universally available; can be layered on top later.

### 3. Placement: new `ExportDataCard` in Profile page

Follows the existing card pattern. Inserted above `DangerZoneCard` since export is a safe, non-destructive action. A simple card with a single "Export JSON" button — no expand/collapse needed.

### 4. Data collection: read all storage keys via `storage.ts`

Add a `exportAllData()` helper in `storage.ts` that calls all existing getters and assembles a typed payload. This keeps the export logic co-located with the storage layer and avoids raw `localStorage` iteration.

## Risks / Trade-offs

- **Large datasets slow the UI thread** → Mitigation: localStorage data is small (no binary blobs); JSON serialisation of thousands of sessions is sub-millisecond.
- **Mobile browsers may not honour `<a download>`** → Mitigation: on iOS Safari the file opens in a new tab; the user can use the share sheet. Acceptable for v1.
- **Exported JSON schema will change as the app evolves** → Mitigation: include a `schemaVersion` field in the export payload so future import tooling can handle migrations.
