// src/lib/calc/__tests__/bmr.test.ts
import { calculateBMR, calculateTDEE, calculateCalorieGoal, ageFromDOB, surplusToFatKg } from '../bmr';

describe('calculateBMR', () => {
  test('male: 25yo, 70kg, 175cm', () => {
    // 10*70 + 6.25*175 - 5*25 + 5 = 700 + 1093.75 - 125 + 5 = 1673.75
    expect(calculateBMR(70, 175, 25, 'male')).toBeCloseTo(1673.75, 1);
  });

  test('female: 25yo, 60kg, 165cm', () => {
    // 10*60 + 6.25*165 - 5*25 - 161 = 600 + 1031.25 - 125 - 161 = 1345.25
    expect(calculateBMR(60, 165, 25, 'female')).toBeCloseTo(1345.25, 1);
  });

  test('other: average of male and female', () => {
    const male = calculateBMR(70, 175, 25, 'male');
    const female = calculateBMR(70, 175, 25, 'female');
    const other = calculateBMR(70, 175, 25, 'other');
    expect(other).toBeCloseTo((male + female) / 2, 1);
  });
});

describe('calculateTDEE', () => {
  test('sedentary multiplier is 1.2', () => {
    expect(calculateTDEE(1673.75, 'sedentary')).toBeCloseTo(1673.75 * 1.2, 0);
  });

  test('very_active multiplier is 1.9', () => {
    expect(calculateTDEE(1673.75, 'very_active')).toBeCloseTo(1673.75 * 1.9, 0);
  });
});

describe('calculateCalorieGoal', () => {
  test('lose is TDEE - 400, floored at 1500 for male', () => {
    const goal = calculateCalorieGoal(2500, 'lose', 'male');
    expect(goal).toBe(2100);
  });

  test('gain is TDEE + 300', () => {
    expect(calculateCalorieGoal(2500, 'gain', 'male')).toBe(2800);
  });

  test('floor: female lose goal never below 1200', () => {
    expect(calculateCalorieGoal(1400, 'lose', 'female')).toBe(1200);
  });

  test('floor: male lose goal never below 1500', () => {
    expect(calculateCalorieGoal(1700, 'lose', 'male')).toBe(1500);
  });
});

describe('surplusToFatKg', () => {
  test('7700 kcal surplus = 1 kg fat', () => {
    expect(surplusToFatKg(7700)).toBeCloseTo(1.0, 3);
  });

  test('10000 kcal surplus ≈ 1.299 kg fat', () => {
    expect(surplusToFatKg(10000)).toBeCloseTo(1.299, 2);
  });
});

describe('ageFromDOB', () => {
  test('age calculation is correct', () => {
    const thirtyYearsAgo = new Date();
    thirtyYearsAgo.setFullYear(thirtyYearsAgo.getFullYear() - 30);
    expect(ageFromDOB(thirtyYearsAgo)).toBe(30);
  });
});

