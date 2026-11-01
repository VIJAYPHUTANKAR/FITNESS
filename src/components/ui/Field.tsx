import * as React from 'react';
import { cn } from '@/lib/ui';

export interface FieldProps {
  id: string;
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  className?: string;
  children: (props: {
    id: string;
    'aria-invalid'?: boolean;
    'aria-describedby'?: string;
  }) => React.ReactNode;
}

export function Field({
  id,
  label,
  error,
  helperText,
  required,
  className,
  children,
}: FieldProps) {
  const errorId = error ? `${id}-error` : undefined;
  const helperId = helperText ? `${id}-helper` : undefined;
  const describedBy = [errorId, helperId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={cn('w-full space-y-1.5 text-left', className)}>
      {label && (
        <label
          htmlFor={id}
          className="block text-xs font-semibold text-[var(--color-neel)] tracking-normal"
        >
          {label}
          {required && <span className="text-[var(--color-chukandar)] ml-1">*</span>}
        </label>
      )}

      {children({
        id,
        'aria-invalid': Boolean(error),
        'aria-describedby': describedBy,
      })}

      {error && (
        <p id={errorId} className="text-xs font-medium text-[var(--color-chukandar)]">
          {error}
        </p>
      )}

      {helperText && !error && (
        <p id={helperId} className="text-xs text-[var(--color-neel-muted)]">
          {helperText}
        </p>
      )}
    </div>
  );
}
