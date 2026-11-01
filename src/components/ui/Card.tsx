import * as React from 'react';
import { cn } from '@/lib/ui';

export interface CardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
}

export function Card({ className, title, subtitle, action, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'bg-[var(--color-plate)] rounded-[16px] border border-[var(--color-border)] p-5 sm:p-6 text-[var(--color-neel)] transition-colors duration-150',
        className
      )}
      {...props}
    >
      {(title || subtitle || action) && (
        <div className="flex items-start justify-between gap-4 mb-4 pb-3 border-b border-[var(--color-border-subtle)]">
          <div>
            {title && (
              <h3 className="font-heading text-base font-bold text-[var(--color-neel)] leading-tight">
                {title}
              </h3>
            )}
            {subtitle && <p className="text-xs text-[var(--color-neel-muted)] mt-1">{subtitle}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
