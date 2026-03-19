'use client';

import { Play } from 'lucide-react';
import { useTranslations } from '@/lib/locale-context';

interface SessionPausedOverlayProps {
  onResume: () => void;
}

export default function SessionPausedOverlay({ onResume }: SessionPausedOverlayProps) {
  const t = useTranslations();

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-base/80 backdrop-blur-sm z-10">
      <button
        onClick={onResume}
        aria-label="Resume session"
        className="w-24 h-24 rounded-full bg-brand flex items-center justify-center shadow-lg active:scale-95 transition-transform duration-150 cursor-pointer"
      >
        <Play className="w-10 h-10 text-white ml-1" />
      </button>
      <p className="text-secondary text-sm font-medium mt-4">{t.session_paused}</p>
    </div>
  );
}
