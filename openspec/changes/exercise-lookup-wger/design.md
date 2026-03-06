## Context

Exercise names are currently free-text fields in both `AddPlanExerciseModal` and `AddExerciseModal`. The original exercise-lookup plan used a static TypeScript data file bundled with the app. This revision replaces that with live queries against the wger public REST API (`https://wger.de/api/v2/`), which provides a large, community-maintained exercise catalog with category metadata — no data bundling required.

The project is a Next.js/React client-only app storing data in localStorage. There is no backend.

## Goals / Non-Goals

**Goals:**

- Fetch exercise suggestions from wger API on user input (debounced)
- Cache results in-session (per query string) to avoid redundant network calls
- Show exercise name + category in the suggestion dropdown
- Gracefully degrade when offline or when wger is unreachable — input remains usable
- Apply the same autocomplete UX to both `AddPlanExerciseModal` and `AddExerciseModal`

**Non-Goals:**

- Persisting wger data to localStorage or any server
- Saving category metadata onto the stored exercise (name stays a plain string)
- Authentication with wger (public API, no key required)
- Paginating deep into wger results (first page of matches is sufficient)

## Decisions

### 1. Use wger `/api/v2/exercise/` with language + name filter

The wger endpoint `GET /api/v2/exercise/?format=json&language=2&name=<query>` returns exercises filtered by English name substring. This avoids fetching all exercises upfront and keeps payloads small.

Alternatives considered:

- `/api/v2/exerciseinfo/` — richer data but much heavier payload; overkill for a name+category display
- Fetch all exercises once and filter locally — wasteful bundle/memory use; defeats the purpose of using a live API

### 2. In-session Map cache keyed by query string

A module-level `Map<string, CachedResult>` is used to memoize responses within the browser session. If the user types the same prefix again, no network request is made.

Alternatives considered:

- `localStorage` cache: adds complexity and stale-data management; unnecessary for session-scoped suggestions
- No cache: causes excessive network requests on every keystroke

### 3. 300 ms debounce on input

Typing is debounced by 300 ms before firing the API call. This balances responsiveness vs. request volume.

### 4. Cap suggestions at 8 items, fetch `limit=8` from API

Limits UI height and API payload simultaneously. The wger API supports `limit` query param.

### 5. Graceful offline degradation

If the fetch fails (network error, non-200 status), the hook clears suggestions and sets an `error` flag — the input remains functional for free-text entry. No error toast is shown; failure is silent.

### 6. Category lookup via wger category ID → name map

wger exercises return a `category` field as an integer ID. A small static map of wger category IDs to English names (fetched once from `/api/v2/exercisecategory/`) is either hardcoded or fetched at hook init. Given the category list is tiny and stable (< 15 entries), it will be hardcoded as a constant to avoid an extra request.

## Risks / Trade-offs

- **API availability** → wger public instance may be slow or down. Mitigation: debounce + graceful degradation; user can still type freely.
- **CORS** → wger's public API allows cross-origin requests (confirmed). No proxy needed.
- **Rate limiting** → wger applies rate limits on public use. Mitigation: debounce + session cache reduce request volume significantly.
- **Response latency on mobile** → Slower connections may see delayed suggestions. Mitigation: show a subtle loading indicator while fetching.
