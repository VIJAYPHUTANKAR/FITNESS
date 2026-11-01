// src/lib/validation/__tests__/schemas.test.ts
import { ProfileFormSchema } from '../schemas';

describe('ProfileFormSchema Calorie Floor and Minor Protection (Task 6)', () => {
  const baseProfile = {
    full_name: 'Alex Johnson',
    date_of_birth: '1995-05-15', // Age ~31 (adult)
    gender: 'female' as const,
    height_cm: 165,
    weight_kg: 60,
    activity_level: 'moderate' as const,
    goal_type: 'lose' as const,
    daily_calorie_goal: 1400,
  };

  describe('Minor Protection (Age >= 18)', () => {
    test('accepts adult age (>= 18)', () => {
      const res = ProfileFormSchema.safeParse(baseProfile);
      expect(res.success).toBe(true);
    });

    test('rejects minor age (< 18)', () => {
      // Calculate a date corresponding to 16 years ago
      const sixteenYearsAgo = new Date();
      sixteenYearsAgo.setFullYear(sixteenYearsAgo.getFullYear() - 16);
      const minorDob = sixteenYearsAgo.toISOString().split('T')[0];

      const res = ProfileFormSchema.safeParse({
        ...baseProfile,
        date_of_birth: minorDob,
      });

      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.issues[0].message).toContain('18 years old');
      }
    });

    test('rejects 17.5 year old minor', () => {
      const seventeenYearsAgo = new Date();
      seventeenYearsAgo.setFullYear(seventeenYearsAgo.getFullYear() - 17);
      seventeenYearsAgo.setMonth(seventeenYearsAgo.getMonth() - 6);
      const minorDob = seventeenYearsAgo.toISOString().split('T')[0];

      const res = ProfileFormSchema.safeParse({
        ...baseProfile,
        date_of_birth: minorDob,
      });

      expect(res.success).toBe(false);
    });
  });

  describe('Calorie Goal Floor Enforcement', () => {
    test('female: accepts goal >= 1200 kcal', () => {
      const res1200 = ProfileFormSchema.safeParse({
        ...baseProfile,
        gender: 'female',
        daily_calorie_goal: 1200,
      });
      expect(res1200.success).toBe(true);

      const res1400 = ProfileFormSchema.safeParse({
        ...baseProfile,
        gender: 'female',
        daily_calorie_goal: 1400,
      });
      expect(res1400.success).toBe(true);
    });

    test('female: rejects goal < 1200 kcal', () => {
      const res = ProfileFormSchema.safeParse({
        ...baseProfile,
        gender: 'female',
        daily_calorie_goal: 1100,
      });
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.issues.some((i) => i.message.includes('1,200'))).toBe(true);
      }
    });

    test('male: accepts goal >= 1500 kcal', () => {
      const res = ProfileFormSchema.safeParse({
        ...baseProfile,
        gender: 'male',
        daily_calorie_goal: 1500,
      });
      expect(res.success).toBe(true);
    });

    test('male: rejects goal < 1500 kcal even if above 1200 kcal', () => {
      const res = ProfileFormSchema.safeParse({
        ...baseProfile,
        gender: 'male',
        daily_calorie_goal: 1350,
      });
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.issues.some((i) => i.message.includes('1,500'))).toBe(true);
      }
    });

    test('other: enforces 1500 kcal floor', () => {
      const resBelow = ProfileFormSchema.safeParse({
        ...baseProfile,
        gender: 'other',
        daily_calorie_goal: 1400,
      });
      expect(resBelow.success).toBe(false);

      const resAt = ProfileFormSchema.safeParse({
        ...baseProfile,
        gender: 'other',
        daily_calorie_goal: 1500,
      });
      expect(resAt.success).toBe(true);
    });
  });
});

