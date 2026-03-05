## Context

The session start screen currently presents "Follow a Plan" and "Free Session" as two options without a clear visual hierarchy. When a user has no plans yet, "Follow a Plan" as an equal or primary option creates friction — the user can't follow a plan that doesn't exist. This design addresses button hierarchy in the no-plans empty state.

## Goals / Non-Goals

**Goals:**
- When no plans exist, render "Start Free Session" as the primary button and "Create New Plan" as a secondary button
- When plans exist, preserve the existing UI behavior (no change)

**Non-Goals:**
- Changing the session start flow itself (pre-fill logic, plan selection, etc.)
- Redesigning the session start screen beyond button hierarchy
- Adding onboarding tours or tooltips

## Decisions

**Decision: Conditional rendering based on plan count**

Check whether any plans exist at the session start screen render time. If the plan list is empty, swap the button roles: primary → "Start Free Session", secondary → "Create New Plan". If plans exist, keep the current layout.

Alternatives considered:
- Always showing "Start Free Session" as primary: Rejected — users with plans likely want to follow a plan, so it would regress their UX.
- A dedicated empty state screen: Overkill for a button order change; a simple conditional is sufficient.

**Decision: Use existing plan data already fetched in the UI**

The UI already loads plans to display them. Re-use that data (e.g., `plans.length === 0`) to drive the conditional — no new API call or state needed.

## Risks / Trade-offs

- [Race condition on plan load] If plans are fetched asynchronously, the button order could flash. → Mitigation: Show a loading state until plan data resolves, then render the correct hierarchy.
- [Simple heuristic] Only checking "no plans" covers the most impactful case. Edge cases (all plans archived, etc.) are out of scope and can be addressed later if needed.
