import type { Profile, FoodLog, ExerciseLog } from '@/types/database';

export interface DashboardMetrics {
  caloriesIn: number;
  caloriesOut: number;
  netCalories: number;
  goal: number;
  bmr: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  vsGoal: number;
  baselineMaintenance: number;
  energyBalance: number;
  hasProfileMetrics: boolean;
  needsOnboarding: boolean;
}

export interface DashboardData {
  profile: Profile | null;
  foodLogs: FoodLog[];
  exerciseLogs: ExerciseLog[];
  today: string;
  metrics: DashboardMetrics;
}
