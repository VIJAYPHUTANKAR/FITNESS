import * as React from 'react';
import { cn } from '@/lib/ui';

export type SkeletonProps = React.HTMLAttributes<HTMLDivElement>;

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'animate-pulse rounded-[10px] bg-[var(--color-border)]/60 dark:bg-[var(--color-border)]/30',
        className
      )}
      {...props}
    />
  );
}
