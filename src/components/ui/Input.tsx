import * as React from 'react';
import { cn } from '@/lib/ui';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, id, type = 'text', ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;
    const errorId = error ? `${inputId}-error` : undefined;
    const helperId = helperText ? `${inputId}-helper` : undefined;
    const describedBy = [errorId, helperId].filter(Boolean).join(' ') || undefined;

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold text-[var(--color-neel)] tracking-normal"
          >
            {label}
            {props.required && <span className="text-[var(--color-chukandar)] ml-1">*</span>}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          type={type}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={cn(
            'w-full px-3.5 py-2.5 rounded-[10px] border border-[var(--color-border)] bg-[var(--color-plate)] text-[var(--color-neel)] placeholder:text-[var(--color-neel-muted)]/60',
            'transition-colors duration-150 focus:outline-none focus-visible:outline-2 focus-visible:outline-[var(--color-haldi)] focus-visible:outline-offset-1',
            'disabled:opacity-50 disabled:cursor-not-allowed text-sm min-h-[44px]',
            error && 'border-[var(--color-chukandar)] focus-visible:outline-[var(--color-chukandar)]',
            className
          )}
          {...props}
        />
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
Input.displayName = 'Input';
