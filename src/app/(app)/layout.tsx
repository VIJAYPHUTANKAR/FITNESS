import { redirect } from 'next/navigation';
import Link from 'next/link';
import { LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { NavSidebar, BottomTabBar, ThemeToggle } from '@/components/layout';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const userEmail = user.email ?? '';

  return (
    <div className="flex h-full min-h-screen flex-col bg-[var(--color-steel)] text-[var(--color-neel)]">
      {/* ── Top Header ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-plate)] px-4 sm:px-6">
        {/* Brand Logo */}
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-neel)] text-[var(--color-haldi)] font-heading font-bold text-sm">
            FC
          </div>
          <span className="font-heading text-lg font-bold tracking-tight text-[var(--color-neel)]">
            FitCalc
          </span>
        </Link>

        {/* User controls + theme + sign-out */}
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <span className="hidden max-w-[180px] truncate text-xs font-medium text-[var(--color-neel-muted)] sm:block">
            {userEmail}
          </span>
          <form
            action={async () => {
              'use server';
              const sb = await createClient();
              await sb.auth.signOut();
              redirect('/login');
            }}
          >
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-[10px] px-2.5 py-1.5 text-xs font-semibold text-[var(--color-neel-muted)] hover:bg-[var(--color-steel)] hover:text-[var(--color-neel)] transition-colors min-h-[44px]"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </form>
        </div>
      </header>

      {/* ── Body: Desktop Rail + Main Content ──────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar rail – desktop */}
        <aside className="hidden w-56 shrink-0 border-r border-[var(--color-border)] bg-[var(--color-plate)] md:block overflow-y-auto">
          <NavSidebar />
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto pb-20 md:pb-8">
          {children}
        </main>
      </div>

      {/* ── Bottom tab bar – mobile only ───────────────────────── */}
      <BottomTabBar />
    </div>
  );
}
