'use client';

import { useState } from 'react';
import { Check, ChevronDown, Sparkles } from 'lucide-react';
import { getLlmConfig, saveLlmConfig } from '@/lib/storage';
import type { LlmProvider } from '@/lib/types';
import { Button, FieldLabel, Input, Select } from '@/components/ui';

interface AiConfigCardProps {
  defaultOpen?: boolean;
  open?: boolean;
  onToggle?: () => void;
}

interface ProviderMeta {
  label: string;
  defaultModel: string;
  models: { value: string; label: string }[];
  keyLabel: string;
  keyUrl: string;
  keyPlaceholder: string;
  tagline: string;
}

const PROVIDERS: Record<LlmProvider, ProviderMeta> = {
  openai: {
    label: 'OpenAI',
    defaultModel: 'gpt-4o-mini',
    models: [
      { value: 'gpt-4o-mini', label: 'GPT-4o Mini (faster, cheaper)' },
      { value: 'gpt-4o', label: 'GPT-4o (more capable)' },
    ],
    keyLabel: 'OpenAI API Key',
    keyUrl: 'https://platform.openai.com/api-keys',
    keyPlaceholder: 'sk-...',
    tagline: 'Use your own OpenAI subscription',
  },
  gemini: {
    label: 'Gemini',
    defaultModel: 'gemini-2.5-flash',
    models: [
      { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash (faster, cheaper)' },
      { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro (more capable)' },
    ],
    keyLabel: 'Gemini API Key',
    keyUrl: 'https://aistudio.google.com/app/apikey',
    keyPlaceholder: 'AIza...',
    tagline: 'Use your own Google Gemini key',
  },
};

export default function AiConfigCard({
  defaultOpen = false,
  open: openProp,
  onToggle,
}: AiConfigCardProps) {
  const savedConfig = getLlmConfig();
  const [provider, setProvider] = useState<LlmProvider>(() => savedConfig?.provider ?? 'openai');
  const [apiKey, setApiKey] = useState(() => savedConfig?.apiKey ?? '');
  const [model, setModel] = useState(() => savedConfig?.model ?? PROVIDERS.openai.defaultModel);
  const [saved, setSaved] = useState(false);
  const [internalOpen, setInternalOpen] = useState(defaultOpen);

  const controlled = openProp !== undefined;
  const open = controlled ? openProp : internalOpen;
  const toggle = controlled ? onToggle! : () => setInternalOpen((o) => !o);

  const meta = PROVIDERS[provider];

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
              <p className="text-foreground text-sm font-semibold leading-tight">AI Companion</p>
              <p className="text-dim text-xs mt-0.5 truncate">
                {meta.label} · {apiKey.slice(0, 5)}··· · {model}
              </p>
            </>
          ) : (
            <>
              <p className="text-foreground text-sm font-semibold leading-tight">
                Connect your AI companion
              </p>
              <p className="text-dim text-xs mt-0.5">Use your own OpenAI or Gemini key</p>
            </>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {saved && (
            <span className="flex items-center gap-1 text-xs font-semibold text-success">
              <Check className="w-3 h-3" strokeWidth={3} />
              Saved
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
            <FieldLabel htmlFor="ai-provider">Provider</FieldLabel>
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
                {meta.keyLabel}
              </FieldLabel>
              <a
                href={meta.keyUrl}
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
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={meta.keyPlaceholder}
              autoComplete="off"
              data-ph-no-capture
            />
          </div>
          <div>
            <FieldLabel htmlFor="ai-model">Model</FieldLabel>
            <Select id="ai-model" value={model} onChange={(e) => setModel(e.target.value)}>
              {meta.models.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </Select>
          </div>
          <p className="text-dim text-xs leading-relaxed">
            Your API key is stored locally on this device.
          </p>
          <Button onClick={handleSave} disabled={!apiKey.trim()} className="w-full">
            Save
          </Button>
        </div>
      )}
    </div>
  );
}
