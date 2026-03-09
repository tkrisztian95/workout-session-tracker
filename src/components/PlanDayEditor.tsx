'use client';

import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import type { PlanDay, PlanExercise } from '@/lib/types';
import AddPlanExerciseModal from './AddPlanExerciseModal';
import { useTranslations } from '@/lib/locale-context';
import PlanExerciseRow from '@/components/PlanExerciseRow';
import { Card, IconButton, Input } from '@/components/ui';

interface Props {
  day: PlanDay;
  onChange: (day: PlanDay) => void;
  onRemove: () => void;
}

export default function PlanDayEditor({ day, onChange, onRemove }: Props) {
  const t = useTranslations();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState<PlanExercise | null>(null);
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

  const handleEditExercise = (updated: Omit<PlanExercise, 'id'>) => {
    if (!editingExercise) return;
    const id = editingExercise.id;
    onChange({
      ...day,
      coreExercises: day.coreExercises.map((e) => (e.id === id ? { ...updated, id } : e)),
      optionalExercises: day.optionalExercises.map((e) => (e.id === id ? { ...updated, id } : e)),
    });
    setEditingExercise(null);
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
          {t.plan_day_core_exercises} ({day.coreExercises.length})
        </p>
        <div className="space-y-2">
          {day.coreExercises.map((ex) => (
            <PlanExerciseRow
              key={ex.id}
              ex={ex}
              onEdit={() => setEditingExercise(ex)}
              onRemove={() => removeExercise('core', ex.id)}
            />
          ))}
          {day.coreExercises.length === 0 && (
            <p className="text-muted text-sm">{t.plan_day_no_core}</p>
          )}
        </div>
      </div>

      {/* Optional exercises */}
      <div>
        <p className="block text-secondary text-xs font-medium uppercase tracking-wide mb-2">
          {t.plan_day_optional_exercises} ({day.optionalExercises.length})
        </p>
        <div className="space-y-2">
          {day.optionalExercises.map((ex) => (
            <PlanExerciseRow
              key={ex.id}
              ex={ex}
              onEdit={() => setEditingExercise(ex)}
              onRemove={() => removeExercise('optional', ex.id)}
            />
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
      <AddPlanExerciseModal
        isOpen={editingExercise !== null}
        onClose={() => setEditingExercise(null)}
        onAdd={handleAddExercise}
        onEdit={handleEditExercise}
        initialValues={editingExercise ?? undefined}
      />
    </Card>
  );
}
