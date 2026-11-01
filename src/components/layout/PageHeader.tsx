import * as React from 'react';
import { cn } from '@/lib/ui';

export interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, description, action, className }: PageHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[var(--color-border-subtle)]',
        className
      )}
    >
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-[var(--color-neel)]">
          {title}
        </h1>
        {description && (
          <p className="mt-0.5 text-xs text-[var(--color-neel-muted)] max-w-2xl leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0 flex items-center gap-2">{action}</div>}
    </div>
  );
}
