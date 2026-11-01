'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  UtensilsCrossed,
  Activity,
  Flame,
  CalendarDays,
  User,
  Plus,
} from 'lucide-react';
import { cn } from '@/lib/ui';

export const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/log/food', label: 'Food', icon: UtensilsCrossed },
  { href: '/log/exercise', label: 'Activity', icon: Activity },
  { href: '/burn-calculator', label: 'Equivalents', icon: Flame },
  { href: '/history', label: 'History', icon: CalendarDays },
  { href: '/profile', label: 'Profile', icon: User },
];

export function NavSidebar() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1.5 p-3" aria-label="Main Navigation">
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(href + '/');
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'group flex items-center gap-3 rounded-[12px] px-3.5 py-2.5 text-xs font-semibold transition-all duration-150 min-h-[44px]',
              active
                ? 'bg-[var(--color-neel)] text-[var(--color-plate)] dark:text-[#12142B] shadow-xs'
                : 'text-[var(--color-neel-muted)] hover:bg-[var(--color-steel)] hover:text-[var(--color-neel)]'
            )}
          >
            <Icon
              className={cn(
                'h-4 w-4 shrink-0 transition-colors',
                active ? 'text-[var(--color-haldi)]' : 'text-[var(--color-neel-muted)] group-hover:text-[var(--color-neel)]'
              )}
            />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

/** Bottom tab bar for mobile screens (< 768px) */
export function BottomTabBar() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-[var(--color-border)] bg-[var(--color-plate)] px-2 py-1 md:hidden"
      aria-label="Mobile Navigation"
      style={{ paddingBottom: 'calc(0.25rem + env(safe-area-inset-bottom, 0px))' }}
    >
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(href + '/');
        const isFoodLog = href === '/log/food';

        if (isFoodLog) {
          return (
            <Link
              key={href}
              href={href}
              className="relative -top-2 flex flex-col items-center justify-center min-h-[48px] min-w-[48px]"
              aria-label="Log food"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-neel)] text-[var(--color-haldi)] shadow-md border-2 border-[var(--color-plate)]">
                <Plus className="h-5 w-5" />
              </div>
              <span className="text-[10px] font-bold text-[var(--color-neel)] mt-0.5">
                Add food
              </span>
            </Link>
          );
        }

        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex flex-1 flex-col items-center justify-center py-1.5 min-h-[44px] transition-colors',
              active
                ? 'text-[var(--color-neel)] font-bold'
                : 'text-[var(--color-neel-muted)] hover:text-[var(--color-neel)]'
            )}
          >
            <Icon className={cn('h-4 w-4', active && 'text-[var(--color-haldi)]')} />
            <span className="text-[10px] mt-0.5">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
