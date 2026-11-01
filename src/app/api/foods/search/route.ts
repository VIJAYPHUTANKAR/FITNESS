import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

// ── Rate limiter (In-memory per-instance fallback guard) ─────────────────────
// ARCHITECTURAL NOTE ON SERVERLESS RATE LIMITING:
// In serverless deployment environments (e.g., Vercel, AWS Lambda, Cloudflare Workers),
// memory is isolated per runtime instance/container and does not persist across cold starts.
// Therefore, this in-memory Map provides per-container debounce protection only.
// For robust, distributed rate limiting across all instances in production, a centralized
// key-value store (such as Upstash Redis with @upstash/ratelimit) should be used.
// The primary defense against unauthenticated spam/scraping is Step 1 below (mandatory
// Supabase JWT authentication returning 401).
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

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 40;

  // Periodically evict expired entries when approaching capacity
  if (rateLimitMap.size >= MAX_RATE_LIMIT_ENTRIES) {
    evictExpiredEntries(now);
    // If still at or above capacity after eviction, evict oldest entries
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
const FoodItemSchema = z.object({
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

const SearchResponseSchema = z.array(FoodItemSchema);

export async function GET(request: NextRequest) {
  // 1. Enforce authentication
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized: Authentication required' }, { status: 401 });
  }

  // 2. Dev rate-limiting check
  const ip = request.headers.get('x-forwarded-for') || user.id;
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Please wait a moment.' },
      { status: 429 }
    );
  }

  // 3. Extract & sanitize search query
  const { searchParams } = new URL(request.url);
  const rawQ = searchParams.get('q') ?? '';

  // Sanitize: strip PostgREST/SQL special chars (, % _ * \ " ' ( )), cap at 60 chars
  const sanitizedQ = rawQ
    .replace(/[,()%_*\\"'`]/g, '')
    .trim()
    .slice(0, 60);

  if (sanitizedQ.length < 2) {
    return NextResponse.json([]);
  }

  const rawResults: unknown[] = [];

  // 4. Query local Supabase foods table
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

  // 5. Augment with Open Food Facts API if local results are few
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

            // Extract calories per 100g; handle kcal vs kJ
            let kcal: number | null = null;
            const nutriments = p.nutriments || {};

            if (typeof nutriments['energy-kcal_100g'] === 'number' && !isNaN(nutriments['energy-kcal_100g'])) {
              kcal = nutriments['energy-kcal_100g'];
            } else if (typeof nutriments.energy_100g === 'number' && !isNaN(nutriments.energy_100g)) {
              // Convert kJ to kcal
              kcal = nutriments.energy_100g / 4.184;
            }

            // Discard invalid, 0, negative, or > 900 kcal/100g
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
      // Graceful fallback on timeout or network error: returns local results only
    }
  }

  // 6. Validate response shape using Zod
  const parsed = SearchResponseSchema.safeParse(rawResults.slice(0, 25));
  if (!parsed.success) {
    console.error('Food search response validation error:', parsed.error);
    // Filter out any invalid items
    const validItems = rawResults
      .map((item) => FoodItemSchema.safeParse(item))
      .filter((res) => res.success)
      .map((res) => res.data);
    return NextResponse.json(validItems);
  }

  return NextResponse.json(parsed.data);
}
