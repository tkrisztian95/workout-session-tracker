'use client';

import { X } from 'lucide-react';

interface ModalSheetProps {
  /** Content rendered in the body of the modal */
  children: React.ReactNode;
  /** Icon rendered inside the header badge */
  icon?: React.ReactNode;
  /** Tailwind bg class for the icon badge, defaults to 'bg-brand/10' */
  iconClassName?: string;
  /** Primary title text */
  title: string;
  /** Optional subtitle rendered below the title row */
  subtitle?: string;
  /**
   * 'sheet'  — bottom-sheet with dark backdrop, slides up from bottom (default)
   * 'page'   — full-screen overlay, centered content, no backdrop
   */
  variant?: 'sheet' | 'page';
  /** Controls visibility for the sheet variant */
  isOpen?: boolean;
  /** Providing this shows an X button and closes on backdrop click */
  onClose?: () => void;
}

export function ModalSheet({
  children,
  icon,
  iconClassName = 'bg-brand/10',
  title,
  subtitle,
  variant = 'sheet',
  isOpen = true,
  onClose,
}: ModalSheetProps) {
  const header = (
    <div className="mb-5">
      <div className="flex items-center gap-3">
        {icon && (
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${iconClassName}`}
          >
            {icon}
          </div>
        )}
        <h2 className="text-lg font-bold text-foreground font-condensed leading-tight flex-1">
          {title}
        </h2>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-elevated flex items-center justify-center cursor-pointer shrink-0 ml-1 active:bg-border transition-colors duration-150"
            aria-label="Close"
          >
            <X className="w-4 h-4 text-muted" />
          </button>
        )}
      </div>
      {subtitle && <p className="text-sm text-muted leading-snug mt-1.5 ml-0">{subtitle}</p>}
    </div>
  );

  if (variant === 'page') {
    return (
      <div className="fixed inset-0 bg-base z-50 flex items-center justify-center px-6">
        <div className="w-full max-w-sm">
          {header}
          {children}
        </div>
      </div>
    );
  }

  // sheet variant
  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/70 z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Sheet */}
      <div
        className={`fixed bottom-0 left-0 right-0 max-w-md mx-auto z-50 bg-surface rounded-t-3xl max-h-[90dvh] flex flex-col overflow-hidden transition-transform duration-300 ease-out ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header — always visible, never scrolls */}
        <div className="px-6 pt-6 flex-shrink-0">{header}</div>
        {/* Body — children manage their own scroll. The bottom safe-area
            padding is applied to the body's direct child rather than the
            wrapper, so a scrolling child uses the full available height and the
            padding becomes scroll-end breathing room instead of a dead band. */}
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden px-6 [&>*]:pb-[max(2.5rem,env(safe-area-inset-bottom))]">
          {children}
        </div>
      </div>
    </>
  );
}
