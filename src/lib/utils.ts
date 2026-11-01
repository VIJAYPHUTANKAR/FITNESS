// src/lib/utils.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function toISODate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function todayISO(): string {
  return toISODate(new Date());
}

/** Maps raw database/Supabase errors to safe, human-readable user messages without leaking stack or internal schemas */
export function formatSupabaseError(error: unknown): string {
  if (!error) return 'An unexpected error occurred. Please try again.';

  const raw =
    typeof error === 'object' && error !== null && 'message' in error
      ? String((error as { message: unknown }).message)
      : String(error);

  if (raw.includes('duplicate key') || raw.includes('unique constraint')) {
    return 'An entry with this data already exists for this date.';
  }
  if (raw.includes('violates check constraint') || raw.includes('check constraint')) {
    return 'The entered values are outside safe physical bounds. Please check your numbers.';
  }
  if (raw.includes('row-level security') || raw.includes('violates row-level security')) {
    return 'You do not have permission to modify this record.';
  }
  if (raw.includes('JWT') || raw.includes('token') || raw.includes('Invalid Refresh Token')) {
    return 'Your login session has expired. Please sign in again.';
  }
  if (raw.includes('Failed to fetch') || raw.includes('NetworkError')) {
    return 'Unable to reach the server. Please check your network connection.';
  }
  if (raw.includes('Invalid login credentials')) {
    return 'Invalid email or password. Please verify your credentials.';
  }

  // Fallback sanitized message
  return raw.replace(/violates foreign key constraint [^,]+/g, 'Invalid reference')
            .replace(/relation "[^"]+" does not exist/g, 'Service error');
}
