'use client';

import { useState } from 'react';
import Link from 'next/link';
import { SquarePlay, Loader2, AlertTriangle, ListPlus } from 'lucide-react';
import { usePostHog } from 'posthog-js/react';
import { getLlmConfig, getPlans, savePlan } from '@/lib/storage';
import { buildAiContext, parseYoutubeDay, AiValidationError } from '@/lib/ai';
import { fetchYoutubeDescription, YoutubeDescriptionError } from '@/lib/youtubeApi';
import type { YoutubeDescriptionErrorCode } from '@/lib/youtubeApi';
import { parseYoutubeId } from '@/lib/youtube';
import type { PlanDay, WorkoutPlan } from '@/lib/types';
import { Button, FieldLabel, Input, Select, ModalSheet } from '@/components/ui';
import PlanDayEditor from '@/components/PlanDayEditor';
import { useTranslations } from '@/lib/locale-context';

type View = 'no-config' | 'input' | 'loading' | 'review' | 'rejected';

const NEW_PLAN = '__new__';

interface Props {
  onClose: () => void;
  /** Called after a day is saved; receives the destination plan id. */
  onSaved: (planId: string) => void;
}

export default function YoutubeDayImportModal({ onClose, onSaved }: Props) {
  const t = useTranslations();
  const posthog = usePostHog();
  const hasSavedConfig = !!getLlmConfig()?.apiKey;

  const [plans] = useState<WorkoutPlan[]>(() => getPlans().filter((p) => p.status !== 'completed'));
  const [view, setView] = useState<View>(hasSavedConfig ? 'input' : 'no-config');
  const [url, setUrl] = useState('');
  const [loadingMsg, setLoadingMsg] = useState('');
  const [error, setError] = useState('');
  const [validationReason, setValidationReason] = useState('');
  const [day, setDay] = useState<PlanDay | null>(null);
  const [videoTitle, setVideoTitle] = useState('');
  const [destination, setDestination] = useState<string>(NEW_PLAN);
  const [newPlanName, setNewPlanName] = useState('');

  const urlValid = parseYoutubeId(url) !== null;

  const errorMessage = (code: YoutubeDescriptionErrorCode): string => {
    switch (code) {
      case 'invalid_url':
        return t.youtube_error_invalid_url;
      case 'not_found':
        return t.youtube_error_not_found;
      case 'no_description':
        return t.youtube_error_no_description;
      case 'fetch_failed':
      default:
        return t.youtube_error_fetch_failed;
    }
  };

  const handleFetch = async () => {
    const config = getLlmConfig();
    if (!config?.apiKey) {
      setView('no-config');
      return;
    }
    if (!urlValid) {
      setError(t.youtube_url_invalid);
      return;
    }
    setError('');
    setView('loading');
    setLoadingMsg(t.youtube_fetching);
    posthog?.capture('youtube_day_import_started');
    try {
      const video = await fetchYoutubeDescription(url);
      setVideoTitle(video.title);
      setLoadingMsg(t.youtube_parsing);
      const ctx = buildAiContext('youtube-day-import');
      const result = await parseYoutubeDay(config, ctx, video);
      const parsedDay: PlanDay = {
        id: crypto.randomUUID(),
        name: result.name,
        weekdays: result.weekdays,
        coreExercises: result.coreExercises,
        optionalExercises: result.optionalExercises,
      };
      setDay(parsedDay);
      setNewPlanName(video.title || result.name);
      setDestination(plans.length > 0 ? plans[0].id : NEW_PLAN);
      setView('review');
      posthog?.capture('youtube_day_import_parsed', {
        core_count: parsedDay.coreExercises.length,
        optional_count: parsedDay.optionalExercises.length,
      });
    } catch (err) {
      if (err instanceof YoutubeDescriptionError) {
        setError(errorMessage(err.code));
        setView('input');
        posthog?.capture('youtube_day_import_failed', { error_type: err.code });
        return;
      }
      if (err instanceof AiValidationError) {
        const reason = err.reason.startsWith('ai.validation.')
          ? t.youtube_validation_not_workout
          : err.reason;
        setValidationReason(reason);
        setView('rejected');
        posthog?.capture('youtube_day_import_failed', { error_type: 'validation' });
        return;
      }
      setError(err instanceof Error ? err.message : t.youtube_error_fetch_failed);
      setView('input');
      posthog?.capture('youtube_day_import_failed', { error_type: 'api' });
    }
  };

  const resetToInput = () => {
    setDay(null);
    setError('');
    setValidationReason('');
    setView('input');
  };

  const handleSave = () => {
    if (!day) return;
    const now = new Date().toISOString();
    const creatingNew = destination === NEW_PLAN;

    let targetId: string;
    if (creatingNew) {
      const newPlan: WorkoutPlan = {
        id: crypto.randomUUID(),
        name: newPlanName.trim() || videoTitle || day.name || 'Workout',
        days: [day],
        sharedExercises: [],
        createdAt: now,
        updatedAt: now,
        status: 'active',
        aiGenerated: true,
      };
      savePlan(newPlan);
      targetId = newPlan.id;
    } else {
      const plan = getPlans().find((p) => p.id === destination);
      if (!plan) {
        setError(t.youtube_error_fetch_failed);
        return;
      }
      const updated: WorkoutPlan = {
        ...plan,
        days: [...plan.days, day],
        updatedAt: now,
      };
      savePlan(updated);
      targetId = plan.id;
    }

    posthog?.capture('youtube_day_import_saved', { new_plan: creatingNew });
    onSaved(targetId);
  };

  return (
    <ModalSheet
      icon={<SquarePlay className="w-5 h-5 text-brand" />}
      title={t.youtube_import_title}
      subtitle={t.youtube_import_subtitle}
      onClose={onClose}
    >
      {/* No config */}
      {view === 'no-config' && (
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
      )}

      {/* Input */}
      {view === 'input' && (
        <div className="space-y-4">
          <div>
            <FieldLabel>{t.youtube_url_label}</FieldLabel>
            <Input
              type="url"
              inputMode="url"
              autoFocus
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (error) setError('');
              }}
              placeholder={t.youtube_url_placeholder}
            />
          </div>
          {error && <p className="text-danger text-sm">{error}</p>}
          <Button onClick={handleFetch} disabled={!urlValid} className="w-full gap-2">
            <SquarePlay className="w-4 h-4" />
            {t.youtube_fetch_button}
          </Button>
        </div>
      )}

      {/* Loading */}
      {view === 'loading' && (
        <div className="flex flex-col items-center justify-center py-12 gap-4">
          <Loader2 className="w-8 h-8 text-brand animate-spin" />
          <p className="text-secondary text-sm">{loadingMsg}</p>
        </div>
      )}

      {/* Rejected (not a workout) */}
      {view === 'rejected' && (
        <div className="space-y-4">
          <div className="bg-warning/8 rounded-2xl px-4 py-4 flex gap-3">
            <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="text-warning text-sm font-semibold">{t.ai_validation_title}</p>
              <p className="text-warning/80 text-sm leading-relaxed">{validationReason}</p>
            </div>
          </div>
          <Button variant="secondary" onClick={resetToInput} className="w-full">
            {t.youtube_try_again}
          </Button>
        </div>
      )}

      {/* Review + destination */}
      {view === 'review' && day && (
        <div className="flex-1 min-h-0 flex flex-col">
          <div className="flex-1 min-h-0 overflow-y-auto space-y-4 pb-4">
            <PlanDayEditor day={day} onChange={setDay} onRemove={resetToInput} />

            <div>
              <FieldLabel>{t.youtube_destination_label}</FieldLabel>
              <Select value={destination} onChange={(e) => setDestination(e.target.value)}>
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
                <option value={NEW_PLAN}>{t.youtube_destination_new}</option>
              </Select>
            </div>

            {destination === NEW_PLAN && (
              <div>
                <FieldLabel>{t.youtube_new_plan_name_label}</FieldLabel>
                <Input
                  type="text"
                  value={newPlanName}
                  onChange={(e) => setNewPlanName(e.target.value)}
                  placeholder={t.youtube_new_plan_name_placeholder}
                />
              </div>
            )}
          </div>

          <Button onClick={handleSave} className="w-full gap-2 mt-1">
            <ListPlus className="w-4 h-4" />
            {destination === NEW_PLAN ? t.youtube_save_new_plan : t.youtube_save_to_plan}
          </Button>
        </div>
      )}
    </ModalSheet>
  );
}
