'use client';

import { useState } from 'react';
import { ChevronLeft, Plus, Timer, Trash2 } from 'lucide-react';
import AddExerciseModal from '@/components/AddExerciseModal';
import { useTranslations } from '@/lib/locale-context';
import type { Exercise, TimedConfig } from '@/lib/types';
import {
  BackButton,
  Button,
  CtaBar,
  FieldLabel,
  HeadingXL,
  Input,
  LabelOverline,
  Page,
  PageHeader,
} from '@/components/ui';

export function TimedConfigScreen({
  onStart,
  onBack,
}: {
  onStart: (config: TimedConfig, exercises: Omit<Exercise, 'id'>[]) => void;
  onBack: () => void;
}) {
  const t = useTranslations();
  const [workSec, setWorkSec] = useState('20');
  const [restSec, setRestSec] = useState('10');
  const [rounds, setRounds] = useState('8');
  const [exercises, setExercises] = useState<Omit<Exercise, 'id'>[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  const canStart = exercises.length > 0;

  const handleStart = () => {
    if (!canStart) return;
    onStart(
      {
        mode: 'tabata',
        workSec: Math.max(1, parseInt(workSec, 10) || 0),
        restSec: Math.max(0, parseInt(restSec, 10) || 0),
        rounds: Math.max(1, parseInt(rounds, 10) || 0),
      },
      exercises,
    );
  };

  return (
    <Page>
      <PageHeader>
        <BackButton onClick={onBack} aria-label="Go back">
          <span className="w-9 h-9 rounded-full flex items-center justify-center bg-surface active:bg-elevated">
            <ChevronLeft className="w-5 h-5 text-secondary" />
          </span>
          <span className="text-sm font-medium text-secondary">{t.back}</span>
        </BackButton>
        <HeadingXL>{t.timed_config_title}</HeadingXL>
      </PageHeader>

      <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-6">
        <div>
          <LabelOverline>{t.timed_mode_tabata}</LabelOverline>
          <div className="grid grid-cols-3 gap-3 mt-2">
            <div>
              <FieldLabel>{t.timed_work_sec}</FieldLabel>
              <Input
                type="number"
                inputMode="numeric"
                min="1"
                value={workSec}
                onChange={(e) => setWorkSec(e.target.value)}
              />
            </div>
            <div>
              <FieldLabel>{t.timed_rest_sec}</FieldLabel>
              <Input
                type="number"
                inputMode="numeric"
                min="0"
                value={restSec}
                onChange={(e) => setRestSec(e.target.value)}
              />
            </div>
            <div>
              <FieldLabel>{t.timed_rounds}</FieldLabel>
              <Input
                type="number"
                inputMode="numeric"
                min="1"
                value={rounds}
                onChange={(e) => setRounds(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div>
          <LabelOverline>{t.timed_circuit}</LabelOverline>
          <div className="flex flex-col gap-2 mt-2">
            {exercises.map((ex, i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-3 rounded-xl bg-surface px-4 py-3"
              >
                <span className="flex items-center gap-2 min-w-0">
                  <span className="text-dim text-sm tabular-nums w-5">{i + 1}</span>
                  <span className="truncate text-secondary">{ex.name}</span>
                </span>
                <button
                  onClick={() => setExercises((list) => list.filter((_, idx) => idx !== i))}
                  className="shrink-0 text-muted active:text-danger transition-colors"
                  aria-label={t.discard}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <Button variant="secondary" onClick={() => setModalOpen(true)}>
              <span className="flex items-center gap-2">
                <Plus className="w-5 h-5" /> {t.timed_add_exercise}
              </span>
            </Button>
          </div>
        </div>
      </div>

      <CtaBar>
        {!canStart && <p className="text-muted text-sm text-center">{t.timed_need_exercise}</p>}
        <Button size="lg" disabled={!canStart} onClick={handleStart}>
          <span className="flex items-center gap-2">
            <Timer className="w-5 h-5" /> {t.timed_start}
          </span>
        </Button>
      </CtaBar>

      <AddExerciseModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onAdd={(ex) => {
          setExercises((list) => [...list, ex]);
          setModalOpen(false);
        }}
      />
    </Page>
  );
}
