// lib/calc/bmr.ts
// Pure functions for BMR, TDEE, energy balance, and calorie goal calculation.
// All values are estimates. Not medical advice.

export type Gender = 'male' | 'female' | 'other';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
export type GoalType = 'lose' | 'maintain' | 'gain';

export const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
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
  if (weightKg <= 0 || heightCm <= 0 || ageYears <= 0) return 0;
  const base = 10 * weightKg + 6.25 * heightCm - 5 * ageYears;
  if (gender === 'male') return base + 5;
  if (gender === 'female') return base - 161;
  // 'other': average of male and female (-78)
  return base - 78;
}

/** Total Daily Energy Expenditure */
export function calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
  const mult = ACTIVITY_MULTIPLIERS[activityLevel] ?? 1.55;
  return bmr * mult;
}

/** Safe calorie goal floor by biological sex */
export function getCalorieGoalFloor(gender?: Gender | null): number {
  return gender === 'female' ? 1200 : 1500;
}

/** Recommended daily calorie goal based on goal type with minimum safety floors */
export function calculateCalorieGoal(
  tdee: number,
  goalType: GoalType,
  gender: Gender
): number {
  let goal: number;
  switch (goalType) {
    case 'lose':
      goal = tdee - 400; // moderate healthy deficit
      break;
    case 'gain':
      goal = tdee + 300;
      break;
    default:
      goal = tdee;
  }
  const floor = getCalorieGoalFloor(gender);
  return Math.max(Math.round(goal), floor);
}

/** Age in whole years from date of birth */
export function ageFromDOB(dob: Date): number {
  if (isNaN(dob.getTime())) return 25; // fallback default
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
  return Math.max(1, Math.min(120, age));
}

/** Computes BMR from a profile object safely without crashing on missing data */
export function getProfileBMR(profile: {
  weight_kg?: number | null;
  height_cm?: number | null;
  date_of_birth?: string | null;
  gender?: Gender | null;
} | null): number {
  if (!profile || !profile.weight_kg || !profile.height_cm) {
    return 0;
  }
  const age = profile.date_of_birth ? ageFromDOB(new Date(profile.date_of_birth)) : 25;
  const gender: Gender = profile.gender || 'other';
  return Math.round(calculateBMR(Number(profile.weight_kg), Number(profile.height_cm), age, gender));
}

/** Computes TDEE from a profile object safely without crashing on missing data */
export function getProfileTDEE(profile: {
  weight_kg?: number | null;
  height_cm?: number | null;
  date_of_birth?: string | null;
  gender?: Gender | null;
  activity_level?: ActivityLevel | null;
} | null): number {
  if (!profile || !profile.weight_kg || !profile.height_cm) {
    return 2000; // sensible fallback
  }
  const age = profile.date_of_birth ? ageFromDOB(new Date(profile.date_of_birth)) : 25;
  const gender: Gender = profile.gender || 'other';
  const activity: ActivityLevel = profile.activity_level || 'moderate';
  const bmr = calculateBMR(Number(profile.weight_kg), Number(profile.height_cm), age, gender);
  return Math.round(calculateTDEE(bmr, activity));
}

export interface EnergyBalance {
  /** Intake minus daily target goal (positive = over goal, negative = remaining budget) */
  vsGoal: number;
  /** Baseline sedentary expenditure: BMR * 1.2 (non-exercise baseline) */
  baselineMaintenance: number;
  /** Intake minus (baselineMaintenance + loggedExerciseBurned). True thermodynamic balance */
  energyBalance: number;
  /** Safe surplus amount to send to burn calculator (energyBalance clamped to >= 0) */
  caloriesToBurn: number;
  /** Whether the user has complete profile metrics to compute BMR */
  hasProfileMetrics: boolean;
}

/**
 * Calculates energy balance without double-counting exercise.
 * Formula:
 * - baselineMaintenance = BMR * 1.2 (sedentary baseline, excluding workout activity)
 * - energyBalance = intake - (baselineMaintenance + loggedExerciseBurned)
 * - caloriesToBurn = Math.max(0, energyBalance)
 *
 * Notice: dailyGoal (which factors in activity-level TDEE) affects vsGoal,
 * but does NOT alter the physical energyBalance.
 */
export function calculateEnergyBalance(
  intake: number,
  dailyGoal: number,
  bmr: number,
  loggedExerciseBurned = 0
): EnergyBalance {
  const safeIntake = Math.max(0, intake);
  const safeGoal = Math.max(0, dailyGoal);
  const safeBurn = Math.max(0, loggedExerciseBurned);

  const vsGoal = Math.round(safeIntake - safeGoal);

  if (!bmr || bmr <= 0 || isNaN(bmr)) {
    return {
      vsGoal,
      baselineMaintenance: 0,
      energyBalance: 0,
      caloriesToBurn: 0,
      hasProfileMetrics: false,
    };
  }

  const baselineMaintenance = Math.round(bmr * 1.2);
  const energyBalance = Math.round(safeIntake - (baselineMaintenance + safeBurn));
  const caloriesToBurn = Math.max(0, energyBalance);

  return {
    vsGoal,
    baselineMaintenance,
    energyBalance,
    caloriesToBurn,
    hasProfileMetrics: true,
  };
}

/** Calorie surplus relative to goal (legacy helper) */
export function calculateSurplus(caloriesIn: number, goal: number): number {
  return caloriesIn - goal;
}

/** Fat mass equivalent of a calorie surplus (rough: 7700 kcal ≈ 1 kg fat) */
export function surplusToFatKg(surplusKcal: number): number {
  return surplusKcal / 7700;
}
