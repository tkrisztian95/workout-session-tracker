'use client';

import type { Muscle } from '@/lib/muscles';
import { useTranslations } from '@/lib/locale-context';

export default function MuscleBadge({ muscle }: { muscle: Muscle }) {
  const t = useTranslations();
  const label = t.muscle_labels[muscle] ?? muscle;
  return (
    <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-elevated text-secondary">
      {label}
    </span>
  );
}
