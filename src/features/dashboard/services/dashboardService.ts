import { createClient } from '@/lib/supabase/server';
import { calculateEnergyBalance, getProfileBMR } from '@/lib/calc/bmr';
import type { DashboardData } from '../types';

/**
 * Fetches dashboard data and computes energy balance and macro summaries for the specified calendar date.
 * Server function requires the explicit client local date string (YYYY-MM-DD) to prevent server-side UTC timezone skew.
 */
export async function getDashboardData(userId: string, targetDate: string): Promise<DashboardData> {
  const supabase = await createClient();
  const today = targetDate;

  const [profileRes, foodLogsRes, exerciseLogsRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', userId).single(),
    supabase.from('food_logs').select('*').eq('user_id', userId).eq('logged_on', today),
    supabase.from('exercise_logs').select('*').eq('user_id', userId).eq('logged_on', today),
  ]);

  const profile = profileRes.data ?? null;
  const foodLogs = foodLogsRes.data ?? [];
  const exerciseLogs = exerciseLogsRes.data ?? [];

  const caloriesIn = Math.round(foodLogs.reduce((sum, item) => sum + Number(item.calories), 0));
  const caloriesOut = Math.round(exerciseLogs.reduce((sum, item) => sum + Number(item.calories_burned), 0));
  const goal = profile?.daily_calorie_goal ?? 2000;
  const bmr = getProfileBMR(profile);

  const {
    vsGoal,
    baselineMaintenance,
    energyBalance,
    hasProfileMetrics,
  } = calculateEnergyBalance(caloriesIn, goal, bmr, caloriesOut);

  const netCalories = caloriesIn - caloriesOut;

  const proteinG = Math.round(foodLogs.reduce((sum, item) => sum + Number(item.protein_g ?? 0), 0));
  const carbsG = Math.round(foodLogs.reduce((sum, item) => sum + Number(item.carbs_g ?? 0), 0));
  const fatG = Math.round(foodLogs.reduce((sum, item) => sum + Number(item.fat_g ?? 0), 0));

  const needsOnboarding = !profile?.weight_kg || !profile?.daily_calorie_goal;

  return {
    profile,
    foodLogs,
    exerciseLogs,
    today,
    metrics: {
      caloriesIn,
      caloriesOut,
      netCalories,
      goal,
      bmr,
      proteinG,
      carbsG,
      fatG,
      vsGoal,
      baselineMaintenance,
      energyBalance,
      hasProfileMetrics,
      needsOnboarding,
    },
  };
}
