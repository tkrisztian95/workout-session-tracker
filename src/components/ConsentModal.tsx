'use client';

import { useState } from 'react';
import { BarChart2, Brain, Database, ShieldCheck } from 'lucide-react';
import { saveConsentAccepted, saveConsentDeclined } from '@/lib/storage';
import { useTranslations } from '@/lib/locale-context';
import { Button, ModalSheet } from '@/components/ui';
import PrivacyPolicyModal from '@/components/PrivacyPolicyModal';
import { initPostHog } from '@/components/PostHogProvider';

interface ConsentModalProps {
  onComplete: () => void;
  variant?: 'page' | 'modal';
}

export default function ConsentModal({ onComplete, variant = 'page' }: ConsentModalProps) {
  const [isPolicyOpen, setIsPolicyOpen] = useState(false);
  const t = useTranslations();

  const handleAccept = () => {
    saveConsentAccepted();
    initPostHog();
    onComplete();
  };

  const handleDecline = () => {
    saveConsentDeclined();
    onComplete();
  };

  const isSheet = variant === 'modal';

  return (
    <>
      <ModalSheet
        icon={<ShieldCheck className="w-5 h-5 text-brand" />}
        title={t.consent_title}
        subtitle={t.consent_subtitle}
        onClose={isSheet ? handleDecline : undefined}
        variant={isSheet ? 'sheet' : 'page'}
        isOpen={true}
      >
        {/* Data disclosure rows */}
        <div className="space-y-2 mb-5">
          <div className="flex items-start gap-3 bg-elevated rounded-2xl px-4 py-3">
            <div className="w-7 h-7 rounded-xl bg-surface flex items-center justify-center shrink-0 mt-0.5">
              <Database className="w-3.5 h-3.5 text-secondary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground leading-tight">
                {t.consent_local_data_title}
              </p>
              <p className="text-xs text-muted mt-0.5 leading-relaxed">
                {t.consent_local_data_body}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-elevated rounded-2xl px-4 py-3">
            <div className="w-7 h-7 rounded-xl bg-surface flex items-center justify-center shrink-0 mt-0.5">
              <BarChart2 className="w-3.5 h-3.5 text-secondary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground leading-tight">
                {t.consent_analytics_title}
              </p>
              <p className="text-xs text-muted mt-0.5 leading-relaxed">
                {t.consent_analytics_body}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-elevated rounded-2xl px-4 py-3">
            <div className="w-7 h-7 rounded-xl bg-surface flex items-center justify-center shrink-0 mt-0.5">
              <Brain className="w-3.5 h-3.5 text-secondary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground leading-tight">
                {t.consent_ai_title}
              </p>
              <p className="text-xs text-muted mt-0.5 leading-relaxed">{t.consent_ai_body}</p>
            </div>
          </div>
        </div>

        {/* Privacy policy link */}
        <button
          type="button"
          onClick={() => setIsPolicyOpen(true)}
          className="text-xs text-brand underline underline-offset-2 text-center cursor-pointer w-full mb-5"
        >
          {t.onboarding_privacy_link}
        </button>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <Button type="button" onClick={handleAccept} className="w-full py-4 text-base">
            {t.consent_allow_button}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={handleDecline}
            className="w-full py-3 text-sm"
          >
            {t.consent_decline_button}
          </Button>
        </div>
      </ModalSheet>

      <PrivacyPolicyModal isOpen={isPolicyOpen} onClose={() => setIsPolicyOpen(false)} />
    </>
  );
}
