'use client';

import * as React from 'react';
import { cn } from '@/lib/ui';

export interface TabItem<T extends string | number> {
  id: T;
  label: string;
}

export interface SegmentedControlProps<T extends string | number> {
  items: TabItem<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  name?: string;
}

export function SegmentedControl<T extends string | number>({
  items,
  value,
  onChange,
  className,
}: SegmentedControlProps<T>) {
  return (
    <div
      role="tablist"
      className={cn(
        'inline-flex items-center p-1 rounded-[12px] bg-[var(--color-steel)] border border-[var(--color-border)]',
        className
      )}
    >
      {items.map((item) => {
        const selected = item.id === value;
        return (
          <button
            key={String(item.id)}
            role="tab"
            aria-selected={selected}
            type="button"
            onClick={() => onChange(item.id)}
            className={cn(
              'px-3.5 py-1.5 text-xs font-semibold rounded-[8px] transition-all duration-150 min-h-[36px]',
              selected
                ? 'bg-[var(--color-plate)] text-[var(--color-neel)] shadow-xs border border-[var(--color-border)] font-bold'
                : 'text-[var(--color-neel-muted)] hover:text-[var(--color-neel)]'
            )}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
