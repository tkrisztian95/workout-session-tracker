import en from '@/locales/en.json';
import hu from '@/locales/hu.json';
import de from '@/locales/de.json';

export type Locale = 'en' | 'hu' | 'de';

export type Translations = typeof en;

export const defaultLocale: Locale = 'en';

export const translations: Record<Locale, Translations> = { en, hu, de };
