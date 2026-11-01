import { createClient } from '@/lib/supabase/client';
import type { Profile, BurnPlan, Exercise, SaveBurnPlanPayload } from '../types';

/**
 * Loads user profile for weight calculation.
 */
export async function loadUserProfile(userId: string): Promise<Profile | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  return data ?? null;
}

/**
 * Loads the exercises catalog.
 */
export async function loadExercisesCatalog(): Promise<Exercise[]> {
  const supabase = createClient();
  const { data } = await supabase.from('exercises').select('*').order('name');
  return (data as Exercise[]) ?? [];
}

/**
 * Loads recent saved burn plans for user.
 */
export async function loadSavedBurnPlans(userId: string): Promise<BurnPlan[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from('burn_plans')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(5);

  return data ?? [];
}

/**
 * Saves a new activity equivalents plan.
 */
export async function saveBurnPlan(userId: string, payload: SaveBurnPlanPayload) {
  const supabase = createClient();
  return supabase.from('burn_plans').insert({
    user_id: userId,
    calories_to_burn: payload.calories_to_burn,
    days: payload.days,
    plan: payload.plan as unknown as import('@/types/database').Json,
  });
}

/**
 * Deletes a saved burn plan.
 */
export async function deleteSavedBurnPlan(planId: number) {
  const supabase = createClient();
  return supabase.from('burn_plans').delete().eq('id', planId);
}
