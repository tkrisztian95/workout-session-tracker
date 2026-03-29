## Why

Users have no way to export their workout data, making it impossible to back up their history, migrate to other tools, or share progress with coaches or healthcare providers. Adding data export addresses a common user need and builds trust by giving users ownership of their data.

## What Changes

- Add a new "Export Data" option in the Profile/Settings section
- Allow users to export their full workout history (sessions, exercises, sets, stats) as a JSON or CSV file
- Trigger a file download on the device when export is requested

## Capabilities

### New Capabilities

- `data-export`: Allows users to download their complete workout history and profile data in a portable format (JSON or CSV)

### Modified Capabilities

## Impact

- `profile-settings` UI: new export action entry
- Data layer: read access to all user workout sessions, plans, and profile data
- File system / share API: trigger native file download or share sheet on mobile
