import { forwardRef } from 'react';

const INPUT_BASE =
  'w-full bg-base text-foreground rounded-xl px-4 py-3 text-base outline-none border border-border placeholder-dim focus:ring-2 focus:ring-brand transition-shadow duration-150';

// ─── FieldLabel ───────────────────────────────────────────────────────────────

interface FieldLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode;
}

export const FieldLabel = forwardRef<HTMLLabelElement, FieldLabelProps>(
  ({ className = '', ...props }, ref) => (
    <label
      ref={ref}
      className={`block text-secondary text-xs font-medium uppercase tracking-wide mb-2 ${className}`}
      {...props}
    />
  ),
);
FieldLabel.displayName = 'FieldLabel';

// ─── Input ────────────────────────────────────────────────────────────────────

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', ...props }, ref) => (
    <input ref={ref} className={`${INPUT_BASE} ${className}`} {...props} />
  ),
);
Input.displayName = 'Input';

// ─── Select ───────────────────────────────────────────────────────────────────

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  children: React.ReactNode;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', ...props }, ref) => (
    <select ref={ref} className={`${INPUT_BASE} ${className}`} {...props} />
  ),
);
Select.displayName = 'Select';
