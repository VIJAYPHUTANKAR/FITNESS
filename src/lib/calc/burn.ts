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
  /** Total minutes needed (may be unrealistic) */
  minutes: number;
  /** Is this considered unrealistic? */
  isUnrealistic: boolean;
  /** Suggested minutes per day when split across N days */
  minutesPerDay?: number;
}

/** Daily burn cap considered "safe to suggest" (about 90 min vigorous exercise) */
const MAX_REALISTIC_MINUTES_PER_DAY = 120;

/**
 * Calculate time needed to burn `caloriesKcal` for each exercise.
 * @param caloriesKcal  Calories to burn (positive number)
 * @param weightKg      User's body weight in kg
 * @param exercises     List of exercise options
 * @param days          Spread across this many days (default 1)
 */
export function calculateBurnPlan(
  caloriesKcal: number,
  weightKg: number,
  exercises: Exercise[],
  days = 1
): BurnResult[] {
  if (caloriesKcal <= 0 || weightKg <= 0) return [];

  const caloriesPerDay = caloriesKcal / days;

  return exercises.map((ex) => {
    const totalMinutes = (caloriesKcal / (ex.met * weightKg)) * 60;
    const minutesPerDay = totalMinutes / days;

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
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

/**
 * How many days to suggest spreading the burn so daily effort ≤ cap?
 */
export function suggestDays(
  caloriesKcal: number,
  weightKg: number,
  exercises: Exercise[]
): number {
  if (exercises.length === 0) return 1;
  // Use a moderate-MET exercise (e.g. cycling ~8 MET) as the reference
  const refMET = 8;
  const totalMinutes = (caloriesKcal / (refMET * weightKg)) * 60;
  return Math.max(1, Math.ceil(totalMinutes / MAX_REALISTIC_MINUTES_PER_DAY));
}
