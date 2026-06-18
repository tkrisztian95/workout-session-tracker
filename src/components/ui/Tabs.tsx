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
  /**
   * Pin the tab bar to the top of the nearest scroll container so only the
   * active panel scrolls. The parent must be the scrolling element.
   */
  stickyTabList?: boolean;
}

export function Tabs({ tabs, activeId, onChange, className, stickyTabList = false }: TabsProps) {
  const baseId = useId();
  const activeIndex = Math.max(
    0,
    tabs.findIndex((t) => t.id === activeId),
  );
  const active = tabs[activeIndex] ?? tabs[0];

  return (
    <div className={className}>
      <div
        role="tablist"
        className={cn(
          'relative flex border-b border-border',
          stickyTabList && 'sticky top-0 z-10 bg-base',
        )}
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
                'flex-1 px-3 py-2.5 text-sm font-medium transition-colors cursor-pointer',
                isActive ? 'text-foreground' : 'text-muted active:text-secondary',
              )}
            >
              {tab.label}
            </button>
          );
        })}
        <span
          aria-hidden
          className="pointer-events-none absolute bottom-0 left-0 h-0.5 rounded-full bg-brand transition-transform duration-200 ease-out"
          style={{
            width: `${100 / tabs.length}%`,
            transform: `translateX(${activeIndex * 100}%)`,
          }}
        />
      </div>
      <div
        role="tabpanel"
        id={`${baseId}-panel-${active.id}`}
        aria-labelledby={`${baseId}-tab-${active.id}`}
        className="mt-4"
      >
        {active.content}
      </div>
    </div>
  );
}
