'use client';

import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import type { PlanDay, PlanExercise } from '@/lib/types';
import AddPlanExerciseModal from './AddPlanExerciseModal';
import { useTranslations } from '@/lib/locale-context';
import CategoryBadge from '@/components/CategoryBadge';

interface Props {
  day: PlanDay;
  onChange: (day: PlanDay) => void;
  onRemove: () => void;
}

const labelClass = 'block text-[#9CA3AF] text-xs font-medium uppercase tracking-wide mb-2';

function planExerciseDetail(ex: PlanExercise): string {
  if (ex.type === 'sets-reps') return `${ex.sets}×${ex.reps}`;
  if (ex.type === 'sets-duration') return `${ex.sets}×${ex.duration}s`;
  const d = ex.duration ?? 0;
  return d >= 60 ? `${Math.round(d / 60)} min` : `${d}s`;
}

function ExerciseRow({ ex, onRemove }: { ex: PlanExercise; onRemove: () => void }) {
  const detail = planExerciseDetail(ex);

  return (
    <div className="flex items-center gap-2 bg-[#111827] border border-[#374151] rounded-xl px-3 py-2.5">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-[#F9FAFB] text-sm font-medium truncate">{ex.name}</p>
          {ex.category && <CategoryBadge category={ex.category} />}
        </div>
        <p className="text-[#F97316] text-xs mt-0.5">{detail}</p>
        {ex.scalingNote && (
          <p className="text-[#6B7280] text-xs mt-0.5 truncate">{ex.scalingNote}</p>
        )}
      </div>
      <button
        onClick={onRemove}
        aria-label={`Remove ${ex.name}`}
        className="w-8 h-8 flex items-center justify-center rounded-full bg-[#374151] cursor-pointer flex-shrink-0"
      >
        <X className="w-3.5 h-3.5 text-[#9CA3AF]" />
      </button>
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
    <div className="bg-[#1F2937] border border-[#374151] rounded-2xl p-4 space-y-4">
      {/* Day name + remove */}
      <div className="flex items-center gap-3">
        <input
          type="text"
          value={day.name}
          onChange={(e) => onChange({ ...day, name: e.target.value })}
          placeholder={t.plan_day_name_placeholder}
          className="flex-1 bg-[#111827] text-[#F9FAFB] rounded-xl px-4 py-2.5 text-base outline-none focus:ring-2 focus:ring-[#F97316] border border-[#374151] placeholder-[#4B5563]"
        />
        <button
          onClick={onRemove}
          aria-label="Remove day"
          className="w-10 h-10 flex items-center justify-center rounded-full bg-[#374151] cursor-pointer hover:bg-red-900/40 transition-colors"
        >
          <X className="w-4 h-4 text-[#9CA3AF]" />
        </button>
      </div>

      {/* Schedule toggle + weekday selector */}
      <div>
        <button
          onClick={toggleSchedule}
          className="flex items-center gap-2 text-sm font-medium cursor-pointer select-none"
        >
          <span
            className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
              showSchedule ? 'bg-[#F97316] border-[#F97316]' : 'bg-transparent border-[#6B7280]'
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
          <span className={showSchedule ? 'text-[#F9FAFB]' : 'text-[#6B7280]'}>
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
                  day.weekdays.includes(idx)
                    ? 'bg-[#F97316] text-white'
                    : 'bg-[#374151] text-[#9CA3AF]'
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
        <p className={labelClass}>{t.plan_day_core_exercises}</p>
        <div className="space-y-2">
          {day.coreExercises.map((ex) => (
            <ExerciseRow key={ex.id} ex={ex} onRemove={() => removeExercise('core', ex.id)} />
          ))}
          {day.coreExercises.length === 0 && (
            <p className="text-[#6B7280] text-sm">{t.plan_day_no_core}</p>
          )}
        </div>
      </div>

      {/* Optional exercises */}
      <div>
        <p className={labelClass}>{t.plan_day_optional_exercises}</p>
        <div className="space-y-2">
          {day.optionalExercises.map((ex) => (
            <ExerciseRow key={ex.id} ex={ex} onRemove={() => removeExercise('optional', ex.id)} />
          ))}
          {day.optionalExercises.length === 0 && (
            <p className="text-[#6B7280] text-sm">{t.plan_day_no_optional}</p>
          )}
        </div>
      </div>

      {/* Add exercise button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="flex items-center gap-2 text-[#F97316] text-sm font-semibold cursor-pointer"
      >
        <Plus className="w-4 h-4" />
        {t.plan_day_add_exercise}
      </button>

      <AddPlanExerciseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddExercise}
      />
    </div>
  );
}
