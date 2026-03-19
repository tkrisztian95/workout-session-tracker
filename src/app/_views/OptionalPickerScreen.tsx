'use client';

import { useState } from 'react';
import { Check, ChevronLeft } from 'lucide-react';
import { useTranslations } from '@/lib/locale-context';
import type { PlanDay, WorkoutPlan } from '@/lib/types';
import {
  BackButton,
  Button,
  CtaBar,
  HeadingXL,
  LabelOverline,
  Page,
  PageHeader,
} from '@/components/ui';

export function OptionalPickerScreen({
  plan,
  day,
  onStart,
  onBack,
}: {
  plan: WorkoutPlan;
  day: PlanDay;
  onStart: (selectedOptionalIds: Set<string>) => void;
  onBack: () => void;
}) {
  const t = useTranslations();
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <Page className="pb-32">
      <PageHeader>
        <BackButton onClick={onBack} aria-label="Go back">
          <span className="w-9 h-9 rounded-full flex items-center justify-center bg-surface active:bg-elevated">
            <ChevronLeft className="w-5 h-5 text-secondary" />
          </span>
          <span className="text-sm font-medium text-secondary">{t.back}</span>
        </BackButton>
        <LabelOverline className="mb-1">
          {plan.name} · {day.name}
        </LabelOverline>
        <HeadingXL>{t.optional_exercises_title}</HeadingXL>
        <p className="text-muted text-sm mt-2">{t.optional_exercises_subtitle}</p>
      </PageHeader>

      <div className="flex-1 px-6 space-y-4 overflow-y-auto pb-4">
        {day.coreExercises.length > 0 && (
          <div>
            <p className="text-secondary text-xs font-medium uppercase tracking-wide mb-2">
              {t.core_always_included}
            </p>
            <div className="space-y-2">
              {day.coreExercises.map((ex) => (
                <div
                  key={ex.id}
                  className="flex items-center gap-3 bg-surface border border-border rounded-xl px-3 py-2.5"
                >
                  <div className="w-5 h-5 rounded-md bg-brand flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                  </div>
                  <div>
                    <p className="text-foreground text-sm font-medium">{ex.name}</p>
                    <p className="text-brand text-xs">
                      {ex.type === 'sets-reps'
                        ? `${ex.sets}×${ex.reps}`
                        : ex.type === 'sets-duration'
                          ? `${ex.sets}×${ex.duration}s`
                          : (ex.duration ?? 0) >= 60
                            ? `${Math.round((ex.duration ?? 0) / 60)} min`
                            : `${ex.duration}s`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {day.optionalExercises.length > 0 ? (
          <div>
            <p className="text-secondary text-xs font-medium uppercase tracking-wide mb-2">
              {t.optional_label}
            </p>
            <div className="space-y-2">
              {day.optionalExercises.map((ex) => {
                const checked = selected.has(ex.id);
                return (
                  <button
                    key={ex.id}
                    onClick={() => toggle(ex.id)}
                    className={`w-full flex items-center gap-3 rounded-xl border px-3 py-3 cursor-pointer transition-colors duration-150 text-left ${
                      checked ? 'bg-surface border-brand/50' : 'bg-base border-border'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                        checked ? 'bg-brand border-brand' : 'border-border-subtle'
                      }`}
                    >
                      {checked && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                    </div>
                    <div>
                      <p className="text-foreground text-sm font-medium">{ex.name}</p>
                      <p className="text-muted text-xs">
                        {ex.type === 'sets-reps'
                          ? `${ex.sets}×${ex.reps}`
                          : ex.type === 'sets-duration'
                            ? `${ex.sets}×${ex.duration}s`
                            : (ex.duration ?? 0) >= 60
                              ? `${Math.round((ex.duration ?? 0) / 60)} min`
                              : `${ex.duration}s`}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <p className="text-muted text-sm">{t.no_optional_in_day}</p>
        )}
      </div>

      <CtaBar>
        <Button onClick={() => onStart(selected)} className="w-full py-4">
          {t.start_session}
        </Button>
      </CtaBar>
    </Page>
  );
}
