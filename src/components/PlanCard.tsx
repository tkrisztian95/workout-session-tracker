'use client';

import type { ReactNode } from 'react';
import { useState } from 'react';
import Link from 'next/link';
import { CheckCircle, ChevronRight, Copy, MoreVertical, RotateCcw, Sparkles } from 'lucide-react';
import type { WorkoutPlan } from '@/lib/types';
import {
  getPlanMuscles,
  getPlanPlannedOccurrences,
  getPlanUniqueExerciseCount,
} from '@/lib/plan-list';
import { useLocale } from '@/lib/locale-context';
import MuscleBadge from '@/components/MuscleBadge';
import { Badge, IconButton } from '@/components/ui';

export interface PlanCardProps {
  plan: WorkoutPlan;
  /** Completed sessions logged against this plan. */
  followCount: number;
  /** When set, the card body links here (plans list). Takes precedence over `onSelect`. */
  href?: string;
  /** When set (and no `href`), tapping the card body invokes this (plan picker). */
  onSelect?: () => void;
  /** Leading avatar icon, rendered before the body (plan picker). */
  leadingIcon?: ReactNode;
  /** Show a trailing chevron affordance (plan picker). */
  trailingChevron?: boolean;
  /** Hide the schedule line and muscle badges, leaving just the name, badges, and progress (plan picker). */
  compact?: boolean;
  /** Show the "Recent" last-followed badge beside the plan name. */
  lastFollowed?: boolean;
  /** Duplicate handler — together with `onToggleStatus`, enables the actions menu. */
  onDuplicate?: () => void;
  /** Mark-completed / reactivate handler — together with `onDuplicate`, enables the menu. */
  onToggleStatus?: () => void;
}

/**
 * Shared plan summary card used by both the plans list and the start-a-session
 * plan picker. The picker omits the actions menu and opts into the last-followed
 * badge; the list opts into the menu and links to the plan detail.
 */
