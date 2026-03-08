'use client';

import { useState, useEffect } from 'react';
import { X, Sparkles, RefreshCw, Loader2, ChevronDown } from 'lucide-react';
import { getLlmConfig, saveLlmConfig, getPlans, getSessions } from '@/lib/storage';
import { suggestPlan } from '@/lib/ai';
import type { LlmConfig, WorkoutPlan } from '@/lib/types';
import { Button, FieldLabel, Input, Select } from '@/components/ui';

const URL_SPLIT_RE = /(https?:\/\/[^\s]+)/g;

function ErrorMessage({ message }: { message: string }) {
  const parts = message.split(URL_SPLIT_RE);
  return (
    <p className="text-danger text-sm">
      {parts.map((part, i) =>
        part.startsWith('http') ? (
          <a
            key={i}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="underline font-medium"
          >
            Open ↗
          </a>
        ) : (
          part
        ),
      )}
    </p>
  );
}

type View = 'config' | 'loading' | 'preview';

interface AiPlanSuggestionModalProps {
  onApply: (plan: Omit<WorkoutPlan, 'id' | 'status'>) => void;
  onClose: () => void;
}

const MODELS = [
  { value: 'gpt-4o-mini', label: 'GPT-4o Mini (faster, cheaper)' },
  { value: 'gpt-4o', label: 'GPT-4o (more capable)' },
];

export default function AiPlanSuggestionModal({ onApply, onClose }: AiPlanSuggestionModalProps) {
  const savedConfig = getLlmConfig();
  const hasSavedConfig = !!savedConfig?.apiKey;

  const [view, setView] = useState<View>(() => (hasSavedConfig ? 'loading' : 'config'));
  const [apiKey, setApiKey] = useState(() => savedConfig?.apiKey ?? '');
  const [model, setModel] = useState(() => savedConfig?.model ?? 'gpt-4o-mini');
  const [error, setError] = useState('');
  const [suggestedPlan, setSuggestedPlan] = useState<Omit<WorkoutPlan, 'id' | 'status'> | null>(
    null,
  );
  const [reasoning, setReasoning] = useState<string | undefined>(undefined);
  const [autoGenerating, setAutoGenerating] = useState(hasSavedConfig);
  const [reasoningOpen, setReasoningOpen] = useState(false);

  const handleGenerate = async (config?: LlmConfig) => {
    const effectiveKey = config?.apiKey ?? apiKey.trim();
    if (!effectiveKey) {
      setError('API key is required');
      return;
    }
    setError('');
    const effectiveConfig: LlmConfig = config ?? {
      provider: 'openai',
      apiKey: effectiveKey,
      model,
    };
    if (!config) saveLlmConfig(effectiveConfig);
    setView('loading');
    try {
      const plans = getPlans();
      const sessions = getSessions();
      const result = await suggestPlan(effectiveConfig, plans, sessions);
      setSuggestedPlan(result);
      setReasoning(result.reasoning);
      setView('preview');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate plan');
      setView('config');
    } finally {
      setAutoGenerating(false);
    }
  };

  // Auto-generate on mount when saved config exists
  useEffect(() => {
    if (hasSavedConfig && savedConfig) {
      handleGenerate(savedConfig);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUse = () => {
    if (!suggestedPlan) return;
    onApply(suggestedPlan);
  };

  const handleRegenerate = () => {
    setSuggestedPlan(null);
    setReasoning(undefined);
    setView('config');
  };

  const handleChangeSettings = () => {
    setSuggestedPlan(null);
    setReasoning(undefined);
    setAutoGenerating(false);
    setError('');
    setView('config');
  };

  const savedModel = savedConfig?.model ?? model;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-end max-w-md mx-auto">
      <div className="w-full bg-surface rounded-t-3xl px-6 pt-6 pb-10 max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand" />
            <h2 className="font-bold text-lg text-foreground font-condensed">AI Plan Suggestion</h2>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-elevated flex items-center justify-center cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4 text-muted" />
          </button>
        </div>

        {/* Config view */}
        {view === 'config' && (
          <div className="space-y-4">
            <div>
              <div className="flex items-baseline justify-between mb-2">
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
                onChange={(e) => {
                  setApiKey(e.target.value);
                  setError('');
                }}
                placeholder="sk-..."
                autoComplete="off"
              />
            </div>

            <div>
              <FieldLabel htmlFor="ai-model">Model</FieldLabel>
              <Select id="ai-model" value={model} onChange={(e) => setModel(e.target.value)}>
                {MODELS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </Select>
            </div>

            {error && <ErrorMessage message={error} />}

            <p className="text-dim text-xs leading-relaxed">
              Your API key is stored locally on this device. Workout data is sent to OpenAI to
              generate suggestions.
            </p>

            <Button onClick={() => handleGenerate()} className="w-full gap-2 mt-2">
              <Sparkles className="w-4 h-4" />
              Save & Generate
            </Button>
          </div>
        )}

        {/* Loading view */}
        {view === 'loading' && (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <Loader2 className="w-8 h-8 text-brand animate-spin" />
            <p className="text-secondary text-sm">Generating your plan...</p>
            {autoGenerating && (
              <p className="text-dim text-xs">
                Using saved API key · {savedModel}{' '}
                <button
                  onClick={handleChangeSettings}
                  className="text-brand underline cursor-pointer"
                >
                  Change
                </button>
              </p>
            )}
          </div>
        )}

        {/* Preview view */}
        {view === 'preview' && suggestedPlan && (
          <div className="space-y-5">
            <div className="bg-elevated rounded-2xl px-4 py-4 space-y-1">
              <p className="font-bold text-foreground text-base">{suggestedPlan.name}</p>
              <p className="text-muted text-sm">
                {suggestedPlan.days.length}{' '}
                {suggestedPlan.days.length !== 1 ? 'training days' : 'training day'}
              </p>
              {suggestedPlan.days.map((day) => (
                <div key={day.id} className="pt-1">
                  <p className="text-secondary text-sm font-medium">{day.name || 'Day'}</p>
                  <p className="text-dim text-xs">
                    {day.coreExercises.length + day.optionalExercises.length} exercises
                  </p>
                </div>
              ))}
              {suggestedPlan.sharedExercises.length > 0 && (
                <p className="text-dim text-xs pt-1">
                  + {suggestedPlan.sharedExercises.length} shared exercise
                  {suggestedPlan.sharedExercises.length !== 1 ? 's' : ''}
                </p>
              )}
            </div>

            {reasoning && (
              <div className="bg-elevated rounded-2xl overflow-hidden">
                <button
                  onClick={() => setReasoningOpen((o) => !o)}
                  className="w-full flex items-center justify-between px-4 py-3 cursor-pointer"
                >
                  <p className="text-muted text-xs font-medium uppercase tracking-wide">
                    Why this plan
                  </p>
                  <ChevronDown
                    className={`w-4 h-4 text-muted transition-transform duration-200 ${reasoningOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                {reasoningOpen && (
                  <p className="text-secondary text-sm leading-relaxed px-4 pb-4">{reasoning}</p>
                )}
              </div>
            )}

            <div className="flex gap-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleRegenerate}
                className="flex-1 gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Regenerate
              </Button>
              <Button onClick={handleUse} className="flex-[2] gap-2">
                <Sparkles className="w-4 h-4" />
                Use this plan
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
