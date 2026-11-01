// src/lib/calc/__tests__/burn.test.ts
import { calculateBurnPlan, formatDuration, suggestDays } from '../burn';
import type { Exercise } from '../burn';

const mockExercises: Exercise[] = [
  { id: 1, name: 'Running (8 km/h)', category: 'cardio', met: 8.3, intensity: 'high', equipment_needed: false },
  { id: 2, name: 'Walking (5 km/h)', category: 'cardio', met: 3.5, intensity: 'low', equipment_needed: false },
  { id: 3, name: 'Yoga',             category: 'flexibility', met: 2.5, intensity: 'low', equipment_needed: false },
];

describe('calculateBurnPlan', () => {
  test('500 kcal, 70 kg, running 8.3 MET = ~52 min', () => {
    const results = calculateBurnPlan(500, 70, [mockExercises[0]]);
    // 500 / (8.3 * 70) * 60 = 51.9 ≈ 52
    expect(results[0].minutes).toBeCloseTo(52, 0);
  });

  // Edge Case: weight_kg = 0 or null
  test('returns empty array when weight is 0 or null (prevents division by zero)', () => {
    expect(calculateBurnPlan(500, 0, mockExercises)).toEqual([]);
    expect(calculateBurnPlan(500, null, mockExercises)).toEqual([]);
    expect(calculateBurnPlan(500, undefined, mockExercises)).toEqual([]);
  });

  // Edge Case: MET = 0
  test('handles exercise with MET = 0 gracefully without Infinity or crash', () => {
    const zeroMetExercise: Exercise = {
      id: 99,
      name: 'Zero Activity',
      category: 'other',
      met: 0,
      intensity: 'low',
      equipment_needed: false,
    };
    const results = calculateBurnPlan(500, 70, [zeroMetExercise]);
    expect(results[0].minutes).toBe(0);
    expect(results[0].isUnrealistic).toBe(false);
  });

  // Edge Case: calories_to_burn = 0
  test('returns empty array for calories = 0', () => {
    expect(calculateBurnPlan(0, 70, mockExercises)).toEqual([]);
  });

  // Edge Case: negative input
  test('returns empty array for negative calories or negative weight', () => {
    expect(calculateBurnPlan(-500, 70, mockExercises)).toEqual([]);
    expect(calculateBurnPlan(500, -70, mockExercises)).toEqual([]);
  });

  // Edge Case: 10,000 kcal input
  test('10000 kcal burn calculation works accurately and marks 1 day as unrealistic', () => {
    const results1Day = calculateBurnPlan(10000, 70, mockExercises, 1);
    // Running 8.3 MET: 10000 / (8.3 * 70) * 60 = 1032.7 min (~17 hours)
    expect(results1Day[0].minutes).toBeCloseTo(1033, 0);
    expect(results1Day[0].isUnrealistic).toBe(true);

    // Spread over 30 days
    const results30Days = calculateBurnPlan(10000, 70, [mockExercises[0]], 30);
    // 1033 / 30 = ~34 min/day -> Realistic
    expect(results30Days[0].minutesPerDay).toBeCloseTo(34, 0);
    expect(results30Days[0].isUnrealistic).toBe(false);
  });

  // Edge Case: decimal inputs
  test('handles decimal calories and decimal body weight accurately', () => {
    const results = calculateBurnPlan(350.5, 68.4, [mockExercises[0]]);
    // 350.5 / (8.3 * 68.4) * 60 = 37.04 min
    expect(results[0].minutes).toBeCloseTo(37, 0);
  });

  test('marks unrealistic when minutes/day > 120', () => {
    const results = calculateBurnPlan(10000, 70, [mockExercises[1]], 1);
    expect(results[0].isUnrealistic).toBe(true);
  });
});

describe('formatDuration', () => {
  test('less than 60 min', () => {
    expect(formatDuration(45)).toBe('45 min');
  });

  test('exactly 60 min', () => {
    expect(formatDuration(60)).toBe('1h');
  });

  test('90 min → 1h 30min', () => {
    expect(formatDuration(90)).toBe('1h 30min');
  });

  test('handles 0 or negative numbers', () => {
    expect(formatDuration(0)).toBe('0 min');
    expect(formatDuration(-10)).toBe('0 min');
  });
});

describe('suggestDays', () => {
  test('small burn does not need many days', () => {
    expect(suggestDays(300, 70, mockExercises)).toBe(1);
  });

  test('10000 kcal surplus suggests spreading across at least 10 days (capped at 1000 kcal/day)', () => {
    const days = suggestDays(10000, 70, mockExercises);
    // 10000 / 1000 kcal/day = at least 10 days
    expect(days).toBeGreaterThanOrEqual(10);
  });

  test('handles null or invalid weight without crashing', () => {
    expect(suggestDays(500, null, mockExercises)).toBe(1);
    expect(suggestDays(500, 0, mockExercises)).toBe(1);
  });
});
