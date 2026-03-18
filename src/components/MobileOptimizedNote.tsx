'use client';

import { useTranslations } from '@/lib/locale-context';

export default function MobileOptimizedNote() {
  const t = useTranslations();

  return (
    <div className="hidden sm:flex items-start gap-2 bg-brand/10 border border-brand/20 rounded-xl px-3 py-2.5">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-4 h-4 mt-0.5 flex-shrink-0 text-brand"
        aria-hidden="true"
      >
        <rect x="5" y="2" width="14" height="20" rx="2" />
        <line x1="12" y1="18" x2="12.01" y2="18" />
      </svg>
      <p className="text-xs text-brand leading-snug">{t.onboarding_mobile_note}</p>
    </div>
  );
}
