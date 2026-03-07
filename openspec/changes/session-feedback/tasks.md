## 1. Data Model

- [x] 1.1 Add optional `rating?: 1 | 2 | 3 | 4 | 5` field to `WorkoutSession` in `src/lib/types.ts`

## 2. Emoji Rating Constants

- [x] 2.1 Add a `RATING_EMOJIS` constant (array of 5 emojis in order: 😩 😕 😐 💪 🔥) to a shared lib file (e.g., `src/lib/sessionUtils.ts` or a new `src/lib/ratings.ts`)

## 3. Session Completion Overlay

- [x] 3.1 Remove the `onClick={onDismiss}` background tap handler from `SessionCompleteOverlay`
- [x] 3.2 Add the emoji rating row below the stats grid in `SessionCompleteOverlay`
- [x] 3.3 Add a "Skip" text button below the emoji row
- [x] 3.4 Update the `onDismiss` prop (or add a new `onRate` prop) to accept an optional rating value so the parent can save it before dismissing

## 4. Session Save Logic

- [x] 4.1 Locate where the session is saved on completion (the parent component/page that uses `SessionCompleteOverlay`)
- [x] 4.2 Pass the selected rating (or `undefined` for skip) into the session save call so it is persisted to local storage with the `WorkoutSession` record

## 5. Workout History

- [x] 5.1 In the history page session card, look up the session's `rating` field
- [x] 5.2 Render the corresponding emoji from `RATING_EMOJIS` as a badge on the card when `rating` is defined; render nothing when undefined

## 6. Localization

- [x] 6.1 Add translation keys for the rating prompt label (e.g., `session_rate_prompt`) and the skip action (e.g., `session_rate_skip`) in all locale files under `src/locales/`

## 7. QA

- [x] 7.1 Verify emoji row appears after stats animate in on the completion overlay
- [x] 7.2 Verify tapping an emoji saves the session with the correct `rating` value and dismisses the overlay
- [x] 7.3 Verify tapping Skip saves the session without a `rating` field
- [x] 7.4 Verify rated sessions show the correct emoji badge in history; unrated sessions show no badge
- [x] 7.5 Verify existing sessions in local storage (without `rating`) load without errors
