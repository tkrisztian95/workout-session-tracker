'use client';

import { useRef, useState } from 'react';
import { Sparkles, RefreshCw, Loader2, ChevronDown, AlertTriangle } from 'lucide-react';
import { usePostHog } from 'posthog-js/react';
import { getLlmConfig } from '@/lib/storage';
import { suggestPlan, AiValidationError, buildAiContext } from '@/lib/ai';
import type { AiPlanPreferences } from '@/lib/ai';
import type { WorkoutPlan } from '@/lib/types';
import { Button, FieldLabel, ModalSheet } from '@/components/ui';
import { useTranslations } from '@/lib/locale-context';
import Link from 'next/link';

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

type View = 'no-config' | 'config' | 'loading' | 'preview' | 'rejected';

interface AiPlanSuggestionModalProps {
  onApply: (plan: Omit<WorkoutPlan, 'id' | 'status'>) => void;
  onClose: () => void;
}

const FOCUS_OPTIONS = ['Strength', 'Hypertrophy', 'Endurance', 'Flexibility', 'Weight loss'];
const DAYS_PER_WEEK_OPTIONS = ['2', '3', '4', '5+'];
const GOAL_OPTIONS = ['Build muscle', 'Lose weight', 'Improve cardio', 'Maintain fitness'];

function ChipPicker({
  options,
  labels,
  value,
  onChange,
}: {
  options: string[];
  labels?: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt, i) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(value === opt ? '' : opt)}
          className={`px-3 py-1 rounded-full text-xs font-medium border cursor-pointer transition-colors duration-150 ${
            value === opt
              ? 'bg-brand text-white border-brand'
              : 'bg-elevated text-secondary border-transparent'
          }`}
        >
          {labels ? labels[i] : opt}
        </button>
      ))}
    </div>
  );
}

