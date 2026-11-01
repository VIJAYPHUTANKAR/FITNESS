import * as React from 'react';
import { cn } from '@/lib/ui';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, helperText, id, children, ...props }, ref) => {
    const generatedId = React.useId();
    const selectId = id || generatedId;
    const errorId = error ? `${selectId}-error` : undefined;
    const helperId = helperText ? `${selectId}-helper` : undefined;
    const describedBy = [errorId, helperId].filter(Boolean).join(' ') || undefined;

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-xs font-semibold text-[var(--color-neel)] tracking-normal"
          >
            {label}
            {props.required && <span className="text-[var(--color-chukandar)] ml-1">*</span>}
          </label>
        )}
        <select
          id={selectId}
          ref={ref}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={cn(
            'w-full px-3.5 py-2.5 rounded-[10px] border border-[var(--color-border)] bg-[var(--color-plate)] text-[var(--color-neel)]',
            'transition-colors duration-150 focus:outline-none focus-visible:outline-2 focus-visible:outline-[var(--color-haldi)] focus-visible:outline-offset-1',
            'disabled:opacity-50 disabled:cursor-not-allowed text-sm min-h-[44px]',
            error && 'border-[var(--color-chukandar)] focus-visible:outline-[var(--color-chukandar)]',
            className
          )}
          {...props}
        >
          {children}
        </select>
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
);
Select.displayName = 'Select';
