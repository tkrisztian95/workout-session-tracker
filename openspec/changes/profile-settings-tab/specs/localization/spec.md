## ADDED Requirements

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
