// src/lib/calc/__tests__/macros.test.ts
import { macroCalories, scaleMacros, recommendedMacros } from '../macros';

describe('macroCalories', () => {
  test('protein 4 kcal/g, carbs 4 kcal/g, fat 9 kcal/g', () => {
    const result = macroCalories({ protein_g: 30, carbs_g: 50, fat_g: 10 });
    expect(result.protein).toBe(120);
    expect(result.carbs).toBe(200);
    expect(result.fat).toBe(90);
    expect(result.total).toBe(410);
  });
});

describe('scaleMacros', () => {
  test('scales correctly by quantity', () => {
    const food = { calories_per_100g: 200, protein_g: 10, carbs_g: 30, fat_g: 5 };
    const result = scaleMacros(food, 50); // half serving
    expect(result.calories).toBe(100);
    expect(result.protein_g).toBe(5);
    expect(result.carbs_g).toBe(15);
    expect(result.fat_g).toBe(2.5);
  });

  test('handles null macros gracefully', () => {
    const food = { calories_per_100g: 100, protein_g: null, carbs_g: null, fat_g: null };
    const result = scaleMacros(food, 100);
    expect(result.protein_g).toBe(0);
    expect(result.carbs_g).toBe(0);
    expect(result.fat_g).toBe(0);
  });
});

describe('recommendedMacros', () => {
  test('all percentages sum to 100', () => {
    const goals: Array<'lose' | 'maintain' | 'gain'> = ['lose', 'maintain', 'gain'];
    goals.forEach(g => {
      const m = recommendedMacros(g);
      expect(m.proteinPct + m.carbsPct + m.fatPct).toBe(100);
    });
  });
});

