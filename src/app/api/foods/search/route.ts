import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface RateLimitTracker {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitTracker>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 40;

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

export async function GET(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || 'anon';
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: 'Rate limit exceeded. Please wait a moment.' }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.trim();

  if (!q || q.length < 2) {
    return NextResponse.json([]);
  }

  const supabase = await createClient();

  // 1. Search local Supabase foods table
  const { data: localFoods } = await supabase
    .from('foods')
    .select('*')
    .ilike('name', `%${q}%`)
    .limit(20);

  const results: Array<{
    id?: number;
    name: string;
    brand?: string | null;
    serving_desc: string;
    serving_grams: number;
    calories_per_100g: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
    source: string;
  }> = [];

  if (localFoods && localFoods.length > 0) {
    for (const f of localFoods) {
      results.push({
        id: f.id,
        name: f.name,
        brand: f.brand,
        serving_desc: f.serving_desc ?? '100 g',
        serving_grams: Number(f.serving_grams ?? 100),
        calories_per_100g: Number(f.calories_per_100g),
        protein_g: Number(f.protein_g ?? 0),
        carbs_g: Number(f.carbs_g ?? 0),
        fat_g: Number(f.fat_g ?? 0),
        source: f.source ?? 'database',
      });
    }
  }

  // 2. If results are few, fetch from Open Food Facts API with timeout
  if (results.length < 8) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);

      const offRes = await fetch(
        `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(
          q
        )}&json=1&fields=product_name,brands,nutriments,serving_quantity,serving_size&page_size=6`,
        {
          signal: controller.signal,
          headers: { 'User-Agent': 'FitCalc-CalorieTracker/1.0' },
        }
      );
      clearTimeout(timeoutId);

      if (offRes.ok) {
        const offData = await offRes.json();
        if (offData.products && Array.isArray(offData.products)) {
          for (const p of offData.products) {
            const name = p.product_name?.trim();
            if (!name) continue;

            const kcal =
              p.nutriments?.['energy-kcal_100g'] ??
              (p.nutriments?.energy_100g ? Math.round(p.nutriments.energy_100g / 4.184) : 0);

            if (kcal > 0) {
              results.push({
                name,
                brand: p.brands || null,
                serving_desc: p.serving_size || '100 g',
                serving_grams: Number(p.serving_quantity) || 100,
                calories_per_100g: Number(kcal),
                protein_g: Number(p.nutriments?.proteins_100g || 0),
                carbs_g: Number(p.nutriments?.carbohydrates_100g || 0),
                fat_g: Number(p.nutriments?.fat_100g || 0),
                source: 'openfoodfacts',
              });
            }
          }
        }
      }
    } catch {
      // Timeout or network error on OFF: gracefully fallback to what we have
    }
  }

  return NextResponse.json(results.slice(0, 25));
}
