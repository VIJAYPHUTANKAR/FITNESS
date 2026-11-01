import * as React from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
}

export function Card({ className, title, subtitle, action, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6 transition-all duration-150',
        className
      )}
      {...props}
    >
      {(title || subtitle || action) && (
        <div className="flex items-start justify-between gap-4 mb-4 pb-3 border-b border-gray-50">
          <div>
            {title && <h3 className="text-lg font-semibold text-gray-900 leading-tight">{title}</h3>}
            {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
