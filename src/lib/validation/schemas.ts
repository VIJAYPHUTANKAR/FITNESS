// src/lib/validation/schemas.ts
// Zod schemas for all forms, API payloads, and database inputs.
import { z } from 'zod';

export const GenderSchema = z.enum(['male', 'female', 'other']);
export const ActivityLevelSchema = z.enum(['sedentary', 'light', 'moderate', 'active', 'very_active']);
export const GoalTypeSchema = z.enum(['lose', 'maintain', 'gain']);
export const MealTypeSchema = z.enum(['breakfast', 'lunch', 'dinner', 'snack']);

// ── Profile / Onboarding Schema ─────────────────────────────────────────────
export const ProfileFormSchema = z
  .object({
    full_name: z.string().max(100, 'Name must be 100 characters or less').optional().nullable(),
    date_of_birth: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be in YYYY-MM-DD format')
      .refine((val) => {
        const d = new Date(val);
        if (isNaN(d.getTime())) return false;
        const today = new Date();
        let age = today.getFullYear() - d.getFullYear();
        const m = today.getMonth() - d.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < d.getDate())) {
          age--;
        }
        return age >= 18 && age <= 120;
      }, 'Users must be at least 18 years old. FitCalc is designed for adults only.'),
    gender: GenderSchema,
    height_cm: z
      .number({ message: 'Height must be a number' })
      .min(50, 'Height must be at least 50 cm')
      .max(260, 'Height must be 260 cm or less'),
    weight_kg: z
      .number({ message: 'Weight must be a number' })
      .min(20, 'Weight must be at least 20 kg')
      .max(500, 'Weight must be 500 kg or less'),
    activity_level: ActivityLevelSchema,
    goal_type: GoalTypeSchema,
    daily_calorie_goal: z
      .number({ message: 'Calorie goal must be a number' })
      .min(1200, 'Calorie goal must be at least 1,200 kcal')
      .max(10000, 'Calorie goal cannot exceed 10,000 kcal'),
  })
  .refine(
    (data) => {
      const floor = data.gender === 'female' ? 1200 : 1500;
      return data.daily_calorie_goal >= floor;
    },
    {
      message:
        'Daily calorie goal cannot be below 1,200 kcal for females or 1,500 kcal for males and other',
      path: ['daily_calorie_goal'],
    }
  );

export type ProfileFormInput = z.infer<typeof ProfileFormSchema>;

// ── Food Log Schema ─────────────────────────────────────────────────────────
export const FoodLogFormSchema = z.object({
  food_id: z.number().optional().nullable(),
  food_name: z.string().min(1, 'Food name is required').max(255),
  logged_on: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  meal_type: MealTypeSchema,
  quantity_grams: z
    .number({ message: 'Quantity must be a number' })
    .positive('Quantity must be greater than 0')
    .max(5000, 'Quantity cannot exceed 5,000 grams'),
  calories: z
    .number()
    .min(0, 'Calories cannot be negative')
    .max(20000, 'Calories cannot exceed 20,000 kcal'),
  protein_g: z.number().min(0).max(500).optional().nullable(),
  carbs_g: z.number().min(0).max(1000).optional().nullable(),
  fat_g: z.number().min(0).max(500).optional().nullable(),
});

// ── Custom Food Schema ──────────────────────────────────────────────────────
export const CustomFoodFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  brand: z.string().max(100).optional().nullable(),
  serving_desc: z.string().min(1).max(100).default('100 g'),
  serving_grams: z
    .number()
    .positive('Serving size must be greater than 0')
    .max(5000, 'Serving size cannot exceed 5,000 grams')
    .default(100),
  calories_per_100g: z
    .number({ message: 'Calories must be a number' })
    .min(0, 'Calories cannot be negative')
    .max(900, 'Calories cannot exceed 900 kcal/100g (pure fat limit)'),
  protein_g: z.number().min(0).max(100).optional().nullable(),
  carbs_g: z.number().min(0).max(100).optional().nullable(),
  fat_g: z.number().min(0).max(100).optional().nullable(),
  fiber_g: z.number().min(0).max(100).optional().nullable(),
});

// ── Exercise Log Schema ─────────────────────────────────────────────────────
export const ExerciseLogFormSchema = z.object({
  exercise_id: z.number().optional().nullable(),
  exercise_name: z.string().min(1, 'Exercise name is required').max(255),
  logged_on: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  duration_min: z
    .number({ message: 'Duration must be a number' })
    .positive('Duration must be greater than 0')
    .max(600, 'Duration cannot exceed 600 minutes (10 hours)'),
  calories_burned: z
    .number()
    .min(0, 'Calories burned cannot be negative')
    .max(15000, 'Calories burned cannot exceed 15,000 kcal'),
});

// ── Weight Log Schema ───────────────────────────────────────────────────────
export const WeightLogFormSchema = z.object({
  logged_on: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  weight_kg: z
    .number({ message: 'Weight must be a number' })
    .min(20, 'Weight must be at least 20 kg')
    .max(500, 'Weight cannot exceed 500 kg'),
});

// ── Burn Plan / Activity Plan Schema ───────────────────────────────────────
export const BurnPlanFormSchema = z
  .object({
    calories_to_burn: z
      .number({ message: 'Calories must be a number' })
      .positive('Calories must be greater than 0')
      .max(2000, 'Calories cannot exceed 2,000 kcal'),
    days: z.number().int().min(1).max(30),
    plan: z.array(z.any()),
  })
  .refine((data) => data.calories_to_burn / data.days <= 1000, {
    message: 'Plan exceeds daily cap of 1,000 kcal per day',
  })
  .refine(
    (data) => {
      if (!Array.isArray(data.plan)) return true;
      return !data.plan.some(
        (p: { minutesPerDay?: number; minutes?: number }) =>
          (p.minutesPerDay ?? p.minutes ?? 0) > 120
      );
    },
    {
      message: 'Plan exceeds daily cap of 120 minutes per day for one or more activities',
    }
  );
