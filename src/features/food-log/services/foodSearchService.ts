import { z } from 'zod';
import type { SupabaseClient } from '@supabase/supabase-js';

// ── Rate limiter (In-memory per-instance fallback guard) ─────────────────────
interface RateLimitTracker {
  count: number;
  resetAt: number;
}

const MAX_RATE_LIMIT_ENTRIES = 1000;
const rateLimitMap = new Map<string, RateLimitTracker>();

function evictExpiredEntries(now: number) {
  for (const [key, tracker] of rateLimitMap.entries()) {
    if (now > tracker.resetAt) {
      rateLimitMap.delete(key);
    }
  }
}

export function checkSearchRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 40;

  if (rateLimitMap.size >= MAX_RATE_LIMIT_ENTRIES) {
    evictExpiredEntries(now);
    if (rateLimitMap.size >= MAX_RATE_LIMIT_ENTRIES) {
      const oldestKey = rateLimitMap.keys().next().value;
      if (oldestKey) {
        rateLimitMap.delete(oldestKey);
      }
    }
  }

  const current = rateLimitMap.get(ip);
  if (!current || now > current.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (current.count >= maxRequests) {
    return false;
  }

  current.count++;
  return true;
}

// ── Output Zod Schema ───────────────────────────────────────────────────────
export const FoodItemSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1).max(255),
  brand: z.string().nullable().optional(),
  serving_desc: z.string().min(1).max(100),
  serving_grams: z.number().positive().max(5000),
  calories_per_100g: z.number().positive().max(900),
  protein_g: z.number().min(0).max(100),
  carbs_g: z.number().min(0).max(100),
  fat_g: z.number().min(0).max(100),
  source: z.string().min(1).max(50),
});

export const SearchResponseSchema = z.array(FoodItemSchema);

/**
 * Executes a food search with local database query and Open Food Facts API fallback.
 */
export async function searchFoodsWithFallback(
  supabase: SupabaseClient,
  rawQuery: string,
  clientIp: string
) {
  if (!checkSearchRateLimit(clientIp)) {
    return { error: 'Rate limit exceeded. Please wait a moment.', status: 429 };
  }

  const sanitizedQ = rawQuery
    .replace(/[,()%_*\\"'`]/g, '')
    .trim()
    .slice(0, 60);

  if (sanitizedQ.length < 2) {
    return { data: [] };
  }

  const rawResults: unknown[] = [];

  // Query local Supabase foods table
  try {
    const { data: localFoods } = await supabase
      .from('foods')
      .select('*')
      .ilike('name', `%${sanitizedQ}%`)
      .limit(20);

    if (localFoods && localFoods.length > 0) {
      for (const f of localFoods) {
        const cal = Number(f.calories_per_100g);
        if (cal > 0 && cal <= 900) {
          rawResults.push({
            id: f.id,
            name: f.name.trim(),
            brand: f.brand?.trim() || null,
            serving_desc: f.serving_desc?.trim() || '100 g',
            serving_grams: Math.max(1, Number(f.serving_grams ?? 100)),
            calories_per_100g: cal,
            protein_g: Math.max(0, Number(f.protein_g ?? 0)),
            carbs_g: Math.max(0, Number(f.carbs_g ?? 0)),
            fat_g: Math.max(0, Number(f.fat_g ?? 0)),
            source: f.source || 'database',
          });
        }
      }
    }
  } catch (err) {
    console.error('Local food search error:', err);
  }

  // Augment with Open Food Facts API if local results are few
  if (rawResults.length < 8) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);

      const offRes = await fetch(
        `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(
          sanitizedQ
        )}&json=1&fields=product_name,brands,nutriments,serving_quantity,serving_size&page_size=8`,
        {
          signal: controller.signal,
          headers: { 'User-Agent': 'FitCalc-CalorieTracker/1.0 (contact@example.com)' },
        }
      );
      clearTimeout(timeoutId);

      if (offRes.ok) {
        const offData = await offRes.json();
        if (offData.products && Array.isArray(offData.products)) {
          for (const p of offData.products) {
            const name = typeof p.product_name === 'string' ? p.product_name.trim() : '';
            if (!name) continue;

            let kcal: number | null = null;
            const nutriments = p.nutriments || {};

            if (typeof nutriments['energy-kcal_100g'] === 'number' && !isNaN(nutriments['energy-kcal_100g'])) {
              kcal = nutriments['energy-kcal_100g'];
            } else if (typeof nutriments.energy_100g === 'number' && !isNaN(nutriments.energy_100g)) {
              kcal = nutriments.energy_100g / 4.184;
            }

            if (kcal === null || kcal <= 0 || kcal > 900 || isNaN(kcal)) {
              continue;
            }

            const pG = Math.max(0, Math.min(100, Number(nutriments.proteins_100g) || 0));
            const cG = Math.max(0, Math.min(100, Number(nutriments.carbohydrates_100g) || 0));
            const fG = Math.max(0, Math.min(100, Number(nutriments.fat_100g) || 0));
            const sG = Math.max(1, Math.min(5000, Number(p.serving_quantity) || 100));

            rawResults.push({
              name,
              brand: typeof p.brands === 'string' && p.brands.trim() ? p.brands.trim() : null,
              serving_desc: typeof p.serving_size === 'string' && p.serving_size.trim() ? p.serving_size.trim() : '100 g',
              serving_grams: sG,
              calories_per_100g: Math.round(kcal * 10) / 10,
              protein_g: Math.round(pG * 10) / 10,
              carbs_g: Math.round(cG * 10) / 10,
              fat_g: Math.round(fG * 10) / 10,
              source: 'openfoodfacts',
            });
          }
        }
      }
    } catch {
      // Graceful fallback on timeout or network error
    }
  }

  const parsed = SearchResponseSchema.safeParse(rawResults.slice(0, 25));
  if (!parsed.success) {
    const validItems = rawResults
      .map((item) => FoodItemSchema.safeParse(item))
      .filter((res) => res.success)
      .map((res) => res.data);
    return { data: validItems };
  }

  return { data: parsed.data };
}
