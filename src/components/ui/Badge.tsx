import * as React from 'react';
import { cn } from '@/lib/ui';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'neutral' | 'haldi' | 'chukandar' | 'patta' | 'outline';
  size?: 'sm' | 'md';
}

export function Badge({
  className,
  variant = 'neutral',
  size = 'md',
  children,
  ...props
}: BadgeProps) {
  const variants = {
    neutral:
      'bg-[var(--color-steel)] text-[var(--color-neel)] border border-[var(--color-border)]',
    haldi:
      'bg-[var(--color-haldi-subtle)] text-[#7A4B00] dark:text-[#F7C966] border border-[var(--color-haldi)]/40',
    chukandar:
      'bg-[var(--color-chukandar-subtle)] text-[var(--color-chukandar)] border border-[var(--color-chukandar)]/30',
    patta:
      'bg-[var(--color-patta-subtle)] text-[var(--color-patta)] border border-[var(--color-patta)]/30',
    outline:
      'bg-transparent text-[var(--color-neel)] border border-[var(--color-border)]',
  };

  const sizes = {
    sm: 'text-[10px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-semibold rounded-full tracking-normal',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
