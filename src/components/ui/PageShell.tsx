import { forwardRef } from 'react';

// ─── Page ─────────────────────────────────────────────────────────────────────

interface PageProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
}

export const Page = forwardRef<HTMLElement, PageProps>(({ className = '', ...props }, ref) => (
  <main
    ref={ref}
    className={`min-h-screen bg-base flex flex-col max-w-md mx-auto ${className}`}
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
    <div ref={ref} className={`px-6 pt-14 pb-6 ${className}`} {...props} />
  ),
);
PageHeader.displayName = 'PageHeader';
