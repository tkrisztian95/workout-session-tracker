'use client';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  showHandle?: boolean;
}

export function BottomSheet({ isOpen, onClose, children, showHandle = true }: BottomSheetProps) {
  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/60 z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Sheet */}
      <div
        className={`fixed bottom-0 left-0 right-0 max-w-md mx-auto z-50 bg-surface rounded-t-3xl flex flex-col max-h-[90dvh] transition-transform duration-300 ease-out ${
          isOpen ? 'translate-y-0 pointer-events-auto' : 'translate-y-full pointer-events-none'
        }`}
      >
        {showHandle && (
          <div className="flex-shrink-0 pt-4 pb-1">
            <div className="w-10 h-1 rounded-full bg-border-subtle mx-auto" />
          </div>
        )}
        <div className="overflow-y-auto overscroll-contain flex-1 px-6 pt-3 pb-[max(2.5rem,env(safe-area-inset-bottom))]">
          {children}
        </div>
      </div>
    </>
  );
}
