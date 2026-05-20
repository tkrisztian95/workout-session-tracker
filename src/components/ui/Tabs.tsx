'use client';

import { useId, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface TabItem {
  id: string;
  label: string;
  content: ReactNode;
}

interface TabsProps {
  tabs: TabItem[];
  activeId: string;
  onChange: (id: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeId, onChange, className }: TabsProps) {
  const baseId = useId();
  const active = tabs.find((t) => t.id === activeId) ?? tabs[0];

  return (
    <div className={className}>
      <div
        role="tablist"
        className="flex items-stretch gap-1 rounded-xl bg-surface border border-border p-1"
      >
        {tabs.map((tab) => {
          const isActive = tab.id === active.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`${baseId}-tab-${tab.id}`}
              aria-selected={isActive}
              aria-controls={`${baseId}-panel-${tab.id}`}
              onClick={() => onChange(tab.id)}
              className={cn(
                'flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer',
                isActive ? 'bg-base text-foreground shadow-sm' : 'text-muted active:bg-elevated',
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      <div
        role="tabpanel"
        id={`${baseId}-panel-${active.id}`}
        aria-labelledby={`${baseId}-tab-${active.id}`}
        className="mt-3"
      >
        {active.content}
      </div>
    </div>
  );
}
