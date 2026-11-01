// src/lib/export/csv.ts
// Secure CSV formatting and paginated table extraction.

/**
 * Encodes a single cell value for CSV export with spreadsheet formula injection protection.
 *
 * Rules:
 * - Real numeric columns are formatted as string representations without prefixing quotes.
 * - Text cells starting with formula triggers (=, +, -, @, \t, \r) after optional whitespace
 *   are prefixed with a single quote (') to neutralize spreadsheet execution.
 * - Non-printable control characters are stripped.
 * - Quotes are doubled ("") and cells are enclosed in quotes.
 */
export function csvCell(val: unknown, isNumeric = false): string {
  if (val === null || val === undefined) {
    return isNumeric ? '' : '""';
  }

  if (isNumeric) {
    const num = typeof val === 'number' ? val : Number(val);
    if (!Number.isNaN(num) && Number.isFinite(num)) {
      return String(num);
    }
    return '';
  }

  if (typeof val === 'number' && Number.isFinite(val)) {
    return String(val);
  }

  let text = String(val);

  // Check if string begins (after optional whitespace) with =, +, -, @, \t, or \r
  const hasFormulaMarker = /^[\s]*[=+\-@\t\r]/.test(text);

  // Strip control characters (preserve newline \n for multiline cells, strip other controls)
  text = text.replace(/[\x00-\x09\x0b-\x1f\x7f]/g, '');

  if (hasFormulaMarker) {
    text = "'" + text;
  }

  // Double quotes and wrap in quotes
  return `"${text.replace(/"/g, '""')}"`;
}

export interface FetchPageResult<T> {
  data: T[] | null;
  error: { message: string } | null;
}

export type PageFetcher<T> = (from: number, to: number) => Promise<FetchPageResult<T>>;

/**
 * Pages through a PostgREST query using .range(from, to) in blocks of pageSize (default 1000)
 * until a short page returns or no rows remain.
 * If any page fetch fails, throws an error so callers do not output a partial export.
 */
export async function fetchAllPages<T>(
  fetcher: PageFetcher<T>,
  pageSize = 1000
): Promise<T[]> {
  const allRows: T[] = [];
  let from = 0;

  while (true) {
    const to = from + pageSize - 1;
    const { data, error } = await fetcher(from, to);

    if (error) {
      throw new Error(`Data fetch failed at range [${from}, ${to}]: ${error.message}`);
    }

    if (!data || data.length === 0) {
      break;
    }

    allRows.push(...data);

    // If fewer rows than pageSize were returned, this was the last page
    if (data.length < pageSize) {
      break;
    }

    from += pageSize;
  }

  return allRows;
}
