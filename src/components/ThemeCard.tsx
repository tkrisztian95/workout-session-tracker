'use client';

import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '@/lib/theme-context';
import { useTranslations } from '@/lib/locale-context';
import type { Theme } from '@/lib/storage';

const OPTIONS: {
  value: Theme;
  icon: React.ElementType;
  labelKey: 'theme_light' | 'theme_dark' | 'theme_system';
}[] = [
  { value: 'light', icon: Sun, labelKey: 'theme_light' },
  { value: 'dark', icon: Moon, labelKey: 'theme_dark' },
  { value: 'system', icon: Monitor, labelKey: 'theme_system' },
];

export default function ThemeCard() {
  const t = useTranslations();
  const { theme, setTheme } = useTheme();

  const activeOption = OPTIONS.find((o) => o.value === theme);
  const ActiveIcon = activeOption?.icon ?? Monitor;

  return (
    <div className="bg-surface border border-border rounded-2xl overflow-hidden">
      <div className="flex items-center gap-4 px-4 py-4">
        <div className="w-10 h-10 rounded-xl bg-elevated flex items-center justify-center shrink-0">
          <ActiveIcon className="w-5 h-5 text-brand transition-all duration-200" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-foreground text-sm font-semibold leading-tight">
            {t.profile_theme_label}
          </p>
          <p className="text-secondary text-xs mt-0.5">
            {t[activeOption?.labelKey ?? 'theme_system']}
          </p>
        </div>
      </div>
      <div className="px-4 pb-4">
        <div className="bg-elevated rounded-xl p-1 flex gap-1">
          {OPTIONS.map(({ value, icon: Icon, labelKey }) => {
            const active = theme === value;
            return (
              <button
                key={value}
                onClick={() => setTheme(value)}
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
    </div>
  );
}
