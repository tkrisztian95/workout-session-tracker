'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Dumbbell,
  CheckCircle,
  RotateCcw,
  Sparkles,
  Copy,
  MoreVertical,
  Search,
  X,
  SlidersHorizontal,
} from 'lucide-react';
import { getPlans, togglePlanStatus, savePlan, duplicatePlan, getSessions } from '@/lib/storage';
import type { WorkoutPlan, WorkoutSession } from '@/lib/types';
import {
  availableDayCounts,
  availableMuscles,
  countActiveFilters,
  DEFAULT_PLAN_FILTERS,
  getPlanMuscles,
  organizePlans,
  type PlanFilters,
  type PlanSort,
} from '@/lib/plan-list';
import BottomNav from '@/components/BottomNav';
import { useTranslations } from '@/lib/locale-context';
import MuscleBadge from '@/components/MuscleBadge';
import {
  BottomSheet,
  Button,
  EmptyState,
  HeadingXL,
  IconButton,
  Page,
  PageHeader,
} from '@/components/ui';
import AiPlanSuggestionModal from '@/components/AiPlanSuggestionModal';

export default function PlansPage() {
  const t = useTranslations();
  const router = useRouter();
  const [plans, setPlans] = useState<WorkoutPlan[]>(() => getPlans());
  const [sessions] = useState<WorkoutSession[]>(() => getSessions());
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<PlanSort>('created');
  const [filters, setFilters] = useState<PlanFilters>(DEFAULT_PLAN_FILTERS);
  const [showAiModal, setShowAiModal] = useState(false);
  const [showControls, setShowControls] = useState(false);

  const visiblePlans = useMemo(
    () => organizePlans(plans, sessions, { search, sort, filters }),
    [plans, sessions, search, sort, filters],
  );
  const activeVisible = visiblePlans.filter((p) => p.status !== 'completed');
  const completedVisible = visiblePlans.filter((p) => p.status === 'completed');
  const muscles = useMemo(() => availableMuscles(plans), [plans]);
  const dayCounts = useMemo(() => availableDayCounts(plans), [plans]);
  const filterCount = countActiveFilters(filters);
  const hasPlans = plans.length > 0;
  const controlsActive = search.trim() !== '' || filterCount > 0 || sort !== 'created';

  const handleToggleStatus = (id: string) => {
    togglePlanStatus(id);
    setPlans(getPlans());
  };

  const handleDuplicate = (id: string) => {
    const copy = duplicatePlan(id);
    setPlans(getPlans());
    router.push(`/plans/${copy.id}`);
  };

  const handleClearAll = () => {
    setSearch('');
    setSort('created');
    setFilters(DEFAULT_PLAN_FILTERS);
  };

  const handleAiApply = (planData: Omit<WorkoutPlan, 'id' | 'status'>) => {
    const now = new Date().toISOString();
    const newPlan: WorkoutPlan = {
      ...planData,
      id: crypto.randomUUID(),
      status: 'active',
      aiGenerated: true,
      createdAt: planData.createdAt ?? now,
      updatedAt: now,
    };
    savePlan(newPlan);
    setShowAiModal(false);
    router.push(`/plans/${newPlan.id}`);
  };

  return (
    <Page className="pb-24">
      <PageHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <HeadingXL>{t.plans_title}</HeadingXL>
            {hasPlans && (
              <p className="text-muted text-sm mt-3">
                {visiblePlans.length === plans.length
                  ? t.plans_total_count.replace('{n}', String(plans.length))
                  : t.plans_shown_of_total
                      .replace('{shown}', String(visiblePlans.length))
                      .replace('{total}', String(plans.length))}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 mt-1">
            {hasPlans && (
              <IconButton
                onClick={() => setShowControls(true)}
                aria-label={t.plans_controls_open}
                className="relative border border-border"
              >
                <SlidersHorizontal className="w-4 h-4 text-muted" />
                {controlsActive && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand" />
                )}
              </IconButton>
            )}
            <IconButton
              onClick={() => setShowAiModal(true)}
              aria-label="AI Suggest Plan"
              className="border border-border"
            >
              <Sparkles className="w-4 h-4 text-brand" />
            </IconButton>
          </div>
        </div>
      </PageHeader>

      <div className="flex-1 px-6 space-y-3 overflow-y-auto pb-28">
        {!hasPlans ? (
          <EmptyState
            icon={<Dumbbell className="w-9 h-9 text-border" />}
            title={t.plans_no_plans_title}
            subtitle={t.plans_no_plans_subtitle}
          />
        ) : visiblePlans.length === 0 ? (
          <div className="flex flex-col items-center">
            <EmptyState
              icon={<Search className="w-9 h-9 text-border" />}
              title={t.plans_no_results_title}
              subtitle={t.plans_no_results_subtitle}
            />
            <button
              onClick={handleClearAll}
              className="mt-5 text-sm text-brand font-semibold cursor-pointer"
            >
              {t.plans_no_results_clear}
            </button>
          </div>
        ) : (
          <>
            {activeVisible.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                onToggleStatus={() => handleToggleStatus(plan.id)}
                onDuplicate={() => handleDuplicate(plan.id)}
              />
            ))}
            {completedVisible.length > 0 && (
              <>
                {activeVisible.length > 0 && (
                  <p className="text-muted text-xs font-medium tracking-widest uppercase pt-3">
                    {t.plan_completed_count.replace('{n}', String(completedVisible.length))}
                  </p>
                )}
                {completedVisible.map((plan) => (
                  <PlanCard
                    key={plan.id}
                    plan={plan}
                    onToggleStatus={() => handleToggleStatus(plan.id)}
                    onDuplicate={() => handleDuplicate(plan.id)}
                  />
                ))}
              </>
            )}
          </>
        )}
      </div>

      {/* New Plan CTA */}
      <div
        className="fixed bottom-16 left-0 right-0 max-w-md mx-auto px-6 pb-4 pt-6"
        style={{ background: 'linear-gradient(to top, var(--color-base) 60%, transparent)' }}
      >
        <Link
          href="/plans/new"
          className="font-bold rounded-2xl cursor-pointer transition-transform duration-150 active:scale-[0.98] flex items-center justify-center font-condensed bg-brand text-white text-base py-3.5 px-6 w-full gap-2"
        >
          <Plus className="w-5 h-5" strokeWidth={2.5} />
          {t.new_plan}
        </Link>
      </div>

      {showAiModal && (
        <AiPlanSuggestionModal onApply={handleAiApply} onClose={() => setShowAiModal(false)} />
      )}

      <PlanControlsSheet
        isOpen={showControls}
        onClose={() => setShowControls(false)}
        search={search}
        onSearchChange={setSearch}
        sort={sort}
        onSortChange={setSort}
        filters={filters}
        onFiltersChange={setFilters}
        onClearAll={handleClearAll}
        muscles={muscles}
        dayCounts={dayCounts}
      />

      <BottomNav active="plans" />
    </Page>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3.5 py-2 rounded-xl text-sm font-medium border transition-colors duration-150 cursor-pointer ${
        active
          ? 'bg-brand text-white border-brand'
          : 'bg-base text-secondary border-border active:bg-elevated'
      }`}
    >
      {children}
    </button>
  );
}

function ControlRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-secondary text-xs font-medium uppercase tracking-wide mb-2">{label}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function PlanControlsSheet({
  isOpen,
  onClose,
  search,
  onSearchChange,
  sort,
  onSortChange,
  filters,
  onFiltersChange,
  onClearAll,
  muscles,
  dayCounts,
}: {
  isOpen: boolean;
  onClose: () => void;
  search: string;
  onSearchChange: (value: string) => void;
  sort: PlanSort;
  onSortChange: (sort: PlanSort) => void;
  filters: PlanFilters;
  onFiltersChange: (filters: PlanFilters) => void;
  onClearAll: () => void;
  muscles: ReturnType<typeof availableMuscles>;
  dayCounts: number[];
}) {
  const t = useTranslations();
  const set = (patch: Partial<PlanFilters>) => onFiltersChange({ ...filters, ...patch });
  const sortOptions: { value: PlanSort; label: string }[] = [
    { value: 'created', label: t.plans_sort_created },
    { value: 'followed', label: t.plans_sort_followed },
    { value: 'updated', label: t.plans_sort_updated },
    { value: 'name', label: t.plans_sort_name },
  ];

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose}>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold text-foreground">{t.plans_controls_title}</h2>
        <button
          onClick={() => {
            onClearAll();
            onClose();
          }}
          className="text-sm text-brand font-medium cursor-pointer"
        >
          {t.plans_filters_clear_all}
        </button>
      </div>

      <div className="space-y-5">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dim pointer-events-none" />
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t.plans_search_placeholder}
            className="w-full bg-base text-foreground rounded-xl pl-10 pr-10 py-3 text-base outline-none border border-border placeholder-dim focus:ring-2 focus:ring-brand transition-shadow duration-150"
          />
          {search !== '' && (
            <button
              onClick={() => onSearchChange('')}
              aria-label={t.plans_search_clear}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full text-muted active:bg-elevated transition-colors duration-150 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <ControlRow label={t.plans_sort_label}>
          {sortOptions.map((opt) => (
            <Chip
              key={opt.value}
              active={sort === opt.value}
              onClick={() => onSortChange(opt.value)}
            >
              {opt.label}
            </Chip>
          ))}
        </ControlRow>

        <ControlRow label={t.plans_filter_status_label}>
          <Chip active={filters.status === 'active'} onClick={() => set({ status: 'active' })}>
            {t.plans_filter_status_active}
          </Chip>
          <Chip
            active={filters.status === 'completed'}
            onClick={() => set({ status: 'completed' })}
          >
            {t.plans_filter_status_completed}
          </Chip>
          <Chip active={filters.status === 'all'} onClick={() => set({ status: 'all' })}>
            {t.plans_filter_status_all}
          </Chip>
        </ControlRow>

        <ControlRow label={t.plans_filter_origin_label}>
          <Chip active={filters.aiGenerated === 'any'} onClick={() => set({ aiGenerated: 'any' })}>
            {t.plans_filter_origin_any}
          </Chip>
          <Chip active={filters.aiGenerated === 'ai'} onClick={() => set({ aiGenerated: 'ai' })}>
            {t.plans_filter_origin_ai}
          </Chip>
          <Chip
            active={filters.aiGenerated === 'manual'}
            onClick={() => set({ aiGenerated: 'manual' })}
          >
            {t.plans_filter_origin_manual}
          </Chip>
        </ControlRow>

        {muscles.length > 0 && (
          <ControlRow label={t.plans_filter_muscle_label}>
            <Chip active={filters.muscle === null} onClick={() => set({ muscle: null })}>
              {t.plans_filter_muscle_any}
            </Chip>
            {muscles.map((m) => (
              <Chip key={m} active={filters.muscle === m} onClick={() => set({ muscle: m })}>
                {t.muscle_labels[m] ?? m}
              </Chip>
            ))}
          </ControlRow>
        )}

        {dayCounts.length > 0 && (
          <ControlRow label={t.plans_filter_days_label}>
            <Chip
              active={filters.trainingDays === null}
              onClick={() => set({ trainingDays: null })}
            >
              {t.plans_filter_days_any}
            </Chip>
            {dayCounts.map((n) => (
              <Chip
                key={n}
                active={filters.trainingDays === n}
                onClick={() => set({ trainingDays: n })}
              >
                {n} {n !== 1 ? t.training_days : t.training_day}
              </Chip>
            ))}
          </ControlRow>
        )}
      </div>

      <Button variant="primary" className="w-full mt-6" onClick={onClose}>
        {t.plans_filters_done}
      </Button>
    </BottomSheet>
  );
}

function PlanCard({
  plan,
  onToggleStatus,
  onDuplicate,
}: {
  plan: WorkoutPlan;
  onToggleStatus: () => void;
  onDuplicate: () => void;
}) {
  const t = useTranslations();
  const isCompleted = plan.status === 'completed';
  const muscles = getPlanMuscles(plan);
  const scheduledWeekdays = [...new Set(plan.days.flatMap((d) => d.weekdays))].sort(
    (a, b) => a - b,
  );
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div
      className={`relative flex items-center rounded-2xl border px-4 py-4 gap-3 ${
        isCompleted ? 'bg-surface/50 border-border/50' : 'bg-surface border-border'
      }`}
    >
      {plan.aiGenerated === true && (
        <div className="absolute -top-px left-3 flex items-center gap-1 bg-brand text-white rounded-b-md px-1.5 py-0.5">
          <Sparkles className="w-2.5 h-2.5" />
          <span className="text-[9px] font-bold tracking-wide uppercase leading-none">AI</span>
        </div>
      )}

      <Link
        href={`/plans/${plan.id}`}
        className="flex-1 min-w-0 active:opacity-70 transition-opacity duration-150"
      >
        <p className={`font-semibold text-base ${isCompleted ? 'text-muted' : 'text-foreground'}`}>
          {plan.name}
        </p>
        <p className="text-muted text-sm mt-0.5">
          {plan.days.length} {plan.days.length !== 1 ? t.training_days : t.training_day}
          {plan.scheduledWeeks && (
            <span className="ml-2">
              · {plan.scheduledWeeks} {plan.scheduledWeeks !== 1 ? 'weeks' : 'week'}
            </span>
          )}
          {isCompleted && <span className="ml-2 text-dim text-xs">· {t.plan_completed_label}</span>}
        </p>
        {scheduledWeekdays.length > 0 && (
          <p className="text-dim text-xs mt-1">
            {scheduledWeekdays.map((w) => t.weekday_abbr[w]).join(' · ')}
          </p>
        )}
        {muscles.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {muscles.map((m) => (
              <MuscleBadge key={m} muscle={m} />
            ))}
          </div>
        )}
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
                  onDuplicate();
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
                  onToggleStatus();
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
