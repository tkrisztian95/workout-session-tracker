import { forwardRef } from 'react';

const CARD_BASE = 'rounded-2xl bg-surface border border-border';
const CARD_ROW_BASE =
  'rounded-2xl bg-surface border border-border flex items-center justify-between px-4 py-4 gap-3 transition-all duration-200';

// ─── Card ─────────────────────────────────────────────────────────────────────

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(({ className = '', ...props }, ref) => (
  <div ref={ref} className={`${CARD_BASE} ${className}`} {...props} />
));
Card.displayName = 'Card';

// ─── CardRow ──────────────────────────────────────────────────────────────────
// Interactive row — renders as <button>.
// For non-interactive or Link-based rows, use <Card> or inline Tailwind directly.

interface CardRowProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export const CardRow = forwardRef<HTMLButtonElement, CardRowProps>(
  ({ className = '', ...props }, ref) => (
    <button
      ref={ref}
      className={`${CARD_ROW_BASE} cursor-pointer active:scale-[0.98] w-full text-left ${className}`}
      {...props}
    />
  ),
);
CardRow.displayName = 'CardRow';
