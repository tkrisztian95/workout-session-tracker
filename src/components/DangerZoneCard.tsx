'use client';

import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useTranslations } from '@/lib/locale-context';

export default function DangerZoneCard() {
  const t = useTranslations();
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  function handleReset() {
    localStorage.clear();
    window.location.reload();
  }

  return (
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
            <span className="text-foreground text-base font-medium">{t.profile_reset_label}</span>
          </button>
        ) : (
          <div className="p-4 space-y-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-danger flex-shrink-0 mt-0.5" />
              <p className="text-sm text-secondary leading-relaxed">{t.profile_reset_warning}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-3.5 rounded-xl border border-border text-foreground text-sm font-bold font-condensed cursor-pointer active:bg-elevated transition-colors"
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
  );
}
