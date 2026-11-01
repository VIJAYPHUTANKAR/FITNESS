import * as React from 'react';
import { cn } from '@/lib/ui';

export interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  className?: string;
  barColor?: string;
}

export function ProgressBar({
  value,
  max = 100,
  label,
  className,
  barColor = 'bg-[var(--color-neel)]',
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  return (
    <div className={cn('w-full space-y-1', className)}>
      {label && (
        <div className="flex justify-between text-xs text-[var(--color-neel-muted)] font-medium">
          <span>{label}</span>
          <span className="tabular-nums font-semibold">{percentage}%</span>
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label || 'Progress'}
        className="h-2 w-full overflow-hidden rounded-full bg-[var(--color-steel)] border border-[var(--color-border-subtle)]"
      >
        <div
          className={cn('h-full transition-all duration-300', barColor)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
