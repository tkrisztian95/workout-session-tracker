'use client';

import { useState } from 'react';
import {
  CalendarDays,
  CheckCircle,
  ChevronLeft,
  Dumbbell,
  Flame,
  ListChecks,
  RotateCcw,
  Sparkles,
  Trash2,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { PlanExercise, WorkoutPlan } from '@/lib/types';
import { getPlanExerciseCount, getPlanMuscles } from '@/lib/plan-list';
import { ALL_MUSCLE_GROUPS, MUSCLE_TO_GROUP } from '@/lib/muscles';
import MuscleBadge from '@/components/MuscleBadge';
import DeletePlanConfirmSheet from '@/components/DeletePlanConfirmSheet';
import { useLocale } from '@/lib/locale-context';
import {
  Badge,
  Card,
  HeadingXL,
  IconButton,
  LabelOverline,
  Page,
  PageHeader,
} from '@/components/ui';

interface PlanOverviewProps {
  plan: WorkoutPlan;
  followCount: number;
  lastFollowedAt: string | null;
  onEdit: () => void;
  onBack: () => void;
  onDelete: () => void;
  onToggleStatus: () => void;
}

function exerciseDetail(ex: PlanExercise): string {
  if (ex.type === 'sets-reps') {
    const reps = ex.repsPerSet?.length ? ex.repsPerSet.join('/') : (ex.reps ?? 0);
    return `${ex.sets ?? 0}×${reps}`;
  }
  if (ex.type === 'sets-duration') return `${ex.sets ?? 0}×${ex.duration ?? 0}s`;
  const d = ex.duration ?? 0;
  return d >= 60 ? `${Math.round(d / 60)} min` : `${d}s`;
}

export default function PlanOverview({
  plan,
  followCount,
  lastFollowedAt,
  onEdit,
  onBack,
  onDelete,
  onToggleStatus,
}: PlanOverviewProps) {
  const { t, locale } = useLocale();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isCompleted = plan.status === 'completed';
  const exerciseCount = getPlanExerciseCount(plan);
  const muscles = getPlanMuscles(plan);
  const scheduledWeekdays = [...new Set(plan.days.flatMap((d) => d.weekdays))].sort(
    (a, b) => a - b,
  );

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' });

  const weeksValue = plan.scheduledWeeks
    ? (plan.scheduledWeeks === 1
        ? t.plan_overview_week_value
        : t.plan_overview_weeks_value
      ).replace('{n}', String(plan.scheduledWeeks))
    : null;

  const stats: { label: string; value: number; icon: LucideIcon }[] = [
    { label: t.plan_overview_stat_days, value: plan.days.length, icon: CalendarDays },
    { label: t.plan_overview_stat_exercises, value: exerciseCount, icon: Dumbbell },
    { label: t.plan_overview_stat_follows, value: followCount, icon: Flame },
  ];

  const exerciseCountLabel = (n: number) =>
    (n === 1 ? t.plan_overview_exercise_count_one : t.plan_overview_exercises_count).replace(
      '{n}',
      String(n),
    );

  const details: { label: string; value: string }[] = [
    { label: t.plan_overview_created_label, value: fmtDate(plan.createdAt) },
  ];
  if (weeksValue) details.push({ label: t.plan_overview_scheduled_weeks_label, value: weeksValue });
  if (scheduledWeekdays.length > 0) {
    details.push({
      label: t.plan_overview_scheduled_days_label,
      value: scheduledWeekdays.map((w) => t.weekday_abbr[w]).join(', '),
    });
  }
  details.push({
    label: t.plan_overview_last_followed_label,
    value: lastFollowedAt ? fmtDate(lastFollowedAt) : t.plan_overview_never_followed,
  });
  if (isCompleted && plan.completedAt) {
    details.push({ label: t.plan_completed_on_label, value: fmtDate(plan.completedAt) });
  }

  return (
    <Page>
      <PageHeader>
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 w-fit mb-2"
            aria-label={t.plans_title}
          >
            <span className="w-9 h-9 rounded-full flex items-center justify-center bg-surface active:bg-elevated">
              <ChevronLeft className="w-5 h-5 text-secondary" />
            </span>
            <span className="text-sm font-medium text-secondary">{t.plans_title}</span>
          </button>
          <div className="flex items-center gap-2">
            {!isCompleted && (
              <button
                onClick={onEdit}
                className="text-sm font-medium text-brand px-3 py-1.5 rounded-lg active:bg-surface"
              >
                {t.edit_label}
              </button>
            )}
            <IconButton
              onClick={onToggleStatus}
              aria-label={isCompleted ? t.plan_action_reactivate : t.plan_action_mark_completed}
              className="border border-border"
            >
              {isCompleted ? (
                <RotateCcw className="w-4 h-4 text-secondary" />
              ) : (
                <CheckCircle className="w-4 h-4 text-muted" />
              )}
            </IconButton>
            <IconButton
              onClick={() => setShowDeleteConfirm(true)}
              aria-label={`${t.delete} ${plan.name}`}
              className="border border-border hover:border-danger/50"
            >
              <Trash2 className="w-4 h-4 text-muted" />
            </IconButton>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-3">
          <HeadingXL>{plan.name}</HeadingXL>
        </div>
        <div className="flex items-center gap-2 mt-2">
          {plan.aiGenerated === true && (
            <Badge variant="brand" className="flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" />
              AI
            </Badge>
          )}
          {isCompleted && <Badge variant="subtle">{t.plan_completed_label}</Badge>}
        </div>
      </PageHeader>

      <div className="flex-1 overflow-y-auto px-6 pb-12 space-y-6">
        {/* Stat tiles */}
        <div className="grid grid-cols-3 gap-3">
          {stats.map((s) => (
            <Card key={s.label} className="px-3 py-4 flex flex-col items-center text-center">
              <s.icon className="w-4 h-4 text-brand mb-2" aria-hidden="true" />
              <p className="text-foreground text-3xl font-bold font-condensed leading-none tabular-nums">
                {s.value}
              </p>
              <p className="text-muted text-xs mt-1.5">{s.label}</p>
            </Card>
          ))}
        </div>

        {/* Muscle groups */}
        {muscles.length > 0 && (
          <div>
            <LabelOverline className="mb-2">{t.plan_overview_muscle_groups_title}</LabelOverline>
            <div className="space-y-2">
              {ALL_MUSCLE_GROUPS.map((group) => {
                const inGroup = muscles.filter((m) => MUSCLE_TO_GROUP[m] === group);
                if (inGroup.length === 0) return null;
                return (
                  <div key={group} className="flex items-center gap-2 flex-wrap">
                    <span className="text-secondary text-sm font-medium">
                      {t.muscle_group_labels[group]}
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {inGroup.map((m) => (
                        <MuscleBadge key={m} muscle={m} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Details */}
        <div>
          <LabelOverline className="mb-2">{t.plan_overview_details_title}</LabelOverline>
          <Card className="divide-y divide-border">
            {details.map((d) => (
              <div key={d.label} className="flex items-center justify-between px-4 py-3">
                <span className="text-muted text-sm">{d.label}</span>
                <span className="text-foreground text-sm font-medium">{d.value}</span>
              </div>
            ))}
          </Card>
        </div>

        {/* Shared exercises */}
        {plan.sharedExercises.length > 0 && (
          <div>
            <LabelOverline className="mb-2">
              {t.shared_exercises_label} ({plan.sharedExercises.length})
            </LabelOverline>
            <Card className="divide-y divide-border">
              {plan.sharedExercises.map((ex) => (
                <ExerciseRow key={ex.id} ex={ex} />
              ))}
            </Card>
          </div>
        )}

        {/* Per-day breakdown */}
        <div>
          <LabelOverline className="mb-2">
            {t.training_days_label} ({plan.days.length})
          </LabelOverline>
          {plan.days.length === 0 ? (
            <Card className="flex flex-col items-center text-center px-6 py-10">
              <CalendarDays className="w-8 h-8 text-dim mb-3" aria-hidden="true" />
              <p className="text-secondary text-sm font-medium">{t.plan_overview_no_days}</p>
              <p className="text-muted text-xs mt-1">{t.plan_overview_no_days_subtitle}</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {plan.days.map((day, i) => {
                const count = day.coreExercises.length + day.optionalExercises.length;
                return (
                  <Card key={day.id} className="overflow-hidden">
                    <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border">
                      <div className="min-w-0">
                        <p className="text-foreground text-sm font-semibold truncate">
                          {day.name.trim() || `${t.training_day} ${i + 1}`}
                        </p>
                        <p className="text-dim text-xs mt-0.5 flex items-center gap-1">
                          <ListChecks className="w-3 h-3" aria-hidden="true" />
                          {exerciseCountLabel(count)}
                        </p>
                      </div>
                      {day.weekdays.length > 0 && (
                        <span className="text-dim text-xs flex-shrink-0">
                          {[...day.weekdays]
                            .sort((a, b) => a - b)
                            .map((w) => t.weekday_abbr[w])
                            .join(', ')}
                        </span>
                      )}
                    </div>
                    {count > 0 ? (
                      <div className="divide-y divide-border">
                        {day.coreExercises.map((ex) => (
                          <ExerciseRow key={ex.id} ex={ex} />
                        ))}
                        {day.optionalExercises.map((ex) => (
                          <ExerciseRow
                            key={ex.id}
                            ex={ex}
                            optional
                            optionalLabel={t.optional_label}
                          />
                        ))}
                      </div>
                    ) : (
                      <p className="px-4 py-3 text-muted text-sm">
                        {t.plan_overview_no_day_exercises}
                      </p>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {showDeleteConfirm && (
        <DeletePlanConfirmSheet
          planName={plan.name}
          onConfirm={onDelete}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </Page>
  );
}

function ExerciseRow({
  ex,
  optional = false,
  optionalLabel,
}: {
  ex: PlanExercise;
  optional?: boolean;
  optionalLabel?: string;
}) {
  return (
    <div className="flex items-center gap-2 px-4 py-2.5">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-foreground text-sm font-medium truncate">{ex.name}</p>
          {ex.muscle && <MuscleBadge muscle={ex.muscle} />}
          {optional && optionalLabel && <Badge variant="subtle">{optionalLabel}</Badge>}
        </div>
        {ex.scalingNote && <p className="text-muted text-xs mt-0.5 truncate">{ex.scalingNote}</p>}
      </div>
      <span className="text-brand text-xs flex-shrink-0 tabular-nums">{exerciseDetail(ex)}</span>
    </div>
  );
}
