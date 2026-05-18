'use client';

import {
  Activity,
  ChevronsDown,
  Disc3,
  Dumbbell,
  Flame,
  Footprints,
  Heart,
  Layers,
  Move,
  Shield,
  Spline,
  Target,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import type { Muscle } from '@/lib/muscles';
import { useTranslations } from '@/lib/locale-context';

const MUSCLE_ICONS: Record<Muscle, LucideIcon> = {
  chest: Heart,
  back: Layers,
  shoulders: Zap,
  arms: Dumbbell,
  quads: Target,
  hamstrings: Spline,
  glutes: Disc3,
  calves: Footprints,
  abs: Flame,
  obliques: Move,
  lower_back: Shield,
  cardio: Activity,
};

export default function MuscleBadge({ muscle }: { muscle: Muscle }) {
  const t = useTranslations();
  const label = t.muscle_labels[muscle] ?? muscle;
  const Icon = MUSCLE_ICONS[muscle] ?? ChevronsDown;
  return (
    <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-elevated text-secondary">
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
}
