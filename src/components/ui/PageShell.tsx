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
}

export const PageHeader = forwardRef<HTMLDivElement, PageHeaderProps>(
  ({ className = '', ...props }, ref) => (
    <div
      ref={ref}
      className={`px-6 pb-6 sticky top-0 z-10 bg-base pt-[max(3.5rem,env(safe-area-inset-top))] ${className}`}
      {...props}
    />
  ),
);
PageHeader.displayName = 'PageHeader';
