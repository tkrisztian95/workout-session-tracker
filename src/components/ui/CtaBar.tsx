import { forwardRef } from 'react';

const GRADIENT = 'linear-gradient(to top, var(--color-base) 60%, transparent)';

// ─── CtaBar ───────────────────────────────────────────────────────────────────

interface CtaBarProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  slim?: boolean;
}

export const CtaBar = forwardRef<HTMLDivElement, CtaBarProps>(
  ({ slim = false, className = '', style, ...props }, ref) => (
    <div
      ref={ref}
      className={`fixed bottom-0 left-0 right-0 max-w-md mx-auto px-6 pb-[max(0.5rem,env(safe-area-inset-bottom))] ${slim ? 'pt-2' : 'pt-6'} ${className}`}
      style={{ background: GRADIENT, ...style }}
      {...props}
    />
  ),
);
CtaBar.displayName = 'CtaBar';
