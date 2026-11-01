// src/lib/__tests__/utils.test.ts
import { formatSupabaseError } from '../utils';

describe('formatSupabaseError Sanitization (Task 7)', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  test('never leaks raw database schema or internal error text for unknown errors', () => {
    const hostileInternalError = {
      code: '42P01',
      message: 'relation "private_user_secrets" does not exist at postgres://postgres:SecretPass123@db.internal:5432/postgres',
      details: 'Table pg_catalog.pg_class query failed',
    };

    const userMessage = formatSupabaseError(hostileInternalError);

    expect(userMessage).toBe('An unexpected error occurred. Please try again.');
    expect(userMessage).not.toContain('private_user_secrets');
    expect(userMessage).not.toContain('SecretPass123');
    expect(userMessage).not.toContain('postgres');
    expect(userMessage).not.toContain('42P01');

    // Server-side logging was called securely
    expect(consoleErrorSpy).toHaveBeenCalledWith('[Supabase Error]:', hostileInternalError);
  });

  test('maps 23505 duplicate key error code correctly', () => {
    const err = { code: '23505', message: 'duplicate key value violates unique constraint "foods_name_key"' };
    expect(formatSupabaseError(err)).toBe('An entry with this data already exists for this date.');
  });

  test('maps 23503 foreign key error code correctly', () => {
    const err = { code: '23503', message: 'violates foreign key constraint "food_logs_food_id_fkey"' };
    expect(formatSupabaseError(err)).toBe(
      'This record is currently in use or references an item that does not exist.'
    );
  });

  test('maps 42501 row-level security / permission denied code correctly', () => {
    const err = { code: '42501', message: 'new row violates row-level security policy for table "food_logs"' };
    expect(formatSupabaseError(err)).toBe('You do not have permission to modify this record.');
  });

  test('maps check constraint violation correctly', () => {
    const err = { code: '23514', message: 'violates check constraint check_calorie_goal_floor' };
    expect(formatSupabaseError(err)).toBe(
      'The entered values are outside safe physical bounds. Please check your numbers.'
    );
  });

  test('maps auth session and token errors correctly', () => {
    expect(formatSupabaseError({ message: 'Invalid Refresh Token: token has expired' })).toBe(
      'Your login session has expired. Please sign in again.'
    );
    expect(formatSupabaseError({ message: 'JWT expired' })).toBe(
      'Your login session has expired. Please sign in again.'
    );
  });

  test('maps network connection errors correctly', () => {
    expect(formatSupabaseError({ message: 'Failed to fetch' })).toBe(
      'Unable to reach the server. Please check your network connection.'
    );
  });

  test('maps invalid login credentials correctly', () => {
    expect(formatSupabaseError({ message: 'Invalid login credentials' })).toBe(
      'Invalid email or password. Please verify your credentials.'
    );
  });

  test('returns generic message for empty or null error without crashing', () => {
    expect(formatSupabaseError(null)).toBe('An unexpected error occurred. Please try again.');
    expect(formatSupabaseError(undefined)).toBe('An unexpected error occurred. Please try again.');
    expect(formatSupabaseError('')).toBe('An unexpected error occurred. Please try again.');
  });
});
