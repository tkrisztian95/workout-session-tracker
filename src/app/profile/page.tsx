'use client';

import { useState, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Check, ChevronDown, Pencil, User } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import { Page, PageHeader, HeadingXL, LabelOverline } from '@/components/ui';
import { useTranslations } from '@/lib/locale-context';
import { getUserName, saveUserName, getSex, saveSex } from '@/lib/storage';
import LanguageCard from '@/components/LanguageCard';
import AiConfigCard from '@/components/AiConfigCard';
import { getInitials } from '@/utils';
import DangerZoneCard from '@/components/DangerZoneCard';
import type { Sex } from '@/lib/types';

function ProfilePageInner() {
  const t = useTranslations();
  const searchParams = useSearchParams();
  const [name, setName] = useState(() => getUserName() ?? '');
  const [nameSaved, setNameSaved] = useState(false);
  const savedNameRef = useRef(getUserName() ?? '');
  const [sex, setSex] = useState<Sex | null>(() => getSex());

  const expandAi = searchParams.get('expand') === 'ai';

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
        <LabelOverline>{t.profile_title}</LabelOverline>
        <HeadingXL className="mt-1">{t.profile_title}</HeadingXL>
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
                className="w-full bg-transparent text-white text-sm mt-0.5 outline-none placeholder:text-dim"
              />
            </div>
          </div>
          {/* Sex row — ghost select overlay */}
          <div className="relative flex items-center gap-4 px-4 py-4">
            <div className="w-10 h-10 rounded-xl bg-elevated flex items-center justify-center shrink-0 pointer-events-none">
              <User className="w-5 h-5 text-secondary" />
            </div>
            <div className="flex-1 min-w-0 pointer-events-none">
              <p className="text-white text-sm font-semibold leading-tight">
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
            <ChevronDown className="w-4 h-4 text-muted shrink-0 pointer-events-none" />
            <select
              id="sex-select"
              value={sex ?? ''}
              onChange={(e) => {
                const v = e.target.value;
                const next = v === '' ? null : (v as Sex);
                setSex(next);
                saveSex(next);
              }}
              className="absolute inset-0 w-full opacity-0 cursor-pointer"
            >
              <option value="">{t.profile_sex_not_specified}</option>
              <option value="male">{t.profile_sex_male}</option>
              <option value="female">{t.profile_sex_female}</option>
            </select>
          </div>
        </div>

        {/* ── Language ── */}
        <LanguageCard />

        {/* ── AI Configuration ── */}
        <AiConfigCard defaultOpen={expandAi} />

        {/* ── Danger zone ── */}
        <DangerZoneCard />
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
