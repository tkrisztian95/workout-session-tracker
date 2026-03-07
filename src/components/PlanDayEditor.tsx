'use client';

import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import type { PlanDay, PlanExercise } from '@/lib/types';
import AddPlanExerciseModal from './AddPlanExerciseModal';
import { useTranslations } from '@/lib/locale-context';
import CategoryBadge from '@/components/CategoryBadge';
import { Card, IconButton, Input } from '@/components/ui';

interface Props {
  day: PlanDay;
  onChange: (day: PlanDay) => void;
  onRemove: () => void;
}

function planExerciseDetail(ex: PlanExercise): string {
  if (ex.type === 'sets-reps') return `${ex.sets}×${ex.reps}`;
  if (ex.type === 'sets-duration') return `${ex.sets}×${ex.duration}s`;
  const d = ex.duration ?? 0;
  return d >= 60 ? `${Math.round(d / 60)} min` : `${d}s`;
}

function ExerciseRow({ ex, onRemove }: { ex: PlanExercise; onRemove: () => void }) {
  const detail = planExerciseDetail(ex);

  return (
    <div className="flex items-center gap-2 bg-base border border-border rounded-xl px-3 py-2.5">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-foreground text-sm font-medium truncate">{ex.name}</p>
          {ex.category && <CategoryBadge category={ex.category} />}
        </div>
        <p className="text-brand text-xs mt-0.5">{detail}</p>
        {ex.scalingNote && <p className="text-muted text-xs mt-0.5 truncate">{ex.scalingNote}</p>}
      </div>
      <IconButton
        size="sm"
        onClick={onRemove}
        aria-label={`Remove ${ex.name}`}
        className="flex-shrink-0"
      >
        <X className="w-3.5 h-3.5 text-secondary" />
      </IconButton>
    </div>
  );
}

export default function PlanDayEditor({ day, onChange, onRemove }: Props) {
  const t = useTranslations();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSchedule, setShowSchedule] = useState(day.weekdays.length > 0);

  const toggleSchedule = () => {
    if (showSchedule) {
      onChange({ ...day, weekdays: [] });
    }
    setShowSchedule((prev) => !prev);
  };

  const toggleWeekday = (wd: number) => {
    const wds = day.weekdays.includes(wd)
      ? day.weekdays.filter((d) => d !== wd)
      : [...day.weekdays, wd].sort();
    onChange({ ...day, weekdays: wds });
  };

  const handleAddExercise = (ex: Omit<PlanExercise, 'id'>) => {
    const newEx: PlanExercise = { ...ex, id: crypto.randomUUID() };
    if (ex.role === 'core') {
      onChange({ ...day, coreExercises: [...day.coreExercises, newEx] });
    } else {
      onChange({ ...day, optionalExercises: [...day.optionalExercises, newEx] });
    }
    setIsModalOpen(false);
  };

  const removeExercise = (role: 'core' | 'optional', id: string) => {
    if (role === 'core') {
      onChange({ ...day, coreExercises: day.coreExercises.filter((e) => e.id !== id) });
    } else {
      onChange({ ...day, optionalExercises: day.optionalExercises.filter((e) => e.id !== id) });
    }
  };

  return (
    <Card className="p-4 space-y-4">
      {/* Day name + remove */}
      <div className="flex items-center gap-3">
        <Input
          type="text"
          value={day.name}
          onChange={(e) => onChange({ ...day, name: e.target.value })}
          placeholder={t.plan_day_name_placeholder}
          className="flex-1 py-2.5"
        />
        <IconButton
          onClick={onRemove}
          aria-label="Remove day"
          className="hover:bg-danger/20 transition-colors"
        >
          <X className="w-4 h-4 text-secondary" />
        </IconButton>
      </div>

      {/* Schedule toggle + weekday selector */}
      <div>
        <button
          onClick={toggleSchedule}
          className="flex items-center gap-2 text-sm font-medium cursor-pointer select-none"
        >
          <span
            className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
              showSchedule ? 'bg-brand border-brand' : 'bg-transparent border-muted'
            }`}
          >
            {showSchedule && (
              <svg viewBox="0 0 10 8" className="w-2.5 h-2.5 text-white fill-current">
                <path
                  d="M1 4l3 3 5-6"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </span>
          <span className={showSchedule ? 'text-foreground' : 'text-muted'}>
            {t.plan_day_schedule}
          </span>
        </button>
        {showSchedule && (
          <div className="flex gap-1.5 flex-wrap mt-3">
            {t.weekday_abbr.map((label, idx) => (
              <button
                key={idx}
                onClick={() => toggleWeekday(idx)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors duration-150 ${
                  day.weekdays.includes(idx) ? 'bg-brand text-white' : 'bg-elevated text-secondary'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Core exercises */}
      <div>
        <p className="block text-secondary text-xs font-medium uppercase tracking-wide mb-2">
          {t.plan_day_core_exercises}
        </p>
        <div className="space-y-2">
          {day.coreExercises.map((ex) => (
            <ExerciseRow key={ex.id} ex={ex} onRemove={() => removeExercise('core', ex.id)} />
          ))}
          {day.coreExercises.length === 0 && (
            <p className="text-muted text-sm">{t.plan_day_no_core}</p>
          )}
        </div>
      </div>

      {/* Optional exercises */}
      <div>
        <p className="block text-secondary text-xs font-medium uppercase tracking-wide mb-2">
          {t.plan_day_optional_exercises}
        </p>
        <div className="space-y-2">
          {day.optionalExercises.map((ex) => (
            <ExerciseRow key={ex.id} ex={ex} onRemove={() => removeExercise('optional', ex.id)} />
          ))}
          {day.optionalExercises.length === 0 && (
            <p className="text-muted text-sm">{t.plan_day_no_optional}</p>
          )}
        </div>
      </div>

      {/* Add exercise button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="flex items-center gap-2 text-brand text-sm font-semibold cursor-pointer"
      >
        <Plus className="w-4 h-4" />
        {t.plan_day_add_exercise}
      </button>

      <AddPlanExerciseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddExercise}
      />
    </Card>
  );
}