export default function AiPlanSuggestionModal({ onApply, onClose }: AiPlanSuggestionModalProps) {
  const t = useTranslations();
  const posthog = usePostHog();
  const savedConfig = getLlmConfig();
  const hasSavedConfig = !!savedConfig?.apiKey;

  const [view, setView] = useState<View>(hasSavedConfig ? 'config' : 'no-config');
  const [error, setError] = useState('');
  const [suggestedPlan, setSuggestedPlan] = useState<Omit<WorkoutPlan, 'id' | 'status'> | null>(
    null,
  );
  const [reasoning, setReasoning] = useState<string | undefined>(undefined);
  const [reasoningOpen, setReasoningOpen] = useState(false);
  const [validationReason, setValidationReason] = useState('');
  const [focus, setFocus] = useState('');
  const [daysPerWeek, setDaysPerWeek] = useState('');
  const [goal, setGoal] = useState('');
  const generationStartRef = useRef<number>(0);

  const handleGenerate = async () => {
    const config = getLlmConfig();
    if (!config?.apiKey) {
      setView('no-config');
      return;
    }
    setError('');
    setView('loading');
    const preferences: AiPlanPreferences = {
      focus: focus || undefined,
      daysPerWeek: daysPerWeek || undefined,
      goal: goal || undefined,
    };
    posthog?.capture('ai_plan_generation_started', {
      model: config.model,
      focus: focus || null,
      days_per_week: daysPerWeek || null,
      goal: goal || null,
    });
    generationStartRef.current = Date.now();
    try {
      const ctx = buildAiContext('plan-suggest');
      const result = await suggestPlan(config, ctx, preferences);
      setSuggestedPlan(result);
      setReasoning(result.reasoning);
      setView('preview');
      posthog?.capture('ai_plan_generation_succeeded', {
        model: config.model,
        duration_ms: Date.now() - generationStartRef.current,
        day_count: result.days.length,
      });
    } catch (err) {
      if (err instanceof AiValidationError) {
        setValidationReason(err.reason);
        setView('rejected');
        posthog?.capture('ai_plan_generation_failed', {
          model: config.model,
          duration_ms: Date.now() - generationStartRef.current,
          error_type: 'validation',
        });
        return;
      }
      const message = err instanceof Error ? err.message : 'Failed to generate plan';
      setError(message);
      setView('config');
      posthog?.capture('ai_plan_generation_failed', {
        model: config.model,
        duration_ms: Date.now() - generationStartRef.current,
        error_type: message.includes('no credits')
          ? 'quota'
          : message.includes('Invalid API key')
            ? 'auth'
            : message.includes('parse JSON')
              ? 'parse'
              : message.includes('missing required')
                ? 'validation'
                : 'api',
      });
    }
  };

  const handleUse = () => {
    if (!suggestedPlan) return;
    posthog?.capture('ai_plan_applied', {
      model: getLlmConfig()?.model,
      day_count: suggestedPlan.days.length,
    });
    onApply(suggestedPlan);
  };

  const handleRegenerate = () => {
    posthog?.capture('ai_plan_regenerated', {
      model: getLlmConfig()?.model,
    });
    setSuggestedPlan(null);
    setReasoning(undefined);
    setValidationReason('');
    setFocus('');
    setDaysPerWeek('');
    setGoal('');
    setView('config');
  };

  return (
    <ModalSheet
      icon={<Sparkles className="w-5 h-5 text-brand" />}
      title={t.ai_modal_title}
      subtitle={t.ai_modal_subtitle}
      onClose={onClose}
    >
      {/* No config view */}
      {view === 'no-config' && (
        <div className="space-y-4">
          <div className="bg-elevated rounded-2xl px-4 py-5 text-center space-y-3">
            <p className="text-secondary text-sm leading-relaxed">{t.ai_no_config_message}</p>
            <Link
              href="/profile?expand=ai"
              onClick={onClose}
              className="inline-block text-brand text-sm font-semibold"
            >
              {t.ai_no_config_link}
            </Link>
          </div>
        </div>
      )}

      {/* Config view (preferences only) */}
      {view === 'config' && (
        <div className="space-y-4">
          <div>
            <FieldLabel>{t.ai_preferences_label}</FieldLabel>
            <p className="text-dim text-xs mb-3 -mt-1">{t.ai_preferences_subtitle}</p>
            <div className="space-y-3">
              <div>
                <p className="text-dim text-xs mb-1.5">{t.ai_focus_label}</p>
                <ChipPicker
                  options={FOCUS_OPTIONS}
                  labels={t.ai_focus_options}
                  value={focus}
                  onChange={setFocus}
                />
              </div>
              <div>
                <p className="text-dim text-xs mb-1.5">{t.ai_days_per_week_label}</p>
                <ChipPicker
                  options={DAYS_PER_WEEK_OPTIONS}
                  value={daysPerWeek}
                  onChange={setDaysPerWeek}
                />
              </div>
              <div>
                <p className="text-dim text-xs mb-1.5">{t.ai_goal_label}</p>
                <ChipPicker
                  options={GOAL_OPTIONS}
                  labels={t.ai_goal_options}
                  value={goal}
                  onChange={setGoal}
                />
              </div>
            </div>
          </div>

          {error && <ErrorMessage message={error} openLinkLabel={t.ai_error_open_link} />}

          <Button onClick={handleGenerate} className="w-full gap-2 mt-2">
            <Sparkles className="w-4 h-4" />
            {t.ai_generate_button}
          </Button>
        </div>
      )}

      {/* Loading view */}
      {view === 'loading' && (
        <div className="flex flex-col items-center justify-center py-12 gap-4">
          <Loader2 className="w-8 h-8 text-brand animate-spin" />
          <p className="text-secondary text-sm">{t.ai_generating}</p>
        </div>
      )}

      {/* Rejected view */}
      {view === 'rejected' && (
        <div className="space-y-4">
          <div className="bg-warning/8 rounded-2xl px-4 py-4 flex gap-3">
            <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="text-warning text-sm font-semibold">{t.ai_validation_title}</p>
              <p className="text-warning/80 text-sm leading-relaxed">{validationReason}</p>
            </div>
          </div>
          <Button variant="secondary" onClick={handleRegenerate} className="w-full gap-2">
            <RefreshCw className="w-4 h-4" />
            {t.ai_regenerate_button}
          </Button>
        </div>
      )}

      {/* Preview view */}
      {view === 'preview' && suggestedPlan && (
        <div className="space-y-5">
          <div className="bg-elevated rounded-2xl px-4 py-4 space-y-1">
            <p className="font-bold text-foreground text-base">{suggestedPlan.name}</p>
            <p className="text-muted text-sm">
              {suggestedPlan.days.length}{' '}
              {suggestedPlan.days.length !== 1 ? t.ai_training_days : t.ai_training_day}
            </p>
            {suggestedPlan.days.map((day) => (
              <div key={day.id} className="pt-1">
                <p className="text-secondary text-sm font-medium">{day.name || 'Day'}</p>
                <p className="text-dim text-xs">
                  {day.coreExercises.length + day.optionalExercises.length} {t.ai_exercises}
                </p>
              </div>
            ))}
            {suggestedPlan.sharedExercises.length > 0 && (
              <p className="text-dim text-xs pt-1">
                + {suggestedPlan.sharedExercises.length}{' '}
                {suggestedPlan.sharedExercises.length !== 1
                  ? t.ai_shared_exercises
                  : t.ai_shared_exercise}
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
                  {t.ai_why_this_plan}
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
              {t.ai_regenerate_button}
            </Button>
            <Button onClick={handleUse} className="flex-[2] gap-2">
              <Sparkles className="w-4 h-4" />
              {t.ai_use_plan_button}
            </Button>
          </div>
        </div>
      )}
    </ModalSheet>
  );
}
