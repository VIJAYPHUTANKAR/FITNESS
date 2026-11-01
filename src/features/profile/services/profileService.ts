import { createClient } from '@/lib/supabase/client';
import { csvCell, fetchAllPages } from '@/lib/csv';
import type { ProfileFormInput } from '@/lib/validation/schemas';
import type { Profile } from '../types';

/**
 * Loads current user's profile record.
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
 * Updates user profile record.
 */
export async function updateUserProfile(userId: string, data: ProfileFormInput) {
  const supabase = createClient();
  return supabase.from('profiles').upsert({
    id: userId,
    ...data,
  });
}

/**
 * Logs a weigh-in entry and updates current weight in profile.
 * Requires client-computed loggedOn string to prevent timezone discrepancies.
 */
export async function logQuickWeight(userId: string, weightKg: number, loggedOn: string) {
  const supabase = createClient();
  const { error: weightErr } = await supabase.from('weight_logs').upsert(
    {
      user_id: userId,
      logged_on: loggedOn,
      weight_kg: weightKg,
    },
    { onConflict: 'user_id,logged_on' }
  );

  if (weightErr) return { error: weightErr };

  const { error: profileErr } = await supabase
    .from('profiles')
    .update({ weight_kg: weightKg })
    .eq('id', userId);

  return { error: profileErr || null };
}

/**
 * Exports all user foods, exercises, and weight logs as a CSV string.
 */
export async function exportUserDataCsv(userId: string): Promise<string> {
  const supabase = createClient();

  const foodLogs = await fetchAllPages(async (from, to) => {
    const { data, error } = await supabase
      .from('food_logs')
      .select('*')
      .eq('user_id', userId)
      .order('logged_on', { ascending: false })
      .order('id', { ascending: false })
      .range(from, to);
    return { data, error };
  });

  const exerciseLogs = await fetchAllPages(async (from, to) => {
    const { data, error } = await supabase
      .from('exercise_logs')
      .select('*')
      .eq('user_id', userId)
      .order('logged_on', { ascending: false })
      .order('id', { ascending: false })
      .range(from, to);
    return { data, error };
  });

  const weightLogs = await fetchAllPages(async (from, to) => {
    const { data, error } = await supabase
      .from('weight_logs')
      .select('*')
      .eq('user_id', userId)
      .order('logged_on', { ascending: false })
      .order('id', { ascending: false })
      .range(from, to);
    return { data, error };
  });

  let csvContent = 'DATA TYPE,DATE,NAME,AMOUNT,UNIT,CALORIES,PROTEIN(g),CARBS(g),FAT(g)\n';

  for (const f of foodLogs) {
    csvContent +=
      [
        csvCell('FOOD'),
        csvCell(f.logged_on),
        csvCell(f.food_name),
        csvCell(f.quantity_grams, true),
        csvCell('g'),
        csvCell(f.calories, true),
        csvCell(f.protein_g ?? 0, true),
        csvCell(f.carbs_g ?? 0, true),
        csvCell(f.fat_g ?? 0, true),
      ].join(',') + '\n';
  }

  for (const e of exerciseLogs) {
    csvContent +=
      [
        csvCell('EXERCISE'),
        csvCell(e.logged_on),
        csvCell(e.exercise_name),
        csvCell(e.duration_min, true),
        csvCell('min'),
        csvCell(e.calories_burned, true),
        '',
        '',
        '',
      ].join(',') + '\n';
  }

  for (const w of weightLogs) {
    csvContent +=
      [
        csvCell('WEIGHT'),
        csvCell(w.logged_on),
        csvCell('Weight Record'),
        csvCell(w.weight_kg, true),
        csvCell('kg'),
        '',
        '',
        '',
        '',
      ].join(',') + '\n';
  }

  return csvContent;
}

/**
 * Invokes RPC to delete the user's account and all associated data.
 */
export async function deleteUserAccount() {
  const supabase = createClient();
  return supabase.rpc('delete_my_account');
}

/**
 * Signs out the active user.
 */
export async function signOutUser() {
  const supabase = createClient();
  return supabase.auth.signOut();
}
