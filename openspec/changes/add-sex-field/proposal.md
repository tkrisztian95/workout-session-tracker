## Why

Sex is a key biometric for personalizing fitness recommendations and AI-driven workout guidance. The app currently lacks this data, limiting the ability to tailor suggestions to the user's biology.

## What Changes

- New sex selector card on the profile settings screen (Male / Female / Not specified)
- New localStorage key `wst_user_sex` with getter/setter helpers in the storage module
- New translation keys for the sex field label and options in all three locales (en, hu, de)
- Sex value exposed to the AI companion context for personalized suggestions

## Capabilities

### New Capabilities

- `user-sex`: Sex input field on the profile settings screen, persisted in localStorage and readable by the AI companion

### Modified Capabilities

- `profile-settings`: The profile settings screen gains a new sex selector field alongside the existing name and language fields

## Impact

- `src/lib/storage.ts` — new key constant and `getSex` / `saveSex` helpers
- `src/lib/types.ts` — new `Sex` union type (`'male' | 'female'`)
- `src/components/SexCard.tsx` — new profile card component
- `src/app/profile/page.tsx` — mounts the new card
- `src/locales/en.json`, `hu.json`, `de.json` — new translation keys
- `src/lib/ai.ts` — sex value injected into AI prompt context (if applicable)
