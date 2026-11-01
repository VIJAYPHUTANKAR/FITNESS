import type { Gender, ActivityLevel, GoalType } from '@/lib/calc/bmr';
import type { Profile } from '@/types/database';

export type { Profile, Gender, ActivityLevel, GoalType };

export interface ProfileFormData {
  fullName: string;
  dob: string;
  gender: Gender;
  heightCm: number;
  weightKg: number;
  activityLevel: ActivityLevel;
  goalType: GoalType;
  calorieGoal: number;
}
