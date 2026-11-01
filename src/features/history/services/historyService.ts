import { createClient } from '@/lib/supabase/client';
import { addDays } from '@/lib/dates';
import type { HistoryData, DateRange } from '../types';

/**
 * Fetches user profile and logs within a specified date range.
 * Requires the client-provided local today date string to avoid timezone skew.
 */
export async function fetchHistoryData(
  userId: string,
  rangeDays: DateRange,
  todayStr: string
): Promise<HistoryData> {
  const supabase = createClient();
  const cutoffISO = addDays(todayStr, -rangeDays);

  const [profileRes, foodRes, exerciseRes, weightRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', userId).single(),
    supabase
      .from('food_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('logged_on', cutoffISO)
      .order('logged_on', { ascending: true }),
    supabase
      .from('exercise_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('logged_on', cutoffISO)
      .order('logged_on', { ascending: true }),
    supabase
      .from('weight_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('logged_on', cutoffISO)
      .order('logged_on', { ascending: true }),
  ]);

  return {
    profile: profileRes.data ?? null,
    foodLogs: foodRes.data ?? [],
    exerciseLogs: exerciseRes.data ?? [],
    weightLogs: weightRes.data ?? [],
  };
}
