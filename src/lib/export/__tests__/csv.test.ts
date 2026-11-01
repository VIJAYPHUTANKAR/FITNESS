// src/lib/export/__tests__/csv.test.ts
import { csvCell, fetchAllPages, type PageFetcher } from '../csv';

describe('csvCell Formula Neutralization and Escaping', () => {
  test('neutralizes hostile formula trigger: =cmd|\' /C calc\'!A0', () => {
    const raw = "=cmd|' /C calc'!A0";
    const encoded = csvCell(raw);
    expect(encoded).toBe(`"'=cmd|' /C calc'!A0"`);
    expect(encoded.startsWith(`"'=`)).toBe(true);
  });

  test('neutralizes hostile formula trigger with leading whitespace:   =1+1', () => {
    const raw = "   =1+1";
    const encoded = csvCell(raw);
    expect(encoded).toBe(`"'   =1+1"`);
  });

  test('neutralizes hostile text starting with +: +1', () => {
    const raw = '+1';
    const encoded = csvCell(raw);
    expect(encoded).toBe(`"'+1"`);
  });

  test('neutralizes hostile text starting with -: -1+1', () => {
    const raw = '-1+1';
    const encoded = csvCell(raw);
    expect(encoded).toBe(`"'-1+1"`);
  });

  test('neutralizes hostile text starting with @: @SUM(1)', () => {
    const raw = '@SUM(1)';
    const encoded = csvCell(raw);
    expect(encoded).toBe(`"'@SUM(1)"`);
  });

  test('neutralizes text starting with tab or carriage return', () => {
    const tabHostile = '\t=1+1';
    const encodedTab = csvCell(tabHostile);
    expect(encodedTab.startsWith(`"'`)).toBe(true);

    const crHostile = '\r=1+1';
    const encodedCr = csvCell(crHostile);
    expect(encodedCr.startsWith(`"'`)).toBe(true);
  });

  test('doubles quotes: O\'Reilly "Best" Food', () => {
    const raw = 'O\'Reilly "Best" Food';
    const encoded = csvCell(raw);
    expect(encoded).toBe(`"O'Reilly ""Best"" Food"`);
  });

  test('preserves commas inside quotes: Apple, Honey & Nuts', () => {
    const raw = 'Apple, Honey & Nuts';
    const encoded = csvCell(raw);
    expect(encoded).toBe(`"Apple, Honey & Nuts"`);
  });

  test('preserves newlines in multiline cells: Line 1\\nLine 2', () => {
    const raw = "Line 1\nLine 2";
    const encoded = csvCell(raw);
    expect(encoded).toBe(`"Line 1\nLine 2"`);
  });

  test('handles unicode: Thali 🍛', () => {
    const raw = 'Thali 🍛';
    const encoded = csvCell(raw);
    expect(encoded).toBe(`"Thali 🍛"`);
  });

  test('real numeric columns are not prefixed with single quotes', () => {
    expect(csvCell(100, true)).toBe('100');
    expect(csvCell(-5, true)).toBe('-5');
    expect(csvCell(0, true)).toBe('0');
    expect(csvCell(24.5, true)).toBe('24.5');
    expect(csvCell(null, true)).toBe('');
    expect(csvCell(undefined, true)).toBe('');
  });
});

describe('fetchAllPages Pagination', () => {
  test('proves a 2,500-row export makes exactly 3 calls and yields all 2,500 items', async () => {
    // Generate 2,500 mock rows
    const totalItems = 2500;
    const mockDb = Array.from({ length: totalItems }, (_, i) => ({
      id: i + 1,
      name: `Record ${i + 1}`,
    }));

    let callCount = 0;
    const recordedRanges: [number, number][] = [];

    const mockFetcher: PageFetcher<{ id: number; name: string }> = async (from, to) => {
      callCount++;
      recordedRanges.push([from, to]);
      const slice = mockDb.slice(from, to + 1);
      return { data: slice, error: null };
    };

    const result = await fetchAllPages(mockFetcher, 1000);

    // Call 1: [0, 999] -> 1,000 rows
    // Call 2: [1000, 1999] -> 1,000 rows
    // Call 3: [2000, 2999] -> 500 rows (short page terminates loop)
    expect(callCount).toBe(3);
    expect(recordedRanges).toEqual([
      [0, 999],
      [1000, 1999],
      [2000, 2999],
    ]);
    expect(result.length).toBe(2500);
    expect(result[0].id).toBe(1);
    expect(result[2499].id).toBe(2500);
  });

  test('aborts and throws if any page query fails, preventing partial downloads', async () => {
    let callCount = 0;
    const mockFetcher: PageFetcher<{ id: number }> = async (from) => {
      callCount++;
      if (from === 1000) {
        return { data: null, error: { message: 'Network connection dropped' } };
      }
      return { data: Array.from({ length: 1000 }, (_, i) => ({ id: from + i })), error: null };
    };

    await expect(fetchAllPages(mockFetcher, 1000)).rejects.toThrow(
      'Data fetch failed at range [1000, 1999]: Network connection dropped'
    );
    expect(callCount).toBe(2);
  });
});

