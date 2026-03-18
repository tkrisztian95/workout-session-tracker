'use client';

import { useState } from 'react';
import { saveUserName, saveLocale } from '@/lib/storage';
import { useLocale, useTranslations } from '@/lib/locale-context';
import type { Locale } from '@/lib/i18n';
import { Button, IconButton, Input, HeadingXL } from '@/components/ui';
import MobileOptimizedNote from '@/components/MobileOptimizedNote';

interface UserNameModalProps {
  onComplete: (name: string) => void;
}

const LANGUAGES: { locale: Locale; label: string; flag: string }[] = [
  { locale: 'en', label: 'English', flag: '🇬🇧' },
  { locale: 'hu', label: 'Magyar', flag: '🇭🇺' },
  { locale: 'de', label: 'Deutsch', flag: '🇩🇪' },
];

export default function UserNameModal({ onComplete }: UserNameModalProps) {
  const [name, setName] = useState('');
  const [selectedLocale, setSelectedLocale] = useState<Locale>('en');
  const [langOpen, setLangOpen] = useState(false);
  const { setLocale } = useLocale();
  const t = useTranslations();

  const currentLang = LANGUAGES.find((l) => l.locale === selectedLocale)!;

  const handleLocaleChange = (locale: Locale) => {
    setSelectedLocale(locale);
    setLocale(locale);
    setLangOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    saveUserName(trimmed);
    saveLocale(selectedLocale);
    onComplete(trimmed);
  };

  return (
    <div
      className="fixed inset-0 bg-base z-50 flex items-center justify-center px-6"
      onClick={() => setLangOpen(false)}
    >
      <div className="w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        {/* Title row with inline language picker */}
        <div className="flex items-start justify-between gap-3 mb-2 relative">
          <HeadingXL className="text-4xl">{t.onboarding_title}</HeadingXL>

          <div className="relative flex-shrink-0">
            <IconButton
              type="button"
              onClick={() => setLangOpen((o) => !o)}
              aria-label="Select language"
              className="border border-border text-2xl"
            >
              {currentLang.flag}
            </IconButton>

            {langOpen && (
              <div className="absolute top-[52px] right-0 bg-surface border border-border rounded-2xl overflow-hidden shadow-xl z-10 min-w-[160px]">
                {LANGUAGES.map(({ locale, label, flag }) => (
                  <button
                    key={locale}
                    type="button"
                    onClick={() => handleLocaleChange(locale)}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 text-sm font-semibold cursor-pointer transition-colors duration-150 ${
                      selectedLocale === locale
                        ? 'text-brand bg-brand/10'
                        : 'text-secondary active:bg-elevated'
                    }`}
                  >
                    <span className="text-xl leading-none">{flag}</span>
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <p className="text-muted text-sm mb-6">{t.onboarding_subtitle}</p>

        <div className="mb-6">
          <MobileOptimizedNote />
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t.onboarding_name_placeholder}
            autoFocus
            className="rounded-2xl py-4 focus:border-brand"
          />

          <Button
            type="submit"
            disabled={!name.trim()}
            className="w-full py-4 text-xl disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {t.onboarding_submit}
          </Button>
        </form>
      </div>
    </div>
  );
}
