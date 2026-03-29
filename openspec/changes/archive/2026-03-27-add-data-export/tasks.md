## 1. Storage Layer

- [x] 1.1 Add `exportAllData()` helper to `src/lib/storage.ts` that calls all existing getters and returns a typed payload with `schemaVersion`, `exportedAt`, `profile`, `plans`, and `sessions` fields

## 2. Export Utility

- [x] 2.1 Create `src/lib/exportData.ts` with a `downloadDataExport()` function that serialises the payload to JSON, creates a `Blob`, and triggers a browser `<a download="workout-data.json">` click

## 3. UI Component

- [x] 3.1 Create `src/components/ExportDataCard.tsx` following the existing card pattern (single button, no expand/collapse)
- [x] 3.2 Add translation keys for the card label and button text to all locale files in `src/locales/`

## 4. Profile Page Integration

- [x] 4.1 Import and render `<ExportDataCard />` in `src/app/profile/page.tsx`, placed above `<DangerZoneCard />`