export default function PlanCard({
  plan,
  followCount,
  href,
  onSelect,
  leadingIcon,
  trailingChevron = false,
  compact = false,
  lastFollowed = false,
  onDuplicate,
  onToggleStatus,
}: PlanCardProps) {
  const { t, locale } = useLocale();
  const [menuOpen, setMenuOpen] = useState(false);

  const isCompleted = plan.status === 'completed';
  const showMenu = Boolean(onDuplicate && onToggleStatus);
  const completedLabel =
    isCompleted && plan.completedAt
      ? `${t.plan_completed_label} · ${new Date(plan.completedAt).toLocaleDateString(locale, {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })}`
      : t.plan_completed_label;
  const muscles = getPlanMuscles(plan);
  const scheduledWeekdays = [...new Set(plan.days.flatMap((d) => d.weekdays))].sort(
    (a, b) => a - b,
  );
  const planned = getPlanPlannedOccurrences(plan);

  const dayCount = plan.days.length;
  const dayCountLabel = (
    dayCount === 1 ? t.plan_picker_day_count_one : t.plan_picker_day_count
  ).replace('{n}', String(dayCount));
  const exerciseCount = getPlanUniqueExerciseCount(plan);
  const exerciseCountLabel = (
    exerciseCount === 1 ? t.plan_overview_exercise_count_one : t.plan_overview_exercises_count
  ).replace('{n}', String(exerciseCount));

  const bodyClass =
    'flex-1 min-w-0 text-left active:opacity-70 transition-opacity duration-150 cursor-pointer';
  const body = (
    <>
      <div className="flex items-center gap-2">
        <p
          className={`font-semibold text-base truncate ${isCompleted ? 'text-muted' : 'text-foreground'}`}
        >
          {plan.name}
        </p>
        {lastFollowed && <Badge variant="subtle">{t.last_followed_badge}</Badge>}
        {isCompleted && <span className="text-dim text-xs flex-shrink-0">{completedLabel}</span>}
      </div>
      {compact ? (
        <p className="text-muted text-sm mt-0.5">
          {dayCountLabel} · {exerciseCountLabel}
        </p>
      ) : (
        <p className="text-muted text-sm mt-0.5">
          {plan.days.length} {plan.days.length !== 1 ? t.training_days : t.training_day}
          {plan.scheduledWeeks && (
            <span className="ml-2">
              · {plan.scheduledWeeks} {plan.scheduledWeeks !== 1 ? 'weeks' : 'week'}
            </span>
          )}
          {scheduledWeekdays.length > 0 && (
            <span className="ml-2 text-dim">
              · {scheduledWeekdays.map((w) => t.weekday_abbr[w]).join(', ')}
            </span>
          )}
        </p>
      )}
      <PlanFollowProgress followCount={followCount} planned={planned} isCompleted={isCompleted} />
      {!compact && muscles.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1.5">
          {muscles.map((m) => (
            <MuscleBadge key={m} muscle={m} />
          ))}
        </div>
      )}
    </>
  );

  const outerClass = `relative flex items-center rounded-2xl border px-4 py-4 gap-3 ${
    isCompleted ? 'bg-surface/50 border-border/50' : 'bg-surface border-border'
  }`;
  const aiBadge = plan.aiGenerated === true && (
    <div className="absolute -top-px left-3 flex items-center gap-1 bg-brand text-white rounded-b-md px-1.5 py-0.5">
      <Sparkles className="w-2.5 h-2.5" />
      <span className="text-[9px] font-bold tracking-wide uppercase leading-none">AI</span>
    </div>
  );
  const avatar = leadingIcon && (
    <span
      aria-hidden
      className="w-11 h-11 rounded-xl bg-brand/10 flex items-center justify-center flex-shrink-0"
    >
      {leadingIcon}
    </span>
  );

  // Picker variant: no actions menu, so the whole card is one tappable target
  // with an optional leading icon and trailing chevron.
  if (!showMenu) {
    const wrapperClass = `${outerClass} w-full text-left active:opacity-70 transition-opacity duration-150 cursor-pointer`;
    const inner = (
      <>
        {aiBadge}
        {avatar}
        <div className="flex-1 min-w-0">{body}</div>
        {trailingChevron && <ChevronRight className="w-5 h-5 text-dim flex-shrink-0" />}
      </>
    );
    return href ? (
      <Link href={href} className={wrapperClass}>
        {inner}
      </Link>
    ) : (
      <button type="button" onClick={onSelect} className={wrapperClass}>
        {inner}
      </button>
    );
  }

  // List variant: body links to the plan detail; the actions menu sits beside it.
  return (
    <div className={outerClass}>
      {aiBadge}

      <Link href={href ?? '#'} className={bodyClass}>
        {body}
      </Link>

      <div className="relative flex items-center gap-2 flex-shrink-0">
        <IconButton
          size="sm"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Plan actions"
          className="bg-elevated/50 active:scale-90"
        >
          <MoreVertical className="w-4 h-4 text-muted" />
        </IconButton>

        {menuOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
            <div className="absolute right-0 top-full mt-1 z-20 bg-elevated border border-border rounded-2xl shadow-lg overflow-hidden min-w-[180px]">
              <button
                className="flex items-center gap-3 w-full px-4 py-3.5 text-sm text-foreground active:bg-surface transition-colors cursor-pointer"
                onClick={() => {
                  setMenuOpen(false);
                  onDuplicate?.();
                }}
              >
                <Copy className="w-4 h-4 text-muted flex-shrink-0" />
                {t.plan_action_duplicate}
              </button>
              <div className="h-px bg-border/50 mx-3" />
              <button
                className="flex items-center gap-3 w-full px-4 py-3.5 text-sm text-foreground active:bg-surface transition-colors cursor-pointer"
                onClick={() => {
                  setMenuOpen(false);
                  onToggleStatus?.();
                }}
              >
                {isCompleted ? (
                  <>
                    <RotateCcw className="w-4 h-4 text-secondary flex-shrink-0" />
                    {t.plan_action_reactivate}
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 text-muted flex-shrink-0" />
                    {t.plan_action_mark_completed}
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/**
 * Follow progress shown under the schedule line:
 * - completed plans → compact "Followed {n}×" badge (unchanged behavior);
 * - duration-based plans → a bar filling toward the planned total (e.g. 5 / 16);
 * - open-ended plans → the raw follow count only, no bar.
 */
function PlanFollowProgress({
  followCount,
  planned,
  isCompleted,
}: {
  followCount: number;
  planned: number | null;
  isCompleted: boolean;
}) {
  const { t } = useLocale();

  if (isCompleted) {
    if (followCount === 0) return null;
    return (
      <div className="mt-2">
        <Badge
          variant="subtle"
          aria-label={t.plan_followed_aria.replace('{n}', String(followCount))}
        >
          {t.plan_followed_badge.replace('{n}', String(followCount))}
        </Badge>
      </div>
    );
  }

  if (planned !== null) {
    const pct = Math.min(100, (followCount / planned) * 100);
    return (
      <div
        className="flex items-center gap-2 mt-2"
        aria-label={t.plan_progress_aria
          .replace('{done}', String(followCount))
          .replace('{planned}', String(planned))}
      >
        <div className="flex-1 h-1.5 rounded-full bg-elevated overflow-hidden">
          <div className="h-full rounded-full bg-brand" style={{ width: `${pct}%` }} />
        </div>
        <span className="text-dim text-xs font-medium flex-shrink-0">
          {followCount} / {planned}
        </span>
      </div>
    );
  }

  if (followCount === 0) return null;
  return (
    <div className="mt-2" aria-label={t.plan_followed_aria.replace('{n}', String(followCount))}>
      <span className="text-dim text-xs font-medium">{followCount}×</span>
    </div>
  );
}
