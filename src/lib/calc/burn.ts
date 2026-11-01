// lib/calc/burn.ts
// MET-based exercise duration calculator.
// Formula: duration_hours = calories_to_burn / (MET × weight_kg)
// All values are estimates. Not medical advice.

export interface Exercise {
  id: number;
  name: string;
  category: string;
  met: number;
  intensity: string;
  equipment_needed: boolean;
}

export interface BurnResult {
  exercise: Exercise;
  /** Total minutes needed */
  minutes: number;
  /** True if suggested daily duration > 120 min/day */
  isUnrealistic: boolean;
  /** Suggested minutes per day when split across N days */
  minutesPerDay: number;
}

/** Daily burn duration cap considered "safe to suggest" without elevated strain */
export const MAX_REALISTIC_MINUTES_PER_DAY = 120;

/** Daily caloric burn ceiling for auto-suggestions to prevent encouraging extreme compensation */
export const MAX_SAFE_CALORIES_PER_DAY = 1000;

/**
 * Calculate time needed to burn `caloriesKcal` for each exercise.
 * Safely guards against:
 * - null, undefined, NaN, zero or negative weight
 * - null, zero or negative calories
 * - zero or negative MET values
 * - decimal inputs
 *
 * @param caloriesKcal  Calories to burn (positive number)
 * @param weightKg      User's body weight in kg
 * @param exercises     List of exercise options
 * @param days          Spread across this many days (default 1, max 90)
 */
export function calculateBurnPlan(
  caloriesKcal: number,
  weightKg: number | null | undefined,
  exercises: Exercise[],
  days = 1
): BurnResult[] {
  // Input validations & guards
  if (
    caloriesKcal <= 0 ||
    isNaN(caloriesKcal) ||
    !weightKg ||
    weightKg <= 0 ||
    isNaN(weightKg) ||
    !Array.isArray(exercises) ||
    exercises.length === 0
  ) {
    return [];
  }

  const safeDays = Math.max(1, Math.min(90, Math.round(days)));

  return exercises.map((ex) => {
    const safeMet = Number(ex.met);
    if (!safeMet || safeMet <= 0 || isNaN(safeMet)) {
      return {
        exercise: ex,
        minutes: 0,
        minutesPerDay: 0,
        isUnrealistic: false,
      };
    }

    // Formula: hours = kcal / (MET * kg); minutes = hours * 60
    const totalMinutes = (caloriesKcal / (safeMet * weightKg)) * 60;
    const minutesPerDay = totalMinutes / safeDays;

    return {
      exercise: ex,
      minutes: Math.round(totalMinutes),
      minutesPerDay: Math.round(minutesPerDay),
      isUnrealistic: minutesPerDay > MAX_REALISTIC_MINUTES_PER_DAY,
    };
  });
}

/**
 * Format minutes as "Xh Ym" or "Ym"
 */
export function formatDuration(minutes: number): string {
  if (isNaN(minutes) || minutes <= 0) return '0 min';
  if (minutes < 60) return `${Math.round(minutes)} min`;
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

/**
 * How many days to suggest spreading the burn so daily effort and daily burn remain safe?
 * Caps daily recommended burn to ~1,000 kcal/day and daily time to ~120 min/day.
 */
export function suggestDays(
  caloriesKcal: number,
  weightKg: number | null | undefined,
  exercises: Exercise[] = []
): number {
  if (caloriesKcal <= 0 || isNaN(caloriesKcal) || !weightKg || weightKg <= 0 || isNaN(weightKg)) {
    return 1;
  }

  // 1. Caloric ceiling constraint: max 1,000 kcal/day burn recommendation
  const daysByCalories = Math.ceil(caloriesKcal / MAX_SAFE_CALORIES_PER_DAY);

  // 2. Duration constraint: max 120 min/day for moderate cardio (ref MET ~8.0)
  const refMET = 8.0;
  const totalMinutes = (caloriesKcal / (refMET * weightKg)) * 60;
  const daysByDuration = Math.ceil(totalMinutes / MAX_REALISTIC_MINUTES_PER_DAY);

  // Result is capped between 1 and 30 days for reasonable fitness planning
  return Math.min(30, Math.max(1, Math.max(daysByCalories, daysByDuration)));
}
