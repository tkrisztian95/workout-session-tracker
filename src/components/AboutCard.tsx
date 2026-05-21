'use client';

import { useState } from 'react';
import { BarChart2, Bug, Code2, ExternalLink, Mail, Scale, Shield } from 'lucide-react';
import { useTranslations } from '@/lib/locale-context';
import { getConsentAccepted, saveConsentAccepted, saveConsentDeclined } from '@/lib/storage';
import { initPostHog } from '@/components/PostHogProvider';
import PrivacyPolicyModal from '@/components/PrivacyPolicyModal';

export default function AboutCard() {
  const t = useTranslations();
  const [isPolicyOpen, setIsPolicyOpen] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(() => getConsentAccepted());

  const version = process.env.NEXT_PUBLIC_APP_VERSION ?? '—';

  const handleAnalyticsToggle = () => {
    if (analyticsEnabled) {
      saveConsentDeclined();
      setAnalyticsEnabled(false);
    } else {
      saveConsentAccepted();
      initPostHog();
      setAnalyticsEnabled(true);
    }
  };

  return (
    <>
      <div className="pt-2">
        <p className="text-xs font-semibold text-secondary tracking-widest uppercase mb-2 px-1">
          {t.about_title}
        </p>
        <div className="bg-surface border border-border rounded-2xl overflow-hidden divide-y divide-border/60">
          {/* App name + version row */}
          <div className="flex items-center gap-3 px-4 py-4">
            <div className="flex-1 min-w-0">
              <p className="text-foreground text-sm font-semibold leading-tight">
                Workout Sessions Tracker
              </p>
              <p className="text-dim text-xs mt-0.5">
                {t.about_version} {version}
              </p>
            </div>
          </div>

          {/* Analytics toggle row */}
          <button
            type="button"
            onClick={handleAnalyticsToggle}
            className="w-full flex items-center gap-3 px-4 py-4 active:bg-elevated transition-colors cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-elevated flex items-center justify-center shrink-0">
              <BarChart2 className="w-4 h-4 text-secondary" />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-foreground text-sm font-medium leading-tight">
                {t.analytics_label}
              </p>
              <p className="text-dim text-xs mt-0.5">
                {analyticsEnabled ? t.analytics_enabled : t.analytics_disabled}
              </p>
            </div>
            {/* Toggle switch */}
            <div
              className={`relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0 ${
                analyticsEnabled ? 'bg-brand' : 'bg-border'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                  analyticsEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </div>
          </button>

          {/* Privacy Policy row */}
          <button
            type="button"
            onClick={() => setIsPolicyOpen(true)}
            className="w-full flex items-center gap-3 px-4 py-4 active:bg-elevated transition-colors cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-elevated flex items-center justify-center shrink-0">
              <Shield className="w-4 h-4 text-secondary" />
            </div>
            <p className="flex-1 text-left text-foreground text-sm font-medium">
              {t.about_privacy_policy}
            </p>
          </button>

          {/* Source code row */}
          <a
            href="https://github.com/tkrisztian95/workout-session-tracker"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-4 active:bg-elevated transition-colors cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-elevated flex items-center justify-center shrink-0">
              <Code2 className="w-4 h-4 text-secondary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-foreground text-sm font-medium leading-tight">
                {t.about_source_code}
              </p>
              <p className="text-dim text-xs mt-0.5 truncate">
                github.com/tkrisztian95/workout-session-tracker
              </p>
            </div>
            <ExternalLink className="w-4 h-4 text-muted shrink-0" />
          </a>

          {/* Feedback / Report an issue row */}
          <a
            href="https://github.com/tkrisztian95/workout-session-tracker/issues/new"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-4 active:bg-elevated transition-colors cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-elevated flex items-center justify-center shrink-0">
              <Bug className="w-4 h-4 text-secondary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-foreground text-sm font-medium leading-tight">
                {t.about_feedback}
              </p>
              <p className="text-dim text-xs mt-0.5">{t.about_feedback_subtitle}</p>
            </div>
            <ExternalLink className="w-4 h-4 text-muted shrink-0" />
          </a>

          {/* Contact row */}
          <a
            href="mailto:ktothdev@gmail.com?subject=Workout%20Sessions%20Tracker"
            className="flex items-center gap-3 px-4 py-4 active:bg-elevated transition-colors cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-elevated flex items-center justify-center shrink-0">
              <Mail className="w-4 h-4 text-secondary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-foreground text-sm font-medium leading-tight">{t.about_contact}</p>
              <p className="text-dim text-xs mt-0.5 truncate">
                Krisztian Toth · ktothdev@gmail.com
              </p>
            </div>
            <ExternalLink className="w-4 h-4 text-muted shrink-0" />
          </a>

          {/* License row */}
          <div className="flex items-center gap-3 px-4 py-4">
            <div className="w-10 h-10 rounded-xl bg-elevated flex items-center justify-center shrink-0">
              <Scale className="w-4 h-4 text-secondary" />
            </div>
            <p className="text-foreground text-sm font-medium">{t.about_license}</p>
          </div>
        </div>
      </div>

      <PrivacyPolicyModal isOpen={isPolicyOpen} onClose={() => setIsPolicyOpen(false)} />
    </>
  );
}
