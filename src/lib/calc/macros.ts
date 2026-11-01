// lib/calc/macros.ts
// Macro nutrient helpers.

export interface Macros {
  protein_g: number;
  carbs_g:   number;
  fat_g:     number;
}

/** Calories contributed by each macro */
export function macroCalories(macros: Macros): { protein: number; carbs: number; fat: number; total: number } {
  const protein = macros.protein_g * 4;
  const carbs   = macros.carbs_g   * 4;
  const fat     = macros.fat_g     * 9;
  return { protein, carbs, fat, total: protein + carbs + fat };
}

/** Recommended macro split (percentage) based on goal */
export function recommendedMacros(goalType: 'lose' | 'maintain' | 'gain'): {
  proteinPct: number;
  carbsPct:   number;
  fatPct:     number;
} {
  switch (goalType) {
    case 'lose':    return { proteinPct: 35, carbsPct: 40, fatPct: 25 };
    case 'gain':    return { proteinPct: 30, carbsPct: 50, fatPct: 20 };
    default:        return { proteinPct: 25, carbsPct: 50, fatPct: 25 };
  }
}

/** Scale food macros by quantity (quantity_grams relative to 100g reference) */
export function scaleMacros(food: {
  calories_per_100g: number;
  protein_g?: number | null;
  carbs_g?:   number | null;
  fat_g?:     number | null;
}, quantityGrams: number): { calories: number } & Macros {
  const factor = quantityGrams / 100;
  return {
    calories:  food.calories_per_100g * factor,
    protein_g: (food.protein_g ?? 0)  * factor,
    carbs_g:   (food.carbs_g   ?? 0)  * factor,
    fat_g:     (food.fat_g     ?? 0)  * factor,
  };
}
