import * as React from 'react';
import { cn } from '@/lib/ui';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'quiet' | 'destructive' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, disabled, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-[12px] transition-all duration-150 ' +
      'focus:outline-none focus-visible:outline-2 focus-visible:outline-[var(--color-haldi)] focus-visible:outline-offset-2 ' +
      'disabled:opacity-40 disabled:pointer-events-none active:scale-[0.98] cursor-pointer min-h-[44px]';

    const normalizedVariant =
      variant === 'danger'
        ? 'destructive'
        : variant === 'ghost'
        ? 'quiet'
        : variant === 'outline'
        ? 'secondary'
        : variant;

    const variants = {
      primary:
        'bg-[var(--color-neel)] text-[var(--color-plate)] dark:bg-[var(--color-neel)] dark:text-[#12142B] hover:opacity-90 border border-[var(--color-neel)]',
      secondary:
        'bg-[var(--color-plate)] text-[var(--color-neel)] hover:bg-[var(--color-steel)] border border-[var(--color-border)]',
      quiet:
        'bg-transparent text-[var(--color-neel)] hover:bg-[var(--color-steel)] border border-transparent',
      destructive:
        'bg-[var(--color-chukandar)] text-white hover:opacity-90 border border-[var(--color-chukandar)]',
    };

    const sizes = {
      sm: 'text-xs px-3 py-2 gap-1.5 min-h-[44px]',
      md: 'text-sm px-4 py-2.5 gap-2 min-h-[44px]',
      lg: 'text-base px-6 py-3 gap-2.5 min-h-[48px]',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[normalizedVariant], sizes[size], className)}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
