'use client';

import { useState } from 'react';
import {
  saveUserName,
  saveLocale,
  saveAge,
  saveHeightCm,
  saveWeightKg,
  saveSex,
} from '@/lib/storage';
import { useLocale, useTranslations } from '@/lib/locale-context';
import type { Locale } from '@/lib/i18n';
import type { Sex } from '@/lib/types';
import { Button, IconButton, Input, HeadingXL } from '@/components/ui';
import MobileOptimizedNote from '@/components/MobileOptimizedNote';
import { Check } from 'lucide-react';

interface UserNameModalProps {
  onComplete: (name: string) => void;
}

const LANGUAGES: { locale: Locale; label: string; flag: string }[] = [
  { locale: 'en', label: 'English', flag: '🇬🇧' },
  { locale: 'hu', label: 'Magyar', flag: '🇭🇺' },
  { locale: 'de', label: 'Deutsch', flag: '🇩🇪' },
];

const SEX_OPTIONS: {
  value: Sex | null;
  labelKey: 'profile_sex_not_specified' | 'profile_sex_male' | 'profile_sex_female';
}[] = [
  { value: null, labelKey: 'profile_sex_not_specified' },
  { value: 'male', labelKey: 'profile_sex_male' },
  { value: 'female', labelKey: 'profile_sex_female' },
];

export default function UserNameModal({ onComplete }: UserNameModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState('');
  const [selectedLocale, setSelectedLocale] = useState<Locale>('en');
  const [langOpen, setLangOpen] = useState(false);

  // Body metrics state
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [sex, setSex] = useState<Sex | null>(null);

  const { setLocale } = useLocale();
  const t = useTranslations();

  const currentLang = LANGUAGES.find((l) => l.locale === selectedLocale)!;

  const handleLocaleChange = (locale: Locale) => {
    setSelectedLocale(locale);
    setLocale(locale);
    setLangOpen(false);
  };

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    saveUserName(trimmed);
    saveLocale(selectedLocale);
    setStep(2);
  };

  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    const ageNum = Number(age);
    if (age && Number.isFinite(ageNum) && ageNum >= 10 && ageNum <= 120) {
      saveAge(Math.round(ageNum));
    }
    const heightNum = Number(height);
    if (height && Number.isFinite(heightNum) && heightNum >= 50 && heightNum <= 300) {
      saveHeightCm(Math.round(heightNum));
    }
    const weightNum = Number(weight);
    if (weight && Number.isFinite(weightNum) && weightNum >= 20 && weightNum <= 500) {
      saveWeightKg(Math.round(weightNum * 10) / 10);
    }
    if (sex !== null) {
      saveSex(sex);
    }
    onComplete(name.trim());
  };

  if (step === 2) {
    return (
      <div className="fixed inset-0 bg-base z-50 flex items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <HeadingXL className="text-4xl mb-2">{t.onboarding_body_metrics_title}</HeadingXL>
          <p className="text-muted text-sm mb-6">{t.onboarding_body_metrics_subtitle}</p>

          <form onSubmit={handleStep2Submit} className="space-y-4">
            {/* Age */}
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <label className="text-xs font-semibold text-secondary tracking-widest uppercase block mb-1">
                  {t.profile_age_label}
                </label>
                <Input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder={t.profile_age_placeholder}
                  min={10}
                  max={120}
                  className="rounded-2xl py-3 focus:border-brand"
                />
              </div>
            </div>

            {/* Height */}
            <div>
              <label className="text-xs font-semibold text-secondary tracking-widest uppercase block mb-1">
                {t.profile_height_label}
              </label>
              <div className="relative">
                <Input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder={t.profile_height_placeholder}
                  min={50}
                  max={300}
                  className="rounded-2xl py-3 pr-12 focus:border-brand"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted pointer-events-none">
                  {t.unit_cm}
                </span>
              </div>
            </div>

            {/* Weight */}
            <div>
              <label className="text-xs font-semibold text-secondary tracking-widest uppercase block mb-1">
                {t.profile_weight_label}
              </label>
              <div className="relative">
                <Input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder={t.profile_weight_placeholder}
                  min={20}
                  max={500}
                  step={0.1}
                  className="rounded-2xl py-3 pr-12 focus:border-brand"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted pointer-events-none">
                  {t.unit_kg}
                </span>
              </div>
            </div>

            {/* Sex */}
            <div>
              <label className="text-xs font-semibold text-secondary tracking-widest uppercase block mb-1">
                {t.profile_sex_label}
              </label>
              <div className="bg-surface border border-border rounded-2xl overflow-hidden divide-y divide-border/60">
                {SEX_OPTIONS.map(({ value, labelKey }) => {
                  const active = sex === value;
                  return (
                    <button
                      key={value ?? 'none'}
                      type="button"
                      onClick={() => setSex(value)}
                      className={`w-full flex items-center justify-between px-4 py-3 transition-colors duration-150 cursor-pointer ${active ? 'bg-brand/10' : 'active:bg-elevated'}`}
                    >
                      <span
                        className={`text-sm font-medium ${active ? 'text-brand' : 'text-foreground'}`}
                      >
                        {t[labelKey]}
                      </span>
                      {active && (
                        <Check className="w-4 h-4 text-brand flex-shrink-0" strokeWidth={2.5} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <Button type="submit" className="w-full py-4 text-xl">
              {t.onboarding_continue}
            </Button>
          </form>
        </div>
      </div>
    );
  }

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
        <form onSubmit={handleStep1Submit} className="space-y-4">
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
