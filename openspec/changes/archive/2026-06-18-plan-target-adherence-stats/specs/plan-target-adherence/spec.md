## ADDED Requirements

### Requirement: Stats page displays a plan-adherence section for plan-linked sessions

The stats page SHALL display a Plan Adherence section that aggregates, over the selected time range, how well the user met their plan targets. The section SHALL consider only completed sessions that are linked to a plan — that is, a session whose `planId` resolves to an existing plan and whose `planDayId` resolves to a day within that plan that has at least one core exercise.

#### Scenario: Section shown when plan-linked sessions exist in range

- **WHEN** the selected time range contains at least one completed plan-linked session that can be scored
- **THEN** the Plan Adherence section is displayed with a summary card and a trend line

#### Scenario: Section hidden when no plan-linked sessions in range

- **WHEN** the selected time range contains no completed plan-linked sessions that can be scored (e.g. only ad-hoc sessions, or the range is empty)
- **THEN** the Plan Adherence section is not rendered at all (no empty placeholder)

#### Scenario: Section respects the active time range

- **WHEN** the user changes the time range selector
- **THEN** the adherence summary and trend update to reflect only plan-linked sessions completed within the new range

---

### Requirement: Per-session adherence score reflects met core targets

For each plan-linked session, the system SHALL compute an adherence score equal to the percentage of that plan day's **core** exercises that met their target. A core exercise SHALL be counted as having met its target when its target classification is on-target or exceeded — using the same classification as the per-session plan comparison (`SessionPlanComparison`), where qualifying sets at the prescribed load determine the outcome. A core exercise with no prescribed sets (a pure duration exercise) SHALL count as met when its matching performed exercise is marked completed.

#### Scenario: Score counts only core exercises

- **WHEN** a session's plan day has core exercises and optional exercises
- **THEN** the adherence score denominator is the number of core exercises only
- **THEN** optional exercises and ad-hoc (extra) exercises do not affect the score

#### Scenario: All core targets met

- **WHEN** every core exercise of the session's plan day met its target
- **THEN** the session's adherence score is 100%

#### Scenario: Some core targets missed

- **WHEN** the session's plan day has 4 core exercises and 3 of them met target
- **THEN** the session's adherence score is 75%

#### Scenario: Classification agrees with the per-session comparison

- **WHEN** an exercise is classified for the adherence score
- **THEN** "met target" corresponds exactly to the on-target / overdone outcome shown for that exercise in the per-session plan comparison

#### Scenario: Plan day with no core exercises is not scored

- **WHEN** a session's resolved plan day has zero core exercises
- **THEN** that session is excluded from the adherence trend and average

---

### Requirement: Plan adherence is presented as an average summary and a trend over time

The Plan Adherence section SHALL show an average-adherence summary value and a trend line of per-session adherence scores ordered by session date within the selected range.

#### Scenario: Average summary reflects the mean of in-range scores

- **WHEN** the section is shown
- **THEN** a summary value displays the rounded mean of the adherence scores of all scored plan-linked sessions in range, expressed as a percentage

#### Scenario: Trend line plots one point per scored session

- **WHEN** the section is shown
- **THEN** the trend line plots one data point per scored plan-linked session, in chronological order, with the y-axis representing adherence percentage from 0 to 100

#### Scenario: Trend direction indicator

- **WHEN** there are at least two scored sessions in range
- **THEN** a trend indicator shows improving when the most recent score exceeds the previous score, declining when it is lower, and flat when equal — using the same up/down/flat visual treatment as the volume-trend indicator

#### Scenario: Chart respects app theme

- **WHEN** the user has selected the dark or light theme
- **THEN** the adherence chart colors, axis labels, and grid lines use theme-appropriate values consistent with the other stats-page charts

---

### Requirement: Adherence section is localized

The Plan Adherence section's labels SHALL be sourced from the locale files for English, German, and Hungarian.

#### Scenario: Labels come from locale strings

- **WHEN** the Plan Adherence section renders in any supported locale
- **THEN** its title, summary label, and trend copy are read from that locale's strings rather than hard-coded English
