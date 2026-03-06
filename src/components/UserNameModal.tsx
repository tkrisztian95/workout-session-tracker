'use client';

import { useState } from 'react';
import { saveUserName, saveLocale } from '@/lib/storage';
import { useLocale, useTranslations } from '@/lib/locale-context';
import type { Locale } from '@/lib/i18n';

interface UserNameModalProps {
  onComplete: (name: string) => void;
}

const LANGUAGES: { locale: Locale; label: string }[] = [
  { locale: 'en', label: 'English' },
  { locale: 'hu', label: 'Magyar' },
  { locale: 'de', label: 'Deutsch' },
];

export default function UserNameModal({ onComplete }: UserNameModalProps) {
  const [name, setName] = useState('');
  const [selectedLocale, setSelectedLocale] = useState<Locale>('en');
  const { setLocale } = useLocale();
  const t = useTranslations();

  const handleLocaleChange = (locale: Locale) => {
    setSelectedLocale(locale);
    setLocale(locale);
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
    <div className="fixed inset-0 bg-[#111827] z-50 flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1
          className="text-[#F9FAFB] text-4xl font-bold leading-tight tracking-tight mb-2"
          style={{ fontFamily: 'var(--font-barlow-condensed), sans-serif' }}
        >
          {t.onboarding_title}
        </h1>
        <p className="text-[#6B7280] text-sm mb-8">{t.onboarding_subtitle}</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t.onboarding_name_placeholder}
            autoFocus
            className="w-full bg-[#1F2937] border border-[#374151] text-[#F9FAFB] placeholder-[#4B5563] rounded-2xl px-4 py-4 text-base outline-none focus:border-[#F97316] transition-colors"
          />

          {/* Language selector */}
          <div className="flex rounded-2xl border border-[#374151] overflow-hidden">
            {LANGUAGES.map(({ locale, label }) => (
              <button
                key={locale}
                type="button"
                onClick={() => handleLocaleChange(locale)}
                className={`flex-1 py-3 text-sm font-semibold cursor-pointer transition-colors duration-200 ${
                  selectedLocale === locale
                    ? 'bg-[#F97316] text-white'
                    : 'bg-transparent text-[#6B7280] hover:text-[#9CA3AF]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

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
