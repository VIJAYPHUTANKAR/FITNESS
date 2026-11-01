'use client';

import * as React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/ui';

export interface SheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function Sheet({
  open,
  onClose,
  title,
  description,
  children,
  className,
}: SheetProps) {
  const sheetRef = React.useRef<HTMLDivElement>(null);
  const titleId = React.useId();
  const descId = React.useId();

  // Close on Escape & trap focus
  React.useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
        return;
      }

      if (e.key === 'Tab' && sheetRef.current) {
        const focusables = sheetRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;

        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Initial focus on first input or close button
    const timer = setTimeout(() => {
      if (sheetRef.current) {
        const auto = sheetRef.current.querySelector<HTMLElement>('[autofocus]') ||
          sheetRef.current.querySelector<HTMLElement>('input, button');
        auto?.focus();
      }
    }, 50);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timer);
    };
  }, [open, onClose]);

  // Lock background scroll when open
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? titleId : undefined}
      aria-describedby={description ? descId : undefined}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-[#12142B]/60 backdrop-blur-xs transition-opacity duration-150"
      />

      {/* Surface: Bottom sheet on mobile, dialog on desktop */}
      <div
        ref={sheetRef}
        className={cn(
          'relative z-10 w-full max-h-[90vh] sm:max-h-[85vh] overflow-y-auto',
          'bg-[var(--color-plate)] text-[var(--color-neel)] border border-[var(--color-border)] shadow-2xl',
          'rounded-t-[24px] sm:rounded-[20px] p-5 sm:p-6 sm:max-w-lg',
          'transition-all duration-200',
          className
        )}
      >
        {/* Mobile drag affordance bar */}
        <div className="mx-auto mb-3 h-1 w-12 rounded-full bg-[var(--color-border)] sm:hidden" />

        <div className="flex items-start justify-between gap-4 pb-3 border-b border-[var(--color-border-subtle)]">
          <div>
            {title && (
              <h2 id={titleId} className="font-heading text-lg font-bold text-[var(--color-neel)]">
                {title}
              </h2>
            )}
            {description && (
              <p id={descId} className="mt-0.5 text-xs text-[var(--color-neel-muted)]">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-10 w-10 items-center justify-center rounded-lg text-[var(--color-neel-muted)] hover:bg-[var(--color-steel)] hover:text-[var(--color-neel)] transition-colors min-h-[44px] min-w-[44px]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="pt-4">{children}</div>
      </div>
    </div>
  );
}
