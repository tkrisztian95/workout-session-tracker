'use client';

import type { Difficulty } from '@/lib/exerciseCatalog';
import { useTranslations } from '@/lib/locale-context';

const STYLES: Record<Difficulty, string> = {
  beginner: 'bg-success/15 text-success',
  intermediate: 'bg-brand/15 text-brand',
  advanced: 'bg-danger/15 text-danger',
};

export default function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  const t = useTranslations();
  const label = t.catalog_difficulty_labels[difficulty] ?? difficulty;
  return (
    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${STYLES[difficulty]}`}>
      {label}
    </span>
  );
}
