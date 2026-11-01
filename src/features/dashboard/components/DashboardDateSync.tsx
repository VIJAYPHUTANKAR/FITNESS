'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { todayISO } from '@/lib/dates';

/**
 * DashboardDateSync: Client-side coordinator that computes the user's local browser date
 * and navigates to /dashboard?date=YYYY-MM-DD so that all metrics and daily logs reflect
 * the user's local day, avoiding server-side UTC date skew.
 */
export function DashboardDateSync() {
  const router = useRouter();

  useEffect(() => {
    const localToday = todayISO();
    router.replace(`/dashboard?date=${localToday}`);
  }, [router]);

  return (
    <div className="mx-auto max-w-5xl p-6 sm:p-8 space-y-6 animate-pulse">
      <div className="h-8 w-48 bg-slate-200 rounded-lg" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="h-64 bg-slate-100 rounded-2xl border border-slate-200" />
        <div className="h-64 bg-slate-100 rounded-2xl border border-slate-200" />
        <div className="h-64 bg-slate-100 rounded-2xl border border-slate-200" />
      </div>
      <div className="h-48 bg-slate-100 rounded-2xl border border-slate-200" />
    </div>
  );
}
