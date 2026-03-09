'use client';

import { useState } from 'react';
import { Check, ChevronDown, Sparkles } from 'lucide-react';
import { getLlmConfig, saveLlmConfig } from '@/lib/storage';
import { Button, FieldLabel, Input, Select } from '@/components/ui';

interface AiConfigCardProps {
  defaultOpen?: boolean;
}

export default function AiConfigCard({ defaultOpen = false }: AiConfigCardProps) {
  const savedConfig = getLlmConfig();
  const [apiKey, setApiKey] = useState(() => savedConfig?.apiKey ?? '');
  const [model, setModel] = useState(() => savedConfig?.model ?? 'gpt-4o-mini');
  const [saved, setSaved] = useState(false);
  const [open, setOpen] = useState(defaultOpen);

  function handleSave() {
    saveLlmConfig({ provider: 'openai', apiKey: apiKey.trim(), model });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="bg-surface border border-border rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-4 px-4 py-4 cursor-pointer active:bg-elevated transition-colors duration-150"
      >
        <div className="w-10 h-10 rounded-xl bg-brand/15 flex items-center justify-center shrink-0">
          <Sparkles className="w-5 h-5 text-brand" />
        </div>
        <div className="flex-1 text-left min-w-0">
          {apiKey ? (
            <>
              <p className="text-white text-sm font-semibold leading-tight">AI Companion</p>
              <p className="text-dim text-xs mt-0.5 truncate">
                {apiKey.slice(0, 5)}··· · {model}
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
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
              autoComplete="off"
            />
          </div>
          <div>
            <FieldLabel htmlFor="ai-model">Model</FieldLabel>
            <Select id="ai-model" value={model} onChange={(e) => setModel(e.target.value)}>
              <option value="gpt-4o-mini">GPT-4o Mini (faster, cheaper)</option>
              <option value="gpt-4o">GPT-4o (more capable)</option>
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
