'use client';

import { createContext, useContext, useId, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface TabItem {
  id: string;
  label: string;
  content: ReactNode;
}

// ─── Context ────────────────────────────────────────────────────────────────
//
// `TabsProvider` owns the shared state (the active id + a stable id prefix so
// the tablist and panel keep their `aria-controls` / `aria-labelledby` wiring
// even when rendered in separate parts of the tree). This lets `TabList` and
// `TabPanels` live in different layout regions — e.g. a fixed control bar and a
// scrolling content area — without prop-drilling.

interface TabsContextValue {
  baseId: string;
  activeId: string;
  onChange: (id: string) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext(component: string): TabsContextValue {
  const ctx = useContext(TabsContext);
  if (!ctx) {
    throw new Error(`<${component}> must be rendered inside <TabsProvider>`);
  }
  return ctx;
}

interface TabsProviderProps {
  activeId: string;
  onChange: (id: string) => void;
  children: ReactNode;
}

export function TabsProvider({ activeId, onChange, children }: TabsProviderProps) {
  const baseId = useId();
  return (
    <TabsContext.Provider value={{ baseId, activeId, onChange }}>{children}</TabsContext.Provider>
  );
}

// ─── TabList (the control) ────────────────────────────────────────────────────

interface TabListProps {
  tabs: Pick<TabItem, 'id' | 'label'>[];
  className?: string;
}

export function TabList({ tabs, className }: TabListProps) {
  const { baseId, activeId, onChange } = useTabsContext('TabList');
  const activeIndex = Math.max(
    0,
    tabs.findIndex((t) => t.id === activeId),
  );

  return (
    <div role="tablist" className={cn('relative flex border-b border-border', className)}>
      {tabs.map((tab, index) => {
        const isActive = index === activeIndex;
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
  );
}

// ─── TabPanels (the content) ──────────────────────────────────────────────────

interface TabPanelsProps {
  tabs: Pick<TabItem, 'id' | 'content'>[];
  className?: string;
}

export function TabPanels({ tabs, className }: TabPanelsProps) {
  const { baseId, activeId } = useTabsContext('TabPanels');
  const activeIndex = Math.max(
    0,
    tabs.findIndex((t) => t.id === activeId),
  );
  const active = tabs[activeIndex] ?? tabs[0];
  if (!active) return null;

  return (
    <div
      role="tabpanel"
      id={`${baseId}-panel-${active.id}`}
      aria-labelledby={`${baseId}-tab-${active.id}`}
      className={className}
    >
      {active.content}
    </div>
  );
}
