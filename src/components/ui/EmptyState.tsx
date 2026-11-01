import * as React from 'react';
import { cn } from '@/lib/ui';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center p-8 rounded-[16px]',
        'bg-[var(--color-plate)] border border-[var(--color-border-subtle)] space-y-3',
        className
      )}
    >
      {icon && (
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-steel)] text-[var(--color-neel-muted)] mb-1">
          {icon}
        </div>
      )}
      <h3 className="font-heading text-base font-bold text-[var(--color-neel)]">
        {title}
      </h3>
      {description && (
        <p className="max-w-sm text-xs text-[var(--color-neel-muted)] leading-relaxed">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <Button variant="secondary" size="sm" onClick={onAction} className="mt-2">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
