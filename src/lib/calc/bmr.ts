// lib/calc/bmr.ts
// Pure functions for BMR, TDEE, and calorie goal calculation.
// All values are estimates. Not medical advice.

export type Gender = 'male' | 'female' | 'other';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
export type GoalType = 'lose' | 'maintain' | 'gain';

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary:  1.2,
  light:      1.375,
  moderate:   1.55,
  active:     1.725,
  very_active: 1.9,
};

/** Mifflin-St Jeor BMR (kcal/day) */
export function calculateBMR(
  weightKg: number,
  heightCm: number,
  ageYears: number,
  gender: Gender
): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * ageYears;
  if (gender === 'male') return base + 5;
  if (gender === 'female') return base - 161;
  // 'other': average of male and female
  return base - 78;
}

/** Total Daily Energy Expenditure */
export function calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
  return bmr * ACTIVITY_MULTIPLIERS[activityLevel];
}

/** Recommended daily calorie goal based on goal type */
export function calculateCalorieGoal(
  tdee: number,
  goalType: GoalType,
  gender: Gender
): number {
  let goal: number;
  switch (goalType) {
    case 'lose':
      goal = tdee - 400; // moderate deficit
      break;
    case 'gain':
      goal = tdee + 300;
      break;
    default:
      goal = tdee;
  }
  // Safety floor
  const floor = gender === 'female' ? 1200 : 1500;
  return Math.max(Math.round(goal), floor);
}

/** Age in whole years from date of birth */
export function ageFromDOB(dob: Date): number {
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
  return age;
}

/** Calorie surplus (positive = over, negative = under) */
export function calculateSurplus(caloriesIn: number, goal: number): number {
  return caloriesIn - goal;
}

/** Fat mass equivalent of a calorie surplus (rough: 7700 kcal ≈ 1 kg fat) */
export function surplusToFatKg(surplusKcal: number): number {
  return surplusKcal / 7700;
}

