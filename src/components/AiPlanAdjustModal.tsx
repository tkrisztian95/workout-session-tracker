'use client';

import { useState } from 'react';
import { Sparkles, RefreshCw, Loader2, ChevronDown, AlertTriangle } from 'lucide-react';
import { usePostHog } from 'posthog-js/react';
import { getLlmConfig, getLocale } from '@/lib/storage';
import { adjustPlan, AiValidationError } from '@/lib/ai';
import type { AiAdjustResult } from '@/lib/ai';
import type { WorkoutPlan } from '@/lib/types';
import { Button, FieldLabel, ModalSheet } from '@/components/ui';
import { useTranslations } from '@/lib/locale-context';

const URL_SPLIT_RE = /(https?:\/\/[^\s]+)/g;

function ErrorMessage({ message, openLinkLabel }: { message: string; openLinkLabel: string }) {
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
            {openLinkLabel}
          </a>
        ) : (
          part
        ),
      )}
    </p>
  );
}

const LOCALE_LANGUAGE: Record<string, string> = {
  en: 'English',
  hu: 'Hungarian',
  de: 'German',
};

// English instructions sent to the LLM, paired by index with the translated
// labels in `t.ai_adjust_preset_options`.
const PRESET_INSTRUCTIONS = [
  'Increase the overall training intensity with heavier weights, more reps, or more sets.',
  'Make the plan easier by reducing weights, reps, or volume.',
  'Add more training volume with additional sets or exercises.',
  'Make each session shorter and more time-efficient.',
  'Introduce more exercise variety while keeping the same training focus.',
  'Make the plan more beginner-friendly with simpler movements and scaling notes.',
];

type View = 'config' | 'loading' | 'preview' | 'rejected';

interface AiPlanAdjustModalProps {
  plan: WorkoutPlan;
  onApply: (result: AiAdjustResult) => void;
  onClose: () => void;
}

