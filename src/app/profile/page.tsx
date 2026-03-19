'use client';

import { useState, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Check, ChevronDown, Pencil, User } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import { Page, PageHeader, HeadingXL } from '@/components/ui';
import { useTranslations } from '@/lib/locale-context';
import { getUserName, saveUserName, getSex, saveSex } from '@/lib/storage';
import LanguageCard from '@/components/LanguageCard';
import ThemeCard from '@/components/ThemeCard';
import AiConfigCard from '@/components/AiConfigCard';
import { getInitials } from '@/utils';
import DangerZoneCard from '@/components/DangerZoneCard';
import AboutCard from '@/components/AboutCard';
import type { Sex } from '@/lib/types';

function ProfilePageInner() {
  const t = useTranslations();
  const searchParams = useSearchParams();
  const expandAi = searchParams.get('expand') === 'ai';
  const [name, setName] = useState(() => getUserName() ?? '');
  const [nameSaved, setNameSaved] = useState(false);
  const savedNameRef = useRef(getUserName() ?? '');
  const [sex, setSex] = useState<Sex | null>(() => getSex());
  const [openCard, setOpenCard] = useState<'sex' | 'language' | 'theme' | 'ai' | null>(
    expandAi ? 'ai' : null,
  );

  function toggleCard(card: 'sex' | 'language' | 'theme' | 'ai') {
    setOpenCard((c) => (c === card ? null : card));
  }

  function handleNameBlur() {
    const trimmed = name.trim();
    if (!trimmed || trimmed === savedNameRef.current) return;
    saveUserName(trimmed);
    savedNameRef.current = trimmed;
    setNameSaved(true);
    setTimeout(() => setNameSaved(false), 2000);
  }

  const initials = getInitials(name || '?');

  return (
    <Page className="pb-24">
      <PageHeader>
        <HeadingXL>{t.profile_title}</HeadingXL>
      </PageHeader>

      <div className="flex-1 px-5 overflow-y-auto space-y-6 pb-4">
        {/* Avatar */}
        <div className="flex justify-center pt-2 pb-2">
          <div className="w-20 h-20 rounded-full bg-brand/20 border-2 border-brand/40 flex items-center justify-center">
            <span className="text-brand font-condensed font-bold text-2xl tracking-wide">
              {initials}
            </span>
          </div>
        </div>

        {/* ── Identity card (name + sex) ── */}
        <div className="bg-surface border border-border rounded-2xl overflow-hidden divide-y divide-border/60">
          {/* Name row */}
          <div className="flex items-center gap-4 px-4 py-4">
            <div className="w-10 h-10 rounded-xl bg-elevated flex items-center justify-center shrink-0">
              <Pencil className="w-4 h-4 text-secondary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-xs font-semibold text-secondary tracking-widest uppercase">
                  {t.profile_name_label}
                </p>
                {nameSaved && (
                  <span className="flex items-center gap-1 text-xs font-semibold text-success">
                    <Check className="w-3 h-3" strokeWidth={3} />
                    {t.profile_name_saved}
                  </span>
                )}
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={handleNameBlur}
                placeholder={t.onboarding_name_placeholder}
                className="w-full bg-transparent text-foreground text-sm mt-0.5 outline-none placeholder:text-dim"
                data-ph-no-capture
              />
            </div>
          </div>
          {/* Sex row — inline expand/collapse */}
          <div data-ph-no-capture>
            <button
              onClick={() => toggleCard('sex')}
              className="w-full flex items-center gap-4 px-4 py-4 cursor-pointer active:bg-elevated transition-colors duration-150"
            >
              <div className="w-10 h-10 rounded-xl bg-elevated flex items-center justify-center shrink-0">
                <User className="w-5 h-5 text-secondary" />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-foreground text-sm font-semibold leading-tight">
                  {t.profile_sex_label}
                </p>
                <p className="text-dim text-xs mt-0.5">
                  {sex === 'male'
                    ? t.profile_sex_male
                    : sex === 'female'
                      ? t.profile_sex_female
                      : t.profile_sex_not_specified}
                </p>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-muted transition-transform duration-200 shrink-0 ${openCard === 'sex' ? 'rotate-180' : ''}`}
              />
            </button>
            {openCard === 'sex' && (
              <div className="border-t border-border divide-y divide-border/60">
                {(
                  [
                    { value: null, label: t.profile_sex_not_specified },
                    { value: 'male' as Sex, label: t.profile_sex_male },
                    { value: 'female' as Sex, label: t.profile_sex_female },
                  ] as { value: Sex | null; label: string }[]
                ).map(({ value, label }) => {
                  const active = sex === value;
                  return (
                    <button
                      key={value ?? 'none'}
                      onClick={() => {
                        setSex(value);
                        saveSex(value);
                        setOpenCard(null);
                      }}
                      className={`w-full flex items-center justify-between px-4 py-3.5 transition-colors duration-150 cursor-pointer ${active ? 'bg-brand/10' : 'active:bg-elevated'}`}
                    >
                      <span
                        className={`text-sm font-medium ${active ? 'text-brand' : 'text-foreground'}`}
                      >
                        {label}
                      </span>
                      {active && (
                        <Check className="w-4 h-4 text-brand flex-shrink-0" strokeWidth={2.5} />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── Language ── */}
        <LanguageCard open={openCard === 'language'} onToggle={() => toggleCard('language')} />

        {/* ── Theme ── */}
        <ThemeCard open={openCard === 'theme'} onToggle={() => toggleCard('theme')} />

        {/* ── AI Configuration ── */}
        <AiConfigCard open={openCard === 'ai'} onToggle={() => toggleCard('ai')} />

        {/* ── Danger zone ── */}
        <DangerZoneCard />

        {/* ── About ── */}
        <AboutCard />
      </div>

      <BottomNav active="profile" />
    </Page>
  );
}

export default function ProfilePage() {
  return (
    <Suspense>
      <ProfilePageInner />
    </Suspense>
  );
}
