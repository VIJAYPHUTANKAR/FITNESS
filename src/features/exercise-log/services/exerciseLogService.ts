import { createClient } from '@/lib/supabase/client';
import type { Exercise, ExerciseLog, AddExercisePayload } from '../types';

/**
 * Fetches the exercises catalog ordered by name.
 */
export async function getExercisesCatalog(): Promise<Exercise[]> {
  const supabase = createClient();
  const { data } = await supabase.from('exercises').select('*').order('name');
  return data ?? [];
}

/**
 * Fetches the user weight from profile.
 */
export async function getUserWeight(userId: string): Promise<number> {
  const supabase = createClient();
  const { data: profile } = await supabase
    .from('profiles')
    .select('weight_kg')
    .eq('id', userId)
    .single();

  return profile?.weight_kg ? Number(profile.weight_kg) : 70;
}

/**
 * Fetches exercise logs for a user on a given date.
 */
export async function fetchExerciseLogs(userId: string, dateStr: string): Promise<ExerciseLog[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from('exercise_logs')
    .select('*')
    .eq('user_id', userId)
    .eq('logged_on', dateStr)
    .order('created_at', { ascending: true });

  return data ?? [];
}

/**
 * Inserts a new exercise log.
 */
export async function insertExerciseLog(userId: string, payload: AddExercisePayload) {
  const supabase = createClient();
  return supabase.from('exercise_logs').insert({
    user_id: userId,
    ...payload,
  });
}

/**
 * Updates the duration and calories burned for an existing exercise log.
 */
export async function updateExerciseLog(id: number, durationMin: number, caloriesBurned: number) {
  const supabase = createClient();
  return supabase
    .from('exercise_logs')
    .update({
      duration_min: durationMin,
      calories_burned: caloriesBurned,
    })
    .eq('id', id);
}

/**
 * Deletes an exercise log by id.
 */
export async function deleteExerciseLog(id: number) {
  const supabase = createClient();
  return supabase.from('exercise_logs').delete().eq('id', id);
}
