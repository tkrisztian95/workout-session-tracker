'use client';

import { useState } from 'react';
import { Check, ChevronDown, Globe } from 'lucide-react';
import { useLocale, useTranslations } from '@/lib/locale-context';
import { saveLocale } from '@/lib/storage';
import type { Locale } from '@/lib/i18n';

const LOCALES: { code: Locale; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'hu', label: 'Magyar' },
  { code: 'de', label: 'Deutsch' },
];

export default function LanguageCard() {
  const t = useTranslations();
  const { locale, setLocale } = useLocale();
  const [open, setOpen] = useState(false);

  function handleSelect(next: Locale) {
    setLocale(next);
    saveLocale(next);
    setOpen(false);
  }

  const activeLabel = LOCALES.find((l) => l.code === locale)?.label ?? locale;

  return (
    <div className="bg-surface border border-border rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-4 px-4 py-4 cursor-pointer active:bg-elevated transition-colors duration-150"
      >
        <div className="w-10 h-10 rounded-xl bg-elevated flex items-center justify-center shrink-0">
          <Globe className="w-5 h-5 text-secondary" />
        </div>
        <div className="flex-1 text-left">
          <p className="text-foreground text-sm font-semibold leading-tight">
            {t.profile_language_label}
          </p>
          <p className="text-dim text-xs mt-0.5">{activeLabel}</p>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-muted transition-transform duration-200 shrink-0 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="border-t border-border divide-y divide-border/60">
          {LOCALES.map(({ code, label }) => {
            const active = locale === code;
            return (
              <button
                key={code}
                onClick={() => handleSelect(code)}
                className={`w-full flex items-center justify-between px-4 py-3.5 transition-colors duration-150 cursor-pointer ${active ? 'bg-brand/10' : 'active:bg-elevated'}`}
              >
                <span
                  className={`text-sm font-medium ${active ? 'text-brand' : 'text-foreground'}`}
                >
                  {label}
                </span>
                {active && <Check className="w-4 h-4 text-brand flex-shrink-0" strokeWidth={2.5} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
