import type { FoodLog, ExerciseLog, WeightLog, Profile } from '@/types/database';

export type DateRange = 7 | 14 | 30;

export interface CalorieChartDataPoint {
  date: string;
  caloriesIn: number;
  caloriesOut: number;
  goal: number;
}

export interface WeightChartDataPoint {
  date: string;
  weight: number;
}

export interface HistoryData {
  foodLogs: FoodLog[];
  exerciseLogs: ExerciseLog[];
  weightLogs: WeightLog[];
  profile: Profile | null;
}
