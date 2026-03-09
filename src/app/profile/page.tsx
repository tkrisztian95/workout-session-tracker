'use client';

import { useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Check, AlertTriangle, ChevronDown, Sparkles, Globe } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import { Page, PageHeader, HeadingXL, LabelOverline } from '@/components/ui';
import { useLocale, useTranslations } from '@/lib/locale-context';
import { getUserName, saveUserName, saveLocale, getLlmConfig, saveLlmConfig } from '@/lib/storage';
import { Button, FieldLabel, Input, Select } from '@/components/ui';
import type { Locale } from '@/lib/i18n';

const LOCALES: { code: Locale; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'hu', label: 'Magyar' },
  { code: 'de', label: 'Deutsch' },
];

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export default function ProfilePage() {
  const t = useTranslations();
  const { locale, setLocale } = useLocale();
  const [name, setName] = useState(() => getUserName() ?? '');
  const [nameSaved, setNameSaved] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const savedNameRef = useRef(getUserName() ?? '');

  const [languageOpen, setLanguageOpen] = useState(false);

  const savedLlmConfig = getLlmConfig();
  const [aiApiKey, setAiApiKey] = useState(() => savedLlmConfig?.apiKey ?? '');
  const [aiModel, setAiModel] = useState(() => savedLlmConfig?.model ?? 'gpt-4o-mini');
  const [aiConfigSaved, setAiConfigSaved] = useState(false);
  const searchParams = useSearchParams();
  const [aiConfigOpen, setAiConfigOpen] = useState(() => searchParams.get('expand') === 'ai');

  function handleNameBlur() {
    const trimmed = name.trim();
    if (!trimmed || trimmed === savedNameRef.current) return;
    saveUserName(trimmed);
    savedNameRef.current = trimmed;
    setNameSaved(true);
    setTimeout(() => setNameSaved(false), 2000);
  }

  function handleSelectLocale(next: Locale) {
    setLocale(next);
    saveLocale(next);
    setLanguageOpen(false);
  }

  function handleSaveAiConfig() {
    saveLlmConfig({ provider: 'openai', apiKey: aiApiKey.trim(), model: aiModel });
    setAiConfigSaved(true);
    setTimeout(() => setAiConfigSaved(false), 2000);
  }

  function handleReset() {
    localStorage.clear();
    window.location.reload();
  }

  const initials = getInitials(name || '?');
  const activeLocaleLabel = LOCALES.find((l) => l.code === locale)?.label ?? locale;

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
        <div>
          <div className="bg-surface border border-border rounded-2xl overflow-hidden">
            <button
              onClick={() => setLanguageOpen((o) => !o)}
              className="w-full flex items-center gap-4 px-4 py-4 cursor-pointer active:bg-elevated transition-colors duration-150"
            >
              <div className="w-10 h-10 rounded-xl bg-elevated flex items-center justify-center shrink-0">
                <Globe className="w-5 h-5 text-secondary" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-white text-sm font-semibold leading-tight">
                  {t.profile_language_label}
                </p>
                <p className="text-dim text-xs mt-0.5">{activeLocaleLabel}</p>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-muted transition-transform duration-200 shrink-0 ${languageOpen ? 'rotate-180' : ''}`}
              />
            </button>
            {languageOpen && (
              <div className="border-t border-border divide-y divide-border/60">
                {LOCALES.map(({ code, label }) => {
                  const active = locale === code;
                  return (
                    <button
                      key={code}
                      onClick={() => handleSelectLocale(code)}
                      className={`w-full flex items-center justify-between px-4 py-3.5 transition-colors duration-150 cursor-pointer ${active ? 'bg-brand/10' : 'active:bg-elevated'}`}
                    >
                      <span
                        className={`text-sm font-medium ${active ? 'text-brand' : 'text-white'}`}
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

        {/* ── AI Configuration ── */}
        <div>
          <div className="bg-surface border border-border rounded-2xl overflow-hidden">
            <button
              onClick={() => setAiConfigOpen((o) => !o)}
              className="w-full flex items-center gap-4 px-4 py-4 cursor-pointer active:bg-elevated transition-colors duration-150"
            >
              <div className="w-10 h-10 rounded-xl bg-brand/15 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 text-brand" />
              </div>
              <div className="flex-1 text-left min-w-0">
                {aiApiKey ? (
                  <>
                    <p className="text-white text-sm font-semibold leading-tight">AI Companion</p>
                    <p className="text-dim text-xs mt-0.5 truncate">
                      {aiApiKey.slice(0, 5)}··· · {aiModel}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-white text-sm font-semibold leading-tight">
                      Connect your AI companion
                    </p>
                    <p className="text-dim text-xs mt-0.5">Use your own OpenAI subscription</p>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {aiConfigSaved && (
                  <span className="flex items-center gap-1 text-xs font-semibold text-success">
                    <Check className="w-3 h-3" strokeWidth={3} />
                    Saved
                  </span>
                )}
                <ChevronDown
                  className={`w-4 h-4 text-muted transition-transform duration-200 ${aiConfigOpen ? 'rotate-180' : ''}`}
                />
              </div>
            </button>
            {aiConfigOpen && (
              <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
                <div>
                  <div className="flex items-baseline justify-between mb-1.5">
                    <FieldLabel htmlFor="ai-api-key" className="mb-0">
                      OpenAI API Key
                    </FieldLabel>
                    <a
                      href="https://platform.openai.com/api-keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand text-xs font-medium"
                    >
                      Get API key ↗
                    </a>
                  </div>
                  <Input
                    id="ai-api-key"
                    type="password"
                    value={aiApiKey}
                    onChange={(e) => setAiApiKey(e.target.value)}
                    placeholder="sk-..."
                    autoComplete="off"
                  />
                </div>
                <div>
                  <FieldLabel htmlFor="ai-model">Model</FieldLabel>
                  <Select
                    id="ai-model"
                    value={aiModel}
                    onChange={(e) => setAiModel(e.target.value)}
                  >
                    <option value="gpt-4o-mini">GPT-4o Mini (faster, cheaper)</option>
                    <option value="gpt-4o">GPT-4o (more capable)</option>
                  </Select>
                </div>
                <p className="text-dim text-xs leading-relaxed">
                  Your API key is stored locally on this device.
                </p>
                <Button onClick={handleSaveAiConfig} disabled={!aiApiKey.trim()} className="w-full">
                  Save
                </Button>
              </div>
            )}
          </div>
        </div>

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
