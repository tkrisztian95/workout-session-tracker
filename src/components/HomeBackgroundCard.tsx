'use client';

import { useState } from 'react';
import { Zap, Hexagon, Flame, Square, ChevronDown } from 'lucide-react';
import { useTranslations } from '@/lib/locale-context';
import { type HomeBackground, getHomeBackground, saveHomeBackground } from '@/lib/storage';

const OPTIONS: {
  value: HomeBackground;
  icon: React.ElementType;
  labelKey: 'home_bg_velocity' | 'home_bg_charge' | 'home_bg_ignite' | 'home_bg_none';
}[] = [
  { value: 'velocity', icon: Zap, labelKey: 'home_bg_velocity' },
  { value: 'charge', icon: Hexagon, labelKey: 'home_bg_charge' },
  { value: 'ignite', icon: Flame, labelKey: 'home_bg_ignite' },
  { value: 'none', icon: Square, labelKey: 'home_bg_none' },
];

interface HomeBackgroundCardProps {
  open?: boolean;
  onToggle?: () => void;
}

export default function HomeBackgroundCard({ open: openProp, onToggle }: HomeBackgroundCardProps) {
  const t = useTranslations();
  const [value, setValue] = useState<HomeBackground>(() => getHomeBackground());
  const [internalOpen, setInternalOpen] = useState(false);

  const controlled = openProp !== undefined;
  const open = controlled ? openProp : internalOpen;
  const toggle = controlled ? onToggle! : () => setInternalOpen((o) => !o);

  const activeOption = OPTIONS.find((o) => o.value === value) ?? OPTIONS[0];
  const ActiveIcon = activeOption.icon;

  const select = (next: HomeBackground) => {
    saveHomeBackground(next);
    setValue(next);
  };

  return (
    <div className="bg-surface border border-border rounded-2xl overflow-hidden">
      <button
        onClick={toggle}
        className="w-full flex items-center gap-4 px-4 py-4 cursor-pointer active:bg-elevated transition-colors duration-150"
      >
        <div className="w-10 h-10 rounded-xl bg-elevated flex items-center justify-center shrink-0">
          <ActiveIcon className="w-5 h-5 text-brand transition-all duration-200" />
        </div>
        <div className="flex-1 min-w-0 text-left">
          <p className="text-foreground text-sm font-semibold leading-tight">
            {t.profile_home_bg_label}
          </p>
          <p className="text-secondary text-xs mt-0.5">{t[activeOption.labelKey]}</p>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-muted transition-transform duration-200 shrink-0 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="px-4 pb-4 border-t border-border">
          <div className="bg-elevated rounded-xl p-1 flex gap-1 mt-3">
            {OPTIONS.map(({ value: optValue, icon: Icon, labelKey }) => {
              const active = value === optValue;
              return (
                <button
                  key={optValue}
                  onClick={() => select(optValue)}
                  className={`flex-1 flex flex-col items-center gap-1.5 py-2.5 rounded-lg transition-all duration-200 cursor-pointer ${
                    active ? 'bg-surface shadow-sm' : 'hover:bg-base/40 active:bg-base/60'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 transition-colors duration-200 ${active ? 'text-brand' : 'text-secondary'}`}
                    strokeWidth={active ? 2.5 : 2}
                  />
                  <span
                    className={`text-xs font-medium transition-colors duration-200 ${active ? 'text-brand' : 'text-secondary'}`}
                  >
                    {t[labelKey]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
