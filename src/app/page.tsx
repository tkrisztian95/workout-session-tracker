'use client';

import { useState } from 'react';
import { Plus, Dumbbell } from 'lucide-react';
import ExerciseCard from '@/components/ExerciseCard';
import AddExerciseModal from '@/components/AddExerciseModal';

export interface Exercise {
  id: string;
  name: string;
  type: 'reps' | 'duration';
  sets: number;
  reps?: number;
  duration?: number;
}

export default function WorkoutPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAdd = (exercise: Omit<Exercise, 'id'>) => {
    setExercises((prev) => [...prev, { ...exercise, id: crypto.randomUUID() }]);
    setIsModalOpen(false);
  };

  const handleRemove = (id: string) => {
    setExercises((prev) => prev.filter((e) => e.id !== id));
  };

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <main className="min-h-screen bg-[#111827] flex flex-col max-w-md mx-auto">
      {/* Header */}
      <div className="px-6 pt-14 pb-6">
        <p className="text-[#6B7280] text-xs font-medium tracking-widest uppercase">{today}</p>
        <h1
          className="text-[#F9FAFB] text-5xl font-bold mt-1 leading-none tracking-tight"
          style={{ fontFamily: 'var(--font-barlow-condensed), sans-serif' }}
        >
          Today&apos;s Session
        </h1>
        {exercises.length > 0 && (
          <p className="text-[#6B7280] text-sm mt-3">
            {exercises.length} exercise{exercises.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Exercise list */}
      <div className="flex-1 px-6 pb-36 space-y-3 overflow-y-auto">
        {exercises.length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-24 text-center select-none">
            <div className="w-20 h-20 rounded-full bg-[#1F2937] border border-[#374151] flex items-center justify-center mb-5">
              <Dumbbell className="w-9 h-9 text-[#374151]" />
            </div>
            <p className="text-[#9CA3AF] text-base font-medium">No exercises yet</p>
            <p className="text-[#6B7280] text-sm mt-1">Tap the button below to get started</p>
          </div>
        ) : (
          exercises.map((exercise) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              onRemove={() => handleRemove(exercise.id)}
            />
          ))
        )}
      </div>

      {/* Fixed bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto px-6 pb-10 pt-6 bg-gradient-to-t from-[#111827] via-[#111827]/90 to-transparent">
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full bg-[#F97316] text-white font-bold text-lg py-4 rounded-2xl flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] transition-transform duration-150"
          style={{ fontFamily: 'var(--font-barlow-condensed), sans-serif' }}
        >
          <Plus className="w-5 h-5" strokeWidth={2.5} />
          Add Exercise
        </button>
      </div>

      <AddExerciseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAdd}
      />
    </main>
  );
}
