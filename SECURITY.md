# Security Policy

## Reporting a vulnerability

This is a personal hobby project with no backend — all user data lives in the browser's `localStorage`. The most likely security-relevant areas are:

- Cross-site scripting (XSS) in any code path that renders user-supplied or LLM-generated content.
- Bugs in the OpenAI client that could leak the user's API key beyond the intended request to `api.openai.com`.
- Issues with the data export / import flow that could corrupt persisted state.

If you find an issue you'd rather not disclose publicly, please email **ktothdev@gmail.com** with:

- A short description of the issue.
- Steps to reproduce (or a proof-of-concept).
- Your assessment of impact.

I'll acknowledge within a few days and aim to ship a fix or mitigation as soon as I can. There is no bug-bounty program.

For non-sensitive issues, please open a GitHub issue instead.

## Supported versions

Only the `main` branch is supported. There are no LTS or backport branches.
