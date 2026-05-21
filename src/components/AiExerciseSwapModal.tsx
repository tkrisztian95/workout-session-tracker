'use client';

import { useState } from 'react';
import { Sparkles, RefreshCw, Loader2, ChevronDown, AlertTriangle, ArrowRight } from 'lucide-react';
import { usePostHog } from 'posthog-js/react';
import { getLlmConfig } from '@/lib/storage';
import { swapExercise, AiValidationError, buildAiContext } from '@/lib/ai';
import type { PlanExercise, WorkoutPlan } from '@/lib/types';
import { formatExerciseDetail } from '@/lib/sessionUtils';
import { Button, FieldLabel, ModalSheet } from '@/components/ui';
import MuscleBadge from '@/components/MuscleBadge';
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

function ExerciseSummary({ ex }: { ex: PlanExercise }) {
  return (
    <div className="bg-base border border-border rounded-xl px-3 py-2.5">
      <div className="flex items-center gap-2">
        <p className="text-foreground text-sm font-medium truncate">{ex.name}</p>
        {ex.muscle && <MuscleBadge muscle={ex.muscle} />}
      </div>
      <p className="text-brand text-xs mt-0.5">{formatExerciseDetail(ex)}</p>
      {ex.scalingNote && <p className="text-muted text-xs mt-0.5">{ex.scalingNote}</p>}
    </div>
  );
}

type View = 'config' | 'loading' | 'preview' | 'rejected';

interface AiExerciseSwapModalProps {
  plan: WorkoutPlan;
  exercise: PlanExercise;
  dayName: string | null;
  onApply: (exercise: PlanExercise) => void;
  onClose: () => void;
}

export default function AiExerciseSwapModal({
  plan,
  exercise,
  dayName,
  onApply,
  onClose,
}: AiExerciseSwapModalProps) {
  const t = useTranslations();
  const posthog = usePostHog();

  const [view, setView] = useState<View>('config');
  const [error, setError] = useState('');
  const [custom, setCustom] = useState('');
  const [suggestion, setSuggestion] = useState<PlanExercise | null>(null);
  const [reasoning, setReasoning] = useState<string | undefined>(undefined);
  const [reasoningOpen, setReasoningOpen] = useState(false);
  const [validationReason, setValidationReason] = useState('');

  const handleGenerate = async () => {
    const config = getLlmConfig();
    if (!config?.apiKey) return;
    setError('');
    setView('loading');
    posthog?.capture('ai_exercise_swap_started', { model: config.model });
    try {
      const ctx = buildAiContext('exercise-swap');
      const result = await swapExercise(
        config,
        ctx,
        plan,
        exercise,
        dayName,
        custom.trim() || undefined,
      );
      setSuggestion(result.exercise);
      setReasoning(result.reasoning);
      setView('preview');
      posthog?.capture('ai_exercise_swap_succeeded', { model: config.model });
    } catch (err) {
      if (err instanceof AiValidationError) {
        setValidationReason(err.reason);
        setView('rejected');
        return;
      }
      setError(err instanceof Error ? err.message : 'Failed to find a swap');
      setView('config');
    }
  };

  const handleApply = () => {
    if (!suggestion) return;
    posthog?.capture('ai_exercise_swap_applied', {});
    onApply(suggestion);
  };

  const handleRetry = () => {
    setSuggestion(null);
    setReasoning(undefined);
    setValidationReason('');
    setView('config');
  };

  return (
    <ModalSheet
      icon={<Sparkles className="w-5 h-5 text-brand" />}
      title={t.ai_swap_title}
      subtitle={t.ai_swap_subtitle}
      onClose={onClose}
    >
      {view === 'config' && (
        <div className="flex-1 min-h-0 overflow-y-auto space-y-4">
          <div>
            <FieldLabel>{t.ai_swap_current_label}</FieldLabel>
            <ExerciseSummary ex={exercise} />
          </div>

          <div>
            <FieldLabel htmlFor="ai-swap-custom">{t.ai_swap_custom_label}</FieldLabel>
            <textarea
              id="ai-swap-custom"
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              placeholder={t.ai_swap_custom_placeholder}
              rows={3}
              className="w-full rounded-2xl bg-elevated border border-border px-4 py-3 text-sm text-foreground placeholder:text-dim resize-none focus:outline-none focus:border-brand"
            />
          </div>

          {error && <ErrorMessage message={error} openLinkLabel={t.ai_error_open_link} />}

          <Button onClick={handleGenerate} className="w-full gap-2 mt-1">
            <Sparkles className="w-4 h-4" />
            {t.ai_swap_generate}
          </Button>
        </div>
      )}

      {view === 'loading' && (
        <div className="flex flex-col items-center justify-center py-12 gap-4">
          <Loader2 className="w-8 h-8 text-brand animate-spin" />
          <p className="text-secondary text-sm">{t.ai_swap_generating}</p>
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

      {view === 'preview' && suggestion && (
        <div className="flex-1 min-h-0 overflow-y-auto space-y-5">
          <div className="space-y-2">
            <FieldLabel>{t.ai_swap_suggested_label}</FieldLabel>
            <div className="opacity-60">
              <ExerciseSummary ex={exercise} />
            </div>
            <div className="flex justify-center">
              <ArrowRight className="w-4 h-4 text-muted rotate-90" />
            </div>
            <div className="ring-1 ring-brand/40 rounded-xl">
              <ExerciseSummary ex={suggestion} />
            </div>
          </div>

          {reasoning && (
            <div className="bg-elevated rounded-2xl overflow-hidden">
              <button
                onClick={() => setReasoningOpen((o) => !o)}
                className="w-full flex items-center justify-between px-4 py-3 cursor-pointer"
              >
                <p className="text-muted text-xs font-medium uppercase tracking-wide">
                  {t.ai_swap_why}
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
            <Button variant="secondary" size="sm" onClick={handleRetry} className="flex-1 gap-2">
              <RefreshCw className="w-4 h-4" />
              {t.ai_regenerate_button}
            </Button>
            <Button onClick={handleApply} className="flex-[2] gap-2">
              <Sparkles className="w-4 h-4" />
              {t.ai_swap_apply}
            </Button>
          </div>
        </div>
      )}
    </ModalSheet>
  );
}
