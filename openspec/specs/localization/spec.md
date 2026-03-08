### Requirement: Supported locales

The system SHALL support three locales: English (`en`), Hungarian (`hu`), and German (`de`).

#### Scenario: English is available as a locale

- **WHEN** the locale selection is presented
- **THEN** English SHALL be one of the selectable options

#### Scenario: Hungarian is available as a locale

- **WHEN** the locale selection is presented
- **THEN** Hungarian SHALL be one of the selectable options

#### Scenario: German is available as a locale

- **WHEN** the locale selection is presented
- **THEN** German SHALL be one of the selectable options

### Requirement: Translation dictionary completeness

The system SHALL provide a complete set of translated strings for every supported locale such that no locale has missing or undefined string keys.

#### Scenario: All keys present for Hungarian

- **WHEN** the Hungarian locale is active
- **THEN** every UI string key SHALL resolve to a non-empty Hungarian string

#### Scenario: All keys present for German

- **WHEN** the German locale is active
- **THEN** every UI string key SHALL resolve to a non-empty German string

### Requirement: Locale context availability

The system SHALL expose the active locale and translated strings to all components via a React context so that no component needs to read localStorage directly.

#### Scenario: useTranslations returns strings for active locale

- **WHEN** a component calls `useTranslations()`
- **THEN** it SHALL receive the full translation dictionary for the currently active locale

#### Scenario: Default locale when none is stored

- **WHEN** no locale is found in localStorage
- **THEN** the locale context SHALL default to English (`en`)

### Requirement: Locale persistence

The selected locale SHALL be persisted in localStorage under the key `wst_locale` so it survives page refreshes and browser sessions.

#### Scenario: Locale survives page reload

- **WHEN** the user has selected a locale and reloads the page
- **THEN** the same locale SHALL be active after reload

#### Scenario: Missing locale key defaults to English

- **WHEN** the `wst_locale` key does not exist in localStorage
- **THEN** the app SHALL use English as the active locale

### Requirement: Language selection from profile settings

The profile settings screen SHALL expose a language selector that allows the user to change the active locale at any time after onboarding.

#### Scenario: Language selector shows all supported locales

- **WHEN** the profile settings screen is displayed
- **THEN** English, Magyar, and Deutsch SHALL each appear as selectable options

#### Scenario: Changing locale from profile persists to localStorage

- **WHEN** the user selects a new locale from the profile settings screen
- **THEN** `wst_locale` SHALL be updated in localStorage to the selected locale code

#### Scenario: setLocale from LocaleContext is called on language change

- **WHEN** the user selects a locale on the profile screen
- **THEN** `setLocale` SHALL be called with the new locale so the UI updates immediately without a page reload
