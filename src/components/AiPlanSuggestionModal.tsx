'use client';

import { useState } from 'react';
import { X, Sparkles, RefreshCw, Loader2, ChevronDown } from 'lucide-react';
import { getLlmConfig, getPlans, getSessions, getLocale } from '@/lib/storage';
import { suggestPlan } from '@/lib/ai';
import type { AiPlanPreferences } from '@/lib/ai';
import type { WorkoutPlan } from '@/lib/types';
import { Button, FieldLabel } from '@/components/ui';
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

type View = 'no-config' | 'config' | 'loading' | 'preview';

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
  const savedConfig = getLlmConfig();
  const hasSavedConfig = !!savedConfig?.apiKey;

  const [view, setView] = useState<View>(hasSavedConfig ? 'config' : 'no-config');
  const [error, setError] = useState('');
  const [suggestedPlan, setSuggestedPlan] = useState<Omit<WorkoutPlan, 'id' | 'status'> | null>(
    null,
  );
  const [reasoning, setReasoning] = useState<string | undefined>(undefined);
  const [reasoningOpen, setReasoningOpen] = useState(false);
  const [focus, setFocus] = useState('');
  const [daysPerWeek, setDaysPerWeek] = useState('');
  const [goal, setGoal] = useState('');

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
    try {
      const plans = getPlans();
      const sessions = getSessions();
      const localeLanguage: Record<string, string> = {
        en: 'English',
        hu: 'Hungarian',
        de: 'German',
      };
      const locale = getLocale();
      const language = locale ? localeLanguage[locale] : undefined;
      const result = await suggestPlan(config, plans, sessions, preferences, language);
      setSuggestedPlan(result);
      setReasoning(result.reasoning);
      setView('preview');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate plan');
      setView('config');
    }
  };

  const handleUse = () => {
    if (!suggestedPlan) return;
    onApply(suggestedPlan);
  };

  const handleRegenerate = () => {
    setSuggestedPlan(null);
    setReasoning(undefined);
    setFocus('');
    setDaysPerWeek('');
    setGoal('');
    setView('config');
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-end max-w-md mx-auto">
      <div className="w-full bg-surface rounded-t-3xl px-6 pt-6 pb-10 max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-5 h-5 text-brand" />
              <h2 className="font-bold text-lg text-foreground font-condensed">
                {t.ai_modal_title}
              </h2>
            </div>
            <p className="text-muted text-sm leading-snug">{t.ai_modal_subtitle}</p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-elevated flex items-center justify-center cursor-pointer shrink-0 ml-3"
            aria-label={t.close}
          >
            <X className="w-4 h-4 text-muted" />
          </button>
        </div>

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
      </div>
    </div>
  );
}
