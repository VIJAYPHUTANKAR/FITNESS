import type { Exercise, ExerciseLog } from '@/types/database';

export type { Exercise, ExerciseLog };

export interface AddExercisePayload {
  exercise_id?: number | null;
  exercise_name: string;
  logged_on: string;
  duration_min: number;
  calories_burned: number;
}
