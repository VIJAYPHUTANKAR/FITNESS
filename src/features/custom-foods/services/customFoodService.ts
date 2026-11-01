import { createClient } from '@/lib/supabase/client';
import type { Food, CustomFoodInput } from '../types';

/**
 * Fetches all custom food entries created by the given user.
 */
export async function fetchCustomFoods(userId: string): Promise<Food[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from('foods')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  return data ?? [];
}

/**
 * Inserts a new custom food item.
 */
export async function insertCustomFood(userId: string, input: CustomFoodInput) {
  const supabase = createClient();
  return supabase.from('foods').insert({
    user_id: userId,
    ...input,
    source: 'custom',
  });
}

/**
 * Deletes a custom food item by id.
 */
export async function deleteCustomFood(id: number) {
  const supabase = createClient();
  return supabase.from('foods').delete().eq('id', id);
}
