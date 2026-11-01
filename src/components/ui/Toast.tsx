'use client';

import * as React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/ui';

export interface ToastProps {
  id?: string;
  type?: 'success' | 'error' | 'info';
  message: string;
  onDismiss?: () => void;
  className?: string;
}

export function Toast({
  type = 'info',
  message,
  onDismiss,
  className,
}: ToastProps) {
  const icons = {
    success: <CheckCircle2 className="h-4 w-4 text-[var(--color-patta)] shrink-0" />,
    error: <AlertCircle className="h-4 w-4 text-[var(--color-chukandar)] shrink-0" />,
    info: <Info className="h-4 w-4 text-[var(--color-haldi)] shrink-0" />,
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'flex items-center justify-between gap-3 px-4 py-3 rounded-[12px]',
        'bg-[var(--color-plate)] text-[var(--color-neel)] border border-[var(--color-border)] shadow-lg',
        'text-sm transition-all duration-150',
        className
      )}
    >
      <div className="flex items-center gap-2.5">
        {icons[type]}
        <span className="font-medium text-xs sm:text-sm">{message}</span>
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss notification"
          className="text-[var(--color-neel-muted)] hover:text-[var(--color-neel)] p-1 rounded-md min-h-[32px] min-w-[32px] flex items-center justify-center"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
