import { type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/ui';

interface DailySummaryCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  unit?: string;
  /** Highlight color variant */
  variant?: 'default' | 'emerald' | 'orange' | 'red' | 'blue';
  className?: string;
}

const variantStyles: Record<NonNullable<DailySummaryCardProps['variant']>, string> = {
  default:  'text-slate-700',
  emerald:  'text-emerald-600',
  orange:   'text-orange-500',
  red:      'text-red-500',
  blue:     'text-blue-500',
};

const iconBg: Record<NonNullable<DailySummaryCardProps['variant']>, string> = {
  default:  'bg-slate-100',
  emerald:  'bg-emerald-100',
  orange:   'bg-orange-100',
  red:      'bg-red-100',
  blue:     'bg-blue-100',
};

export function DailySummaryCard({
  icon: Icon,
  label,
  value,
  unit,
  variant = 'default',
  className,
}: DailySummaryCardProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm',
        className
      )}
    >
      <div className={cn('flex h-9 w-9 items-center justify-center rounded-xl', iconBg[variant])}>
        <Icon className={cn('h-5 w-5', variantStyles[variant])} />
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
        <p className={cn('text-2xl font-bold tabular-nums', variantStyles[variant])}>
          {typeof value === 'number' ? value.toLocaleString() : value}
          {unit && <span className="ml-1 text-sm font-normal text-slate-400">{unit}</span>}
        </p>
      </div>
    </div>
  );
}
