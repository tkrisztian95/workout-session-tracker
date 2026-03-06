'use client';

import { useState } from 'react';
import { saveUserName, saveLocale } from '@/lib/storage';
import { useLocale, useTranslations } from '@/lib/locale-context';
import type { Locale } from '@/lib/i18n';

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
      className="fixed inset-0 bg-[#111827] z-50 flex items-center justify-center px-6"
      onClick={() => setLangOpen(false)}
    >
      <div className="w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        {/* Title row with inline language picker */}
        <div className="flex items-start justify-between gap-3 mb-2 relative">
          <h1
            className="text-[#F9FAFB] text-4xl font-bold leading-tight tracking-tight"
            style={{ fontFamily: 'var(--font-barlow-condensed), sans-serif' }}
          >
            {t.onboarding_title}
          </h1>

          <div className="relative flex-shrink-0">
            <button
              type="button"
              onClick={() => setLangOpen((o) => !o)}
              aria-label="Select language"
              className="w-11 h-11 rounded-full bg-[#1F2937] border border-[#374151] flex items-center justify-center text-2xl cursor-pointer active:scale-95 transition-transform duration-150"
            >
              {currentLang.flag}
            </button>

            {langOpen && (
              <div className="absolute top-[52px] right-0 bg-[#1F2937] border border-[#374151] rounded-2xl overflow-hidden shadow-xl z-10 min-w-[160px]">
                {LANGUAGES.map(({ locale, label, flag }) => (
                  <button
                    key={locale}
                    type="button"
                    onClick={() => handleLocaleChange(locale)}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 text-sm font-semibold cursor-pointer transition-colors duration-150 ${
                      selectedLocale === locale
                        ? 'text-[#F97316] bg-[#F97316]/10'
                        : 'text-[#9CA3AF] active:bg-[#374151]'
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

        <p className="text-[#6B7280] text-sm mb-6">{t.onboarding_subtitle}</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t.onboarding_name_placeholder}
            autoFocus
            className="w-full bg-[#1F2937] border border-[#374151] text-[#F9FAFB] placeholder-[#4B5563] rounded-2xl px-4 py-4 text-base outline-none focus:border-[#F97316] transition-colors"
          />

          <button
            type="submit"
            disabled={!name.trim()}
            className="w-full bg-[#F97316] text-white font-bold text-xl py-4 rounded-2xl disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition-all duration-150"
            style={{ fontFamily: 'var(--font-barlow-condensed), sans-serif' }}
          >
            {t.onboarding_submit}
          </button>
        </form>
      </div>
    </div>
  );
}
