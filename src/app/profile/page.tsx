'use client';

import { useState, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Check, AlertTriangle } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import { Page, PageHeader, HeadingXL, LabelOverline } from '@/components/ui';
import { useTranslations } from '@/lib/locale-context';
import { getUserName, saveUserName } from '@/lib/storage';
import LanguageCard from '@/components/LanguageCard';
import AiConfigCard from '@/components/AiConfigCard';

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function ProfilePageInner() {
  const t = useTranslations();
  const searchParams = useSearchParams();
  const [name, setName] = useState(() => getUserName() ?? '');
  const [nameSaved, setNameSaved] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
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

  function handleReset() {
    localStorage.clear();
    window.location.reload();
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

        {/* ── AI Configuration ── */}
        <AiConfigCard defaultOpen={expandAi} />

        {/* ── Danger zone ── */}
        <div className="pt-2">
          <p className="text-xs font-semibold text-secondary tracking-widest uppercase mb-2 px-1">
            {t.profile_reset_label}
          </p>
          <div className="bg-surface border border-border rounded-2xl overflow-hidden">
            {!showResetConfirm ? (
              <button
                onClick={() => setShowResetConfirm(true)}
                className="w-full flex items-center gap-3 px-4 py-4 transition-colors duration-150 cursor-pointer active:bg-danger/10"
              >
                <AlertTriangle className="w-5 h-5 text-danger flex-shrink-0" />
                <span className="text-white text-base font-medium">{t.profile_reset_label}</span>
              </button>
            ) : (
              <div className="p-4 space-y-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-danger flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-secondary leading-relaxed">
                    {t.profile_reset_warning}
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowResetConfirm(false)}
                    className="flex-1 py-3.5 rounded-xl border border-border text-white text-sm font-bold font-condensed cursor-pointer active:bg-elevated transition-colors"
                  >
                    {t.profile_reset_cancel}
                  </button>
                  <button
                    onClick={handleReset}
                    className="flex-1 py-3.5 rounded-xl bg-danger text-white text-sm font-bold font-condensed cursor-pointer active:scale-[0.98] transition-transform"
                  >
                    {t.profile_reset_confirm}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
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
