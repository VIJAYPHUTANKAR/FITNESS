// src/lib/calc/__tests__/bmr.test.ts
import {
  calculateBMR,
  calculateTDEE,
  calculateCalorieGoal,
  ageFromDOB,
  calculateEnergyBalance,
  getProfileBMR,
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

describe('calculateEnergyBalance (Consistent Energy Model)', () => {
  const bmr = 1500;
  // baselineMaintenance = BMR * 1.2 = 1800
  const baseline = 1800;

  test('eating at baseline gives energyBalance = 0', () => {
    const dailyGoal = 1600; // Deficit goal
    const intake = 1800; // Eating at baseline maintenance
    const res = calculateEnergyBalance(intake, dailyGoal, bmr, 0);

    expect(res.baselineMaintenance).toBe(baseline);
    expect(res.energyBalance).toBe(0);
    expect(res.vsGoal).toBe(200); // 1800 - 1600 = +200 vs deficit goal
    expect(res.hasProfileMetrics).toBe(true);
  });

  test('eating above baseline gives positive energyBalance', () => {
    const dailyGoal = 1600;
    const intake = 2100; // 300 kcal above baseline
    const res = calculateEnergyBalance(intake, dailyGoal, bmr, 0);

    expect(res.energyBalance).toBe(300);
    expect(res.vsGoal).toBe(500);
  });

  test('logging exercise reduces the balance', () => {
    const dailyGoal = 1600;
    const intake = 2100; // +300 above baseline
    const exerciseBurned = 200;
    const res = calculateEnergyBalance(intake, dailyGoal, bmr, exerciseBurned);

    // 2100 - (1800 + 200) = +100
    expect(res.energyBalance).toBe(100);
  });

  test('logging exercise exceeding surplus brings energyBalance negative', () => {
    const dailyGoal = 1800;
    const intake = 2000; // +200 above baseline
    const exerciseBurned = 350;
    const res = calculateEnergyBalance(intake, dailyGoal, bmr, exerciseBurned);

    // 2000 - (1800 + 350) = -150
    expect(res.energyBalance).toBe(-150);
  });

  test('missing profile returns a safe empty state without crashing', () => {
    const resNull = calculateEnergyBalance(2000, 2000, 0, 0);
    expect(resNull.hasProfileMetrics).toBe(false);
    expect(resNull.energyBalance).toBe(0);

    const bmrEmpty = getProfileBMR(null);
    expect(bmrEmpty).toBe(0);
    const resEmpty = calculateEnergyBalance(2000, 2000, bmrEmpty, 0);
    expect(resEmpty.hasProfileMetrics).toBe(false);
    expect(resEmpty.energyBalance).toBe(0);
  });

  test('fat-loss goal does not change energyBalance (independence from deficit target)', () => {
    const intake = 2000;
    const burn = 100;
    // Goal A: aggressive cut (-500) = 1500 kcal
    const resA = calculateEnergyBalance(intake, 1500, bmr, burn);
    // Goal B: maintenance goal = 2000 kcal
    const resB = calculateEnergyBalance(intake, 2000, bmr, burn);
    // Goal C: bulking goal (+300) = 2300 kcal
    const resC = calculateEnergyBalance(intake, 2300, bmr, burn);

    // physical energy balance must be identical across all goals
    expect(resA.energyBalance).toBe(resB.energyBalance);
    expect(resB.energyBalance).toBe(resC.energyBalance);
    expect(resA.energyBalance).toBe(2000 - (1800 + 100)); // +100

    // but vsGoal differs as intended
    expect(resA.vsGoal).toBe(500);
    expect(resB.vsGoal).toBe(0);
    expect(resC.vsGoal).toBe(-300);
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
