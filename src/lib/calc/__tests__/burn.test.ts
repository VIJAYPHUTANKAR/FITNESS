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

  test('returns empty array for zero calories', () => {
    expect(calculateBurnPlan(0, 70, mockExercises)).toHaveLength(0);
  });

  test('returns empty array for zero weight', () => {
    expect(calculateBurnPlan(500, 0, mockExercises)).toHaveLength(0);
  });

  test('marks unrealistic when minutes/day > 120', () => {
    // 10000 kcal walking at 3.5 MET, 70 kg: 10000/(3.5*70)*60 = 2449 min total, 1 day → unrealistic
    const results = calculateBurnPlan(10000, 70, [mockExercises[1]], 1);
    expect(results[0].isUnrealistic).toBe(true);
  });

  test('not unrealistic when split over enough days', () => {
    // 10000 kcal running 8.3 MET, 70 kg over 20 days: ~123 min/day — borderline
    // Let's use 30 days: 10000/(8.3*70)*60/30 = 34 min/day → realistic
    const results = calculateBurnPlan(10000, 70, [mockExercises[0]], 30);
    expect(results[0].isUnrealistic).toBe(false);
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
});

describe('suggestDays', () => {
  test('small burn does not need many days', () => {
    expect(suggestDays(300, 70, mockExercises)).toBe(1);
  });

  test('10000 kcal surplus suggests >1 day', () => {
    const days = suggestDays(10000, 70, mockExercises);
    expect(days).toBeGreaterThan(1);
  });
});

