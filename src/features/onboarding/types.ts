import type { Gender, ActivityLevel, GoalType } from '@/lib/calc/bmr';

export type OnboardingStep = 1 | 2 | 3;

export interface OnboardingFormData {
  fullName: string;
  dob: string;
  gender: Gender;
  heightCm: number;
  weightKg: number;
  activityLevel: ActivityLevel;
  goalType: GoalType;
  calorieGoal: number;
}
