import { createClient } from '@/lib/supabase/client';
import type { FoodLog } from '../types';

/**
 * Fetches food logs for a user on a given date.
 */
export async function fetchFoodLogsForDate(userId: string, dateStr: string): Promise<FoodLog[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('food_logs')
    .select('*')
    .eq('user_id', userId)
    .eq('logged_on', dateStr)
    .order('created_at', { ascending: true });

  if (error || !data) {
    return [];
  }
  return data;
}

/**
 * Deletes a food log entry by id.
 */
export async function deleteFoodLog(id: number) {
  const supabase = createClient();
  return supabase.from('food_logs').delete().eq('id', id);
}

/**
 * Updates an existing food log entry's portion and nutritional values.
 */
export async function updateFoodLogEntry(
  id: number,
  updates: {
    quantity_grams: number;
    calories: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
  }
) {
  const supabase = createClient();
  return supabase.from('food_logs').update(updates).eq('id', id);
}
