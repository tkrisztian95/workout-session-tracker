## Why

When no workout plan exists, the current UI doesn't clearly guide the user toward starting a free session, which is the most natural first action. Making the free session the primary call-to-action improves onboarding and reduces friction for new users.

## What Changes

- The "Start Free Session" button becomes the primary (prominent) action when no plan exists
- The "Create New Plan" option becomes a secondary action (lower visual weight)
- The button hierarchy only applies when no plans have been created yet

## Capabilities

### New Capabilities

- `no-plan-session-cta`: UI state that surfaces "Start Free Session" as the primary CTA and "Create New Plan" as secondary when no workout plan exists

### Modified Capabilities

- `plan-session-start`: The session start flow now distinguishes between a "no plans" empty state (free session primary) vs. a "has plans" state (plan selection primary)

## Impact

- UI components rendering the session start or home screen
- Conditional rendering logic based on whether any plans exist
- No API or data model changes required