export default function AiPlanAdjustModal({ plan, onApply, onClose }: AiPlanAdjustModalProps) {
  const t = useTranslations();
  const posthog = usePostHog();

  const [view, setView] = useState<View>('config');
  const [error, setError] = useState('');
  const [preset, setPreset] = useState<number | null>(null);
  const [custom, setCustom] = useState('');
  const [result, setResult] = useState<AiAdjustResult | null>(null);
  const [reasoningOpen, setReasoningOpen] = useState(false);
  const [validationReason, setValidationReason] = useState('');

  const instruction = [preset !== null ? PRESET_INSTRUCTIONS[preset] : '', custom.trim()]
    .filter(Boolean)
    .join(' ');

  const handleGenerate = async () => {
    const config = getLlmConfig();
    if (!config?.apiKey || !instruction) return;
    setError('');
    setView('loading');
    posthog?.capture('ai_plan_adjust_started', {
      model: config.model,
      has_preset: preset !== null,
    });
    try {
      const locale = getLocale();
      const language = locale ? LOCALE_LANGUAGE[locale] : undefined;
      const adjusted = await adjustPlan(config, plan, instruction, language);
      setResult(adjusted);
      setView('preview');
      posthog?.capture('ai_plan_adjust_succeeded', {
        model: config.model,
        day_count: adjusted.days.length,
      });
    } catch (err) {
      if (err instanceof AiValidationError) {
        setValidationReason(err.reason);
        setView('rejected');
        return;
      }
      setError(err instanceof Error ? err.message : 'Failed to adjust plan');
      setView('config');
    }
  };

  const handleApply = () => {
    if (!result) return;
    posthog?.capture('ai_plan_adjust_applied', { day_count: result.days.length });
    onApply(result);
  };

  const handleRetry = () => {
    setResult(null);
    setValidationReason('');
    setView('config');
  };

  return (
    <ModalSheet
      icon={<Sparkles className="w-5 h-5 text-brand" />}
      title={t.ai_adjust_title}
      subtitle={t.ai_adjust_subtitle}
      onClose={onClose}
    >
      {view === 'config' && (
        <div className="flex-1 min-h-0 overflow-y-auto space-y-4">
          <div>
            <FieldLabel>{t.ai_adjust_presets_label}</FieldLabel>
            <div className="flex flex-wrap gap-2">
              {t.ai_adjust_preset_options.map((label, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setPreset((p) => (p === i ? null : i))}
                  className={`px-3 py-1 rounded-full text-xs font-medium border cursor-pointer transition-colors duration-150 ${
                    preset === i
                      ? 'bg-brand text-white border-brand'
                      : 'bg-elevated text-secondary border-transparent'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <FieldLabel htmlFor="ai-adjust-custom">{t.ai_adjust_custom_label}</FieldLabel>
            <textarea
              id="ai-adjust-custom"
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              placeholder={t.ai_adjust_custom_placeholder}
              rows={3}
              className="w-full rounded-2xl bg-elevated border border-border px-4 py-3 text-sm text-foreground placeholder:text-dim resize-none focus:outline-none focus:border-brand"
            />
          </div>

          {error && <ErrorMessage message={error} openLinkLabel={t.ai_error_open_link} />}

          <Button
            onClick={handleGenerate}
            disabled={!instruction}
            className="w-full gap-2 mt-1 disabled:opacity-40"
          >
            <Sparkles className="w-4 h-4" />
            {t.ai_adjust_generate}
          </Button>
          {!instruction && (
            <p className="text-dim text-xs text-center -mt-1">{t.ai_adjust_empty_hint}</p>
          )}
        </div>
      )}

      {view === 'loading' && (
        <div className="flex flex-col items-center justify-center py-12 gap-4">
          <Loader2 className="w-8 h-8 text-brand animate-spin" />
          <p className="text-secondary text-sm">{t.ai_adjust_generating}</p>
        </div>
      )}

      {view === 'rejected' && (
        <div className="space-y-4">
          <div className="bg-warning/8 rounded-2xl px-4 py-4 flex gap-3">
            <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="text-warning text-sm font-semibold">{t.ai_validation_title}</p>
              <p className="text-warning/80 text-sm leading-relaxed">{validationReason}</p>
            </div>
          </div>
          <Button variant="secondary" onClick={handleRetry} className="w-full gap-2">
            <RefreshCw className="w-4 h-4" />
            {t.ai_regenerate_button}
          </Button>
        </div>
      )}

      {view === 'preview' && result && (
        <div className="flex-1 min-h-0 overflow-y-auto space-y-5">
          <div className="bg-elevated rounded-2xl px-4 py-4 space-y-1">
            <p className="text-muted text-xs font-medium uppercase tracking-wide">
              {t.ai_adjust_changes_title}
            </p>
            <p className="font-bold text-foreground text-base">{result.name}</p>
            <p className="text-muted text-sm">
              {result.days.length}{' '}
              {result.days.length !== 1 ? t.ai_training_days : t.ai_training_day}
            </p>
            {result.days.map((day) => (
              <div key={day.id} className="pt-1">
                <p className="text-secondary text-sm font-medium">{day.name || 'Day'}</p>
                <p className="text-dim text-xs">
                  {day.coreExercises.length + day.optionalExercises.length} {t.ai_exercises}
                </p>
              </div>
            ))}
            {result.sharedExercises.length > 0 && (
              <p className="text-dim text-xs pt-1">
                + {result.sharedExercises.length}{' '}
                {result.sharedExercises.length !== 1 ? t.ai_shared_exercises : t.ai_shared_exercise}
              </p>
            )}
          </div>

          {result.reasoning && (
            <div className="bg-elevated rounded-2xl overflow-hidden">
              <button
                onClick={() => setReasoningOpen((o) => !o)}
                className="w-full flex items-center justify-between px-4 py-3 cursor-pointer"
              >
                <p className="text-muted text-xs font-medium uppercase tracking-wide">
                  {t.ai_why_this_plan}
                </p>
                <ChevronDown
                  className={`w-4 h-4 text-muted transition-transform duration-200 ${reasoningOpen ? 'rotate-180' : ''}`}
                />
              </button>
              {reasoningOpen && (
                <p className="text-secondary text-sm leading-relaxed px-4 pb-4">
                  {result.reasoning}
                </p>
              )}
            </div>
          )}

          <div className="flex gap-3">
            <Button variant="secondary" size="sm" onClick={handleRetry} className="flex-1 gap-2">
              <RefreshCw className="w-4 h-4" />
              {t.ai_regenerate_button}
            </Button>
            <Button onClick={handleApply} className="flex-[2] gap-2">
              <Sparkles className="w-4 h-4" />
              {t.ai_adjust_apply}
            </Button>
          </div>
        </div>
      )}
    </ModalSheet>
  );
}
