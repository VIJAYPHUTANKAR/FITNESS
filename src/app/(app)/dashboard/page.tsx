import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { DashboardScreen, getDashboardData, DashboardDateSync } from '@/features/dashboard';

interface DashboardPageProps {
  searchParams?: Promise<{ date?: string }>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const resolved = searchParams ? await searchParams : undefined;
  if (resolved?.date) {
    const data = await getDashboardData(user.id, resolved.date);
    return <DashboardScreen data={data} />;
  }

  return <DashboardDateSync />;
}
