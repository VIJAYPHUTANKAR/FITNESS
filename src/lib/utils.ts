// src/lib/utils.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

import { formatLocalDate, todayISO, addDays, formatDate } from './date';
export { formatLocalDate, todayISO, addDays, formatDate };

export function toISODate(date: Date): string {
  return formatLocalDate(date);
}

/** Maps raw database/Supabase errors to safe, human-readable user messages without leaking stack or internal schemas */
export function formatSupabaseError(error: unknown): string {
  if (!error) return 'An unexpected error occurred. Please try again.';

  if (typeof window === 'undefined') {
    // Log server-side diagnostics only
    console.error('[Supabase Error]:', error);
  }

  const errObj = typeof error === 'object' && error !== null ? (error as Record<string, unknown>) : null;
  const code = errObj && typeof errObj.code === 'string' ? errObj.code : '';
  const raw = errObj && 'message' in errObj ? String(errObj.message) : String(error);

  // 23505: Unique constraint violation
  if (code === '23505' || raw.includes('duplicate key') || raw.includes('unique constraint')) {
    return 'An entry with this data already exists for this date.';
  }

  // 23503: Foreign key violation
  if (code === '23503' || raw.includes('violates foreign key constraint') || raw.includes('foreign key')) {
    return 'This record is currently in use or references an item that does not exist.';
  }

  // 42501: Row-level security / Insufficient privilege
  if (code === '42501' || raw.includes('row-level security') || raw.includes('permission denied')) {
    return 'You do not have permission to modify this record.';
  }

  // Check constraint violation
  if (code === '23514' || raw.includes('violates check constraint') || raw.includes('check constraint')) {
    return 'The entered values are outside safe physical bounds. Please check your numbers.';
  }

  // Auth / session expiration
  if (raw.includes('JWT') || raw.includes('token') || raw.includes('Invalid Refresh Token')) {
    return 'Your login session has expired. Please sign in again.';
  }

  // Network connectivity
  if (raw.includes('Failed to fetch') || raw.includes('NetworkError') || raw.includes('fetch failed')) {
    return 'Unable to reach the server. Please check your network connection.';
  }

  // Login credentials
  if (raw.includes('Invalid login credentials')) {
    return 'Invalid email or password. Please verify your credentials.';
  }

  // Safe fallback: never leak raw backend messages or schema names to the UI
  return 'An unexpected error occurred. Please try again.';
}
