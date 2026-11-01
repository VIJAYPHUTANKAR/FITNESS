// src/lib/date.ts
// Timezone-safe local calendar date utilities.

/**
 * Formats a Date object as a local calendar date string 'YYYY-MM-DD'.
 * Uses local calendar year/month/day (or the specified timeZone) to prevent UTC date shifting.
 */
export function formatLocalDate(date: Date = new Date(), timeZone?: string): string {
  if (timeZone) {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return formatter.format(date);
  }

  // Use local calendar getters (matching user's browser/system local calendar)
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns today's date in local calendar time as 'YYYY-MM-DD'.
 */
export function todayISO(timeZone?: string): string {
  return formatLocalDate(new Date(), timeZone);
}

/**
 * Performs day arithmetic on a 'YYYY-MM-DD' date string without UTC toISOString() roundtrips.
 */
export function addDays(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  // Using noon local time (12:00) avoids any DST midnight boundary shifts
  const dt = new Date(y, m - 1, d, 12, 0, 0);
  dt.setDate(dt.getDate() + days);

  const year = dt.getFullYear();
  const month = String(dt.getMonth() + 1).padStart(2, '0');
  const day = String(dt.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Formats a 'YYYY-MM-DD' string or Date for display without UTC date-shift.
 */
export function formatDate(date: Date | string): string {
  let dt: Date;
  if (typeof date === 'string') {
    const [y, m, d] = date.split('-').map(Number);
    dt = new Date(y, m - 1, d, 12, 0, 0);
  } else {
    dt = date;
  }
  return dt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}
