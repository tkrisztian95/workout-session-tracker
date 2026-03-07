import { forwardRef } from 'react';

// ─── LabelOverline ────────────────────────────────────────────────────────────

interface LabelOverlineProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
}

export const LabelOverline = forwardRef<HTMLParagraphElement, LabelOverlineProps>(
  ({ className = '', ...props }, ref) => (
    <p
      ref={ref}
      className={`text-muted text-xs font-medium tracking-widest uppercase ${className}`}
      {...props}
    />
  ),
);
LabelOverline.displayName = 'LabelOverline';

// ─── HeadingXL ────────────────────────────────────────────────────────────────
// Polymorphic — defaults to <h1>. Pass as="h2", as="h3", as="span", etc.

type HeadingTag = 'h1' | 'h2' | 'h3' | 'h4' | 'span' | 'p';

interface HeadingXLProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: HeadingTag;
  children: React.ReactNode;
}

export function HeadingXL({ as: Tag = 'h1', className = '', ...props }: HeadingXLProps) {
  return (
    <Tag
      className={`text-foreground text-5xl font-bold leading-none tracking-tight font-condensed ${className}`}
      {...(props as React.HTMLAttributes<HTMLElement>)}
    />
  );
}

// ─── ListLabel ────────────────────────────────────────────────────────────────

interface ListLabelProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
}

export const ListLabel = forwardRef<HTMLParagraphElement, ListLabelProps>(
  ({ className = '', ...props }, ref) => (
    <p
      ref={ref}
      className={`text-muted text-xs font-medium uppercase tracking-wide pt-2 ${className}`}
      {...props}
    />
  ),
);
ListLabel.displayName = 'ListLabel';
