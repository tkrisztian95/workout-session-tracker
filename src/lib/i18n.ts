import en from '@/locales/en.json';
import hu from '@/locales/hu.json';
import de from '@/locales/de.json';

export type Locale = 'en' | 'hu' | 'de';

export type Translations = typeof en;

export const defaultLocale: Locale = 'en';

export const translations: Record<Locale, Translations> = { en, hu, de };

const supportedLocales: Locale[] = ['en', 'hu', 'de'];

function isLocale(value: string): value is Locale {
  return (supportedLocales as string[]).includes(value);
}

/**
 * Detect a supported locale from the browser's language preferences.
 * Falls back to `defaultLocale` when none of the user's languages match.
 */
export function detectLocale(): Locale {
  if (typeof navigator === 'undefined') return defaultLocale;

  const candidates = navigator.languages?.length ? navigator.languages : [navigator.language];

  for (const tag of candidates) {
    if (!tag) continue;
    const primary = tag.toLowerCase().split('-')[0];
    if (isLocale(primary)) return primary;
  }

  return defaultLocale;
}
