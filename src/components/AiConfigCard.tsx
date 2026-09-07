'use client';

import { useState } from 'react';
import { Check, ChevronDown, Sparkles } from 'lucide-react';
import {
  getLlmConfig,
  saveLlmConfig,
  isAiDebriefEnabled,
  setAiDebriefEnabled,
} from '@/lib/storage';
import type { LlmProvider } from '@/lib/types';
import { Button, FieldLabel, Input, Select } from '@/components/ui';
import { useTranslations } from '@/lib/locale-context';

interface AiConfigCardProps {
  defaultOpen?: boolean;
  open?: boolean;
  onToggle?: () => void;
}

type ModelTier = 'faster' | 'capable';

interface ProviderMeta {
  label: string;
  defaultModel: string;
  models: { value: string; name: string; tier: ModelTier }[];
  keyUrl: string;
  keyPlaceholder: string;
}

const PROVIDERS: Record<LlmProvider, ProviderMeta> = {
  openai: {
    label: 'OpenAI',
    defaultModel: 'gpt-4o-mini',
    models: [
      { value: 'gpt-4o-mini', name: 'GPT-4o Mini', tier: 'faster' },
      { value: 'gpt-4o', name: 'GPT-4o', tier: 'capable' },
    ],
    keyUrl: 'https://platform.openai.com/api-keys',
    keyPlaceholder: 'sk-...',
  },
  gemini: {
    label: 'Gemini',
    defaultModel: 'gemini-2.5-flash',
    models: [
      { value: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', tier: 'faster' },
      { value: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', tier: 'capable' },
    ],
    keyUrl: 'https://aistudio.google.com/app/apikey',
    keyPlaceholder: 'AIza...',
  },
};

export default function AiConfigCard({
  defaultOpen = false,
  open: openProp,
  onToggle,
}: AiConfigCardProps) {
  const t = useTranslations();
  const savedConfig = getLlmConfig();
  const [provider, setProvider] = useState<LlmProvider>(() => savedConfig?.provider ?? 'openai');
  const [apiKey, setApiKey] = useState(() => savedConfig?.apiKey ?? '');
  const [model, setModel] = useState(() => savedConfig?.model ?? PROVIDERS.openai.defaultModel);
  const [saved, setSaved] = useState(false);
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const [debriefOn, setDebriefOn] = useState(() => isAiDebriefEnabled());

  const controlled = openProp !== undefined;
  const open = controlled ? openProp : internalOpen;
  const toggle = controlled ? onToggle! : () => setInternalOpen((o) => !o);

  const meta = PROVIDERS[provider];

  const tierLabel = (tier: ModelTier) =>
    tier === 'faster' ? t.ai_config_model_faster : t.ai_config_model_capable;

  function handleProviderChange(next: LlmProvider) {
    setProvider(next);
    // Reset to the new provider's default so an OpenAI model is never saved
    // under `gemini` (or vice versa).
    setModel(PROVIDERS[next].defaultModel);
  }

  function handleSave() {
    saveLlmConfig({ provider, apiKey: apiKey.trim(), model });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="bg-surface border border-border rounded-2xl overflow-hidden">
      <button
        onClick={toggle}
        className="w-full flex items-center gap-4 px-4 py-4 cursor-pointer active:bg-elevated transition-colors duration-150"
      >
        <div className="w-10 h-10 rounded-xl bg-brand/15 flex items-center justify-center shrink-0">
          <Sparkles className="w-5 h-5 text-brand" />
        </div>
        <div className="flex-1 text-left min-w-0">
          {apiKey ? (
            <>
              <p className="text-foreground text-sm font-semibold leading-tight">
                {t.ai_config_connected_title}
              </p>
              <p className="text-dim text-xs mt-0.5 truncate">
                {meta.label} · {apiKey.slice(0, 5)}··· · {model}
              </p>
            </>
          ) : (
            <>
              <p className="text-foreground text-sm font-semibold leading-tight">
                {t.ai_config_connect_title}
              </p>
              <p className="text-dim text-xs mt-0.5">{t.ai_config_connect_subtitle}</p>
            </>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {saved && (
            <span className="flex items-center gap-1 text-xs font-semibold text-success">
              <Check className="w-3 h-3" strokeWidth={3} />
              {t.ai_config_saved}
            </span>
          )}
          <ChevronDown
            className={`w-4 h-4 text-muted transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          />
        </div>
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
          <div>
            <FieldLabel htmlFor="ai-provider">{t.ai_config_provider_label}</FieldLabel>
            <Select
              id="ai-provider"
              value={provider}
              onChange={(e) => handleProviderChange(e.target.value as LlmProvider)}
            >
              {(Object.keys(PROVIDERS) as LlmProvider[]).map((p) => (
                <option key={p} value={p}>
                  {PROVIDERS[p].label}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <div className="flex items-baseline justify-between mb-1.5">
              <FieldLabel htmlFor="ai-api-key" className="mb-0">
                {t.ai_config_key_label.replace('{provider}', meta.label)}
              </FieldLabel>
              <a
                href={meta.keyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand text-xs font-medium"
              >
                {t.ai_config_get_key}
              </a>
            </div>
            <Input
              id="ai-api-key"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={meta.keyPlaceholder}
              autoComplete="off"
              data-ph-no-capture
            />
          </div>
          <div>
            <FieldLabel htmlFor="ai-model">{t.ai_config_model_label}</FieldLabel>
            <Select id="ai-model" value={model} onChange={(e) => setModel(e.target.value)}>
              {meta.models.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.name} ({tierLabel(m.tier)})
                </option>
              ))}
            </Select>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={debriefOn}
            onClick={() => {
              const next = !debriefOn;
              setDebriefOn(next);
              setAiDebriefEnabled(next);
            }}
            className="flex items-center justify-between gap-3 w-full text-left py-1"
          >
            <span className="min-w-0">
              <span className="block text-sm text-foreground">{t.ai_debrief_toggle_label}</span>
              <span className="block text-dim text-xs leading-relaxed">
                {t.ai_debrief_toggle_hint}
              </span>
            </span>
            <span
              className={`flex-shrink-0 w-10 h-6 rounded-full p-0.5 transition-colors ${
                debriefOn ? 'bg-brand' : 'bg-elevated'
              }`}
            >
              <span
                className={`block w-5 h-5 rounded-full bg-white transition-transform ${
                  debriefOn ? 'translate-x-4' : ''
                }`}
              />
            </span>
          </button>
          <p className="text-dim text-xs leading-relaxed">{t.ai_config_key_storage_note}</p>
          <Button onClick={handleSave} disabled={!apiKey.trim()} className="w-full">
            {t.ai_config_save}
          </Button>
        </div>
      )}
    </div>
  );
}
