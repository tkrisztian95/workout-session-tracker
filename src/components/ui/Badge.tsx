import { forwardRef } from 'react';

type BadgeVariant = 'brand' | 'subtle';

const VARIANT: Record<BadgeVariant, string> = {
  brand: 'text-xs font-semibold px-2 py-0.5 rounded-full text-brand bg-brand/10',
  subtle: 'text-xs font-semibold px-2 py-0.5 rounded-full text-muted border border-border',
};

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant: BadgeVariant;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant, className = '', ...props }, ref) => (
    <span ref={ref} className={`${VARIANT[variant]} ${className}`} {...props} />
  ),
);
Badge.displayName = 'Badge';
