'use client';

import { createContext, useContext, useState } from 'react';
import { type Locale, type Translations, translations, defaultLocale, detectLocale } from './i18n';
import { getLocale } from './storage';

interface LocaleContextValue {
  locale: Locale;
  t: Translations;
  setLocale: (locale: Locale) => void;
}

const LocaleContext = createContext<LocaleContextValue>({
  locale: defaultLocale,
  t: translations[defaultLocale],
  setLocale: () => {},
});

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => getLocale() ?? detectLocale());

  const setLocale = (next: Locale) => {
    setLocaleState(next);
  };

  return (
    <LocaleContext.Provider value={{ locale, t: translations[locale], setLocale }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useTranslations(): Translations {
  return useContext(LocaleContext).t;
}

export function useLocale(): LocaleContextValue {
  return useContext(LocaleContext);
}
