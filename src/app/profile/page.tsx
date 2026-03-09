'use client';

import { useState, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Check } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import { Page, PageHeader, HeadingXL, LabelOverline } from '@/components/ui';
import { useTranslations } from '@/lib/locale-context';
import { getUserName, saveUserName } from '@/lib/storage';
import LanguageCard from '@/components/LanguageCard';
import SexCard from '@/components/SexCard';
import AiConfigCard from '@/components/AiConfigCard';
import { getInitials } from '@/utils';
import DangerZoneCard from '@/components/DangerZoneCard';

function ProfilePageInner() {
  const t = useTranslations();
  const searchParams = useSearchParams();
  const [name, setName] = useState(() => getUserName() ?? '');
  const [nameSaved, setNameSaved] = useState(false);
  const savedNameRef = useRef(getUserName() ?? '');

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

        {/* ── Display Name ── */}
        <div>
          <div className="flex items-center gap-2 mb-2 px-1">
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
          <div className="bg-surface border border-border rounded-2xl overflow-hidden">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={handleNameBlur}
              placeholder={t.onboarding_name_placeholder}
              className="w-full bg-transparent px-4 py-4 text-white text-base outline-none placeholder:text-dim"
            />
          </div>
        </div>

        {/* ── Language ── */}
        <LanguageCard />

        {/* ── Sex ── */}
        <SexCard />

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
