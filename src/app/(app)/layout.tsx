import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Dumbbell, LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { NavSidebar, BottomTabBar } from '@/components/NavSidebar';

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
    <div className="flex h-full min-h-screen flex-col bg-slate-50">
      {/* ── Top Header ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-emerald-600">
          <Dumbbell className="h-6 w-6" />
          <span className="text-lg tracking-tight">FitCalc</span>
        </Link>

        {/* User info + sign-out */}
        <div className="flex items-center gap-3">
          <span className="hidden max-w-[180px] truncate text-sm text-slate-500 sm:block">
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
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </form>
        </div>
      </header>

      {/* ── Body (sidebar + main) ───────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar – hidden on mobile */}
        <aside className="hidden w-56 shrink-0 border-r border-slate-200 bg-white sm:block">
          <NavSidebar />
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto pb-20 sm:pb-6">
          {children}
        </main>
      </div>

      {/* ── Bottom tab bar – mobile only ───────────────────────── */}
      <BottomTabBar />
    </div>
  );
}
