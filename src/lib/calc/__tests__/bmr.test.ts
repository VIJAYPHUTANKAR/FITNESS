// src/lib/calc/__tests__/bmr.test.ts
import {
  calculateBMR,
  calculateTDEE,
  calculateCalorieGoal,
  ageFromDOB,
  surplusToFatKg,
  calculateEnergyBalance,
  getProfileTDEE,
} from '../bmr';

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

  test('handles zero and negative inputs gracefully', () => {
    expect(calculateBMR(0, 175, 25, 'male')).toBe(0);
    expect(calculateBMR(-70, 175, 25, 'male')).toBe(0);
    expect(calculateBMR(70, -175, 25, 'male')).toBe(0);
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

describe('calculateEnergyBalance (Task 5 Surplus Logic)', () => {
  // Scenario 1: User on a fat-loss goal eats exactly at maintenance
  test('intake at maintenance on a fat-loss goal: true surplus is 0, caloriesToBurn is 0', () => {
    const tdee = 2400;
    const dailyGoal = 2000; // TDEE - 400 fat loss goal
    const intake = 2400; // ate at maintenance
    const { vsGoal, vsMaintenance, caloriesToBurn } = calculateEnergyBalance(intake, dailyGoal, tdee, 0);

    // vsGoal shows +400 (ate more than deficit target)
    expect(vsGoal).toBe(400);
    // vsMaintenance shows 0 (true thermodynamic surplus is zero)
    expect(vsMaintenance).toBe(0);
    // caloriesToBurn to send to calculator must be 0
    expect(caloriesToBurn).toBe(0);
  });

  // Scenario 2: Intake above maintenance
  test('intake above maintenance creates true surplus and caloriesToBurn > 0', () => {
    const tdee = 2000;
    const dailyGoal = 1600;
    const intake = 2500; // 500 kcal above maintenance
    const { vsGoal, vsMaintenance, caloriesToBurn } = calculateEnergyBalance(intake, dailyGoal, tdee, 0);

    expect(vsGoal).toBe(900);
    expect(vsMaintenance).toBe(500);
    expect(caloriesToBurn).toBe(500);
  });

  // Scenario 3: Intake below goal
  test('intake below goal: negative surplus and caloriesToBurn is 0', () => {
    const tdee = 2200;
    const dailyGoal = 1800;
    const intake = 1500;
    const { vsGoal, vsMaintenance, caloriesToBurn } = calculateEnergyBalance(intake, dailyGoal, tdee, 0);

    expect(vsGoal).toBe(-300);
    expect(vsMaintenance).toBe(-700);
    expect(caloriesToBurn).toBe(0);
  });

  // Scenario 4: Exercise reducing surplus
  test('exercise reduces the true surplus and caloriesToBurn', () => {
    const tdee = 2000;
    const dailyGoal = 1600;
    const intake = 2500; // +500 above maintenance
    const exerciseBurned = 300; // burned 300 kcal
    const { vsGoal, vsMaintenance, caloriesToBurn } = calculateEnergyBalance(intake, dailyGoal, tdee, exerciseBurned);

    expect(vsGoal).toBe(900);
    expect(vsMaintenance).toBe(200); // 2500 - (2000 + 300) = +200
    expect(caloriesToBurn).toBe(200);
  });

  // Scenario 5: Exercise exceeding the food surplus
  test('exercise exceeding surplus brings vsMaintenance negative and caloriesToBurn to 0', () => {
    const tdee = 2000;
    const dailyGoal = 2000;
    const intake = 2200;
    const exerciseBurned = 400;
    const { vsMaintenance, caloriesToBurn } = calculateEnergyBalance(intake, dailyGoal, tdee, exerciseBurned);

    expect(vsMaintenance).toBe(-200);
    expect(caloriesToBurn).toBe(0);
  });
});

describe('getProfileTDEE', () => {
  test('handles null/undefined profile without crashing', () => {
    expect(getProfileTDEE(null)).toBe(2000);
    expect(getProfileTDEE({})).toBe(2000);
  });

  test('calculates TDEE accurately for complete profile', () => {
    const profile = {
      weight_kg: 70,
      height_cm: 175,
      date_of_birth: '1999-01-01',
      gender: 'male' as const,
      activity_level: 'moderate' as const,
    };
    const tdee = getProfileTDEE(profile);
    expect(tdee).toBeGreaterThan(1800);
    expect(tdee).toBeLessThan(3000);
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

  test('handles invalid date', () => {
    expect(ageFromDOB(new Date('invalid'))).toBe(25);
  });
});
