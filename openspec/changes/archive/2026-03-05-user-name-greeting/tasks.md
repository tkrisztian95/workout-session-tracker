## 1. Storage

- [x] 1.1 Add `userName` key to the `KEYS` constant in `src/lib/storage.ts`
- [x] 1.2 Add `getUserName(): string | null` function to `src/lib/storage.ts`
- [x] 1.3 Add `saveUserName(name: string): void` function to `src/lib/storage.ts`

## 2. Name Entry Modal Component

- [x] 2.1 Create `src/components/UserNameModal.tsx` with a controlled name input and submit button
- [x] 2.2 Disable/prevent submission when the input is empty
- [x] 2.3 On submit, call `saveUserName` and invoke an `onComplete` callback prop

## 3. Home Screen Integration

- [x] 3.1 In `src/app/page.tsx`, add a `useEffect` to read `getUserName()` on mount and store result in state
- [x] 3.2 Conditionally render `<UserNameModal>` when no name is stored
- [x] 3.3 Add personalized greeting heading: "Welcome, {name}!" for first-time users, "Welcome back, {name}!" for returning users
- [x] 3.4 Track whether the name was just set (first visit) vs already stored (returning) to pick the correct greeting variant
