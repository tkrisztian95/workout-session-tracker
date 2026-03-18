'use client';

import { X } from 'lucide-react';
import { useTranslations } from '@/lib/locale-context';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PrivacyPolicyModal({ isOpen, onClose }: PrivacyPolicyModalProps) {
  const t = useTranslations();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-base z-50 flex flex-col">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <h2 className="text-lg font-bold text-foreground">{t.privacy_policy_title}</h2>
        <button
          type="button"
          onClick={onClose}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-elevated text-secondary active:bg-border transition-colors"
          aria-label={t.privacy_policy_close}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-6 space-y-4">
        <ul className="space-y-4">
          <li className="flex gap-3">
            <span className="text-brand mt-0.5 flex-shrink-0">•</span>
            <p className="text-sm text-secondary leading-relaxed">
              All workout data is stored locally in your browser only. Nothing is sent to any
              server.
            </p>
          </li>
          <li className="flex gap-3">
            <span className="text-brand mt-0.5 flex-shrink-0">•</span>
            <p className="text-sm text-secondary leading-relaxed">
              Anonymous usage events are sent to PostHog (EU servers) for product analytics. PostHog
              sets anonymous cookies (prefixed{' '}
              <code className="text-xs bg-elevated px-1 py-0.5 rounded">ph_</code>) to identify
              sessions across page loads. No personal data is included.
            </p>
          </li>
          <li className="flex gap-3">
            <span className="text-brand mt-0.5 flex-shrink-0">•</span>
            <p className="text-sm text-secondary leading-relaxed">
              If you use the AI plan feature with your own API key, your workout history and
              preferences are sent to OpenAI to generate a plan.
            </p>
          </li>
          <li className="flex gap-3">
            <span className="text-brand mt-0.5 flex-shrink-0">•</span>
            <p className="text-sm text-secondary leading-relaxed">
              No account, no server, no personal data is sold or shared.
            </p>
          </li>
        </ul>
      </div>

      <div className="px-5 py-4 border-t border-border">
        <button
          type="button"
          onClick={onClose}
          className="w-full py-3.5 rounded-xl bg-brand text-white text-sm font-bold font-condensed cursor-pointer active:scale-[0.98] transition-transform"
        >
          {t.privacy_policy_close}
        </button>
      </div>
    </div>
  );
}
