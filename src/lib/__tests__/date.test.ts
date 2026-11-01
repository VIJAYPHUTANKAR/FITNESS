// src/lib/__tests__/date.test.ts
import { formatLocalDate, addDays, formatDate, todayISO } from '../date';

describe('Local Calendar Date Formatting Across UTC Midnight (Task 4)', () => {
  // Timestamp 1: 2026-11-01 18:45:00 UTC
  // In Asia/Kolkata (+5:30) it is 2026-11-02 00:15:00 (past local midnight -> next day)
  // In America/Los_Angeles (-7:00 / -8:00) it is 2026-11-01 11:45:00 (same day)
  const utcLateEvening = new Date('2026-11-01T18:45:00Z');

  // Timestamp 2: 2026-11-02 07:30:00 UTC
  // In Asia/Kolkata (+5:30) it is 2026-11-02 13:00:00 (same day)
  // In America/Los_Angeles (-8:00) it is 2026-11-01 23:30:00 (before local midnight -> previous day)
  const utcEarlyMorning = new Date('2026-11-02T07:30:00Z');

  test('Asia/Kolkata returns 2026-11-02 at 18:45:00Z (local calendar date)', () => {
    const localDate = formatLocalDate(utcLateEvening, 'Asia/Kolkata');
    expect(localDate).toBe('2026-11-02');
  });

  test('America/Los_Angeles returns 2026-11-01 at 18:45:00Z (local calendar date)', () => {
    const localDate = formatLocalDate(utcLateEvening, 'America/Los_Angeles');
    expect(localDate).toBe('2026-11-01');
  });

  test('Asia/Kolkata returns 2026-11-02 at 07:30:00Z (local calendar date)', () => {
    const localDate = formatLocalDate(utcEarlyMorning, 'Asia/Kolkata');
    expect(localDate).toBe('2026-11-02');
  });

  test('America/Los_Angeles returns 2026-11-01 at 07:30:00Z (local calendar date)', () => {
    const localDate = formatLocalDate(utcEarlyMorning, 'America/Los_Angeles');
    expect(localDate).toBe('2026-11-01');
  });

  test('todayISO supports explicit timeZone parameter', () => {
    expect(todayISO('Asia/Kolkata')).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(todayISO('America/Los_Angeles')).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe('Date Arithmetic (addDays without UTC roundtrips)', () => {
  test('increments day correctly across month boundary', () => {
    expect(addDays('2026-10-31', 1)).toBe('2026-11-01');
    expect(addDays('2026-02-28', 1)).toBe('2026-03-01');
  });

  test('decrements day correctly across month and year boundaries', () => {
    expect(addDays('2026-11-01', -1)).toBe('2026-10-31');
    expect(addDays('2027-01-01', -1)).toBe('2026-12-31');
  });

  test('handles multi-day offsets accurately', () => {
    expect(addDays('2026-11-01', 7)).toBe('2026-11-08');
    expect(addDays('2026-11-01', -7)).toBe('2026-10-25');
    expect(addDays('2026-11-01', 30)).toBe('2026-12-01');
  });
});

describe('formatDate Display', () => {
  test('formats YYYY-MM-DD string without UTC shift', () => {
    const formatted = formatDate('2026-11-01');
    expect(formatted).toContain('1');
    expect(formatted).toContain('Nov');
    expect(formatted).toContain('2026');
  });
});
