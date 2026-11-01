'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Utensils,
  Activity,
  Flame,
  CalendarDays,
  User,
} from 'lucide-react';
import { cn } from '@/lib/ui';

const NAV_ITEMS = [
  { href: '/dashboard',        label: 'Dashboard',        icon: LayoutDashboard },
  { href: '/log/food',         label: 'Log Food',         icon: Utensils },
  { href: '/log/exercise',     label: 'Log Exercise',     icon: Activity },
  { href: '/burn-calculator',  label: 'Activity Equivalents',  icon: Flame },
  { href: '/history',          label: 'History',          icon: CalendarDays },
  { href: '/profile',          label: 'Profile',          icon: User },
];

interface NavSidebarProps {
  /** Collapse label text on small sidebar widths */
  collapsed?: boolean;
}

export function NavSidebar({ collapsed = false }: NavSidebarProps) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1 px-2 py-4">
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(href + '/');
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
              active
                ? 'bg-emerald-600 text-white'
                : 'text-slate-600 hover:bg-emerald-50 hover:text-emerald-700',
              collapsed && 'justify-center px-2'
            )}
            title={collapsed ? label : undefined}
          >
            <Icon className="h-5 w-5 shrink-0" />
            {!collapsed && <span>{label}</span>}
          </Link>
        );
      })}
    </nav>
  );
}

/** Bottom tab bar for mobile screens */
export function BottomTabBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex border-t border-slate-200 bg-white sm:hidden">
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(href + '/');
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition-colors',
              active ? 'text-emerald-600' : 'text-slate-500 hover:text-emerald-600'
            )}
          >
            <Icon className={cn('h-5 w-5', active && 'text-emerald-600')} />
            <span className="leading-none">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
