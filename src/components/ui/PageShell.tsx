import { forwardRef } from 'react';

// ─── Page ─────────────────────────────────────────────────────────────────────

interface PageProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
}

export const Page = forwardRef<HTMLElement, PageProps>(({ className = '', ...props }, ref) => (
  <main
    ref={ref}
    className={`h-dvh bg-base flex flex-col max-w-md mx-auto ${className}`}
    {...props}
  />
));
Page.displayName = 'Page';

// ─── PageHeader ───────────────────────────────────────────────────────────────

interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  /** Drop the opaque `bg-base` so a decorative page background shows through. */
  transparent?: boolean;
}

export const PageHeader = forwardRef<HTMLDivElement, PageHeaderProps>(
  ({ className = '', transparent = false, ...props }, ref) => (
    <div
      ref={ref}
      className={`px-6 sticky top-0 z-10 ${transparent ? '' : 'bg-base'} pt-[max(0.5rem,env(safe-area-inset-top))] ${className || 'pb-6'}`}
      {...props}
    />
  ),
);
PageHeader.displayName = 'PageHeader';
