'use client';

import { forwardRef } from 'react';

// ─── Shared base ──────────────────────────────────────────────────────────────

const BASE =
  'font-bold rounded-2xl cursor-pointer transition-transform duration-150 active:scale-[0.98] flex items-center font-condensed';

// ─── Button ───────────────────────────────────────────────────────────────────

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'lg' | 'md' | 'sm';

const VARIANT: Record<ButtonVariant, string> = {
  primary: `${BASE} bg-brand text-white`,
  secondary: `${BASE} bg-surface border border-border text-foreground`,
  ghost: `${BASE} border border-border text-secondary`,
  danger: `${BASE} bg-danger text-white`,
};

const SIZE: Record<ButtonSize, string> = {
  lg: 'w-full text-xl py-5 px-6 justify-between',
  md: 'text-base py-3.5 px-6 justify-center',
  sm: 'text-sm py-3.5 px-4 justify-center',
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className = '', ...props }, ref) => (
    <button ref={ref} className={`${VARIANT[variant]} ${SIZE[size]} ${className}`} {...props} />
  ),
);
Button.displayName = 'Button';

// ─── IconButton ───────────────────────────────────────────────────────────────

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'md' | 'sm';
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ size = 'md', className = '', ...props }, ref) => (
    <button
      ref={ref}
      className={
        size === 'sm'
          ? `w-9 h-9 rounded-full flex items-center justify-center transition-colors duration-150 cursor-pointer bg-surface active:bg-elevated ${className}`
          : `w-11 h-11 rounded-full flex items-center justify-center transition-colors duration-150 cursor-pointer bg-elevated ${className}`
      }
      {...props}
    />
  ),
);
IconButton.displayName = 'IconButton';

// ─── BackButton ───────────────────────────────────────────────────────────────

interface BackButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export const BackButton = forwardRef<HTMLButtonElement, BackButtonProps>(
  ({ className = '', ...props }, ref) => (
    <button
      ref={ref}
      className={`flex items-center gap-2 cursor-pointer mb-2 ${className}`}
      {...props}
    />
  ),
);
BackButton.displayName = 'BackButton';
